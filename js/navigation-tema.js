// Styrer mobilmenuen og brugerens valg mellem lyst og mørkt tema.
const menuButton = document.querySelector(".menu-knap");
const navigation = document.querySelector(".hovednavigation");
const themeButton = document.querySelector(".tema-knap");
const themeLabel = document.querySelector("[data-theme-label]");
const backgroundContent = document.querySelectorAll("main, .sidefod-baggrund");

function closeMenu({ restoreFocus = false } = {}) {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Åbn menu");
  navigation.removeAttribute("data-open");
  document.body.classList.remove("menu-aaben");
  backgroundContent.forEach((element) => element.removeAttribute("inert"));
  if (restoreFocus) menuButton.focus();
}

menuButton?.addEventListener("click", () => {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.setAttribute("aria-label", willOpen ? "Luk menu" : "Åbn menu");
  navigation.toggleAttribute("data-open", willOpen);
  document.body.classList.toggle("menu-aaben", willOpen);
  backgroundContent.forEach((element) => element.toggleAttribute("inert", willOpen));
  if (willOpen) navigation.querySelector("a")?.focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation?.hasAttribute("data-open")) {
    closeMenu({ restoreFocus: true });
  }
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

matchMedia("(min-width: 64rem)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

function updateThemeControl() {
  if (!themeButton || !themeLabel) return;
  const isDark = document.documentElement.dataset.theme === "dark";
  themeButton.setAttribute("aria-checked", String(isDark));
  themeButton.setAttribute("aria-label", isDark ? "Slå lyst tema til" : "Slå mørkt tema til");
  themeLabel.textContent = isDark ? "Mørk" : "Lys";
}

updateThemeControl();

themeButton?.addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.themePreference = theme;
  localStorage.setItem("kokon-theme", theme);
  updateThemeControl();
});

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  if (document.documentElement.dataset.themePreference !== "system") return;
  document.documentElement.dataset.theme = event.matches ? "dark" : "light";
  updateThemeControl();
});
