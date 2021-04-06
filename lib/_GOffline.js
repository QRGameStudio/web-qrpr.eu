if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').then(function() {
        console.debug('[CACHE] ready');
    }, function() {
        console.debug('[CACHE] fail');
    }).then(async () => {
        const worker = await navigator.serviceWorker?.getRegistration('service-worker.js');
        fetch('auto-version.txt').then(async (response) => {
            if (!response.ok) {
                return;
            }
            const newestVersion = await response.text();
            const installedVersion = localStorage.getItem('qrpr-version');
            if (newestVersion !== installedVersion) {
                console.log('[CACHE] update found, installing');
                localStorage.setItem('qrpr-version', newestVersion);
                worker.unregister().then(() => location.reload());
            }
        }).catch();
    });
} else {
    console.debug('[CACHE] not supported');
}
