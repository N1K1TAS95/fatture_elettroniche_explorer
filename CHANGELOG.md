# Changelog

Tutte le modifiche rilevanti del progetto sono annotate qui. Il formato segue [Keep a Changelog](https://keepachangelog.com/it-IT/1.1.0/) e le versioni seguono il [versionamento semantico](https://semver.org/lang/it/).

## [Non rilasciato]

## [1.1.0] - 2026-10-31

Interfaccia rivista, con più cura per schermi larghi e telefoni.

### Aggiunto
- Demo online su GitHub Pages con dominio dedicato (fatture-elettroniche-explorer.n1k.cloud), aggiornata a ogni release dal workflow `pages.yml`, solo dopo i controlli.
- Logo nell'header e nome della propria azienda sempre visibile quando è selezionata (un clic apre i filtri per cambiarla).
- Menu collassabile (hamburger) per schermi piccoli, con tutti i comandi dell'header.
- Menu a tendina personalizzati con ricerca e sotto-titolo (P.IVA e numero di fatture), anche per cliente/fornitore, con suggerimenti e navigazione da tastiera.

### Modificato
- Elenco e filtri a tutta larghezza dello schermo; header più alto con i comandi a destra.
- Con una cartella aperta scorre solo l'elenco: header, ricerca, anni, filtri attivi e totali restano fissi. I filtri si aprono come pannello sopra l'elenco e si chiudono con un clic fuori.
- Filtri su più righe: azienda e cliente/fornitore ciascuno a tutta larghezza, poi periodo, date, tipo e importi che vanno a capo in base allo spazio.
- Tema scelto con un solo pulsante a menu (automatico, chiaro, scuro).
- Icone vettoriali al posto delle emoji (allegato, cartelle, esporta CSV, aggiorna, frecce e comandi del dettaglio).
- Altezze e spaziature dei controlli uniformi; contatore dei filtri attivi più leggibile.
- Dettaglio fattura: spazi verticali uniformi tra le card e testata allineata; su telefono pulsanti sulla prima riga e titolo a tutta larghezza.
- Su telefono la colonna Direzione passa sotto il nome della controparte, il riepilogo del dettaglio è su più righe e i filtri hanno i campi brevi in coppia.
- Scrollbar sottili nei colori del tema.

## [1.0.0] - 2026-10-31

Prima versione pubblica.

### Aggiunto
- Lettura ricorsiva di una cartella (anche di rete) con fatture `.xml` e `.xml.p7m` firmate (CAdES in DER, BER e base64), lotti di più fatture nello stesso file e codifiche diverse da UTF-8.
- Ricerca testuale, filtri per anno, periodo, cliente o fornitore, tipo documento e importo, distinzione tra fatture emesse e ricevute con riconoscimento automatico della propria azienda.
- Tre viste (elenco, riepilogo per cliente o fornitore, andamento mensile) con totali di imponibile, IVA e importo.
- Dettaglio della fattura (anagrafiche, righe, riepilogo IVA, pagamenti, ritenute, cassa previdenziale, bollo, riferimenti), XML originale e allegati PDF apribili e scaricabili.
- Modalità fattura singola: apertura o trascinamento di un solo file.
- Cartelle e fatture recenti con cache delle fatture già lette.
- Copia di cortesia in PDF della singola fattura, dal dialogo di stampa del browser.
- Esportazione CSV di quanto filtrato.
- Tema chiaro, scuro o automatico e interfaccia adattata a telefono, tablet e schermi molto larghi.
- Installazione come app (PWA) e uso offline.
- Distribuzione con Docker (con Nginx Proxy Manager o standalone) e server locale con `uv run serve.py`.
- Fatture di prova fittizie in `tests/fixtures`, generatore e controlli automatici (`tests/check.py`).
- GitHub Actions di controllo, analisi CodeQL e aggiornamento automatico delle action con Dependabot.
- Moduli per le segnalazioni, modello di pull request, guida per contribuire (`CONTRIBUTING.md`) e politica di sicurezza (`SECURITY.md`).

### Sicurezza
- Content-Security-Policy restrittiva, senza richieste di rete, script inline o `unsafe-eval`.
- Ogni campo delle fatture è trattato come non fidato e mostrato come testo.
- Container in sola lettura, con capability ridotte e header di sicurezza.

### Limiti noti
- Le fatture in valuta diversa dall'euro sono sommate nei totali senza conversione.
- Le fatture semplificate (`FatturaElettronicaSemplificata`) non sono supportate.
- Firefox e Safari usano la modalità compatibile, senza cartelle recenti né installazione come app.
- Il foglio di stile Assosoftware non è incluso per via della sua licenza.

[Non rilasciato]: https://github.com/N1K1TAS95/fatture_elettroniche_explorer/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/N1K1TAS95/fatture_elettroniche_explorer/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/N1K1TAS95/fatture_elettroniche_explorer/releases/tag/v1.0.0
