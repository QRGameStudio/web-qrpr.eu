window.onload = async () => {
    const storage = new GStorage("currentGame", true);
    const gamesStorage = new GamesStorage();
    const html = await storage.get('currentGame');

    if (!html) {
        if (window.location.hash) {
            gamesStorage.loadGame(window.location.hash.substring(1)).then((saved) => {
                if (saved) {
                    window.location.reload(true);
                }
            });
        } else {
            window.location.replace('index.html');
        }
        return;
    }

    window.onload = null;
    await gamesStorage.setGameCode(html);
    gamesStorage.saveGame().then((saved) => {
        if (saved) {
            const gameData = gamesStorage.parseGameData();
            if (gameData.saveInHistory) {
                window.location.replace(window.location.pathname + '#' + gameData.id);
            }
        }
        console.log('game saved successful:', saved);
    });
    if (window.onload) {
        // noinspection JSCheckFunctionSignatures
        window.onload();
    }
};

