window.onload = () => {
    const theme = new GTheme();
    const friends = new GFriends();
    const renderer = new Renderer(document.body, {onlineId: null, theme: theme.get(), connectDisabled: false});
    const multiplayer = new GMP();

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

    multiplayer.getSavedId().then((id) => {
        renderer.variables.onlineId = id;
        renderer.render();
        theme.apply();
    });

    renderer.render();
    theme.apply();
}
