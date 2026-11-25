// SW NUEVO - no guarda versión vieja
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
});
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', e => {
  // No guarda caché, siempre trae lo nuevo de GitHub
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
