#!/usr/bin/env python3
"""Genera le fatture elettroniche di PROVA in tests/fixtures/.

Tutti i dati sono FITTIZI (aziende, persone, P.IVA, IBAN): servono solo a provare
Fatture Elettroniche Explorer. Non sono fatture valide e non vanno mai inviate allo SDI.

    uv run tests/generate_fixtures.py

Usa solo la libreria standard. Per i file firmati (.xml.p7m) serve ``openssl`` nel PATH
(oppure la variabile d'ambiente OPENSSL con il percorso dell'eseguibile): senza, lo script
si ferma con un errore. Le fatture vengono scritte in una cartella temporanea e sostituiscono
quelle esistenti solo a lavoro finito: se qualcosa va storto, tests/fixtures resta intatta. La firma è fatta con un certificato di prova usa e getta, creato in una
cartella temporanea e cancellato subito: la chiave non viene mai salvata.

I file .p7m non sono riproducibili byte per byte (contengono la data della firma): se li
rigeneri, git li mostrerà come modificati. I .xml invece sono sempre identici.
"""
import base64
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import zlib
from pathlib import Path

DEST = Path(__file__).resolve().parent / "fixtures"  # cartella finale
OUT = DEST  # durante la generazione punta a una cartella temporanea (vedi main)
NS = "http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2"
FATTURA_DI_PROVA = "FATTURA DI PROVA - dati fittizi"


# ---------------------------------------------------------------- anagrafiche fittizie
def piva(base10: str) -> str:
    """Aggiunge a 10 cifre la cifra di controllo di una partita IVA italiana."""
    s = 0
    for i, ch in enumerate(base10):
        n = int(ch)
        if i % 2 == 1:
            n *= 2
            if n > 9:
                n -= 9
        s += n
    return base10 + str((10 - s % 10) % 10)


def azienda(nome, base, via, cap, comune, prov, dest="0000000", regime="RF01"):
    p = piva(base)
    return {"nome": nome, "piva": p, "cf": p, "via": via, "civ": "1", "cap": cap, "comune": comune,
            "prov": prov, "naz": "IT", "paese": "IT", "dest": dest, "regime": regime}


AZ = azienda("Azienda Test S.r.l.", "0123456789", "Via Prova", "00100", "Roma", "RM", dest="ABC1234")
F1 = azienda("Forniture Esempio S.p.A.", "0234567890", "Via del Campionario", "20100", "Milano", "MI")
F3 = azienda("Servizi Digitali Esempio S.r.l.", "0345678901", "Corso Fittizio", "10100", "Torino", "TO")
C1 = azienda("Cliente Prova S.r.l.", "0456789012", "Piazza dell'Esempio", "40100", "Bologna", "BO", dest="XYZ9876")
ROSSI = {"nome": None, "nomep": "Mario", "cognome": "Rossi", "piva": piva("0567890123"), "cf": "RSSMRA80A01H501U",
         "via": "Via dello Studio", "civ": "7", "cap": "50100", "comune": "Firenze", "prov": "FI", "naz": "IT",
         "paese": "IT", "dest": "0000000", "regime": "RF01"}
PRIVATO = {"nome": None, "nomep": "Giulia", "cognome": "Bianchi", "piva": None, "cf": "BNCGLI85M41F205Z",
           "via": "Via Immaginaria", "civ": "3", "cap": "80100", "comune": "Napoli", "prov": "NA", "naz": "IT",
           "paese": "IT", "dest": "0000000", "regime": None}
IBAN = "IT60X0542811101000000123456"  # IBAN d'esempio universalmente usato nella documentazione


# ---------------------------------------------------------------- costruzione XML
def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def m(x):
    return f"{x:.2f}"


def anag(p, cedente):
    id_iva = f"<IdFiscaleIVA><IdPaese>{p['paese']}</IdPaese><IdCodice>{p['piva']}</IdCodice></IdFiscaleIVA>" if p["piva"] else ""
    cf = f"<CodiceFiscale>{p['cf']}</CodiceFiscale>" if p.get("cf") else ""
    if p["nome"]:
        a = f"<Denominazione>{esc(p['nome'])}</Denominazione>"
    else:
        a = f"<Nome>{esc(p['nomep'])}</Nome><Cognome>{esc(p['cognome'])}</Cognome>"
    reg = f"<RegimeFiscale>{p['regime']}</RegimeFiscale>" if cedente and p.get("regime") else ""
    sede = (f"<Sede><Indirizzo>{esc(p['via'])}</Indirizzo><NumeroCivico>{p['civ']}</NumeroCivico><CAP>{p['cap']}</CAP>"
            f"<Comune>{esc(p['comune'])}</Comune><Provincia>{p['prov']}</Provincia><Nazione>{p['naz']}</Nazione></Sede>")
    return f"<DatiAnagrafici>{id_iva}{cf}<Anagrafica>{a}</Anagrafica>{reg}</DatiAnagrafici>{sede}"


