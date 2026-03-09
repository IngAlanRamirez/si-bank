// Si! Bank — Service Worker mínimo para PWA (instalable)
const CACHE_NAME = "sibank-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Sin interceptación de fetch: la app funciona siempre con red (portfolio)
self.addEventListener("fetch", () => {});
