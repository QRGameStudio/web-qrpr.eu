const version = 'v2020-10-27::06::';
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
    'lib/GMultiplayer.js',
    'ext/bootstrap.min.css',
    'ext/bootstrap.min.js',
    'ext/bootstrap.min.js.map',
    'ext/jquery.min.js',
    'ext/lzma.js',
    'ext/lzma.shim.js',
    'ext/renderer.js',
    'ext/base32.min.js',
    'ext/cordova-plugin-qrscanner-lib.min.js',
    'ext/cordova-plugin-qrscanner-lib.min.js.map',
    'ext/peerjs.min.js'
];
const isLocalhost = ['localhost', '127.0.0.1', '::1'].indexOf(location.host.split(":")[0].toLowerCase()) !== -1;
const cacheName = `${version}cache`;


self.addEventListener("install", function (event) {
    event.waitUntil(
        caches
            .open( cacheName)
            .then(function (cache) {
                return cache.addAll(cached);
            })
    );
});
self.addEventListener("activate", function (event) {
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
    );
});
self.addEventListener("fetch", function(event) {

    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches
            .match(event.request)
            .then(function(cached) {
                const networked = fetch(event.request)
                    .then(fetchedFromNetwork, unableToResolve)
                    .catch(unableToResolve);

                return cached || networked;

                function fetchedFromNetwork(response) {
                    const cacheCopy = response.clone();


                    caches
                        // We open a cache to store the response for this request.
                        .open(cacheName)
                        .then(function add(cache) {
                            cache.put(event.request, cacheCopy);
                        })
                    return response;
                }

                function unableToResolve () {

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
