const GTheme = {
  get: () => localStorage.getItem("theme") || "light",
  apply: () => {
    const theme = GTheme.get();
    if (theme === "dark") {
      document.body.style.setProperty("--theme-primary", "#212121");
      document.body.style.setProperty("--theme-contrast", "#ffffff");
    }
  }
};
