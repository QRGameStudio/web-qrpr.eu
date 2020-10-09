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
            const myId = await storage.get('id', null);
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

    this.connect = (id) => {
        return new Promise(async resolve => {
            const me = await this.getMe();
            const conn = me.connect(id, {metadata: {name: myName}});
            conn.on('open', () => resolve(conn));
        });
    }
}
