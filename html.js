function Decompressor(compressedText) {
    this.base64 = (text=null) => {
        text = text ? text : compressedText;
        // noinspection JSCheckFunctionSignatures
        const compressed = Uint8Array.from(atob(text), c => c.charCodeAt(0));
        try {
            return this.lzma(compressed);
        } catch (e) {
            console.error('LZMA decompression failed with', e);
            return compressed;
        }
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

    this.download = async (fragment=null) => {
        fragment = fragment ? fragment : compressedText;
        const data = JSON.parse(atob(fragment));
        const id = data[0];
        const secret = data.length > 1 ? data[1] : null;
        const response = await fetch(`https://api.${isLocalhost?'qrpr.eu':window.location.host}/game/${id}/code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                secret: secret
            })
        });
        return await response.text();
    }

    this.decompress = async (text=null) => {
        text = text ? text : compressedText;
        if (text.startsWith('==')) {
            return await this.download(text.substring(2));
        }
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
    const decompressed = await decompressor.decompress();
    if (!decompressed) {
        console.error("Invalid data retrieved")
        return;
    }
    const html = new _GCodeMap(decompressed).revert();
    const storage = new GStorage("currentGame", true);
    await storage.set('currentGame', html);
    location.replace('game.html');
};

