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
        return new Promise((r) => setTimeout(() => {
            const scripts = [
                "ext/jquery.min.js",
                "ext/bootstrap.min.js",
                "ext/renderer.js",
                "lib/modals.js",
                "lib/popup.js"
            ];
            const styles = [
                "ext/bootstrap.min.css",
                "lib/popup.css",
            ];
            // load necessary styles and scripts
            Promise.all([
                ...styles.map((s) => new Promise(resolve => {
                    if (document.querySelector(`link[rel=stylesheet][href="${s}"]`)) {
                        return;
                    }
                    const el = document.createElement('link');
                    el.setAttribute('rel', 'stylesheet');
                    el.setAttribute('href', s);
                    el.onload = () => resolve();
                    document.head.appendChild(el);
                })),
                ...scripts.map((s) => new Promise(resolve => {
                    if (document.querySelector(`script[src="${s}"]`)) {
                        return;
                    }
                    const el = document.createElement('script');
                    el.setAttribute('src', s);
                    el.onload = () => resolve();
                    document.head.appendChild(el);
                }))
            ]).then(() => r());
        }));
    }

    this.saveGame = async () => {
        if (!gameCode) {
            return false;
        }
        const gameData = this.parseGameData();
        if (!this.isGame(gameData)) {
            return false;
        }
        const savedGames = await this.getSavedGames();
        let savedVersion = null;

        if (gameData.id in savedGames) {
            savedVersion = savedGames[gameData.id].version;
        }

        savedGames[gameData.id] = {
            name: gameData.name,
            version: gameData.version,
            code: gameCode,
        }
        const saveOk = await storage.set("gamesSaved", savedGames);
        let popup;

        if (saveOk) {
            switch (savedVersion) {
                case null:
                    popup = new Popup("Game was added to your collection", 5000);
                    break;
                case gameData.version:
                    break;
                default:
                    popup = new Popup("Game version was updated in your collection", 5000);
                    break;
            }
        } else {
            popup = new Popup("Saving game has failed", 5000);
        }
        if (popup) {
            popup.show();
        }

        return saveOk;
    }

    this.getSavedGames = async () => {
        return await storage.get("gamesSaved", {});
    }

    this.playGame = async (gameCode) => {
        const currGameStorage = new GStorage("currentGame", true);
        await currGameStorage.set('currentGame', gameCode);
        location.href = 'game.html';
    }

    this.isGame = (gameData = null) => {
        return (gameData ? gameData : this.parseGameData()) !== null;
    }
}