def calcola(b):
    """Riepilogo IVA e totali di un documento."""
    righe = []
    for i, r in enumerate(b["righe"], 1):
        desc, q, um, pu, aliq, nat = r
        righe.append({"n": i, "desc": desc, "q": q, "um": um, "pu": pu, "pt": round(q * pu, 2), "aliq": aliq, "nat": nat})
    gruppi = {}
    for r in righe:
        gruppi.setdefault((r["aliq"], r["nat"]), 0.0)
        gruppi[(r["aliq"], r["nat"])] += r["pt"]
    cassa = b.get("cassa")
    if cassa:  # il contributo di cassa entra nell'imponibile IVA
        k = (cassa["aliq_iva"], None)
        gruppi[k] = gruppi.get(k, 0.0) + cassa["importo"]
    riepilogo = [{"aliq": a, "nat": n, "imp": round(i, 2), "iva": round(i * a / 100, 2)} for (a, n), i in gruppi.items()]
    imp = round(sum(r["imp"] for r in riepilogo), 2)
    iva = round(sum(r["iva"] for r in riepilogo), 2)
    tot = round(imp + iva + b.get("bollo", 0), 2)
    return righe, riepilogo, imp, iva, tot


def mini_pdf(testo):
    """PDF minimo ma valido, con una riga di testo."""
    stream = f"BT /F1 14 Tf 20 60 Td ({testo}) Tj ET".encode()
    oggetti = [
        b"<</Type/Catalog/Pages 2 0 R>>",
        b"<</Type/Pages/Kids[3 0 R]/Count 1>>",
        b"<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 120]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>",
        b"<</Length " + str(len(stream)).encode() + b">>\nstream\n" + stream + b"\nendstream",
        b"<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
    ]
    out = b"%PDF-1.4\n"
    offs = []
    for i, o in enumerate(oggetti, 1):
        offs.append(len(out))
        out += f"{i} 0 obj\n".encode() + o + b"\nendobj\n"
    xref = len(out)
    out += f"xref\n0 {len(oggetti) + 1}\n".encode() + b"0000000000 65535 f \n"
    for o in offs:
        out += f"{o:010d} 00000 n \n".encode()
    out += f"trailer\n<</Size {len(oggetti) + 1}/Root 1 0 R>>\nstartxref\n{xref}\n%%EOF\n".encode()
    return out


def body_xml(b):
    righe, riepilogo, imp, iva, tot = calcola(b)
    g = f"<TipoDocumento>{b['tipo']}</TipoDocumento><Divisa>{b.get('divisa', 'EUR')}</Divisa>"
    if b.get("data") is not None:
        g += f"<Data>{b['data']}</Data>"
    g += f"<Numero>{esc(b['numero'])}</Numero>"
    if b.get("ritenuta"):
        r = b["ritenuta"]
        g += (f"<DatiRitenuta><TipoRitenuta>RT01</TipoRitenuta><ImportoRitenuta>{m(r['importo'])}</ImportoRitenuta>"
              f"<AliquotaRitenuta>{m(r['aliq'])}</AliquotaRitenuta><CausalePagamento>A</CausalePagamento></DatiRitenuta>")
    if b.get("bollo"):
        g += f"<DatiBollo><BolloVirtuale>SI</BolloVirtuale><ImportoBollo>{m(b['bollo'])}</ImportoBollo></DatiBollo>"
    if b.get("cassa"):
        c = b["cassa"]
        g += (f"<DatiCassaPrevidenziale><TipoCassa>TC22</TipoCassa><AlCassa>{m(c['aliq'])}</AlCassa>"
              f"<ImportoContributoCassa>{m(c['importo'])}</ImportoContributoCassa><ImponibileCassa>{m(c['imponibile'])}</ImponibileCassa>"
              f"<AliquotaIVA>{m(c['aliq_iva'])}</AliquotaIVA></DatiCassaPrevidenziale>")
    g += f"<ImportoTotaleDocumento>{m(b.get('totale', tot))}</ImportoTotaleDocumento>"
    for c in b.get("causali", [FATTURA_DI_PROVA]):
        g += f"<Causale>{esc(c)}</Causale>"
    dg = f"<DatiGeneraliDocumento>{g}</DatiGeneraliDocumento>"
    for ordine in b.get("ordini", []):
        dg += (f"<DatiOrdineAcquisto><RiferimentoNumeroLinea>1</RiferimentoNumeroLinea><IdDocumento>{ordine['id']}</IdDocumento>"
               f"<CodiceCUP>{ordine['cup']}</CodiceCUP><CodiceCIG>{ordine['cig']}</CodiceCIG></DatiOrdineAcquisto>")
    for ddt in b.get("ddt", []):
        dg += f"<DatiDDT><NumeroDDT>{ddt[0]}</NumeroDDT><DataDDT>{ddt[1]}</DataDDT></DatiDDT>"
    bs = ""
    for r in righe:
        bs += (f"<DettaglioLinee><NumeroLinea>{r['n']}</NumeroLinea><Descrizione>{esc(r['desc'])}</Descrizione>"
               f"<Quantita>{r['q']:.2f}</Quantita><UnitaMisura>{r['um']}</UnitaMisura><PrezzoUnitario>{r['pu']:.2f}</PrezzoUnitario>"
               f"<PrezzoTotale>{m(r['pt'])}</PrezzoTotale><AliquotaIVA>{m(r['aliq'])}</AliquotaIVA>"
               + (f"<Natura>{r['nat']}</Natura>" if r["nat"] else "") + "</DettaglioLinee>")
    for r in riepilogo:
        bs += (f"<DatiRiepilogo><AliquotaIVA>{m(r['aliq'])}</AliquotaIVA>" + (f"<Natura>{r['nat']}</Natura>" if r["nat"] else "")
               + f"<ImponibileImporto>{m(r['imp'])}</ImponibileImporto><Imposta>{m(r['iva'])}</Imposta>"
               f"<EsigibilitaIVA>I</EsigibilitaIVA></DatiRiepilogo>")
    xml = f"<FatturaElettronicaBody><DatiGenerali>{dg}</DatiGenerali><DatiBeniServizi>{bs}</DatiBeniServizi>"
    pag = b.get("pagamento")
    if pag:
        netto = tot - (b["ritenuta"]["importo"] if b.get("ritenuta") else 0)
        xml += (f"<DatiPagamento><CondizioniPagamento>TP02</CondizioniPagamento><DettaglioPagamento>"
                f"<ModalitaPagamento>{pag['mod']}</ModalitaPagamento><DataScadenzaPagamento>{pag['scad']}</DataScadenzaPagamento>"
                f"<ImportoPagamento>{m(netto)}</ImportoPagamento>" + (f"<IBAN>{IBAN}</IBAN>" if pag["mod"] == "MP05" else "")
                + "</DettaglioPagamento></DatiPagamento>")
    if b.get("allegato"):
        nome, contenuto = b["allegato"]
        xml += (f"<Allegati><NomeAttachment>{nome}</NomeAttachment><FormatoAttachment>PDF</FormatoAttachment>"
                f"<DescrizioneAttachment>Copia di cortesia</DescrizioneAttachment>"
                f"<Attachment>{base64.b64encode(contenuto).decode()}</Attachment></Allegati>")
    for nome, compressione, formato, contenuto in b.get("allegati", []):
        xml += (f"<Allegati><NomeAttachment>{nome}</NomeAttachment>"
                + (f"<AlgoritmoCompressione>{compressione}</AlgoritmoCompressione>" if compressione else "")
                + f"<FormatoAttachment>{formato}</FormatoAttachment><Attachment>{base64.b64encode(contenuto).decode()}</Attachment></Allegati>")
    return xml + "</FatturaElettronicaBody>", imp, iva, tot


