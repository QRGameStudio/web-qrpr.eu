function Decompressor(compressedText) {
    this.base64 = (text=null) => {
        text = text ? text : compressedText;
        // noinspection JSCheckFunctionSignatures
        const compressed = Uint8Array.from(atob(text), c => c.charCodeAt(0));
        return this.lzma(compressed);
    }

    this.base32 = (text=null) => {
        text = text ? text : compressedText;
        const compressed = Uint8Array.from(window.base32.decode(text.toLowerCase()), c => c.charCodeAt(0));
        return this.lzma(compressed);
    }

    this.lzma = (compressed=null) => {
        compressed = compressed ? compressed : compressedText;
        const inStream = new LZMA.iStream(compressed);
        const outStream = LZMA.decompressFile(inStream);
        return outStream.toString();
    }

    this.decompress = (text=null) => {
        text = text ? text : compressedText;
        if (text.startsWith('CB')) {
            return this.base32(text.substring(2));
        }
        return this.base64();
    }
}


window.onload = async () => {
    if (!window.location.hash) {
        console.error("No data to parse");
        return;
    }
    document.body.innerText = '';
    const hashData = window.location.hash.substring(1);
    if (hashData === 'debug') {
        console.log('Awaiting your /debug/ commands');
        return;
    }
    const decompressor = new Decompressor(hashData);
    const decompressed = decompressor.decompress();
    const html = new CodeMap(decompressed).revert();
    const storage = new GStorage("currentGame", true);
    await storage.set('currentGame', html);
    location.replace('game.html');
};

