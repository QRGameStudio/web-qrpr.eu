function GStorage(temporary) {
    const storageProvider = temporary ? sessionStorage : localStorage;

    this.get = (key) => Promise.resolve(storageProvider.getItem(key));
    this.set = (key, value) => Promise.resolve(storageProvider.setItem(key, value));
    this.del = (key) => Promise.resolve(storageProvider.setItem(key, null));
}
