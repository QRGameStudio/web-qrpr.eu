function GamesStorage() {
    let gameCode = null;
    const storage = new GStorage("gamesStorage");

    this.parseGameData = () => {
        const gameIdEl = document.head.querySelector('meta[name=gi]');
        const gameVersionEl = document.head.querySelector('meta[name=gv]');
        const titleEl = document.head.querySelector('title');

        let gameId = null;
        let gameVersion = null;
        let gameName = null;

        if (gameIdEl) {
            gameId = gameIdEl.getAttribute('content');
        } else {
            return null;
        }
        if (titleEl) {
            gameName = titleEl.textContent;
        }
        if (gameVersionEl) {
            gameVersion = gameVersionEl.getAttribute('content');
        }

        console.log(`playing game ${gameId} v${gameVersion}`);

        return {name: gameName, id: gameId, version: gameVersion};
    }

    this.setGameCode = (html) => {
        gameCode = html;
        document.open();
        document.write(html);
        document.close();
        return new Promise((r) => setTimeout(() => r()));
    }

    this.saveGame = async () => {
        if (!gameCode) {
            return false;
        }
        const gameData = this.parseGameData();
        if (!this.isGame(gameData)) {
            return false;
        }
        const savedGames = await storage.get("gamesSaved", {});
        savedGames[gameData.id] = {
            name: gameData.name,
            version: gameData.version,
            code: gameCode,
        }
        return storage.set("gamesSaved", savedGames);
    }

    this.isGame = (gameData = null) => {
        return (gameData ? gameData : this.parseGameData()) !== null;
    }
}
