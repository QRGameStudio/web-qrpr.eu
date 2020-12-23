window.onload = () => {
    const theme = new GTheme();
    const friends = new GFriends();
    const renderer = new Renderer(document.body, {onlineId: null, theme: theme.get(), connectDisabled: false});
    const multiplayer = new GMP();
    const modal = new GModal();

    renderer.functions.applyTheme = (themeName) => {
        theme.apply(themeName);
        theme.save(themeName).then(() => {
            renderer.variables.theme = theme.get();
            renderer.render();
            theme.apply(themeName);
        });
    };

    renderer.functions.onlineConnect = () => {
        renderer.render();
        theme.apply();

        multiplayer.getMe().then((me) => {
            renderer.variables.onlineId = me._id;
            renderer.render();
            theme.apply();
        });
    };

    renderer.functions.friendsEdit = () => friends.showFriendsModal({allowAdd: true, allowDelete: true});

    renderer.functions.copyOnlineId = async () => {
        await navigator.clipboard.writeText(renderer.variables.onlineId);
        new GPopup('Online ID copied', 2000).show();
    };

    renderer.functions.cacheEnable = (enable) => {
        localStorage.setItem('pageCacheEnabled', enable ? '1' : '0');
        renderer.render();
    }

    renderer.functions.musicEnable = async (enable) => {
        await GVolume.prototype.create().setMusicEnabled(enable);
        renderer.render();
    }

    renderer.functions.addGame = async () => {
        let code = await modal.prompt('Enter game content');
        if (code) {
            const urlRe =  /^http.*?#(.*)$/.exec(code);
            if (urlRe) {
                code = urlRe[1];
            }
            window.location.href = 'html.html#' + code;
        }
    };

    multiplayer.getSavedId().then((id) => {
        renderer.variables.onlineId = id;
        renderer.render();
        theme.apply();
    });

    renderer.render();
    theme.apply();
}
