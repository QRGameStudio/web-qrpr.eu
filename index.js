window.onload = () => {
    const theme = new GTheme();
    const rendered = new Renderer(document.body, {savedGames: [], updates: [], theme: theme.get()});
    const gamesStorage = new GamesStorage();

    gamesStorage.getSavedGames().then((gamesDict) => {
       rendered.variables.savedGames = Object.keys(gamesDict).map((gameId) => ({
           id: gameId,
           ...gamesDict[gameId]
       }));
       rendered.functions.playGame = (game) => {
           gamesStorage.playGame(game.code).then();
       };
       rendered.render();
    });

    gamesStorage.findUpdates().then((upd) => {
        rendered.variables.updates = upd;
        rendered.functions.update = () => {
            rendered.variables.updates = [];
            rendered.render();
            gamesStorage.updateGames(upd).then();
        }
        rendered.render();
    });

    rendered.functions.applyTheme = (themeName) => {
        theme.apply(themeName);
        theme.save(themeName).then(() => {
            rendered.variables.theme = theme.get();
            rendered.render();
        });
    };

    theme.apply();
    rendered.render();

    const btnScan = document.getElementById('scan');
    btnScan.onclick = () => {
      window.location.href = 'qrscanner.html';
    };
    console.log('setup complete');
}