def fattura(ced, ces, bodies, prog, modo="p", encoding="UTF-8", trasmittente=None):
    """modo: 'p' = radice con prefisso p: (come i file dello SDI); 'default' = xmlns di default; 'all' = tutti i tag con prefisso ns2:."""
    t = trasmittente or ced["piva"] or "01234567890"
    head = (f"<FatturaElettronicaHeader><DatiTrasmissione><IdTrasmittente><IdPaese>IT</IdPaese><IdCodice>{t}</IdCodice></IdTrasmittente>"
            f"<ProgressivoInvio>{prog}</ProgressivoInvio><FormatoTrasmissione>FPR12</FormatoTrasmissione>"
            f"<CodiceDestinatario>{ces['dest']}</CodiceDestinatario></DatiTrasmissione>"
            f"<CedentePrestatore>{anag(ced, True)}</CedentePrestatore><CessionarioCommittente>{anag(ces, False)}</CessionarioCommittente>"
            f"</FatturaElettronicaHeader>")
    corpi, tot_imp, tot_iva, tot_doc = [], [], [], []
    for b in bodies:
        x, i, v, t_ = body_xml(b)
        corpi.append(x)
        tot_imp.append(i), tot_iva.append(v), tot_doc.append(b.get("totale", t_))
    interno = head + "".join(corpi)
    decl = f'<?xml version="1.0" encoding="{encoding}"?>\n'
    if modo == "p":
        xml = f'{decl}<p:FatturaElettronica versione="FPR12" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:p="{NS}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">{interno}</p:FatturaElettronica>\n'
    elif modo == "default":
        xml = f'{decl}<FatturaElettronica versione="FPR12" xmlns="{NS}">{interno}</FatturaElettronica>\n'
    else:
        interno = re.sub(r"<(/?)([A-Za-z])", r"<\1ns2:\2", interno)
        xml = f'{decl}<ns2:FatturaElettronica versione="FPR12" xmlns:ns2="{NS}">{interno}</ns2:FatturaElettronica>\n'
    return xml, tot_imp, tot_iva, tot_doc


# ---------------------------------------------------------------- generazione
ATTESO = []  # per ogni documento: cosa deve mostrare l'app


def scrivi(rel, xml, encoding="utf-8"):
    p = OUT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(xml.encode(encoding))
    return p


def registra(rel, ced, ces, bodies, imps, ivas, tots, esito="visibile", note=""):
    for b, i, v, t in zip(bodies, imps, ivas, tots):
        segno = -1 if b["tipo"] in ("TD04", "TD08") else 1
        ATTESO.append({
            "file": rel, "numero": b["numero"], "data": b.get("data"), "tipo": b["tipo"],
            "cedente": ced["nome"] or f"{ced['nomep']} {ced['cognome']}",
            "cessionario": ces["nome"] or f"{ces['nomep']} {ces['cognome']}",
            "imponibile": round(segno * i, 2), "iva": round(segno * v, 2), "totale": round(segno * t, 2),
            "direzione": "emessa" if ced is AZ else "ricevuta", "esito": esito, "note": note,
        })


