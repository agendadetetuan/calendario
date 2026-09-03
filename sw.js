const CACHE_NAME = 'agenda-tetuan-v7';
const BASE = '/calendario/';
const STATIC = [BASE, BASE+'index.html', BASE+'manifest.json', BASE+'icon-192.png', BASE+'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => Promise.allSettled(STATIC.map(u => c.add(u)))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method!=='GET') return;
  const url = new URL(e.request.url);
  // No cachear: eventos, imágenes, bot de Render, ni peticiones externas
  if(
    url.pathname.endsWith('events.json') ||
    url.pathname.endsWith('locations.json') ||
    url.pathname.includes('/images/') ||
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('openrouter.ai') ||
    url.hostname.includes('telegram.org')
  ){
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if(r && r.ok && r.type !== 'opaque') {
          caches.open(CACHE_NAME).then(c => c.put(e.request, r.clone()));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(BASE));
});
