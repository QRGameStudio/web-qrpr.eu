const version = 'v0.5::2020-09-17::01::';
const cached = [
    'html.html',
    'html.js',
    'game.html',
    'game.js',
    'service-worker.js',
    'lib/make-offline.js',
    'lib/engine.js',
    'lib/modals.html',
    'lib/modals.js',
    'ext/bootstrap.min.css',
    'ext/bootstrap.min.js',
    'ext/bootstrap.min.js.map',
    'ext/jquery.min.js',
    'ext/lzma.js',
    'ext/lzma.shim.js',
    'ext/renderer.js'
];

self.addEventListener("install", function (event) {
    console.log('WORKER: install event in progress.');
    event.waitUntil(
        caches
            .open(version + 'fundamentals')
            .then(function (cache) {
                return cache.addAll(cached);
            })
            .then(function () {
                console.log('WORKER: install completed');
            })
    );
});
self.addEventListener("activate", function (event) {
    console.log('WORKER: activate event in progress.');

    event.waitUntil(
        caches
            .keys()
            .then(function (keys) {
                return Promise.all(
                    keys
                        .filter(function (key) {
                            return !key.startsWith(version);
                        })
                        .map(function (key) {
                            return caches.delete(key);
                        })
                );
            })
            .then(function () {
                console.log('WORKER: activate completed.');
            })
    );
});
self.addEventListener("fetch", function(event) {
    console.log('WORKER: fetch event in progress.', event.request);

    if (event.request.method !== 'GET') {
        console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
        return;
    }

    event.respondWith(
        caches
            .match(event.request)
            .then(function(cached) {
                const networked = fetch(event.request)
                    .then(fetchedFromNetwork, unableToResolve)
                    .catch(unableToResolve);

                console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
                return cached || networked;

                function fetchedFromNetwork(response) {
                    const cacheCopy = response.clone();

                    console.log('WORKER: fetch response from network.', event.request.url);

                    caches
                        // We open a cache to store the response for this request.
                        .open(version + 'pages')
                        .then(function add(cache) {
                            cache.put(event.request, cacheCopy);
                        })
                        .then(function() {
                            console.log('WORKER: fetch response stored in cache.', event.request.url);
                        });
                    return response;
                }

                function unableToResolve () {
                    console.log('WORKER: fetch request failed in both cache and network.');

                    return new Response('<h1>Service Unavailable</h1>', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/html'
                        })
                    });
                }
            })
    );
});
