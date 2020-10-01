function GTheme() {
    this.get = () => localStorage.getItem("theme") || "light";

    this.apply = () => {
        const theme = new GTheme().get();
        if (theme === "dark") {
            document.body.style.setProperty("--theme-primary", "#212121");
            document.body.style.setProperty("--theme-contrast", "#ffffff");
        } else {
            document.body.style.setProperty("--theme-primary", "#ffffff");
            document.body.style.setProperty("--theme-contrast", "#000000");
        }
    }
}
