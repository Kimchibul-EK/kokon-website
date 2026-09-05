// Henter og viser én udgivelse med bogfakta, billedkarussel og dialog til eksterne links.
import { hentUdgivelser } from "./supabase.js";

const udgivelsesfelt = document.querySelector("[data-publication-detail]");
const forhandlerDialog = document.querySelector("#exit-dialog");
let forhandlerUrls = [];
let dialogKnap = null;

// Hjælpefunktioner til sikker tekst, URL-parameter og tekstafsnit.
function beskytHtml(vaerdi) {
  return String(vaerdi ?? "").replace(/[&<>'"]/g, (tegn) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[tegn]);
}

function hentSlug() {
  return new URLSearchParams(location.search).get("slug") ?? "";
}

function lavAfsnit(indhold) {
  return String(indhold ?? "")
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((afsnit) => `<p>${beskytHtml(afsnit)}</p>`)
    .join("");
}

function valgfriTekstsektion(titel, indhold, kilde = "") {
  if (!indhold || !String(indhold).trim()) return "";
  return `<section class="indholdssektion broedtekst"><h2>${beskytHtml(titel)}</h2>${lavAfsnit(indhold)}${kilde ? `<p class="kildeangivelse">Kilde: ${beskytHtml(kilde)}</p>` : ""}</section>`;
}

function visFaktavaerdi(vaerdi) {
  return vaerdi === null || vaerdi === undefined || String(vaerdi).trim() === ""
    ? "Afventer oplysninger"
    : String(vaerdi);
}

// Formaterer bogens danske udgivelsesdato, når en gyldig dato findes.
function danskUdgivelsesdato(udgivelse) {
  if (udgivelse.udgivelsesdato) {
    const dato = new Date(`${udgivelse.udgivelsesdato}T12:00:00`);
    if (!Number.isNaN(dato.valueOf())) {
      return new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "long", year: "numeric" }).format(dato);
    }
  }
  return udgivelse.dansk_udgivelsesaar ?? null;
}

// Bygger de forskellige indholdssektioner på bogens detaljeside.
function lavBogfakta(udgivelse) {
  const fakta = [
    ["ISBN", udgivelse.isbn],
    ["Sidetal", udgivelse.sidetal],
    ["Format / bind", udgivelse.format_bind],
    ["Sprog", udgivelse.sprog],
    ["Dansk udgivelse", danskUdgivelsesdato(udgivelse)],
    ["Originaludgivelse", udgivelse.originaludgivelsesaar],
    ["Originaltitel", udgivelse.originaltitel],
    ["Oversætter", udgivelse.oversaetter],
    ["Omslag og materialer", udgivelse.format_og_materialer],
  ];
  return `<section class="indholdssektion" aria-labelledby="book-facts-title">
    <h2 id="book-facts-title">Mere om bogen</h2>
    <dl class="bogfakta">${fakta.map(([navn, vaerdi]) => `<div><dt>${beskytHtml(navn)}</dt><dd>${beskytHtml(visFaktavaerdi(vaerdi))}</dd></div>`).join("")}</dl>
  </section>`;
}

function lavAnmeldelser(anmeldelser) {
  if (!Array.isArray(anmeldelser) || anmeldelser.length === 0) return "";
  const gyldigeAnmeldelser = anmeldelser.filter((anmeldelse) => anmeldelse && anmeldelse.citat);
  if (!gyldigeAnmeldelser.length) return "";
  return `<section class="indholdssektion"><h2>Anmeldelser</h2><div class="anmeldelsesliste">${gyldigeAnmeldelser.map((anmeldelse) => `
    <figure class="anmeldelse">
      <blockquote>“${beskytHtml(anmeldelse.citat)}”</blockquote>
      <figcaption><cite>${beskytHtml(anmeldelse.kilde ?? anmeldelse.afsender ?? "")}</cite></figcaption>
    </figure>`).join("")}</div></section>`;
}

function lavBilledsektion(billeder) {
  if (!Array.isArray(billeder) || billeder.length === 0) return "";
  const gyldigeBilleder = billeder.filter((billede) => billede?.src?.startsWith("/assets/images/") && billede?.alt);
  if (!gyldigeBilleder.length) return "";
  const harFlereBilleder = gyldigeBilleder.length > 1;
  const dias = gyldigeBilleder.map((billede) => `
    <figure class="karusel-slide"><img src="${beskytHtml(billede.src)}" alt="${beskytHtml(billede.alt)}" loading="lazy"></figure>`).join("");
  if (!harFlereBilleder) {
    return `<div class="indholdssektion detaljebilleder" role="region" aria-label="Billede fra udgivelsen">
      <div class="detalje-galleri">${dias}</div>
    </div>`;
  }
  const prikker = gyldigeBilleder.map((billede, nummer) => `
    <button class="karusel-prik" type="button" data-carousel-dot="${nummer}" aria-label="Vis billede ${nummer + 1} af ${gyldigeBilleder.length}"${nummer === 0 ? ' aria-current="true"' : ""}></button>`).join("");
  return `<div class="indholdssektion detaljebilleder" role="region" aria-labelledby="flere-billeder-title" data-carousel>
    <h2 class="karusel-titel" id="flere-billeder-title">Flere billeder af bogen</h2>
    <div class="karusel-visning">
      <div class="detalje-galleri er-karusel" tabindex="0" aria-label="Billeder">${dias}</div>
      <button class="karusel-pil forrige" type="button" data-carousel-prev aria-label="Vis forrige billede"><span aria-hidden="true">‹</span></button>
      <button class="karusel-pil naeste" type="button" data-carousel-next aria-label="Vis næste billede"><span aria-hidden="true">›</span></button>
    </div>
    <div class="karusel-prikker" role="group" aria-label="Vælg billede">${prikker}</div>
  </div>`;
}

