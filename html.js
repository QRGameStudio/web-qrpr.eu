window.onload = () => {
    if (!window.location.hash) {
        console.error("No data to parse");
        return;
    }
    const base64 = window.location.hash.substring(1);
    // noinspection JSCheckFunctionSignatures
    const compressed = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    const inStream = new LZMA.iStream(compressed);
    const outStream = LZMA.decompressFile(inStream);
    const html = outStream.toString();

    window.onload = null;
    document.open();
    document.write(html);
    document.close();
    setTimeout(() => {
        if (window.onload) {
            window.onload();
        }
    });
};

