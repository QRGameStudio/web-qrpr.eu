window.onload = () => {
    new GTheme().apply();
    const rendered = new Renderer(document.body, {savedGames: [], updates: []});
    const gamesStorage = new _GGamesStorage();

    function renderGames() {
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
    }
    renderGames();

    gamesStorage.findUpdates().then((upd) => {
        rendered.variables.updates = upd;
        rendered.functions.update = () => {
            rendered.variables.updates = [];
            rendered.render();
            gamesStorage.updateGames(upd).then(() => renderGames());
        }
        rendered.render();
    });

    rendered.functions.goToSettings = () => window.location.href = 'settings.html';

    rendered.render();

    const btnScan = document.getElementById('scan');
    btnScan.onclick = () => {
      window.location.href = 'qrscanner.html';
    };
}
