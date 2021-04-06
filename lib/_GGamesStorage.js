function _GGamesStorage() {
    let gameCode = null;
    const storage = new GStorage("gamesStorage");
    const gameData = new GGameData();

    this.defaultGame = () => gameData.defaultGame();

    this.parseGameData = () => gameData.parseGameData();

    this.setGameCode = (html) => {
        gameCode = html;
        document.open();
        document.write(html);
        document.close();
        return new Promise((r) => setTimeout(async () => {
            const gameData = this.parseGameData();
            if (!this.isGame(gameData)) {
                r();
                return;
            }
            new GTheme().apply();

            // add footer
            if (gameData.showFooter) {
                document.querySelectorAll('.qr-footer').forEach(e => e.parentNode.removeChild(e));
                const footer = document.createElement('footer');
                footer.innerHTML = `<a href="http://qrgamestudio.com/">Powered By QRGameStudio</a>`;
                footer.className = 'qr-footer';
                footer.style.position = 'fixed';
                footer.style.top = '0';
                footer.style.left = '0';
                document.body.appendChild(footer);
            }

            const inserted = [
                [
                    ["ext/inj/jquery.min.js", 'script'],
                    ["ext/inj/bootstrap.min.js", 'script'],
                    ["ext/inj/bootstrap.min.css", 'style']
                ],
            ]

            const scripts = [
                "ext/inj/renderer.js",
                "ext/inj/peerjs.min.js",
                "https://lib.qrpr.eu/GModal/GModal.js",
                "https://lib.qrpr.eu/GPopup/GPopup.js",
                "https://lib.qrpr.eu/GSound/GSound.js",
                "https://lib.qrpr.eu/GTheme/GTheme.js",
                "https://lib.qrpr.eu/GMultiplayer/GMultiplayer.js",
                "https://lib.qrpr.eu/GGameData/GGameData.js",
                "https://lib.qrpr.eu/GUt/GUt.js"
            ];
            const styles = [
                "https://lib.qrpr.eu/GPopup/GPopup.css",
                "https://lib.qrpr.eu/GTheme/GTheme.css",
            ];
            inserted.push(...scripts.map((s) => [[s, 'script']]))
            inserted.push(...styles.map((s) => [[s, 'style']]))

            // load necessary styles and scripts
            console.debug('[INS] Starting inserter')
            await Promise.all(inserted.map((sequence) => {
                return new Promise(async (resolve) => {
                    for (let insert of sequence) {
                        const url = insert[0];
                        const type = insert[1];
                        const loadingTimeout = setTimeout(() => {
                            console.error('[INS] Item taking too long to load', insert);
                        }, 5000);
                        switch (type) {
                            case 'script':
                                await new Promise(resolve => {
                                    if (document.querySelector(`script[src="${url}"]`)) {
                                        resolve();
                                        return;
                                    }
                                    const el = document.createElement('script');
                                    el.setAttribute('src', url);
                                    el.onload = () => resolve();
                                    document.head.appendChild(el);
                                });
                                break;
                            case 'style':
                                await new Promise(resolve => {
                                    if (document.querySelector(`link[rel=stylesheet][href="${url}"]`)) {
                                        resolve();
                                        return;
                                    }
                                    const el = document.createElement('link');
                                    el.setAttribute('rel', 'stylesheet');
                                    el.setAttribute('href', url);
                                    el.onload = () => resolve();
                                    document.head.appendChild(el);
                                });
                                break;
                        }
                        clearTimeout(loadingTimeout);
                    }
                    resolve();
                })
            }));
            console.debug('[INS] Inserting complete')

            r();
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
                    popup = new GPopup("Game was added to your collection", 5000);
                    break;
                case gameData.version:
                    break;
                default:
                    popup = new GPopup("Game version was updated in your collection", 5000);
                    break;
            }
        } else {
            popup = new GPopup("Saving game has failed", 5000);
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
        const response = await fetch(`https://api.qrpr.eu/games/update/find`, {
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
            let response = await fetch(`https://api.qrpr.eu/game/${id}`, {
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
                new GPopup("Obtaining new game data has failed", 5000).show();
                return;
            }
            response = await fetch(`https://api.qrpr.eu/game/${id}/code`, {
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
                new GPopup("Obtaining new game code has failed", 5000).show();
                return;
            }
            saved[id] = {...game, ...newGameMetadata, code: newGameCode};
        }

        const saveOk = await storage.set("gamesSaved", saved);
        if (saveOk) {
            new GPopup("Update completed", 5000).show();
        } else {
            new GPopup("Saving update failed", 5000).show();
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
