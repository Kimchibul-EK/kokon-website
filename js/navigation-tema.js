// Styrer mobilmenuen og brugerens valg mellem lyst og mørkt tema.
const menuKnap = document.querySelector(".menu-knap");
const navigation = document.querySelector(".hovednavigation");
const temaKnap = document.querySelector(".tema-knap");
const temaTekst = document.querySelector("[data-theme-label]");
const sideindhold = document.querySelectorAll("main, .sidefod-baggrund");

// Lukker mobilmenuen og kan sende tastaturfokus tilbage til menuknappen.
function lukMenu(givFokusTilbage = false) {
  if (!menuKnap || !navigation) return;
  menuKnap.setAttribute("aria-expanded", "false");
  menuKnap.setAttribute("aria-label", "Åbn menu");
  navigation.removeAttribute("data-open");
  document.body.classList.remove("menu-aaben");
  sideindhold.forEach((element) => element.removeAttribute("inert"));
  if (givFokusTilbage) menuKnap.focus();
}

// Åbner eller lukker mobilmenuen og skjuler resten af siden for tastaturnavigation.
menuKnap?.addEventListener("click", () => {
  const skalAabne = menuKnap.getAttribute("aria-expanded") !== "true";
  menuKnap.setAttribute("aria-expanded", String(skalAabne));
  menuKnap.setAttribute("aria-label", skalAabne ? "Luk menu" : "Åbn menu");
  navigation.toggleAttribute("data-open", skalAabne);
  document.body.classList.toggle("menu-aaben", skalAabne);
  sideindhold.forEach((element) => element.toggleAttribute("inert", skalAabne));
  if (skalAabne) navigation.querySelector("a")?.focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation?.hasAttribute("data-open")) {
    lukMenu(true);
  }
});

navigation?.addEventListener("click", (event) => {
  if (event.target.closest("a")) lukMenu();
});

matchMedia("(min-width: 64rem)").addEventListener("change", (event) => {
  if (event.matches) lukMenu();
});

// Holder temaknappens tekst og tilgængelighedsbeskrivelse ajour.
function opdaterTemaKnap() {
  if (!temaKnap || !temaTekst) return;
  const erMoerkt = document.documentElement.dataset.theme === "dark";
  temaKnap.setAttribute("aria-checked", String(erMoerkt));
  temaKnap.setAttribute("aria-label", erMoerkt ? "Slå lyst tema til" : "Slå mørkt tema til");
  temaTekst.textContent = erMoerkt ? "Mørk" : "Lys";
}

opdaterTemaKnap();

// Gemmer brugerens manuelle valg, så temaet huskes ved næste besøg.
temaKnap?.addEventListener("click", () => {
  const tema = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = tema;
  document.documentElement.dataset.themePreference = tema;
  localStorage.setItem("kokon-theme", tema);
  opdaterTemaKnap();
});

// Følger kun systemets temaændring, når brugeren ikke selv har valgt et tema.
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  if (document.documentElement.dataset.themePreference !== "system") return;
  document.documentElement.dataset.theme = event.matches ? "dark" : "light";
  opdaterTemaKnap();
});
