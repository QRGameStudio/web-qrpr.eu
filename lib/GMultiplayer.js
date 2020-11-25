function GMP() {
    const storage = new GStorage("multiplayer");
    const modals = new GModal();
    const gameData = new GGameData().parseGameData();
    let currentGameId = gameData ? gameData.id : null;

    let myPeer = null;
    let myName = null;

    this.getMe = async () => {
        if (!await this.isEnabled()) {
            if (! await modals.yesNo('Do you want to connect to the multiplayer server?', 'Enable multiplayer')) {
                return null;
            }
            storage.set('enabled', true).then();
        }

        if (myName === null) {
            storage.get('name', null).then((n) => myName = n);
        }

        if (myPeer !== null) {
            if (!myPeer.disconnected) {
                return myPeer;
            }
            if (!myPeer.destroyed) {
                return await new Promise(resolve => {
                    myPeer.reconnect();
                    myPeer.on('open', () => {
                        resolve(myPeer);
                    });
                })
            }
        }

        const options = {
            host: `peer.qrpr.eu`,
            key: 'qrgames',
            secure: true
        }

        return await new Promise(async (resolve) => {
            const myId = await this.getSavedId();
            if (myId) {
                myPeer = new Peer(myId, options);
            } else {
                myPeer = new Peer(null, options);
            }

            myPeer.on('open', (id) => {
                console.log(`P2P: Running as ${id}`)
                storage.set('id', id);
                resolve(myPeer);
            });
        });
    };

    this.isEnabled = async () => await storage.get('enabled', false);

    this.getSavedId = async () => await storage.get('id', null);

    this.connect = (id, dataCallback) => {
        return new Promise(async resolve => {
            const me = await this.getMe();
            const conn = me.connect(id, {metadata: {name: myName, game: currentGameId}});
            conn.on('open', () => {
                console.log('P2P: connection opened with', conn.peer);
                let connectionAccepted = false;
                conn.on('data', (data) => {
                    if (!connectionAccepted) {
                        if (data) {
                            console.log('P2P: link established with', conn.peer);
                            resolve(conn);
                            connectionAccepted = true;
                            conn.on('close', () => {
                                console.log('P2P: link closed -', conn.peer);
                                dataCallback(null);
                            });
                            conn.on('error', () => {
                                console.log('P2P: link error -', conn.peer);
                                dataCallback(null);
                            });
                        } else {
                            console.log('P2P: connection denied -', conn.peer);
                            connectionAccepted = true;
                            conn.close();
                            resolve(null);
                        }
                    } else {
                        dataCallback(data);
                    }
                });
            });
        });
    }

    this.setCurrentGameId = (gameId) => currentGameId = gameId;

    this.onConnection = async (callback, dataCallback) => {
        (await this.getMe()).on('connection', (conn) => {
            console.log('P2P: incoming connection from', conn.peer);
            const remoteName = conn.metadata.name || null;
            const remoteGameId = conn.metadata.game || null;

            if (currentGameId !== 'DEBUG' && remoteGameId !== currentGameId) {
                console.log('P2P: game ID does not match', conn.peer);
                conn.send(false);
                return;
            }

            modals.yesNo(`${remoteName} want's to play with you in online mode!`, 'Online request').then((response) => {
                if (response) {
                    console.log('P2P: link established with', conn.peer);
                    conn.send(true);
                    conn.on('data', (data) => dataCallback(data));
                    conn.on('close', () => {
                        console.log('P2P: link closed -', conn.peer);
                        dataCallback(null)
                    });
                    conn.on('error', () => {
                        console.log('P2P: link error -', conn.peer);
                        dataCallback(null)
                    });
                    callback(conn);
                } else {
                    console.log('P2P: connection denied - ', conn.peer);
                    conn.send(false);
                }
            });
        });
    }
}

function GFriends() {
    const storage = new GStorage("multiplayer");

    this.getFriends = async () => {
        return await storage.get('friends', {});
    }

    this.addFriend = async (id, name) => {
        const saved = await this.getFriends();
        saved[name] = id;
        return await storage.set('friends', saved);
    }

    this.removeFriend = async (name) => {
        const saved = await this.getFriends();
        delete saved[name];
        return await storage.set('friends', saved);
    }

    this.showFriendsModal = (options = {}) => {
        options = Object.assign({
            allowAdd: true,
            allowDelete: false,
            allowSelect: false
        }, options);
        const modals = new GModal();
        const superThis = this;
        return new Promise(resolve => {
            async function inner() {
                const backData = {};
                await modals.show('OnlineFriends',
                    {friends: await superThis.getFriends(), options},
                    {
                        addFriend: async () => {
                            const id = await modals.prompt('', 'Enter your friend\'s ID');
                            const name = id ? await modals.prompt('', 'Enter your friend\'s name') : id;

                            if (id && name) {
                                await superThis.addFriend(id, name);
                                backData.renderer.variables.friends = await superThis.getFriends();
                                backData.renderer.render(backData.renderer.variables.el);
                            }
                        },
                        select: async (name) => {
                            if (options.allowSelect) {
                                resolve(name);
                                backData.renderer.functions.hideModal();
                            }
                        },
                        delete: async (name) => {
                            await superThis.removeFriend(name);
                            backData.renderer.variables.friends = await superThis.getFriends();
                            backData.renderer.render(backData.renderer.variables.el);
                        }
                    }, backData);
            }

            inner().then();
        });
    }
}
