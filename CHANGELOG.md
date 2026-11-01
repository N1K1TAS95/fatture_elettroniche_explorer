# Changelog

Tutte le modifiche rilevanti del progetto sono annotate qui. Il formato segue [Keep a Changelog](https://keepachangelog.com/it-IT/1.1.0/) e le versioni seguono il [versionamento semantico](https://semver.org/lang/it/).

## [Non rilasciato]

### Aggiunto
- Scheda Rifornimenti: sezione **Da controllare** con i rifornimenti che meritano una verifica, ognuno con il motivo: litri sopra soglia, rifornimenti troppo ravvicinati dello stesso veicolo, carburante insolito per il veicolo (con almeno 4 rifornimenti e un carburante prevalente), carta usata su targhe diverse, rifornimenti di notte (22–06) e di domenica. Sono indizi, non prove. Un avviso in cima alla scheda ne riporta il numero.
- **Soglie configurabili** (litri massimi, ore minime tra due rifornimenti, controllo di notte e domenica) per tutti i veicoli e per ogni singolo veicolo dal pulsante *Soglie…*. Restano salvate nel browser.
- Il CSV esportato ha la colonna *Da controllare* con i motivi.

## [1.5.0] - 2026-11-01

Scheda Rifornimenti: consumi, alias, ordinamento e nuove analisi.

### Aggiunto
- Scheda Rifornimenti: **consumo medio** (km/l e l/100 km) per veicolo e nel riepilogo, calcolato con il metodo «pieno a pieno» dai chilometri del contachilometri (colonna KM del CSV) di rifornimenti consecutivi della stessa targa. Compare solo per i veicoli i cui rifornimenti riportano i km; gli altri mostrano «—». I km sono anche nel CSV esportato.
- Scheda Rifornimenti, tabella *Per veicolo*: **litri al mese** e giorni medi tra un rifornimento e l'altro, disponibili anche senza i km.
- Scheda Rifornimenti: tutte le tabelle (*Per veicolo*, *Per carburante*, *Per stazione*, *Elenco rifornimenti*) si ordinano cliccando l'intestazione di una colonna (di nuovo per invertire), anche da tastiera. I valori mancanti, come il consumo senza km, restano in fondo. Nell'elenco, oltre i 300 rifornimenti, si vedono i primi 300 nell'ordine scelto.
- Scheda Rifornimenti: **alias dei veicoli**. Il pulsante con la matita accanto a una targa, nella tabella *Per veicolo*, permette di darle un nome (per esempio «Furgone di Mario»), mostrato al posto della targa in tabelle, filtro e ordinamento, con la targa sotto. L'alias si cerca come testo, finisce nel CSV esportato (colonna *Alias veicolo*) e resta salvato nel browser. Lasciandolo vuoto si toglie.
- Scheda Rifornimenti: **Prezzo al litro nel tempo**, grafico del prezzo medio pagato (spesa ÷ litri) per mese, con una linea per carburante (i 3 con più spesa).
- Scheda Rifornimenti: **Spesa mensile per veicolo**, tabella veicoli × mesi con totale, media al mese e proiezione annua (da 3 mesi di storia), ordinabile.
- Scheda Rifornimenti: **Quando si fa rifornimento**, rifornimenti e spesa per giorno della settimana e fascia oraria, con il riepilogo di fine settimana e notte. È un dato indicativo, non prova un uso improprio.

### Modificato
- Scheda Rifornimenti: il fornitore di carburante **non è più predefinito**. La scheda è sempre presente e, finché non ne scegli uno, mostra «Fornitore non selezionato» con le istruzioni e l'elenco dei fornitori che allegano file CSV o ZIP. La scelta resta salvata nel browser; per chi usava Q8 senza averlo scelto, va rifatta una volta.
- Cambia il formato della cache delle cartelle recenti: al primo uso le fatture vengono rilette una volta.

## [1.4.0] - 2026-11-01

Scheda Rifornimenti per le carte carburante Q8.

### Aggiunto
- Scheda **Rifornimenti** per le fatture delle carte carburante Q8 (Kuwait Petroleum Italia, P.IVA IT00891951006): l'app legge i CSV zippati allegati e mostra spesa, litri e prezzo al litro per periodo, veicolo (targa), carburante e stazione, con l'elenco dei rifornimenti e l'esportazione in CSV. Compare solo se tra le fatture ce ne sono. Segue i filtri di periodo e la ricerca; un clic su una targa o su una barra del grafico restringe i dati.
- Altri fornitori di carte carburante: dal dettaglio di una fattura con allegati CSV o ZIP, il pulsante **Leggi come carta carburante Q8** fa leggere i suoi allegati nello stesso formato di Q8. La scelta resta nel browser; si toglie con **Non leggere più** (dal dettaglio fattura o dall'elenco *Fornitori letti* nella scheda). Se gli allegati non sono nel formato Q8 non cambia nulla e l'app lo segnala.
- Scheda Rifornimenti: periodo coperto e filtri non applicabili in evidenza, clic su un rifornimento per aprire la sua fattura, grafico che parte dai mesi più recenti, stazione e carburante sotto la data sugli schermi stretti.
- Lettore ZIP integrato, senza librerie: usa la decompressione nativa del browser.
- Fatture di prova Q8 in `tests/fixtures/carburante` (compresa una con CSV ostile: HTML, script e formule Excel), con il relativo controllo in `tests/check.py`.

### Modificato
- Cambia il formato della cache delle cartelle recenti: al primo uso le fatture vengono rilette una volta.

## [1.3.0] - 2026-11-01

Esportazione dell'XML dal dettaglio fattura.

### Aggiunto
- Dettaglio fattura: pulsante di download (icona) per scaricare il file XML della fattura aperta. Da un file `.p7m` si scarica l'XML estratto dalla firma.

### Sicurezza
- `SECURITY.md`: verifica dell'esportazione XML e nota sui rischi di aprire nel browser un XML scaricato.

## [1.2.0] - 2026-10-31

Fatture di esempio integrate e schermata iniziale uniformata alla dashboard.

### Aggiunto
- Schermata iniziale: pulsante **Prova con fatture di esempio**, con scelta di quante fatture caricare (3, 6 o tutte). Sono le fatture fittizie di `tests/fixtures`, incorporate in `html/esempi.js` (generato da `tests/generate_fixtures.py`): nessuna richiesta di rete, funziona anche aprendo `index.html` da file.

### Modificato
- Schermata iniziale a tutta altezza, come la dashboard, con il logo in cima e tre sezioni distinte: apri le tue fatture, fatture di esempio, aperti di recente. Gli spazi tra i blocchi sono tutti uguali.
- Spaziatura unica: margine esterno, spazio tra le card e distanza del testo dal bordo usano lo stesso valore (`--sp`), impostabile in cima a `app.css`, insieme a padding delle righe, raggio degli angoli e altezze di intestazione e controlli.
- Margine inferiore dell'elenco uguale a quello laterale.

## [1.1.1] - 2026-10-31

Dettaglio fattura riordinato sul modello della copia di cortesia in PDF.

### Modificato
- Dettaglio fattura: cedente e cessionario affiancati in alto, sulla stessa riga, poi righe, riepilogo IVA, dati documento, pagamento e trasmissione in un'unica colonna.
- A larghezza intera la fattura occupa tutto lo spazio disponibile, senza limite di larghezza né centratura.
- Padding uniformi in tutte le card: il testo delle tabelle parte allineato al titolo e ai campi, e le distanze verticali tra i blocchi sono sempre di 12 px.

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

[Non rilasciato]: https://github.com/N1K1TAS95/fatture_elettroniche_explorer/compare/v1.5.0...HEAD
[1.5.0]: https://github.com/N1K1TAS95/fatture_elettroniche_explorer/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/N1K1TAS95/fatture_elettroniche_explorer/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/N1K1TAS95/fatture_elettroniche_explorer/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/N1K1TAS95/fatture_elettroniche_explorer/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/N1K1TAS95/fatture_elettroniche_explorer/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/N1K1TAS95/fatture_elettroniche_explorer/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/N1K1TAS95/fatture_elettroniche_explorer/releases/tag/v1.0.0
