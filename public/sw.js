const CACHE_NAME = 'quntedge-static-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/favicon.ico',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            if (cache) return cache.addAll(ASSETS_TO_CACHE);
        }).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name).catch(() => {}))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    const destination = request.destination;

    if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
        return;
    }

    if (request.mode === 'navigate' || destination === 'document') {
        return;
    }

    if (
        url.pathname.startsWith('/api') ||
        url.pathname.startsWith('/authentication') ||
        url.pathname.includes('/dashboard/')
    ) {
        return;
    }

    event.respondWith((async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            event.waitUntil(
                fetch(request).then((networkResponse) => {
                    if (!networkResponse.ok) return;
                    if (
                        url.pathname.startsWith('/logos') ||
                        url.pathname.startsWith('/videos')
                    ) {
                        return caches.open(CACHE_NAME).then((cache) => {
                            if (cache) cache.put(request, networkResponse.clone());
                        });
                    }
                }).catch(() => {})
            );
            return cachedResponse;
        }

        const response = await fetch(request);
        if (
            response.ok &&
            (url.pathname.startsWith('/logos') ||
                url.pathname.startsWith('/videos'))
        ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                if (cache) cache.put(request, responseToCache);
            }).catch(() => {});
        }
        return response;
    })());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
