window.onload = async () => {
    const storage = new GStorage(true);
    const html = await storage.get('currentGame');

    if (!html) {
        return;
    }

    storage.del('currentGame').then();

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

