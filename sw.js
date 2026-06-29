const CACHE_NAME = 'agenda-tetuan-v6';
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
  if(url.pathname.endsWith('events.json')||url.pathname.includes('/images/')){
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(fetch(e.request).then(r=>{caches.open(CACHE_NAME).then(c=>c.put(e.request,r.clone()));return r;}).catch(()=>caches.match(e.request)));
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(data.title||'Agenda Tetuán',{body:data.body||'Nuevo evento en el barrio',icon:BASE+'icon-192.png',badge:BASE+'icon-192.png'}));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(BASE));
});
