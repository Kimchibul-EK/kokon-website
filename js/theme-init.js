// Vælger gemt eller systemstyret tema, før siden bliver vist.
(() => {
  const stored = localStorage.getItem("kokon-theme");
  const theme = stored === "light" || stored === "dark"
    ? stored
    : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = stored || "system";
})();
