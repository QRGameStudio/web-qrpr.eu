function scanner() {
    QRScanner.prepare((err, status) => {
        if (err) {
            console.error("QR init error", err);
            alert("An error occurred when initializing the camera");
            window.location.replace('index.html');
            return;
        }
        if (status.authorized) {
            console.debug("QR authorized");
            QRScanner.scan((err, text) => {
                if (err) {
                    console.error("QR error", err);
                    window.location.replace('index.html');
                } else {
                    const qrGameData = /^.*?#(.*$)/.exec(text);
                    console.debug('QR data', text, qrGameData);
                    if (!qrGameData) {
                        alert("No QR game could be found");
                        window.location.reload(true);
                        return;
                    }
                    window.location.replace(`html.html#${qrGameData[1]}`);
                }
            });
            QRScanner.show();
        } else if (status.denied) {
            console.debug("QR denied");
            if (confirm("Would you like to enable QR code scanning? You can allow camera access in your settings.")) {
                QRScanner.openSettings();
            } else {
                window.location.replace('index.html');
            }
        } else {
            // try to ask again in 2 seconds
            console.debug("QR retry");
            setTimeout(() => scanner(), 2000);
        }
    });
}

if (window.cordova) {
    document.addEventListener('deviceready', () => scanner(), false);
} else {
    window.onload = () => {
        window.QRScanner_SCAN_INTERVAL = 500;
        scanner();
    }
}
