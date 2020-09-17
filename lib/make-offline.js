const isLocalhost = ['localhost', '127.0.0.1', '::1'].indexOf(location.host.split(":")[0].toLowerCase()) !== -1;
if (isLocalhost) {
  console.log('OFFLINE CACHE: cache is disabled on localhost');
} else if ('serviceWorker' in navigator) {
    console.log('OFFLINE CACHE: service worker registration in progress.');
    navigator.serviceWorker.register('service-worker.js').then(function() {
        console.log('OFFLINE CACHE: service worker registration complete.');
    }, function() {
        console.log('OFFLINE CACHE: service worker registration failure.');
    });
} else {
    console.log('OFFLINE CACHE: service worker is not supported.');
}
