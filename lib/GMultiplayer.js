function GMP() {
    const storage = new GStorage("multiplayer");

    let myPeer = null;
    let myName = null;

    this.getMe = () => {
        if (myName === null) {
            myName = storage.get('name');
        }

        if (myPeer !== null) {
            if (!myPeer.disconnected) {
                return Promise.resolve(myPeer);
            }
            if (!myPeer.destroyed) {
                return new Promise(resolve => {
                    myPeer.reconnect();
                    myPeer.on('open', () => {
                        resolve(myPeer);
                    });
                })
            }
        }

        const options = {
            // host: `peer.${window.location.host}`,
            host: 'peer.qrpr.eu', // TODO remove fixed server
            key: 'qrgames',
            secure: true
        }

        return new Promise(async (resolve) => {
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

    this.getSavedId = async () => await storage.get('id', null);

    this.connect = (id) => {
        return new Promise(async resolve => {
            const me = await this.getMe();
            const conn = me.connect(id, {metadata: {name: myName}});
            conn.on('open', () => resolve(conn));
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

    this.showFriendsModal = (options={}) => {
        options = Object.assign( {
            allowAdd: true,
            allowDelete: false,
            allowSelect: false
        }, options);
        const modals = new ModalService();
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
