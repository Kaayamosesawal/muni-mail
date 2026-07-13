const CACHE_NAME = 'muni-circle-v1';

// Assets to cache for offline availability
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png'
];

// 1. Install: Cache essential assets and force activation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching essential assets...');
      return cache.addAll(URLS_TO_CACHE).catch(err => {
        console.error("SW: Pre-cache failed. Check file paths.", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate: Clean up old caches and take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch: CRITICAL for the Install Button & Offline support
self.addEventListener('fetch', (event) => {
  // Skip non-GET and Google API requests to prevent auth errors
  if (event.request.method !== 'GET' || event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If network is up, serve the resource and update cache
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network is down (Offline), try the cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // FALLBACK: If not in cache and no network, return a valid Response object.
          // This satisfies the PWA "Offline" requirement for the install button.
          return new Response("MuniCircle: This page is not available offline yet.", {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});