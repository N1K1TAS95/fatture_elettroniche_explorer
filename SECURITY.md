# Sicurezza

## Segnalare una vulnerabilità

Non aprire una issue pubblica: usa **Security → Report a vulnerability** nella pagina GitHub del repository (segnalazione privata). Includi i passaggi per riprodurre il problema e, se serve, un file di esempio **anonimizzato**: non allegare mai fatture reali.

## Modello di minaccia

L'app legge file XML che arrivano da terzi (i fornitori): **ogni campo di una fattura va trattato come non fidato**. L'app gira solo nel browser, senza backend e senza richieste di rete, quindi la superficie è limitata a: contenuto dei file letti, allegati, esportazione CSV e configurazione del web server.

## Verifiche eseguite (audit)

| Area | Esito |
| --- | --- |
| **XSS da dati XML** (nomi, descrizioni, causali, date, tipo documento…) | Ogni valore inserito nell'HTML passa da `esc()`; date e tipo documento sono validati. Provato con una fattura contenente `<img onerror>`, `<svg onload>`, `<script>`, `<iframe>`: tutto mostrato come testo, nessun codice eseguito. Durante l'audit sono stati corretti due punti dove un valore non veniva escapato (formattazione delle date, elenco di tipi documento e anni). |
| **Content-Security-Policy** | Nessuno script o gestore di eventi inline: `script-src 'self'`. `default-src 'none'`: nessuna richiesta di rete possibile, nemmeno verso la propria origine. Applicata sia dagli header di nginx sia da un `<meta>` (utile aprendo il file in locale). |
| **Richieste di rete e dipendenze** | Nessuna: né `fetch`/XHR, né librerie, font o CDN esterni. Nessuna dipendenza npm, quindi nessuna catena di fornitura da controllare. |
| **Allegati** | Aperti nel browser solo se i primi byte sono davvero `%PDF-`; altrimenti solo download. Nome file ripulito da percorsi e caratteri speciali; estensioni eseguibili (`.exe`, `.bat`, `.js`…) rinominate in `.bloccato`. Apertura con `noopener`. |
| **CSV injection** | Le celle di testo che iniziano con `=`, `+`, `-`, `@` sono precedute da un apice, così Excel non le esegue come formule. |
| **Accesso ai file** | Cartelle e file aperti in sola lettura (`mode: 'read'`). L'app non scrive nulla. |
| **Parser XML** | Si usa il `DOMParser` del browser: non carica DTD o entità esterne. File oltre 80 MB scartati. |
| **Chiavi speciali** (`__proto__`, `constructor`…) nei dati | Le tabelle dei codici non hanno prototype. |
| **Web server** | Container in sola lettura, `no-new-privileges`, capability ridotte, limiti di risorse; solo `GET`/`HEAD`; nessun file nascosto; versione nginx nascosta; header di sicurezza (vedi `security-headers.conf`). |
| **Segreti nel repository** | Nessuna chiave, token o password. `.gitignore` esclude fatture (`.xml`, `.p7m`), CSV e PDF. |

## Rischi residui e note

- **Dati in locale**: per la cache il browser salva (non cifrati) i dati estratti dalle fatture nel profilo dell'utente. Su un computer condiviso usare *Recenti → Svuota* o cancellare i dati del sito.
- `style-src-attr 'unsafe-inline'` è consentito perché l'interfaccia genera attributi `style=""`; gli script restano bloccati. Il rischio è limitato (nessuna origine esterna raggiungibile).
- I PDF aperti dal browser ereditano la CSP della pagina (`object-src blob:`). Se un visualizzatore PDF li bloccasse, resta il pulsante *Scarica*.
- **HTTPS e HSTS** vanno gestiti dal proxy davanti a nginx: senza HTTPS la selezione diretta delle cartelle non è disponibile.
- Un file XML molto grande o con molte entità annidate può rallentare il browser (limiti propri del parser); non c'è un rischio per i dati.
- `nginx.conf` contiene la subnet privata della rete Docker del proxy (`set_real_ip_from`): non è un segreto, ma va adattata al tuo ambiente.
