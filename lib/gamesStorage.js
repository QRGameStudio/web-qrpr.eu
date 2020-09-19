function GamesStorage() {
    let gameCode = null;
    const storage = new GStorage("gamesStorage");

    this.parseGameData = () => {
        const gameIdEl = document.head.querySelector('meta[name=gi]');
        const gameVersionEl = document.head.querySelector('meta[name=gv]');
        const gameSecretEl = document.head.querySelector('meta[name=gs]');
        const gameFooterEl = document.head.querySelector('meta[name=gf]');
        const gameAutoUpdateEl = document.head.querySelector('meta[name=gu]');
        const titleEl = document.head.querySelector('title');

        let gameId = null;
        let gameVersion = null;
        let gameName = null;
        let gameSecret = null;
        let gameUpdate = 'auto';
        let gameFooter = true;

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
        if (gameSecretEl) {
            gameSecret = gameSecretEl.getAttribute('content');
        }
        if (gameFooterEl) {
            gameFooter = gameFooterEl.getAttribute('content').toLowerCase() !== 'no';
        }
        if (gameAutoUpdateEl) {
            gameUpdate = gameAutoUpdateEl.getAttribute('content').toLowerCase();
        }

        console.log(`playing game ${gameId} v${gameVersion}`);

        return {
            name: gameName,
            id: gameId,
            version: gameVersion,
            secret: gameSecret,
            showFooter: gameFooter,
            update: gameUpdate
        };
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
                footer.innerHTML = '<a href="http://qrgamestudio.com/">Made By QRGameStudio</a>';
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
        let savedVersion = undefined;

        if (gameData.id in savedGames) {
            savedVersion = savedGames[gameData.id].version;
        }

        savedGames[gameData.id] = {
            code: gameCode,
            ...gameData
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