def genera(rel, ced, ces, bodies, prog, esito="visibile", note="", **kw):
    xml, imps, ivas, tots = fattura(ced, ces, bodies, prog, **kw)
    scrivi(rel, xml, encoding=("latin-1" if kw.get("encoding") == "ISO-8859-1" else "utf-8"))
    registra(rel, ced, ces, bodies, imps, ivas, tots, esito, note)
    return xml


def pag(mod="MP05", scad="2025-12-31"):
    return {"mod": mod, "scad": scad}


def main():
    """Genera in una cartella temporanea e sostituisce tests/fixtures solo se tutto è andato a buon fine."""
    global OUT
    stage = Path(tempfile.mkdtemp(prefix="fe-stage-"))
    OUT = stage / "fixtures"
    try:
        genera_tutto()
        if DEST.exists():
            shutil.rmtree(DEST)
        shutil.copytree(OUT, DEST)
    finally:
        shutil.rmtree(stage, ignore_errors=True)
    scrivi_esempi()
    riepilogo_atteso()


ESEMPI_JS = Path(__file__).resolve().parent.parent / "html" / "esempi.js"


def scrivi_esempi():
    """Scrive html/esempi.js: le fatture ricevute ed emesse di tests/fixtures come dati inerti (JSON) per il
    pulsante «Prova con fatture di esempio». Niente p7m, casi limite né il file con contenuto ostile.
    Le ricevute e le emesse si alternano, così anche poche fatture mostrano entrambe le direzioni."""
    def elenco(sub):
        return sorted(p for p in (DEST / sub).rglob("*.xml"))
    a, b = elenco("ricevute"), elenco("emesse")
    ordine = []
    while a or b:
        for lista in (a, b):
            if lista:
                ordine.append(lista.pop(0))
    files = [{"p": f.relative_to(DEST).as_posix(), "x": f.read_text(encoding="utf-8")} for f in ordine]
    v = zlib.crc32("".join(f["p"] + f["x"] for f in files).encode("utf-8"))
    dati = json.dumps({"v": v, "f": files}, ensure_ascii=True, separators=(",", ":"))
    ESEMPI_JS.write_text(
        "/* GENERATO da tests/generate_fixtures.py: non modificare a mano. Solo fatture FITTIZIE (dati inerti). */\n"
        f"const ESEMPI=Object.freeze({dati});\n", encoding="utf-8", newline="\n")
    print(f"html/esempi.js: {len(files)} fatture di esempio")


def genera_tutto():
    OUT.mkdir(parents=True)

    # ===== fatture ricevute (cedente = fornitore, cessionario = Azienda Test) =====
    genera("ricevute/2024/12/IT02345678900_00000.xml", F1, AZ, [dict(
        tipo="TD01", data="2024-12-20", numero="FE/2024/900", righe=[("Cancelleria varia", 5, "PZ", 2.00, 22.0, None)],
        pagamento=pag(scad="2025-01-20"))], "00000")

    genera("ricevute/2025/01/IT02345678900_00001.xml", F1, AZ, [dict(
        tipo="TD01", data="2025-01-15", numero="FE/2025/1",
        righe=[("Materiale di consumo", 10, "PZ", 12.50, 22.0, None), ("Spedizione", 1, "NR", 15.00, 22.0, None)],
        pagamento=pag(scad="2025-02-14"))], "00001")

    genera("ricevute/2025/02/IT02345678900_00002.xml", F1, AZ, [dict(
        tipo="TD04", data="2025-02-03", numero="NC/2025/1", causali=["Nota di credito su fattura FE/2025/1 - reso merce"],
        righe=[("Reso materiale di consumo", 4, "PZ", 10.00, 22.0, None)])], "00002")

    # professionista: ritenuta d'acconto + cassa previdenziale
    genera("ricevute/2025/03/IT05678901230_00003.xml", ROSSI, AZ, [dict(
        tipo="TD06", data="2025-03-10", numero="3/2025", causali=["Parcella per consulenza - " + FATTURA_DI_PROVA],
        righe=[("Consulenza professionale marzo 2025", 1, "NR", 1000.00, 22.0, None)],
        cassa=dict(aliq=4.0, importo=40.00, imponibile=1000.00, aliq_iva=22.0),
        ritenuta=dict(aliq=20.0, importo=200.00), pagamento=pag(scad="2025-04-10"))], "00003")

    # più aliquote + operazione esente + bollo virtuale
    genera("ricevute/2025/04/IT02345678900_00004.xml", F1, AZ, [dict(
        tipo="TD01", data="2025-04-22", numero="FE/2025/4", bollo=2.00,
        righe=[("Fornitura A", 1, "NR", 100.00, 22.0, None), ("Libri e pubblicazioni", 4, "PZ", 50.00, 10.0, None),
               ("Servizio esente art. 10", 1, "NR", 50.00, 0.0, "N4")],
        pagamento=pag(scad="2025-05-22"))], "00004")

    # lotto: due fatture nello stesso file
    genera("ricevute/2025/05/IT02345678900_00005.xml", F1, AZ, [
        dict(tipo="TD01", data="2025-05-05", numero="FE/2025/5A", righe=[("Prodotto A", 5, "PZ", 10.00, 22.0, None)]),
        dict(tipo="TD01", data="2025-05-05", numero="FE/2025/5B", righe=[("Prodotto B", 1, "NR", 100.00, 22.0, None)])], "00005")

    # allegato PDF
    genera("ricevute/2025/06/IT03456789010_00006.xml", F3, AZ, [dict(
        tipo="TD01", data="2025-06-30", numero="SD-2025-6", ordini=[dict(id="ORD-77", cup="B11B20000010001", cig="ZA12345678")],
        righe=[("Canone annuale software gestionale", 1, "NR", 300.00, 22.0, None)], pagamento=pag("MP08", "2025-06-30"),
        allegato=("Fattura-SD-2025-6.pdf", mini_pdf("FATTURA DI PROVA - allegato")))], "00006")

    # fattura differita con DDT
    genera("ricevute/2025/08/IT02345678900_00008.xml", F1, AZ, [dict(
        tipo="TD24", data="2025-08-29", numero="D/8", ddt=[("DDT-101", "2025-08-05"), ("DDT-117", "2025-08-19")],
        righe=[("Merce consegnata come da DDT 101", 20, "PZ", 15.00, 22.0, None), ("Merce consegnata come da DDT 117", 10, "PZ", 20.00, 22.0, None)],
        pagamento=pag(scad="2025-10-31"))], "00008")

    # ===== fatture emesse (cedente = Azienda Test) =====
    genera("emesse/2025/IT01234567897_00001.xml", AZ, C1, [dict(
        tipo="TD01", data="2025-02-12", numero="1/E", righe=[("Servizio di assistenza", 20, "HUR", 50.00, 22.0, None)],
        pagamento=pag(scad="2025-03-14"))], "00001")
    genera("emesse/2025/IT01234567897_00002.xml", AZ, PRIVATO, [dict(
        tipo="TD01", data="2025-09-18", numero="2/E", righe=[("Corso di formazione", 1, "NR", 80.00, 22.0, None)])], "00002")
    genera("emesse/2025/IT01234567897_00003.xml", AZ, C1, [dict(
        tipo="TD04", data="2025-10-02", numero="3/E", causali=["Nota di credito su fattura 1/E"],
        righe=[("Storno 2 ore di assistenza", 2, "HUR", 50.00, 22.0, None)])], "00003")

    # ===== file firmati (.xml.p7m) =====
    firmate(F1, AZ)

    # ===== carte carburante =====
    carburante()

    # ===== casi limite =====
    casi_limite()

    testo = json.dumps(ATTESO, indent=2, ensure_ascii=False) + "\n"
    (OUT / "ATTESO.json").write_bytes(testo.encode("utf-8"))  # sempre LF, anche su Windows


