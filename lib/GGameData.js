function GGameData() {
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
}