// Gør pile, prikker, scrolling og tastaturstyring aktive i hver karussel.
function startKaruseller() {
  udgivelsesfelt.querySelectorAll("[data-carousel]").forEach((karusel) => {
    const billedrulle = karusel.querySelector(".er-karusel");
    const dias = [...karusel.querySelectorAll(".karusel-slide")];
    const prikker = [...karusel.querySelectorAll("[data-carousel-dot]")];
    const mindreBevaegelse = matchMedia("(prefers-reduced-motion: reduce)");
    let aktivtNummer = 0;
    let scrollTid = 0;

    function opdaterPrikker(nummer) {
      aktivtNummer = (nummer + dias.length) % dias.length;
      prikker.forEach((prik, prikNummer) => {
        if (prikNummer === aktivtNummer) prik.setAttribute("aria-current", "true");
        else prik.removeAttribute("aria-current");
      });
    }

    function visBillede(nummer, animer = true) {
      opdaterPrikker(nummer);
      billedrulle.scrollTo({
        left: billedrulle.clientWidth * aktivtNummer,
        behavior: animer && !mindreBevaegelse.matches ? "smooth" : "auto",
      });
    }

    karusel.querySelector("[data-carousel-prev]")?.addEventListener("click", () => visBillede(aktivtNummer - 1));
    karusel.querySelector("[data-carousel-next]")?.addEventListener("click", () => visBillede(aktivtNummer + 1));
    prikker.forEach((prik, nummer) => prik.addEventListener("click", () => visBillede(nummer)));

    billedrulle.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      visBillede(aktivtNummer + (event.key === "ArrowRight" ? 1 : -1));
    });

    billedrulle.addEventListener("scroll", () => {
      clearTimeout(scrollTid);
      scrollTid = window.setTimeout(() => {
        if (!billedrulle.clientWidth) return;
        opdaterPrikker(Math.round(billedrulle.scrollLeft / billedrulle.clientWidth));
      }, 100);
    }, { passive: true });

    window.addEventListener("resize", () => visBillede(aktivtNummer, false));
  });
}

// Gemmer kun gyldige eksterne links og bygger knapperne til dem.
function lavForhandlersektion(links) {
  if (!Array.isArray(links) || links.length === 0) return "";
  forhandlerUrls = links.filter((link) => {
    if (!link?.url || !link?.label) return false;

    try {
      return /^https?:$/.test(new URL(link.url).protocol);
    } catch {
      return false;
    }
  });
  if (!forhandlerUrls.length) return "";
  return `<section class="indholdssektion"><p class="overlinje">Anskaffelse</p><h2>Find bogen</h2><p>Forhandlerlinket fører væk fra Kokons website. Du får altid besked, før det åbnes.</p><div class="linkliste">${forhandlerUrls.map((link, nummer) =>
    `<button class="knap" type="button" data-external-index="${nummer}">Gå til ${beskytHtml(link.label)}</button>`,
  ).join("")}</div></section>`;
}

// Bygger et bogkort til sektionen med relaterede udgivelser.
function lavRelateretBogkort(udgivelse) {
  return `<article class="bogkort"><a href="/udgivelse.html?slug=${encodeURIComponent(udgivelse.slug)}">
    <div class="bogforside-ramme"><img src="${beskytHtml(udgivelse.forside_sti)}" alt="${beskytHtml(udgivelse.forside_alt)}" loading="lazy" width="600" height="760"></div>
    <div class="bogkort-indhold"><p class="overlinje">Læs videre</p><h3>${beskytHtml(udgivelse.titel)}</h3><p class="bogforfatter">${beskytHtml(udgivelse.forfatter)}</p><span class="tekstlink"><span class="tekstlink-tekst">Se udgivelsen</span><span aria-hidden="true">→</span></span></div>
  </a></article>`;
}

