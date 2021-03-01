window.onload = () => {
    const theme = new GTheme();
    const friends = new GFriends();
    const renderer = new Renderer(document.body,
        {onlineId: null, theme: theme.get(), connectDisabled: false, sound: 'off'});
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
        const value = enable === null ? GSoundStatus.off : enable ? GSoundStatus.music : GSoundStatus.fx;
        renderer.variables.sound = enable === null ? 'off' : enable ? 'all' : 'fx';
        GVolume.prototype.get().setStatus(value).then();
        renderer.render();
    }

    renderer.functions.addGame = async () => {
        let code = await modal.prompt('Enter game content');
        if (code) {
            const urlRe = /^http.*?#(.*)$/.exec(code);
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

    GVolume.prototype.get().getStatus().then((status) => {
        switch (status) {
            case GSoundStatus.fx:
                renderer.variables.sound = 'fx';
                break;
            case GSoundStatus.music:
                renderer.variables.sound = 'all';
                break;
            case GSoundStatus.off:
                renderer.variables.sound = 'off';
                break;
        }
        renderer.render();
    });

    renderer.render();
    theme.apply();
}
