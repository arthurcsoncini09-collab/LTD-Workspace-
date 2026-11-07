/* Service worker do NetLearn: deixa o app abrir rápido e funcionar sem internet
   nas páginas já visitadas. As rotas /api nunca são guardadas em cache. */
const VERSION = 'netlearn-v3';
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/brand/netlearn-emblem.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    // Página nunca visitada: mostra a tela "sem internet" (HTML simples, sem depender do Next).
    if (request.mode === 'navigate') return (await caches.match(OFFLINE_URL)) || Response.error();
    return Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(STATIC_CACHE)).put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.startsWith('/_next/') && url.searchParams.has('_rsc')) {
    // Navegação interna do Next (RSC): rede primeiro, cópia offline como reserva.
    event.respondWith(networkFirst(request));
  } else if (/\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
