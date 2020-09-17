window.onload = async () => {
    const storage = new Storage();
    const html = await storage.get('currentGame');

    window.onload = null;
    document.open();
    document.write(html);
    document.close();
    setTimeout(() => {
        if (window.onload) {
            // noinspection JSCheckFunctionSignatures
            window.onload();
            new ENGINE().parseGameData();
        }
    });
};

