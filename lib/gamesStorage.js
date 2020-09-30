function GamesStorage() {
    let gameCode = null;
    const storage = new GStorage("gamesStorage");

    this.defaultGame = () => {
        return {
            name: 'QR Game',
            id: null,
            version: null,
            secret: null,
            showFooter: true,
            update: true,
            saveInHistory: true,
            code: null
        };
    }

    this.parseGameData = () => {
        const gameIdEl = document.head.querySelector('meta[name=gi]');
        const gameVersionEl = document.head.querySelector('meta[name=gv]');
        const gameSecretEl = document.head.querySelector('meta[name=gs]');
        const gameFooterEl = document.head.querySelector('meta[name=gf]');
        const gameAutoUpdateEl = document.head.querySelector('meta[name=gu]');
        const gameSaveInHistoryEl = document.head.querySelector('meta[name=gh]');
        const titleEl = document.head.querySelector('title');

        let game = this.defaultGame();

        if (gameIdEl) {
            game.id = gameIdEl.getAttribute('content');
        } else {
            return null;
        }
        if (titleEl) {
            game.name = titleEl.textContent;
        }
        if (gameVersionEl) {
            game.version = gameVersionEl.getAttribute('content');
        }
        if (gameSecretEl) {
            game.secret = gameSecretEl.getAttribute('content');
        }
        if (gameFooterEl) {
            game.showFooter = gameFooterEl.getAttribute('content').toLowerCase() !== 'no';
        }
        if (gameAutoUpdateEl) {
            game.update = gameAutoUpdateEl.getAttribute('content').toLowerCase();
        }
        if (gameSaveInHistoryEl) {
            game.saveInHistory = gameSaveInHistoryEl.getAttribute('content').toLowerCase() !== 'no';
        }

        console.log(`playing game ${game.id} v${game.version}`);

        return game;
    }

    this.setGameCode = (html) => {
        gameCode = html;
        document.open();
        document.write(html);
        document.close();
        return new Promise((r) => setTimeout(() => {
            const gameData = this.parseGameData();
            if (!this.isGame(gameData)) {
                r();
                return;
            }

            // add footer
            if (gameData.showFooter) {
                document.querySelectorAll('.qr-footer').forEach(e => e.parentNode.removeChild(e));
                const footer = document.createElement('footer');
                footer.innerHTML = '<a href="http://qrgamestudio.com/">Powered By QRGameStudio</a>';
                footer.className = 'qr-footer';
                footer.style.position = 'fixed';
                footer.style.top = '0';
                footer.style.left = '0';
                document.body.appendChild(footer);
            }

            const scripts = [
                "ext/jquery.min.js",
                "ext/bootstrap.min.js",
                "ext/renderer.js",
                "lib/modals.js",
                "lib/popup.js",
                "lib/musicComposer.js",
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
        let savedVersion = undefined;

        if (gameData.id in savedGames) {
            savedVersion = savedGames[gameData.id].version;
        }

        savedGames[gameData.id] = {
            ...this.defaultGame(),
            ...gameData,
            code: gameCode,
        }
        const saveOk = await storage.set("gamesSaved", savedGames);
        let popup;

        if (saveOk) {
            switch (savedVersion) {
                case undefined:
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
        const games = await storage.get("gamesSaved", {});
        for (let key of Object.keys(games)) {
            games[key] = {...this.defaultGame(), ...games[key]};
        }
        return games;
    }

    this.findUpdates = async () => {
        const saved = await this.getSavedGames();
        const values = Object.keys(saved)
            .map((key) => saved[key])
            .filter((game) => game.update)
            .map((game) => [game.id, game.secret, game.version]);
        const response = await fetch(`https://api.${window.location.host}/games/update/find`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                games: values
            })
        });
        return await response.json();
    }

    this.updateGames = async (ids) => {
        const saved = await this.getSavedGames();
        for (let id of ids) {
            let game = saved[id];
            let response = await fetch(`https://api.${window.location.host}/game/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    secret: game.secret
                })
            });
            const newGameMetadata = await response.json();
            if (newGameMetadata === null) {
                new Popup("Obtaining new game data has failed", 5000).show();
                return;
            }
            response = await fetch(`https://api.${window.location.host}/game/${id}/code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    secret: game.secret
                })
            });
            const newGameCode = await response.text();
            if (newGameCode === null) {
                new Popup("Obtaining new game code has failed", 5000).show();
                return;
            }
            saved[id] = {...game, ...newGameMetadata, code: newGameCode};
        }

        const saveOk = await storage.set("gamesSaved", saved);
        if (saveOk) {
            new Popup("Update completed", 5000).show();
        } else {
            new Popup("Saving update failed", 5000).show();
        }
    }

    this.loadGame = async (gameId) => {
        const saved = await this.getSavedGames();
        if (!(gameId in saved)) {
            return false;
        }
        await this.playGame(saved[gameId].code);
        return true;
    };

    this.playGame = async (gameCode) => {
        const currGameStorage = new GStorage("currentGame", true);
        await currGameStorage.set('currentGame', gameCode);
        location.href = 'game.html';
    }

    this.isGame = (gameData = null) => {
        return (gameData ? gameData : this.parseGameData()) !== null;
    }
}
