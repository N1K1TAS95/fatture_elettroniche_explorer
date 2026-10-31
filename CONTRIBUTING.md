# Contribuire a Fatture Elettroniche Explorer

Grazie per l'interesse! Le segnalazioni e le proposte sono benvenute. Questa guida spiega come proporre una modifica senza sorprese.

## Prima di tutto: niente dati reali

Le fatture elettroniche contengono **dati personali** (nomi, P.IVA, codici fiscali, IBAN, importi) e questo repository è **pubblico**. Per questo:

- non allegare né incollare mai fatture vere in issue, pull request, commenti o screenshot;
- se un problema dipende da una fattura, **anonimizzala o inventane una** con la stessa struttura;
- per provare l'app usa le fatture fittizie di [`tests/fixtures`](tests/fixtures) (vedi [tests/README.md](tests/README.md)).

Il `.gitignore` esclude `.xml`, `.p7m`, `.csv` e `.pdf` proprio per evitare errori, con l'unica eccezione di `tests/fixtures`.

## Segnalare un problema o proporre un'idea

Apri una [issue](https://github.com/N1K1TAS95/fatture_elettroniche_explorer/issues/new/choose) e compila il modulo. Più il caso è riproducibile (meglio se con le fatture di prova), più è facile risolverlo.

**Vulnerabilità di sicurezza:** non usare le issue. Segui le istruzioni in [SECURITY.md](SECURITY.md) e usa la segnalazione privata.

## Principi del progetto

Le modifiche devono rispettarli; sono il motivo per cui l'app è semplice da usare e da verificare:

- **Nessuna dipendenza e nessuna build**: HTML, CSS e JavaScript puri.
- **Nessuna richiesta di rete**: le fatture non lasciano mai il browser. La Content-Security-Policy lo impone.
- **Ogni dato di una fattura è non fidato**: i valori mostrati nella pagina passano sempre da `esc()`; niente script inline né gestori di eventi inline.
- **Sicurezza prima di tutto**: nel dubbio, la scelta più restrittiva.

## Provare una modifica in locale

```bash
uv run serve.py            # app su http://localhost:8000, con gli header della produzione
uv run tests/check.py      # controlli del repository (gli stessi della CI)
```

Poi apri `tests/fixtures` dall'app e confronta con i risultati attesi in [tests/README.md](tests/README.md). Se tocchi il lettore delle fatture o i totali, controlla anche i casi limite (file firmati, lotti, note di credito, codifiche, contenuto ostile).

## Regole pratiche

- **CSP**: se la modifichi, tieni allineati `html/index.html` (il `<meta>`), `nginx.conf` e `serve.py`; `tests/check.py` lo verifica.
- **Changelog**: annota le modifiche visibili agli utenti in [CHANGELOG.md](CHANGELOG.md), sotto *Non rilasciato*.
- **Cache dell'app**: se cambi i file in `html/`, aumenta `VERSION` in `html/sw.js`.
- **Fatture di prova**: sono generate da `tests/generate_fixtures.py`. Non modificare a mano i file in `tests/fixtures`: cambia lo script e rigenera.
- **Lingua**: interfaccia, documentazione e messaggi di commit in italiano.
- **Piccole e mirate**: una pull request, uno scopo. Le modifiche grandi vanno discusse prima in una issue.

Se lavori con un **assistente di programmazione** (un agente), fagli leggere [AGENTS.md](AGENTS.md): contiene le stesse regole in forma sintetica.

## Aprire una pull request

1. Fai un fork e crea un ramo dedicato.
2. Esegui `uv run tests/check.py`.
3. Apri la pull request e compila l'elenco dei controlli.
4. La CI parte da sola. Per le prime contribuzioni un amministratore deve approvarne l'esecuzione.

Inviando una modifica accetti che sia rilasciata con la [licenza MIT](LICENSE) del progetto.