def firmate(ced, ces):
    """Tre fatture firmate: DER, BER 'streaming' (OCTET STRING a pezzi) e PEM/base64."""
    base = [
        ("IT02345678900_00010.xml.p7m", "DER", dict(tipo="TD01", data="2025-09-10", numero="FE/2025/10",
            righe=[("Fornitura firmata (CAdES, DER)", 2, "PZ", 50.00, 22.0, None)])),
        ("IT02345678900_00011.xml.p7m", "BER", dict(tipo="TD01", data="2025-09-11", numero="FE/2025/11",
            righe=[("Fornitura firmata (CAdES, BER in streaming)", 3, "PZ", 40.00, 22.0, None)])),
        ("IT02345678900_00012.xml.p7m", "PEM", dict(tipo="TD01", data="2025-09-12", numero="FE/2025/12",
            righe=[("Fornitura firmata (p7m in base64)", 1, "NR", 200.00, 22.0, None)])),
    ]
    exe = os.environ.get("OPENSSL") or shutil.which("openssl")
    if not exe:
        sys.exit("ERRORE: openssl non trovato (serve per i file .p7m). Installalo o imposta la variabile OPENSSL.")
    tmp = Path(tempfile.mkdtemp(prefix="fe-fixtures-"))
    try:
        env = dict(os.environ)
        conf = env.get("OPENSSL_CONF")
        if conf and not Path(conf).is_file():
            env.pop("OPENSSL_CONF")  # configurazione di openssl inesistente (capita con alcuni programmi installati): la ignoriamo
        key, crt = tmp / "k.pem", tmp / "c.pem"
        subprocess.run([exe, "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", str(key), "-out", str(crt),
                        "-subj", "/CN=Certificato di prova - non valido", "-days", "2"], check=True, capture_output=True, env=env)
        for nome, formato, b in base:
            xml, imps, ivas, tots = fattura(ced, ces, [b], nome[14:19])
            sorgente = tmp / "src.xml"
            sorgente.write_bytes(xml.encode("utf-8"))
            destinazione = OUT / "firmate" / nome
            destinazione.parent.mkdir(parents=True, exist_ok=True)
            cmd = [exe, "cms", "-sign", "-in", str(sorgente), "-signer", str(crt), "-inkey", str(key),
                   "-nodetach", "-binary", "-outform", "PEM" if formato == "PEM" else "DER", "-out", str(destinazione)]
            if formato == "BER":
                cmd.append("-stream")
            subprocess.run(cmd, check=True, capture_output=True, env=env)
            registra("firmate/" + nome, ced, ces, [b], imps, ivas, tots, note=f"p7m {formato}")
    except subprocess.CalledProcessError as e:
        print("ERRORE openssl:", (e.stderr or b"").decode(errors="replace")[-400:], file=sys.stderr)
        raise
    finally:
        shutil.rmtree(tmp, ignore_errors=True)  # il certificato di prova e la chiave non restano da nessuna parte


