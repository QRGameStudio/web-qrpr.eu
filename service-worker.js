const version = 'v2020-11-25::01::';
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
    'lib/GPopup.js',
    'lib/_GPopup.css',
    'lib/GStorage.js',
    'lib/_GOffline.js',
    'lib/_GGamesStorage.js',
    'lib/GGameData.js',
    'lib/GModal.html',
    'lib/GModal.js',
    'lib/GSound.js',
    'lib/_GCodeMap.js',
    'lib/GTheme.css',
    'lib/GTheme.js',
    'lib/GMultiplayer.js',
    'ext/inj/bootstrap.min.css',
    'ext/inj/bootstrap.min.js',
    'ext/inj/bootstrap.min.js.map',
    'ext/inj/jquery.min.js',
    'ext/lzma.js',
    'ext/lzma.shim.js',
    'ext/inj/renderer.js',
    'ext/base32.min.js',
    'ext/cordova-plugin-qrscanner-lib.min.js',
    'ext/cordova-plugin-qrscanner-lib.min.js.map',
    'ext/inj/peerjs.min.js'
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