// Samler alle dele og skriver den valgte udgivelse ind på siden.
function visUdgivelse(udgivelse, relateredeUdgivelser) {
  document.title = `${udgivelse.titel} · Kokon`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", udgivelse.kort_beskrivelse);
  forhandlerUrls = [];
  const ekstraIndhold = [
    valgfriTekstsektion("Om forfatteren", udgivelse.forfatter_beskrivelse, udgivelse.forfatter_kilde),
    lavBogfakta(udgivelse),
    valgfriTekstsektion("Om oversætteren", udgivelse.oversaetter_beskrivelse),
    valgfriTekstsektion("Litterær og kulturel kontekst", udgivelse.kontekst),
    lavBilledsektion(udgivelse.detaljebilleder),
    lavAnmeldelser(udgivelse.anmeldelser),
    lavForhandlersektion(udgivelse.eksterne_links),
  ].join("");
  const handling = udgivelse.beskrivelse || "Afventer godkendt bogbeskrivelse.";
  udgivelsesfelt.innerHTML = `
    <section class="sektion">
      <div class="sektion-indhold">
        <a class="tilbage-link" href="/udgivelser.html"><span aria-hidden="true">←</span><span class="tilbage-link-tekst">Tilbage til udgivelser</span></a>
        <article class="detalje-hero">
          <figure class="detalje-forside">
            <img src="${beskytHtml(udgivelse.forside_sti)}" alt="${beskytHtml(udgivelse.forside_alt)}" width="720" height="912">
          </figure>
          <div class="lodret-indhold">
            <p class="overlinje">${beskytHtml(udgivelse.forfatter)}</p>
            <h1>${beskytHtml(udgivelse.titel)}</h1>
            ${udgivelse.oversaetter ? `<p class="detalje-meta">Oversat af ${beskytHtml(udgivelse.oversaetter)}</p>` : ""}
            <div class="detalje-handling broedtekst">
              <h2>Handling</h2>
              ${lavAfsnit(handling)}
            </div>
          </div>
        </article>
      </div>
    </section>
    ${ekstraIndhold ? `<section class="sektion flade-sektion"><div class="sektion-indhold detalje-indhold">${ekstraIndhold}</div></section>` : ""}
    ${relateredeUdgivelser.length ? `<section class="sektion relaterede-boeger" aria-labelledby="related-title"><div class="sektion-indhold"><p class="overlinje">Flere udgivelser</p><h2 id="related-title">Læs videre hos Kokon</h2><div class="bog-gitter">${relateredeUdgivelser.map(lavRelateretBogkort).join("")}</div></div></section>` : ""}`;

  udgivelsesfelt.querySelectorAll("[data-external-index]").forEach((knap) => {
    knap.addEventListener("click", () => aabnExitDialog(Number(knap.dataset.externalIndex), knap));
  });
  startKaruseller();
}

// Viser exit-dialogen, før brugeren forlader Kokons website.
function aabnExitDialog(nummer, knap) {
  const forhandler = forhandlerUrls[nummer];
  if (!forhandler) return;
  let url;

  try {
    url = new URL(forhandler.url);
  } catch {
    return;
  }

  if (!/^https?:$/.test(url.protocol)) return;
  forhandlerDialog.querySelector("[data-continue]").href = url.href;
  forhandlerDialog.querySelector("#exit-description").textContent = `Du er på vej videre til ${forhandler.label}. Siden åbner i en ny fane.`;
  dialogKnap = knap;
  forhandlerDialog.showModal();
}

function lukExitDialog() {
  forhandlerDialog?.close();
  if (dialogKnap?.isConnected) dialogKnap.focus();
}

// Henter den rigtige udgivelse ud fra sidens slug og håndterer fejltilstande.
async function hentValgtUdgivelse() {
  const slug = hentSlug();
  if (!slug) {
    udgivelsesfelt.innerHTML = '<section class="sektion"><div class="sektion-indhold"><p class="statusbesked">Udgivelsen mangler en gyldig adresse.</p></div></section>';
    return;
  }
  try {
    const udgivelser = await hentUdgivelser();
    const udgivelse = udgivelser.find((bog) => bog.slug === slug);
    if (!udgivelse) {
      udgivelsesfelt.innerHTML = '<section class="sektion"><div class="sektion-indhold"><p class="statusbesked">Udgivelsen blev ikke fundet.</p></div></section>';
      return;
    }
    const relateredeUdgivelser = udgivelser.filter((bog) => bog.slug !== slug).slice(0, 3);
    visUdgivelse(udgivelse, relateredeUdgivelser);
  } catch (error) {
    udgivelsesfelt.innerHTML = `<section class="sektion"><div class="sektion-indhold"><p class="statusbesked" role="status">${beskytHtml(error.message)}</p></div></section>`;
  }
}

forhandlerDialog?.querySelector("[data-cancel]")?.addEventListener("click", lukExitDialog);
forhandlerDialog?.querySelector("[data-continue]")?.addEventListener("click", lukExitDialog);
forhandlerDialog?.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  lukExitDialog();
});
if (udgivelsesfelt) hentValgtUdgivelse();
