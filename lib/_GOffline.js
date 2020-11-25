const isLocalhost = ['localhost', '127.0.0.1', '::1'].indexOf(location.host.split(":")[0].toLowerCase()) !== -1;
const cacheEnabled = localStorage.getItem('pageCacheEnabled') || '0';
if (isLocalhost) {
  console.debug('[CACHE] cache is disabled on localhost');
} else if (cacheEnabled === '1') {
    console.debug('[CACHE] Disabled by settings');
} else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').then(function() {
        console.debug('[CACHE] ready');
    }, function() {
        console.debug('[CACHE] fail');
    });
} else {
    console.debug('[CACHE] not supported');
}
