function Storage() {
    this.get = (key) => Promise.resolve(localStorage.getItem(key));
    this.set = (key, value) => Promise.resolve(localStorage.setItem(key, value));
}
