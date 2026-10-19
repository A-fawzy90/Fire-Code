// Service Worker for Egyptian Fire Code Assistant
// Version: v3.0.26 (Decree 255/2026 & NFPA Gas Flooding Aligned)
// Engineered for 100% Offline Field Operations (Basements & Construction Sites)
// Prepared by: Eng. Ahmed Fawzy - Fire Fighting & Alarm Systems Engineer

const CACHE_NAME = 'egyptian-fire-code-v3-2026-gas';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icons.svg'
];

// Install: Cache critical static shell safely (without aborting if an optional asset is missing)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn('[SW] Precache asset skipped:', asset, err?.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache versions and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy:
// 1. Firebase / Backend calls: Network only (with clean JSON offline response)
// 2. Navigation (HTML): Network first with fallback to cached index.html
// 3. Static Assets & Fonts: Stale-While-Revalidate with proper response cloning
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET or browser extension schemes
  if (req.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Handle Google Fonts & static font binaries (.woff2) with Cache First strategy
  const isGoogleFont = 
    url.hostname === 'fonts.googleapis.com' || 
    url.hostname === 'fonts.gstatic.com';

  if (isGoogleFont) {
    event.respondWith(
      caches.match(req).then((cachedFont) => {
        if (cachedFont) return cachedFont;
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        }).catch(() => new Response('', { status: 408, statusText: 'Font Offline' }));
      })
    );
    return;
  }

  // Handle Firebase and Google Analytics as network-only
  const isCloudOrAnalytics = 
    url.hostname.includes('firebase') || 
    (url.hostname.includes('googleapis.com') && !url.hostname.includes('fonts.googleapis.com'));

  if (isCloudOrAnalytics) {
    event.respondWith(
      fetch(req).catch(() => 
        new Response(JSON.stringify({ offline: true, timestamp: Date.now() }), { 
          headers: { 'Content-Type': 'application/json' } 
        })
      )
    );
    return;
  }

  // HTML Navigation: Network first, fall back to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedIndex = 
            (await caches.match('./index.html')) || 
            (await caches.match('/index.html')) || 
            (await caches.match('./')) || 
            (await caches.match('/'));
          return cachedIndex || new Response(
            '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/><title>وضع عدم الاتصال</title></head><body style="font-family:sans-serif;text-align:center;padding:40px;"><h2>⚡ أنت الآن في وضع العمل بدون إنترنت</h2><p>يرجى فتح التطبيق مرة واحدة أثناء الاتصال بالإنترنت لتخزين كافة البيانات محلياً.</p></body></html>', 
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Static Assets (JS, CSS, SVGs, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) {
        // Fetch in background to update cache (with response cloning to prevent 'body already used' error)
        fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
            }
          })
          .catch(() => {/* Silent offline fallback */});
        return cachedRes;
      }

      return fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          return new Response('', { status: 408, statusText: 'Offline Mode' });
        });
    })
  );
});
