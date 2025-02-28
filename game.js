function superSecretEditMode(gamesStorage) {
    const defaultCode = `
<script>
function openEditWindow() {
    const w = window.open('editor.html', '_blank');
    w.onload = () => {
      const editor = w.document.getElementById('editor');
      function updateCode() {
        sessionStorage.setItem('edit', editor.value);
      }
      editor.onkeyup = updateCode;
    };
    sessionStorage.setItem('edit', '<code>Go to your opened editor tab</code>');
}
</script>
<code>Replace sessionStorage.code to update or open</code>
<button id="editor-btn" class="btn" onclick="openEditWindow()">Edit window</button>
    `;
    sessionStorage.setItem('edit', defaultCode);
    let editCache = '';
    setInterval(() => {
        const currentCode = sessionStorage.getItem('edit');
        if (currentCode === editCache) {
            return;
        }
        editCache = currentCode;
        gamesStorage.setGameCode(currentCode).then();
    }, 1000);
}

window.onload = async () => {
    window.qrgames = {env: true};
    const storage = new GStorage("currentGame", true);
    const gamesStorage = new _GGamesStorage();
    new GTheme().apply();
    const html = await storage.get('currentGame');

    if (!html) {
        if (window.location.hash) {
            const hashContent = window.location.hash.substring(1);
            if (hashContent === 'super-secret-edit-mode') {
                // if you want to try out your game in a live editing environment,
                // why not just to simply pass the code to the cache
                superSecretEditMode(gamesStorage);
            } else {
                gamesStorage.loadGame(hashContent).then((saved) => {
                    if (saved) {
                        window.location.reload(true);
                    } else {
                        window.location.replace('index.html');
                    }
                });
            }
        } else {
            window.location.replace('index.html');
        }
        return;
    }

    window.onload = null;
    await gamesStorage.setGameCode(html);
    gamesStorage.saveGame().then((saved) => {
        if (saved) {
            const gameData = gamesStorage.parseGameData();
            if (gameData.saveInHistory) {
                window.location.replace(window.location.pathname + '#' + gameData.id);
            }
        }
        console.debug('[GAME] game saved successful:', saved);
    });
    window.addEventListener('error', (e,) => {
        alert(`!Error!\n${e.lineno}:${e.filename}\n${e.message}`);
        console.error(e);
    });
    if (window.qrgames.onload) {
        console.debug('[GAME] Triggering QR onload');
        window.qrgames.onload();
    } else if (window.onload) {
        console.debug('[GAME] Triggering onload');
        // noinspection JSCheckFunctionSignatures
        window.onload();
    } else {
        console.debug('[GAME] No startup to triigger');
    }
};
