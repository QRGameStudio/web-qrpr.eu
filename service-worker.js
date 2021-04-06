const cacheName = "offline-cache";

self.addEventListener("install", function (event) {
    console.log('[CACHE] installing');
    event.waitUntil(
        caches
            .open(cacheName)
            .then(function (cache) {
                // refresh the cache
                return new Promise(async (resolve) => {
                    await Promise.all((await caches.keys()).map((key) => {
                        cache.delete(key);
                    }));

                    const webFiles = (await (await fetch('offline-files-web.txt')).text())
                        .split('\n').map((x) => x.trim()).filter((x) => x.length);
                    const libsFiles = (await (await fetch('offline-files-libs.txt')).text())
                        .split('\n').map((x) => x.trim()).filter((x) => x.length)
                        .map((x) => 'https://lib.qrpr.eu/' + x);

                    cache.addAll([...webFiles, ...libsFiles])
                        .catch((e) =>  console.error(`[CACHE] Failed to add URL(s)`, e))
                        .then(() => resolve());
                });
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
                if (cached) {
                    return cached;
                }

                return fetch(event.request).catch(unableToResolve);

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
