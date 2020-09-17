window.onload = async () => {
    const storage = new GStorage("currentGame", true);
    const gamesStorage = new GamesStorage();
    const html = await storage.get('currentGame');

    if (!html) {
        return;
    }

    window.onload = null;
    await gamesStorage.setGameCode(html);
    gamesStorage.saveGame().then((saved) => console.log('game saved successful:', saved));
    if (window.onload) {
        // noinspection JSCheckFunctionSignatures
        window.onload();
    }
};

