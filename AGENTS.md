# AGENTS.md

Istruzioni per gli assistenti di programmazione (e per chi arriva nuovo) su **Fatture Elettroniche Explorer**: un esploratore di fatture elettroniche italiane (FatturaPA) che gira interamente nel browser. Le regole per chi contribuisce, in forma più discorsiva, sono in [CONTRIBUTING.md](CONTRIBUTING.md); la sicurezza è in [SECURITY.md](SECURITY.md).

## Cos'è

HTML, CSS e JavaScript puri in `html/`: **nessuna dipendenza, nessuna build, nessuna richiesta di rete**. Le fatture si leggono dal computer dell'utente e non lasciano mai il browser. Interfaccia, documentazione e messaggi di commit sono in **italiano**.

```
html/    il sito: tutto ciò che viene pubblicato (index.html, app.js, app.css, sw.js, manifest…)
tests/   fatture di PROVA fittizie (fixtures/), generatore e controlli (check.py)
docs/    immagini del README e anteprima social (solo da fatture fittizie)
.github/ CI, pubblicazione della demo (Pages), moduli per le issue
```

## Comandi

```bash
uv run serve.py                       # app su http://localhost:8000, con gli header di produzione
uv run tests/check.py                 # controlli del repository: gli stessi della CI. Lancialo prima di committare
uv run tests/generate_fixtures.py     # rigenera tests/fixtures (serve openssl per i file .p7m)
```

I risultati attesi dell'app sulle fatture di prova sono in `tests/README.md` e `tests/fixtures/ATTESO.json`.

## Regole che non si deducono dal codice

**Sicurezza**
- Ogni campo di una fattura è **non fidato**: va mostrato sempre con `esc()`. Niente `innerHTML` con valori che non passano da lì, niente script o gestori di eventi inline.
- **Nessuna richiesta di rete** e nessuna libreria, font o CDN esterni. Non aggiungere dipendenze.
- La **Content-Security-Policy** è scritta in tre posti che devono restare identici: il `<meta>` di `html/index.html`, `nginx.conf` e `serve.py` (il `<meta>` non può avere `frame-ancestors`). `tests/check.py` lo verifica.
- Le **GitHub Actions** si fissano all'**hash del commit**, non al tag (il repository lo impone). Dependabot propone gli aggiornamenti.

**Dati**
- **Mai fatture reali**, né dati personali, nomi, P.IVA, percorsi del computer di qualcuno, in nessun file né screenshot. Si prova solo con `tests/fixtures`, che è generata da `tests/generate_fixtures.py`: non modificare quei file a mano, cambia lo script e rigenera.
- `html/esempi.js` è l'unico file di dati in `html/`: **generato** da `tests/generate_fixtures.py` con sole fatture fittizie (testo inerte, senza p7m né casi ostili). Non modificarlo a mano: `tests/check.py` lo confronta con `tests/fixtures`.
- Il `.gitignore` esclude `.xml`, `.p7m`, `.csv` e `.pdf` salvo `tests/fixtures/`. Non aggirarlo.

**Pubblicazione**
- Un file in `html/` diventa **pubblico**: Docker monta solo `html/` e la demo su GitHub Pages pubblica solo `html/`.
- La demo online si aggiorna **solo con una release** (tag `vX.Y.Z`), non con un push su `main`. Come si rilascia: vedi *Rilasciare una versione* in [CONTRIBUTING.md](CONTRIBUTING.md).
- Se cambi i file dell'app, aumenta `VERSION` in `html/sw.js` e annota le novità visibili agli utenti in `CHANGELOG.md`, sotto *Non rilasciato*.
- L'app deve funzionare anche aprendo `html/index.html` **da file**: percorsi relativi, e il service worker si registra solo su `http(s)`.
- Non rinominare il database IndexedDB né il prefisso della cache del service worker: gli utenti perderebbero cartelle recenti e cache.

**Dettagli che hanno già fatto danni**
- La stampa usa `body.printing` e `#printDoc` (copia di cortesia in PDF). Le regole di stampa nascondono ogni elemento `<header>`: non usarlo dentro `#printDoc`.
- Il foglio di stile **Assosoftware** non si può includere né adattare per la sua licenza proprietaria (vedi README): il layout del PDF è scritto da zero.
- Un parametro di sicurezza non va "risolto" con `'unsafe-eval'` o `'unsafe-inline'`; l'unica eccezione, già presente, è `style-src-attr 'unsafe-inline'`.

## Limiti noti (non sono bug da correggere di passaggio)

Le fatture in valuta diversa dall'euro sono sommate senza conversione; le fatture semplificate (`FatturaElettronicaSemplificata`) non sono supportate; Firefox e Safari usano la modalità compatibile.

## Lavorare sul repository

- Ramo `main` protetto: niente force push né cancellazione. La CI e l'analisi CodeQL devono restare verdi.
- Messaggi di commit in italiano, all'indicativo (`Aggiunge…`, `Corregge…`), con una riga di titolo e, se serve, un elenco del perché.
- Piccole modifiche, uno scopo per volta. Per le modifiche grandi apri prima una issue.
