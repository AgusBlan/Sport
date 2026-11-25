// sw.js - AGUS TRAIN ♡
// Service Worker entero
// Lo que hace: borra todo el caché viejo y siempre trae lo nuevo de GitHub
// Por eso ya no te muestra la versión fea aunque subas un index.html nuevo

const CACHE_NAME = 'agus-train-v5';

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando nueva versión, borrando caché viejo...');
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          console.log('[SW] Borrando caché viejo:', key);
          return caches.delete(key);
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activado, tomando control...');
  event.waitUntil(
    clients.claim().then(() => {
      return clients.matchAll().then((clientsList) => {
        clientsList.forEach((client) => {
          client.postMessage({ type: 'SW_ACTUALIZADO' });
        });
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  // No guarda caché de index.html, siempre trae lo nuevo
  // Solo si no hay internet, usa lo que haya guardado
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es buena, la guardamos para offline
        // Pero la próxima vez igual intentamos traer lo nuevo primero
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Sin internet: usar lo guardado
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Si no hay nada guardado, devolver offline simple
          if (event.request.destination === 'document') {
            return new Response(
              '<h1 style="font-family:sans-serif;text-align:center;margin-top:50px">Sin internet ♡<br><small>Conectate y recargá</small></h1>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
        });
      })
  );
});

// Mensaje para forzar actualización desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'BORRAR_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});