# ---------------------------------------------------------------- carte carburante (Q8)
# L'app legge i CSV allegati alle fatture del fornitore con questa partita IVA (Kuwait Petroleum Italia, Q8): nelle
# fatture di prova serve proprio quella, altrimenti il lettore non scatta. Nome, indirizzo, carte, targhe e importi sono inventati.
PIVA_Q8 = "00891951006"
Q8 = {"nome": "Carburanti Esempio S.p.A. (fornitore Q8 di prova)", "piva": PIVA_Q8, "cf": PIVA_Q8, "via": "Via del Rifornimento",
      "civ": "1", "cap": "00100", "comune": "Roma", "prov": "RM", "naz": "IT", "paese": "IT", "dest": "0000000", "regime": "RF01"}
Q8_PRODOTTI = {"GLS": "GASOLIO", "SSP": "SUPER SENZA PB", "HBZ": "Q8HI PERFORM - 100 OTTANI", "constructor": "PRODOTTO IGNOTO"}
Q8_TRS = "Carta;Num Ticket;Data;Ora;Cod Prod;Veicolo;Targa/Nome;KM;Cod;Indirizzo;Citta';Imp;Vol;Prezzo E/L;Sconto E/L;Prezzo Scontato;Imp Tot;"
Q8_ACC = "Prodotto;Quantita' Litri;Importo;IVA;Imponibile;Importo Accisa;Base imponib al netto di IVA e Accisa;IVA su imponibile al netto di Accisa;Tot Fattura"
Q8_FEE = "Cod. Main; Cod.Sub;Servizio Cartissima Web;Cartissima Web Plus;Invio Documentazione Cartacea;Spese mensili per carta;Spese riemissione carta;Insoluti;Incentive B2B;"
STAZIONI = {"0001": ("VIA DELLE PROVE 1", "ROMA"), "0002": ("CORSO ESEMPIO 22", "MILANO"),
            # contenuto ostile (fattura PJ4): deve comparire come testo, senza eseguire nulla
            "0666": ("<script>window.__xss=2</script> VIA", "\"><svg onload=window.__xss=3>")}


def virgola(x, dec=2):
    return f"{x:.{dec}f}".replace(".", ",")


def zip_di(nome, testo):
    """ZIP con un solo file, byte per byte uguale su ogni sistema (zlib non lo garantisce: la CI rigenera le fixture su Linux).
    Il file è dichiarato "deflate" ma il flusso è un solo blocco non compresso: è deflate valido e passa dalla stessa
    decompressione nativa del browser di un archivio vero."""
    dati = testo.encode("utf-8")
    assert len(dati) < 0xFFFF
    raw = b"" + struct.pack("<HH", len(dati), len(dati) ^ 0xFFFF) + dati
    crc, n, ora, data = zlib.crc32(dati), nome.encode("utf-8"), 0, 0x21  # 1980-01-01 00:00
    locale = struct.pack("<IHHHHHIIIHH", 0x04034B50, 20, 0, 8, ora, data, crc, len(raw), len(dati), len(n), 0) + n + raw
    centrale = struct.pack("<IHHHHHHIIIHHHHHII", 0x02014B50, 20, 20, 0, 8, ora, data, crc, len(raw), len(dati), len(n), 0, 0, 0, 0, 0, 0) + n
    fine = struct.pack("<IHHHHIIH", 0x06054B50, 0, 0, 1, 1, len(centrale), len(locale), 0)
    return locale + centrale + fine


def allegati_q8(base, righe, fee=0.0):
    """Ritorna (allegati, righe-fattura) per una fattura Q8 di prova.
    righe: (carta, ticket, gg/mm/aa, hhmmss, prodotto, targa, stazione, importo, litri)."""
    trs = [Q8_TRS]
    per_prod = {}
    for carta, tk, data, ora, prod, targa, stz, imp, vol in righe:
        prezzo = imp / vol
        via, citta = STAZIONI[stz]
        trs.append(f"{carta};{tk};{data};{ora};{prod};0000;{targa};00000000;{stz};{via};{citta};{virgola(imp)};{virgola(vol)};"
                   f"{virgola(prezzo, 3)};0,000000;{virgola(prezzo, 6)};{virgola(imp)};")
        x = per_prod.setdefault(prod, [0.0, 0.0])
        x[0] += vol
        x[1] += imp
    acc = [Q8_ACC]
    tl = ti = tv = tb = ta = 0.0
    voci = []
    for prod, (vol, imp) in per_prod.items():
        base_imp = round(imp / 1.22, 2)
        iva = round(imp - base_imp, 2)
        accisa = round(vol * 0.5, 2)
        acc.append(f"{Q8_PRODOTTI[prod]};{virgola(vol)};{virgola(imp)};{virgola(iva)};{virgola(base_imp)};{virgola(accisa)}; ; ; ")
        tl += vol; ti += imp; tv += iva; tb += base_imp; ta += accisa
        voci.append((Q8_PRODOTTI[prod].title(), 1, "NR", base_imp, 22.0, None))
    acc.append(f"TOTALE;{virgola(tl)};{virgola(ti)};{virgola(tv)};{virgola(tb)};{virgola(ta)}; ; ; ")
    crlf = "\r\n"
    csv = {"ACC": crlf.join(acc) + crlf, "FEE": crlf.join([Q8_FEE, f"0000000001;0000000;0;0;0;{fee:.2f};0;0;0;"]) + crlf}
    if righe:
        csv["TRS"] = crlf.join(trs) + crlf
    if fee:
        voci.append(("Spese carta", 1, "NR", round(fee / 1.22, 2), 22.0, None))
    allegati = []
    for tipo in ("ACC", "TRS", "FEE"):
        if tipo in csv:
            if base.endswith(".zip"):  # dal 2023 i file si chiamano .zip, senza compressione dichiarata
                allegati.append((f"{base[:-4]}_{tipo}.zip", None, "ZIP", zip_di(f"{base[:-4]}_{tipo}.csv", csv[tipo])))
            else:
                allegati.append((f"{base}_{tipo}.csv", "ZIP", "CSV", zip_di(f"{base}_{tipo}.csv", csv[tipo])))
    return allegati, voci


