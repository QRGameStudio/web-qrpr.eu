const getTheme = () => localStorage.getItem("theme") || "light";
const applyTheme = () => {
  const theme = getTheme();
  if (theme === "dark") {
    document.body.style.setProperty("--theme-primary", "#212121");
    document.body.style.setProperty("--theme-contrast", "#ffffff");
  }
};
