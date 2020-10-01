const version = 'v2020-10-01::02::';
const cached = [
    'index.html',
    'index.js',
    'index.css',
    'html.html',
    'HTML.html',
    'html.js',
    'game.html',
    'game.js',
    'qrscanner.html',
    'qrscanner.js',
    'qrscanner.css',
    'cordova.js',
    'editor.html',
    'lib/popup.js',
    'lib/popup.css',
    'lib/GStorage.js',
    'lib/make-offline.js',
    'lib/gamesStorage.js',
    'lib/modals.html',
    'lib/modals.js',
    'lib/musicComposer.js',
    'lib/codeMap.js',
    'lib/themeProvider.css',
    'lib/themeProvider.js',
    'ext/bootstrap.min.css',
    'ext/bootstrap.min.js',
    'ext/bootstrap.min.js.map',
    'ext/jquery.min.js',
    'ext/lzma.js',
    'ext/lzma.shim.js',
    'ext/renderer.js',
    'ext/base32.min.js',
    'ext/cordova-plugin-qrscanner-lib.min.js',
    'ext/cordova-plugin-qrscanner-lib.min.js.map'
];
const isLocalhost = ['localhost', '127.0.0.1', '::1'].indexOf(location.host.split(":")[0].toLowerCase()) !== -1;
const cacheName = `${version}cache`;

log = console.log;
if (isLocalhost) {
    log = () => {};
}

self.addEventListener("install", function (event) {
    log('WORKER: install event in progress.');
    event.waitUntil(
        caches
            .open( cacheName)
            .then(function (cache) {
                return cache.addAll(cached);
            })
            .then(function () {
                log('WORKER: install completed');
            })
    );
});
self.addEventListener("activate", function (event) {
    log('WORKER: activate event in progress.');

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
                log('WORKER: activate completed.');
            })
    );
});
self.addEventListener("fetch", function(event) {
    log('WORKER: fetch event in progress.', event.request);

    if (event.request.method !== 'GET') {
        log('WORKER: fetch event ignored.', event.request.method, event.request.url);
        return;
    }

    event.respondWith(
        caches
            .match(event.request)
            .then(function(cached) {
                const networked = fetch(event.request)
                    .then(fetchedFromNetwork, unableToResolve)
                    .catch(unableToResolve);

                log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
                return cached || networked;

                function fetchedFromNetwork(response) {
                    const cacheCopy = response.clone();

                    log('WORKER: fetch response from network.', event.request.url);

                    caches
                        // We open a cache to store the response for this request.
                        .open(cacheName)
                        .then(function add(cache) {
                            cache.put(event.request, cacheCopy);
                        })
                        .then(function() {
                            log('WORKER: fetch response stored in cache.', event.request.url);
                        });
                    return response;
                }

                function unableToResolve () {
                    log('WORKER: fetch request failed in both cache and network.');

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
