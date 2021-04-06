if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').then(function() {
        console.debug('[CACHE] ready');
    }, function() {
        console.debug('[CACHE] fail');
    });
} else {
    console.debug('[CACHE] not supported');
}