def carburante():
    L = "carburante/"
    gen = [
        # (file, data fattura, numero, base allegati, righe, spese carta)
        ("IT00000000001_00001.xml", "2025-01-31", "PJ0000001", "PROVA_Cards_2025_PJ0000001", [
            ("7000000000000000001", "00001", "08/01/25", "071710", "GLS", "AB123CD", "0001", 80.00, 50.00),
            ("7000000000000000001", "00002", "15/01/25", "183015", "GLS", "AB 123 CD", "0002", 73.50, 45.00),
            ("7000000000000000002", "00001", "20/01/25", "090000", "SSP", "EF456GH", "0001", 50.01, 30.00),
            ("7000000000000000003", "00001", "27/01/25", "120500", "HBZ", "FURGONE", "0002", 60.00, 31.00),
        ], 9.76),
        ("IT00000000001_00002.xml", "2025-02-28", "PJ0000002", "PROVA_Cards_2025_PJ0000002.zip", [
            ("7000000000000000001", "00003", "05/02/25", "081000", "GLS", "ab123cd", "0001", 90.00, 55.00),
            ("7000000000000000002", "00002", "12/02/25", "164500", "SSP", "EF-456-GH", "0002", 45.00, 27.50),
            ("7000000000000000003", "00002", "19/02/25", "101010", "HBZ", "FURGONE", "0001", 62.20, 32.00),
        ], 0.0),
        # solo spese della carta, nessun rifornimento (succede davvero nei mesi senza movimenti)
        ("IT00000000001_00003.xml", "2025-03-31", "PJ0000003", "PROVA_Cards_2025_PJ0000003", [], 9.76),
        # CSV ostile: HTML, script, formule Excel e un codice prodotto che è anche una proprietà di Object
        ("IT00000000001_00004.xml", "2025-04-30", 'PJ4" onmouseover="window.__xss=4', "PROVA_Cards_2025_PJ0000004", [
            ("=cmd|' /C calc'!A0", "@SUM(1+1)", "03/04/25", "101500", "GLS", "<img src=x onerror=window.__xss=1>", "0666", 40.00, 25.00),
            ("+1+1", "-2+3", "04/04/25", "111500", "constructor", '"><svg onload=window.__xss=5>', "0666", 30.00, 20.00),
        ], 0.0),
    ]
    for n, (f, data, numero, base, righe, fee) in enumerate(gen, 1):
        allegati, voci = allegati_q8(base, righe, fee)
        voci = voci or [("Spese carta", 1, "NR", round(fee / 1.22, 2), 22.0, None)]
        genera(L + f, Q8, AZ, [dict(tipo="TD01", data=data, numero=numero, righe=voci, allegati=allegati,
                                    pagamento=pag(scad=data))], f"{n:05d}",
               note="carta carburante Q8: scheda Rifornimenti" + (f" ({len(righe)} rifornimenti)" if righe else " (solo spese della carta)"))
        ATTESO[-1]["rifornimenti"] = len(righe)


