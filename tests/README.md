# Fatture di prova

Questa cartella contiene fatture elettroniche **fittizie** per provare Fatture Elettroniche Explorer. Tutti i dati (aziende, persone, P.IVA, codici fiscali, IBAN) sono inventati: **non sono fatture valide e non vanno mai inviate allo SDI**. Le fatture reali non vanno mai messe qui né altrove nel repository.

- Non fanno parte dell'applicazione: stanno fuori da `html/`, quindi **non finiscono nel container Docker** (il compose monta solo `html/`) né nella pubblicazione del sito. Il file `.dockerignore` le esclude anche da eventuali build future.
- Il `.gitignore` esclude `.xml`, `.p7m`, `.csv` e `.pdf` in tutto il repository, **tranne** `tests/fixtures/`.

## Come provarle

1. Avvia l'app (`uv run serve.py`, oppure apri `html/index.html`).
2. **Seleziona cartella…** e scegli `tests/fixtures`.
3. Confronta quello che vedi con i risultati attesi qui sotto (e con `fixtures/ATTESO.json`, che elenca i valori attesi di ogni documento).

Per provare il **PDF**: apri il dettaglio di una fattura, premi **PDF** e scegli *Salva come PDF*. Buoni candidati: la parcella con ritenuta e cassa (`…/2025/03/…_00003.xml`), quella con più aliquote e bollo (`…/2025/04/…_00004.xml`) e `casi-limite/contenuto-ostile-xss.xml` (HTML e script devono comparire come testo).

Per provare la modalità **fattura singola**: **Apri fattura…** e scegli un file qualsiasi, per esempio `fixtures/ricevute/2025/03/IT05678901230_00003.xml` (ritenuta e cassa previdenziale) o `fixtures/ricevute/2025/06/IT03456789010_00006.xml` (allegato PDF).

## Risultati attesi (cartella `tests/fixtures` intera)

| Verifica | Atteso |
| --- | --- |
| Fatture mostrate | **26** (la 27ª è un duplicato nascosto) |
| Emesse / ricevute | 3 / 23 |
| Imponibile · IVA · Totale | **4.680,01 € · 949,52 € · 5.631,53 €** |
| Emesse (totale) / ricevute (totale) | 1.195,60 € / 4.435,93 € |
| La mia azienda (proposta in automatico) | **Azienda Test S.r.l.** (IT01234567897) |
| File non letti | **1**: `casi-limite/xml-non-valido.xml` |
| Anno | 2024: 1 fattura (12,20 €) · 2025: 24 (5.607,13 €) · senza data: 1 (12,20 €) |
| Tipi documento | TD01: 22 · TD04: 2 (importi negativi, -170,80 €) · TD06: 1 · TD24: 1 |
| Duplicati | Spunta *Nascondi duplicati* disattivata → 27 fatture, una con l'etichetta `dup` |

Il totale include la fattura in dollari (`valuta-usd.xml`, 200 USD) sommata senza conversione: è un limite noto dell'app, non un errore.

## Scheda Rifornimenti (cartella `carburante/`)

Le quattro fatture hanno come fornitore la partita IVA `IT00891951006` (gli altri dati sono inventati). Nessun fornitore è predefinito: aprendo la cartella `tests/fixtures` la scheda **Rifornimenti** è presente ma mostra «Fornitore non selezionato», con le istruzioni e il fornitore `00891951006` nell'elenco dei fornitori con allegati CSV/ZIP. Premendo **Leggi come carta carburante** la scheda deve mostrare: **9 rifornimenti**, spesa **530,71 €**, **315,50 litri**, prezzo medio **1,682 €/l**, **5 veicoli** e spese delle carte **19,52 €**. Cliccando la targa `AB123CD`: 3 rifornimenti, 243,50 €. Solo `AB123CD` ha i km (10.000, 10.700, 11.500): consumo **15,0 km/l** (6,7 l/100 km), in riepilogo «Consumo medio» uguale; gli altri veicoli mostrano «—». Nessun avviso di totali non coincidenti. Ricaricando la pagina e riaprendo la cartella la scelta è già salvata; **Non leggere più** (nell'elenco *Fornitori letti* in fondo) riporta a «Fornitore non selezionato». Su una fattura con solo PDF il pulsante nel dettaglio non compare.

## Cosa copre ogni file

