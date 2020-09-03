const SETTINGS = {debug: true};

function ENGINE() {
    this.parseGameData = () => {
        const gameIdEl = document.head.querySelector('meta[name=gi]');
        const gameVersionEl = document.head.querySelector('meta[name=gv]');

        let gameId = null;
        let gameVersion = null;

        if (gameIdEl) {
            gameId = gameIdEl.getAttribute('content');
        }
        if (gameVersionEl) {
            gameVersion = gameVersionEl.getAttribute('content');
        }

        if (gameId && SETTINGS.debug) {
            console.log(`playing game ${gameId} v${gameVersion}`);
        }

        return {id: gameId, version: gameVersion};
    }

    this.isGame = () => {
        return this.parseGameData().id !== null;
    }
}
