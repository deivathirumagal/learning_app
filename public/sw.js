const CACHE_NAME = 'eduportal-static-v1';
const STATIC_ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install: Cache essential static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Purge old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Secure caching strategy
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // SECURITY RULE 1: Never cache non-GET requests (POST, PUT, DELETE)
  if (event.request.method !== 'GET') {
    return;
  }

  // SECURITY RULE 2: NEVER cache authenticated or API requests!
  // Private student grades, tokens, auth endpoints, or progress must always pass through network
  if (
    requestUrl.pathname.startsWith('/api/') || 
    event.request.headers.has('Authorization') ||
    requestUrl.pathname.includes('/auth') ||
    requestUrl.pathname.includes('/enrollments') ||
    requestUrl.pathname.includes('/progress')
  ) {
    // Pure network pass-through for security
    return;
  }

  // Static assets cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache static scripts and styles dynamically
        if (
          networkResponse.status === 200 &&
          (requestUrl.pathname.endsWith('.js') || 
           requestUrl.pathname.endsWith('.css') || 
           requestUrl.pathname.endsWith('.svg') ||
           requestUrl.pathname.endsWith('.png') ||
           requestUrl.pathname.endsWith('.woff2'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for navigation requests when offline
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
