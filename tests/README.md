# Fatture di prova

Questa cartella contiene fatture elettroniche **fittizie** per provare Fatture Explorer. Tutti i dati (aziende, persone, P.IVA, codici fiscali, IBAN) sono inventati: **non sono fatture valide e non vanno mai inviate allo SDI**. Le fatture reali non vanno mai messe qui né altrove nel repository.

- Non fanno parte dell'applicazione: stanno fuori da `html/`, quindi **non finiscono nel container Docker** (il compose monta solo `html/`) né nella pubblicazione del sito. Il file `.dockerignore` le esclude anche da eventuali build future.
- Il `.gitignore` esclude `.xml`, `.p7m`, `.csv` e `.pdf` in tutto il repository, **tranne** `tests/fixtures/`.

## Come provarle

1. Avvia l'app (`uv run serve.py`, oppure apri `html/index.html`).
2. **Seleziona cartella…** e scegli `tests/fixtures`.
3. Confronta quello che vedi con i risultati attesi qui sotto (e con `fixtures/ATTESO.json`, che elenca i valori attesi di ogni documento).

Per provare la modalità **fattura singola**: **Apri fattura…** e scegli un file qualsiasi, per esempio `fixtures/ricevute/2025/03/IT05678901230_00003.xml` (ritenuta e cassa previdenziale) o `fixtures/ricevute/2025/06/IT03456789010_00006.xml` (allegato PDF).

## Risultati attesi (cartella `tests/fixtures` intera)

| Verifica | Atteso |
| --- | --- |
| Fatture mostrate | **22** (la 23ª è un duplicato nascosto) |
| Emesse / ricevute | 3 / 19 |
| Imponibile · IVA · Totale | **4.229,00 € · 850,30 € · 5.081,30 €** |
| Emesse (totale) / ricevute (totale) | 1.195,60 € / 3.885,70 € |
| La mia azienda (proposta in automatico) | **Azienda Test S.r.l.** (IT01234567897) |
| File non letti | **1**: `casi-limite/xml-non-valido.xml` |
| Anno | 2024: 1 fattura (12,20 €) · 2025: 20 (5.056,90 €) · senza data: 1 (12,20 €) |
| Tipi documento | TD01: 18 · TD04: 2 (importi negativi, -170,80 €) · TD06: 1 · TD24: 1 |
| Duplicati | Spunta *Nascondi duplicati* disattivata → 23 fatture, una con l'etichetta `dup` |

Il totale include la fattura in dollari (`valuta-usd.xml`, 200 USD) sommata senza conversione: è un limite noto dell'app, non un errore.

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

Usa solo la libreria standard di Python. Per i file `.p7m` serve `openssl` nel `PATH` (o la variabile `OPENSSL` con il percorso dell'eseguibile); senza, quei tre file vengono saltati. La firma usa un certificato di prova usa e getta, creato in una cartella temporanea e cancellato subito: **la chiave non viene mai salvata**. Le firme contengono la data di creazione, quindi i `.p7m` rigenerati risultano modificati per git; i `.xml` restano identici.

Lo script riscrive anche `fixtures/ATTESO.json` e stampa il riepilogo dei totali: se aggiungi o cambi una fattura, aggiorna di conseguenza la tabella qui sopra.
