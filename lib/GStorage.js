function GStorage(context, temporary=false) {
    const storageProvider = temporary ? sessionStorage : localStorage;

    this.get = (key, def=null) => Promise.resolve(JSON.parse(storageProvider.getItem(`${context}/${key}`) || "null") || def);
    this.set = (key, value) => new Promise((r) => {
        storageProvider.setItem(`${context}/${key}`, JSON.stringify(value));
        r(true);
    });
    this.del = (key) => this.set(key, null);
}
