/* Service worker di Fatture Explorer.
 *
 * Serve solo a due cose: rendere l'app installabile (PWA) e farla aprire anche senza rete.
 * Mette in cache SOLTANTO i file dell'applicazione (HTML, CSS, JS, icone): le fatture non
 * passano mai di qui, restano nel browser e non vengono mai inviate a nessuno.
 *
 * Strategia "rete prima, cache se offline": con la rete si ricevono sempre i file aggiornati.
 *
 * Funziona solo su HTTPS (o su localhost): vedi il README.
 * Dopo aver modificato i file dell'app, aumenta VERSION per ripulire la cache dei client.
 */
const VERSION = '1';
const CACHE = 'fatture-explorer-v' + VERSION;
const ASSETS = [
  './',
  'index.html',
  'app.css',
  'app.js',
  'theme.js',
  'icon.svg',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('fatture-explorer-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
