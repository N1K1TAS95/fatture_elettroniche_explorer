## Cosa cambia

<!-- Descrivi in poche righe la modifica e il perché. Collega la issue, se c'è: "Risolve #123". -->

## Controlli

- [ ] `uv run tests/check.py` passa
- [ ] Ho provato la modifica con le fatture di `tests/fixtures`
- [ ] **Non ci sono dati reali**: nessuna fattura, P.IVA, codice fiscale, nome di persona o azienda vera (nel codice, nei test, negli screenshot)
- [ ] Non ho aggiunto dipendenze, richieste di rete, script inline né `innerHTML` con valori non passati da `esc()`
- [ ] Se ho toccato la CSP, l'ho allineata in `html/index.html`, `nginx.conf` e `serve.py`
- [ ] Se ho modificato i file dell'app, ho aumentato `VERSION` in `html/sw.js`
- [ ] Ho aggiornato la documentazione, se serviva