def casi_limite():
    L = "casi-limite/"
    # namespace: senza prefisso e con prefisso ns2:
    genera(L + "namespace-senza-prefisso.xml", F1, AZ, [dict(
        tipo="TD01", data="2025-07-01", numero="NS/1", righe=[("Namespace di default", 1, "NR", 10.00, 22.0, None)])],
        "10001", modo="default")
    genera(L + "namespace-ns2.xml", F1, AZ, [dict(
        tipo="TD01", data="2025-07-02", numero="NS/2", righe=[("Tutti i tag con prefisso ns2", 1, "NR", 20.00, 22.0, None)])],
        "10002", modo="all")

    # namespace con spazio nell'URI: XML non ben formato per il browser, l'app lo ripara
    xml, i, v, t = fattura(F1, AZ, [dict(tipo="TD01", data="2025-07-03", numero="NS/3",
                                         righe=[("Namespace non valido (spazio nell'URI)", 1, "NR", 30.00, 22.0, None)])], "10003")
    xml = xml.replace("http://www.w3.org/2000/09/xmldsig#", "http://www.w3.org/2000 /09/xmldsig#")
    scrivi(L + "namespace-non-valido.xml", xml)
    registra(L + "namespace-non-valido.xml", F1, AZ, [dict(tipo="TD01", data="2025-07-03", numero="NS/3")], i, v, t,
             note="URI del namespace con uno spazio: l'app lo ripara e la legge")

    # codifica ISO-8859-1 con caratteri accentuati
    genera(L + "codifica-iso-8859-1.xml", azienda("Caffè Società Perché S.r.l.", "0678901234", "Via Città Vecchia", "35100", "Padova", "PD"), AZ,
           [dict(tipo="TD01", data="2025-07-04", numero="ENC/1", causali=["Perché è già così: àèéìòù - " + FATTURA_DI_PROVA],
                 righe=[("Caffè e pasticceria", 3, "PZ", 3.00, 10.0, None)])], "10004", encoding="ISO-8859-1",
           note="caratteri accentuati: devono comparire correttamente")

    # valuta diversa dall'euro
    genera(L + "valuta-usd.xml", F3, AZ, [dict(
        tipo="TD01", data="2025-07-05", numero="USD/1", divisa="USD", righe=[("Licenza software (USD)", 1, "NR", 200.00, 0.0, "N7")])],
        "10005", note="Divisa USD: gli importi si mostrano in USD, ma i totali della pagina sommano i numeri senza convertire")

    # data mancante
    genera(L + "senza-data.xml", F1, AZ, [dict(
        tipo="TD01", data=None, numero="SD/1", righe=[("Fattura senza data", 1, "NR", 10.00, 22.0, None)])], "10006",
        note="senza Data: compare in elenco ma senza data e non rientra nei filtri per anno")

    # duplicato di FE/2025/1 in un'altra cartella
    dup = OUT / L / "duplicato" / "IT02345678900_00001.xml"
    dup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(OUT / "ricevute/2025/01/IT02345678900_00001.xml", dup)
    registra(L + "duplicato/IT02345678900_00001.xml", F1, AZ, [dict(tipo="TD01", data="2025-01-15", numero="FE/2025/1")], [140.0], [30.8], [170.8],
             esito="duplicato", note="copia identica di ricevute/2025/01/IT02345678900_00001.xml: nascosta di default")

    # contenuto ostile: l'app deve mostrarlo come testo, senza eseguire nulla
    ostile = azienda("<img src=x onerror=\"window.__xss=1\">Fornitore =cmd|' /C calc'", "0789012345", "Via <script>alert(1)</script>", "00000", "Test", "RM")
    xml, i, v, t = fattura(ostile, AZ, [dict(
        tipo="TD01", numero="=1+1", data="2025-07-06", causali=["<script>window.__xss=2</script>", "\"><svg onload=window.__xss=3>"],
        righe=[("<iframe srcdoc='x'></iframe> riga con <b>HTML</b>", 1, "NR", 100.00, 22.0, None)])], "10007")
    scrivi(L + "contenuto-ostile-xss.xml", xml)
    registra(L + "contenuto-ostile-xss.xml", ostile, AZ, [dict(tipo="TD01", data="2025-07-06", numero="=1+1")], i, v, t,
             note="HTML e script nei campi: devono comparire come testo, window.__xss deve restare undefined; nel CSV le celle che iniziano con = hanno un apice davanti")

    # file che non è una fattura (altra radice) e notifica SDI (nome ignorato)
    scrivi(L + "documento-non-fattura.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<Documento><Titolo>Non è una fattura</Titolo></Documento>\n')
    ATTESO.append({"file": L + "documento-non-fattura.xml", "esito": "ignorato", "note": "radice diversa da FatturaElettronica: ignorato in silenzio"})
    scrivi(L + "IT02345678900_MT_00001.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<MetadatiInvioFile><NomeFile>x</NomeFile></MetadatiInvioFile>\n')
    ATTESO.append({"file": L + "IT02345678900_MT_00001.xml", "esito": "ignorato", "note": "nome da notifica SDI (_MT_): saltato"})

    # XML rotto
    scrivi(L + "xml-non-valido.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<p:FatturaElettronica><FatturaElettronicaHeader><Sbagliato>\n')
    ATTESO.append({"file": L + "xml-non-valido.xml", "esito": "errore", "note": "XML non ben formato: compare in 'file non letti'"})


def riepilogo_atteso():
    vis = [a for a in ATTESO if a.get("esito") == "visibile"]
    print(f"\nFile generati in {DEST}")
    print(f"Fatture visibili: {len(vis)}  | duplicati: {sum(a.get('esito') == 'duplicato' for a in ATTESO)}"
          f"  | ignorati: {sum(a.get('esito') == 'ignorato' for a in ATTESO)}  | errori: {sum(a.get('esito') == 'errore' for a in ATTESO)}")
    print("Imponibile:", m(sum(a["imponibile"] for a in vis)), " IVA:", m(sum(a["iva"] for a in vis)), " Totale:", m(sum(a["totale"] for a in vis)))
    for d in ("emessa", "ricevuta"):
        s = [a for a in vis if a["direzione"] == d]
        print(f"  {d}: {len(s)} fatture, totale {m(sum(a['totale'] for a in s))}")


if __name__ == "__main__":
    main()
