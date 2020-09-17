window.onload = () => {
    const rendered = new Renderer(document.body, {savedGames: []});
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
}
