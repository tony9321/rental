var cacheName = 'v1'; 

var cacheFiles = [
    '/my-worker/public/index.html',
    '/my-worker/public/manifest.json',
    '/my-worker/public/maskable_icon.png',
    '/my-worker/public/favicon.ico',
    '/my-worker/public/logo192.png',
    '/my-worker/public/logo512.png',
    '/my-worker/build/static/js/453.c6133d5e.chunk.js',
    '/my-worker/build/static/js/453.c6133d5e.chunk.js.map',
    '/my-worker/build/static/js/main.4cb2e448.js',
    '/my-worker/build/static/js/main.4cb2e448.js.map',
    '/my-worker/build/static/css/main.f855e6b.css',
    '/my-worker/build/static/css/main.f855e6bc.css.map',
];

self.addEventListener('install', function(e) {
    console.log("[ServiceWorker] Installed")

    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log("[ServiceWorker] Caching cacheFiles");
            return cache.addAll(cacheFiles);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log("[ServiceWorker] Activated")

    e.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(thisCacheName) {
                if (thisCacheName !== cacheName) {
                    console.log("[ServiceWorker] Removing Cached Files from", thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }))
        })
    );
});

self.addEventListener('fetch', function(e) {
    console.log("[ServiceWorker] Fetching", e.request.url);

    e.respondWith(
        caches.match(e.request)
            .then(function(response) {
                if (response) {
                    console.log("[ServiceWorker] Found in Cache", e.request.url, response);
                    return response;
                }

                var requestClone = e.request.clone();
                return fetch(requestClone)
                    .then(function(response) {
                        if (!response) {
                            console.log("[ServiceWorker] No response from fetch ")
                            return response;
                        }

                        var responseClone = response.clone();

                        return caches.open(cacheName).then(function(cache) {
                            cache.put(e.request, responseClone);
                            console.log('[ServiceWorker] New Data Cached', e.request.url);
                            return response;
                        }); 
                    })
                    .catch(function(err) {
                        console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
                        return new Response('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });
                    });
            })
    );
});