| File | Cosa verifica |
| --- | --- |
| `ricevute/2024/12/…_00000.xml` | un'altra annualità (pulsanti degli anni) |
| `ricevute/2025/01/…_00001.xml` | fattura semplice con 2 righe e bonifico (IBAN fittizio) |
| `ricevute/2025/02/…_00002.xml` | **nota di credito** TD04: importi in negativo, etichetta rossa |
| `ricevute/2025/03/…_00003.xml` | **parcella TD06** di una persona fisica, con **ritenuta d'acconto** e **cassa previdenziale** |
| `ricevute/2025/04/…_00004.xml` | **più aliquote** (22%, 10%, esente N4) e **bollo** |
| `ricevute/2025/05/…_00005.xml` | **lotto**: due fatture nello stesso file (5A e 5B) |
| `ricevute/2025/06/…_00006.xml` | **allegato PDF** (si apre e si scarica), riferimenti d'ordine con CIG/CUP |
| `ricevute/2025/08/…_00008.xml` | **fattura differita TD24** con due DDT |
| `emesse/2025/…` | **fatture emesse** (chi emette è la "mia azienda"): una a un'azienda, una a un privato (solo codice fiscale), una nota di credito |
| `firmate/…_00010.xml.p7m` | firmata, contenitore **DER** |
| `firmate/…_00011.xml.p7m` | firmata, **BER in streaming** (contenuto spezzato in più pezzi) |
| `firmate/…_00012.xml.p7m` | firmata, **p7m in base64** (PEM) |
| `carburante/IT00000000001_00001.xml` | **carta carburante Q8**: 3 CSV zippati (nome `.csv`, compressione ZIP dichiarata), 4 rifornimenti, 3 veicoli, spese carta 9,76 € |
| `carburante/IT00000000001_00002.xml` | come sopra ma con allegati chiamati `.zip` (formato dal 2023): 3 rifornimenti. Le targhe `AB 123 CD`, `ab123cd` ed `AB123CD` devono contare come **un solo veicolo** |
| `carburante/IT00000000001_00003.xml` | solo spese della carta, **nessun rifornimento** (manca il CSV `TRS`) |
| `carburante/IT00000000001_00004.xml` | **sicurezza**: CSV con HTML e script in targa, indirizzo e città, formule Excel in carta e ticket (`=cmd…`, `@SUM…`, `+1+1`), un codice prodotto `constructor` e un numero fattura con un attributo HTML. Devono comparire come **testo**: `window.__xss` deve restare `undefined`, nessun elemento iniettato, e nel CSV le celle che iniziano con `=`, `+`, `-` o `@` hanno un apice davanti. Le targhe ostili diventano due veicoli a sé (lettere e cifre) |
| `casi-limite/namespace-senza-prefisso.xml` | namespace di default, senza prefisso |
| `casi-limite/namespace-ns2.xml` | tutti i tag con prefisso `ns2:` |
| `casi-limite/namespace-non-valido.xml` | URI del namespace con uno spazio (il browser rifiuterebbe l'XML): l'app lo ripara e lo legge |
| `casi-limite/codifica-iso-8859-1.xml` | codifica ISO-8859-1: gli accenti (`Caffè Società Perché`) devono comparire corretti |
| `casi-limite/valuta-usd.xml` | divisa diversa dall'euro (importi mostrati in USD) |
| `casi-limite/senza-data.xml` | data mancante: compare in elenco, senza data |
| `casi-limite/duplicato/…_00001.xml` | copia identica di una fattura: nascosta di default, segnalata come duplicato |
| `casi-limite/contenuto-ostile-xss.xml` | **sicurezza**: HTML e script nei campi. Devono comparire come **testo**, senza eseguire nulla (in console `window.__xss` deve restare `undefined`). Nel CSV le celle che iniziano con `=` hanno un apice davanti |
| `casi-limite/documento-non-fattura.xml` | XML con radice diversa: ignorato in silenzio |
| `casi-limite/IT…_MT_00001.xml` | nome da notifica SDI (`_MT_`): saltato |
| `casi-limite/xml-non-valido.xml` | XML rotto: compare nei *file non letti* |

## Rigenerare le fatture

I file sono prodotti da uno script, così restano coerenti tra loro:

```bash
uv run tests/generate_fixtures.py
```

Usa solo la libreria standard di Python. Per i file `.p7m` serve `openssl` nel `PATH` (o la variabile `OPENSSL` con il percorso dell'eseguibile); senza, lo script si ferma con un errore. Le fatture vengono scritte in una cartella temporanea e sostituiscono quelle esistenti solo a lavoro finito, quindi un errore non lascia `fixtures/` a metà. La firma usa un certificato di prova usa e getta, creato in una cartella temporanea e cancellato subito: **la chiave non viene mai salvata**. Le firme contengono la data di creazione, quindi i `.p7m` rigenerati risultano modificati per git; i `.xml` restano identici.

Lo script riscrive anche `fixtures/ATTESO.json` e stampa il riepilogo dei totali: se aggiungi o cambi una fattura, aggiorna di conseguenza la tabella qui sopra.

## Controlli automatici

`check.py` verifica il repository senza browser e solo con la libreria standard di Python:

```bash
uv run tests/check.py
```

- la Content-Security-Policy è identica in `html/index.html`, `nginx.conf` e `serve.py`, senza `unsafe-eval` né `unsafe-inline` (salvo `style-src-attr`);
- l'app non contiene riferimenti a altre origini, script inline o gestori di eventi inline;
- in `html/` non ci sono fatture né altri file di dati;
- manifest e service worker sono coerenti con i file presenti;
- le fatture di prova sono XML ben formato, tranne i due file rotti apposta.

Gli stessi controlli, più la verifica che le fatture di prova coincidano con il generatore e che i file di Docker Compose siano validi, girano a ogni push con la GitHub Action `.github/workflows/ci.yml`. Non serve nessun segreto e la Action può solo leggere il codice. Non verifica i risultati attesi dentro l'app (quelli si controllano a mano, vedi sopra): serve un browser.
