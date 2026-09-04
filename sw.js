// Service Worker mínimo — solo gestiona instalación PWA, sin caché
const CACHE_NAME = 'agenda-tetuan-v8';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
  self.clients.claim();
});
// Sin handler de fetch — todas las peticiones van directamente a la red
