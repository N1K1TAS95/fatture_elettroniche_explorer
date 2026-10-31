# Fatture Explorer

Esploratore leggero di **fatture elettroniche italiane** (FatturaPA, formato `.xml` e `.xml.p7m`). È una pagina web statica: scegli una cartella del PC o del NAS e naviga, cerca e filtra le fatture, senza installare nulla e **senza che i dati lascino il tuo computer**.

HTML, CSS e JavaScript puri, nessuna dipendenza, nessuna build, nessuna richiesta di rete.

## Caratteristiche

- **Lettura ricorsiva di una cartella** (anche un'unità di rete o un percorso UNC) con barra di avanzamento. Gestisce `.xml` e `.xml.p7m` firmati (CAdES, anche in base64), più fatture in un solo file (lotti) e codifiche diverse da UTF-8.
- **Cerca** in un campo solo: numero, nome, P.IVA, codice fiscale, descrizione delle righe, causale, CIG/CUP, importo.
- **Filtri**: emesse/ricevute, anno, trimestre, mese, intervallo di date, cliente o fornitore, tipo documento, importo minimo e massimo. I filtri attivi sono mostrati come etichette.
- **La mia azienda**: la pagina riconosce la tua P.IVA e distingue fatture emesse (attive) e ricevute (passive). Le note di credito contano in negativo.
- **Tre viste**: elenco fatture, riepilogo per cliente/fornitore, andamento mensile (grafico a barre). Totali di imponibile, IVA e importo per quanto filtrato.
- **Dettaglio fattura** affiancato alla lista, o a tutta larghezza: anagrafiche, righe, riepilogo IVA, pagamento, ritenute, bollo, riferimenti (ordini, DDT, CIG/CUP), allegati (PDF apribili e scaricabili) e XML originale.
- **Fattura singola**: apri un solo file `.xml`/`.p7m` (o trascinalo sulla pagina) e leggilo a tutta pagina, con stampa e salvataggio in PDF.
- **Recenti**: le ultime cartelle e fatture aperte si riaprono con un clic. Le fatture già lette sono tenute in cache, quindi la seconda apertura è molto più veloce, anche su NAS.
- **Esportazione CSV** di quanto filtrato (separatore `;`, decimali con la virgola, pronto per Excel).
- **Tema** automatico, chiaro o scuro. Interfaccia adattata a telefono, tablet, laptop e monitor molto larghi.
- Scorciatoie: `/` cerca, `←` `→` fattura precedente/successiva, `Esc` chiude.

## Come si usa

### In locale

Apri `html/index.html` con Chrome o Edge (doppio clic), poi **Seleziona cartella…** o **Apri fattura…**.

### Da un web server

È un sito statico: basta servire la cartella `html/` con qualunque web server. Con Docker e nginx vedi più sotto.

> **Importante:** la selezione diretta di cartelle e file usa la *File System Access API*, che il browser abilita solo su **HTTPS** o su `localhost`. Se pubblichi la pagina in HTTP semplice (per esempio `http://nas:8080`), compare in automatico il pulsante **modalità compatibile**, che funziona ovunque ma non ricorda le cartelle recenti.

### Browser supportati

| Browser | Selezione cartella | Recenti |
| --- | --- | --- |
| Chrome, Edge (e derivati) su HTTPS o localhost | sì | sì |
| Firefox, Safari | modalità compatibile | no |

## Privacy

- Le fatture sono lette **solo nel tuo browser**. L'app non effettua nessuna richiesta di rete: nessun server, nessuna telemetria, nessuna libreria o font esterno. La Content-Security-Policy lo impedisce anche a livello di browser.
- Le cartelle vengono aperte **in sola lettura**: l'app non scrive né modifica nulla.
- Per velocizzare le aperture successive, il browser conserva in locale (IndexedDB) i dati estratti dalle fatture (nomi, P.IVA, importi, descrizioni) e il riferimento alle cartelle recenti. Su un computer condiviso usa **Recenti → Svuota** o cancella i dati del sito dal browser.
- Il browser non rivela i percorsi completi dei file: l'app ricorda il nome della cartella e il permesso di accesso. Alla riapertura Chrome può chiedere di confermarlo.

Le fatture contengono dati personali: **non caricarle mai in questo repository** (il `.gitignore` esclude `.xml`, `.p7m`, `.csv` e `.pdf`).

## Distribuzione con Docker (nginx)

Il `docker-compose.yml` avvia un container `nginx:stable-alpine` che serve `html/` con `nginx.conf` e `security-headers.conf`. Non c'è nessuna build: i file sono montati in sola lettura, quindi una modifica a `html/` si vede subito.

```bash
docker compose up -d
```

Il servizio non pubblica porte: si collega alla rete Docker esterna `nginx-proxy-manager`, che deve già esistere.

```bash
docker network ls | grep nginx-proxy-manager
```

Da Nginx Proxy Manager crea poi un host che punta a `fatture_explorer` sulla porta `80`, con certificato HTTPS (necessario, vedi sopra) e HSTS.

Se non usi Nginx Proxy Manager, rimuovi il blocco `networks` e aggiungi `ports: ["8080:80"]` al servizio. Ricorda che la selezione diretta delle cartelle richiede comunque HTTPS.

In `nginx.conf`, `set_real_ip_from` deve corrispondere alla subnet della rete del proxy (`docker network inspect nginx-proxy-manager`); serve solo a leggere l'IP reale dei client.

### Irrobustimento

- Container con filesystem in sola lettura, `no-new-privileges`, tutte le capability tolte tranne quelle necessarie a nginx, limiti di memoria (128 MB) e di processi.
- Versione di nginx nascosta, solo metodi `GET`/`HEAD`, file nascosti non serviti.
- Header di sicurezza in `security-headers.conf`: `Content-Security-Policy` restrittiva (niente script inline, nessuna origine esterna), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `Permissions-Policy`.

La CSP è in `security-headers.conf`: se aggiungi script o stili esterni, va aggiornata. In nginx un `location` con un proprio `add_header` perde quelli del `server`, quindi il file va incluso di nuovo.

## Struttura del progetto

```
.
├── html/
│   ├── index.html            # struttura della pagina
│   ├── app.css               # stile (tema chiaro/scuro, layout responsive, stampa)
│   ├── app.js                # lettura FatturaPA/P7M, filtri, viste, recenti
│   ├── theme.js              # applica subito il tema scelto (evita il lampeggio)
│   └── icon.svg
├── nginx.conf                # configurazione di nginx per il container
├── security-headers.conf     # header di sicurezza e CSP
├── docker-compose.yml        # servizio Docker
├── SECURITY.md               # note di sicurezza e segnalazione vulnerabilità
├── LICENSE
└── README.md
```

## Sviluppo

Non serve alcuna build. Per provarlo in locale con un server:

```bash
cd html
python -m http.server 8000
```

poi apri `http://localhost:8000` (`localhost` conta come contesto sicuro per la selezione delle cartelle).

Il formato letto è FatturaPA 1.2.x (`FatturaElettronica`). Le fatture semplificate (`FatturaElettronicaSemplificata`) non sono supportate.

## Licenza

[MIT](LICENSE).
