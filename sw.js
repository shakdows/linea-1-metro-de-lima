/* sw.js — Service worker mínimo: cache-first para el esqueleto de la app */

const CACHE = 'linea1-v1';
const RECURSOS = [
  './',
  './index.html',
  './mapa.html',
  './estacion.html',
  './assets/css/style.css',
  './assets/js/data.js',
  './assets/js/ui.js',
  './assets/js/planner.js',
  './assets/js/assistant.js',
  './assets/js/app.js',
  './assets/js/estacion.js',
  './assets/js/mapa.js',
  './assets/img/favicon.svg',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(RECURSOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ev) => {
  const url = new URL(ev.request.url);
  if (ev.request.method !== 'GET' || url.origin !== location.origin) return;

  ev.respondWith(
    caches.match(ev.request).then(
      (hit) =>
        hit ||
        fetch(ev.request)
          .then((res) => {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(ev.request, copia)).catch(() => {});
            return res;
          })
          .catch(() => caches.match('./index.html'))
    )
  );
});
