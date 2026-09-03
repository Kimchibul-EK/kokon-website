// Henter og viser én udgivelse med bogfakta, billedkarussel og dialog til eksterne links.
import { selectPublications } from "./supabase.js";

const container = document.querySelector("[data-publication-detail]");
const exitDialog = document.querySelector("#exit-dialog");
let externalUrls = [];
let exitDialogTrigger = null;

// Hjælpefunktioner til sikker tekst, URL-parameter og tekstafsnit.
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function getSlug() {
  return new URLSearchParams(location.search).get("slug") ?? "";
}

function renderParagraphs(content) {
  return String(content ?? "")
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function optionalTextSection(title, content, source = "") {
  if (!content || !String(content).trim()) return "";
  return `<section class="indholdssektion broedtekst"><h2>${escapeHtml(title)}</h2>${renderParagraphs(content)}${source ? `<p class="kildeangivelse">Kilde: ${escapeHtml(source)}</p>` : ""}</section>`;
}

function factValue(value) {
  return value === null || value === undefined || String(value).trim() === ""
    ? "Afventer oplysninger"
    : String(value);
}

// Formaterer bogens danske udgivelsesdato, når en gyldig dato findes.
function danishPublication(publication) {
  if (publication.udgivelsesdato) {
    const date = new Date(`${publication.udgivelsesdato}T12:00:00`);
    if (!Number.isNaN(date.valueOf())) {
      return new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "long", year: "numeric" }).format(date);
    }
  }
  return publication.dansk_udgivelsesaar ?? null;
}

// Bygger de forskellige indholdssektioner på bogens detaljeside.
function bookFactsSection(publication) {
  const facts = [
    ["ISBN", publication.isbn],
    ["Sidetal", publication.sidetal],
    ["Format / bind", publication.format_bind],
    ["Sprog", publication.sprog],
    ["Dansk udgivelse", danishPublication(publication)],
    ["Originaludgivelse", publication.originaludgivelsesaar],
    ["Originaltitel", publication.originaltitel],
    ["Oversætter", publication.oversaetter],
    ["Omslag og materialer", publication.format_og_materialer],
  ];
  return `<section class="indholdssektion" aria-labelledby="book-facts-title">
    <h2 id="book-facts-title">Mere om bogen</h2>
    <dl class="bogfakta">${facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(factValue(value))}</dd></div>`).join("")}</dl>
  </section>`;
}

function reviewSection(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) return "";
  const valid = reviews.filter((review) => review && review.citat);
  if (!valid.length) return "";
  return `<section class="indholdssektion"><h2>Anmeldelser</h2><div class="anmeldelsesliste">${valid.map((review) => `
    <figure class="anmeldelse">
      <blockquote>“${escapeHtml(review.citat)}”</blockquote>
      <figcaption><cite>${escapeHtml(review.kilde ?? review.afsender ?? "")}</cite></figcaption>
    </figure>`).join("")}</div></section>`;
}

function detailImageSection(images) {
  if (!Array.isArray(images) || images.length === 0) return "";
  const valid = images.filter((image) => image?.src?.startsWith("/assets/images/") && image?.alt);
  if (!valid.length) return "";
  const hasMultipleImages = valid.length > 1;
  const slides = valid.map((image) => `
    <figure class="karusel-slide"><img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy"></figure>`).join("");
  if (!hasMultipleImages) {
    return `<div class="indholdssektion detaljebilleder" role="region" aria-label="Billede fra udgivelsen">
      <div class="detalje-galleri">${slides}</div>
    </div>`;
  }
  const dots = valid.map((_, index) => `
    <button class="karusel-prik" type="button" data-carousel-dot="${index}" aria-label="Vis billede ${index + 1} af ${valid.length}"${index === 0 ? ' aria-current="true"' : ""}></button>`).join("");
  return `<div class="indholdssektion detaljebilleder" role="region" aria-labelledby="flere-billeder-title" data-carousel>
    <h2 class="karusel-titel" id="flere-billeder-title">Flere billeder af bogen</h2>
    <div class="karusel-visning">
      <div class="detalje-galleri er-karusel" tabindex="0" aria-label="Billeder">${slides}</div>
      <button class="karusel-pil forrige" type="button" data-carousel-prev aria-label="Vis forrige billede"><span aria-hidden="true">‹</span></button>
      <button class="karusel-pil naeste" type="button" data-carousel-next aria-label="Vis næste billede"><span aria-hidden="true">›</span></button>
    </div>
    <div class="karusel-prikker" role="group" aria-label="Vælg billede">${dots}</div>
  </div>`;
}

// Gør pile, prikker, scrolling og tastaturstyring aktive i hver karussel.
function initializeCarousels() {
  container.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector(".er-karusel");
    const slides = [...carousel.querySelectorAll(".karusel-slide")];
    const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
    const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let activeIndex = 0;
    let scrollTimer = 0;

    function updateDots(index) {
      activeIndex = (index + slides.length) % slides.length;
      dots.forEach((dot, dotIndex) => {
        if (dotIndex === activeIndex) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function showSlide(index, animate = true) {
      updateDots(index);
      track.scrollTo({
        left: track.clientWidth * activeIndex,
        behavior: animate && !prefersReducedMotion.matches ? "smooth" : "auto",
      });
    }

    carousel.querySelector("[data-carousel-prev]")?.addEventListener("click", () => showSlide(activeIndex - 1));
    carousel.querySelector("[data-carousel-next]")?.addEventListener("click", () => showSlide(activeIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));

    track.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      showSlide(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
    });

    track.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        if (!track.clientWidth) return;
        updateDots(Math.round(track.scrollLeft / track.clientWidth));
      }, 100);
    }, { passive: true });

    window.addEventListener("resize", () => showSlide(activeIndex, false));
  });
}

// Gemmer kun gyldige eksterne links og bygger knapperne til dem.
function externalLinkSection(links) {
  if (!Array.isArray(links) || links.length === 0) return "";
  externalUrls = links.filter((link) => {
    if (!link?.url || !link?.label) return false;
    try { return /^https?:$/.test(new URL(link.url).protocol); }
    catch { return false; }
  });
  if (!externalUrls.length) return "";
  return `<section class="indholdssektion"><p class="overlinje">Anskaffelse</p><h2>Find bogen</h2><p>Forhandlerlinket fører væk fra Kokons website. Du får altid besked, før det åbnes.</p><div class="linkliste">${externalUrls.map((link, index) =>
    `<button class="knap" type="button" data-external-index="${index}">Gå til ${escapeHtml(link.label)}</button>`,
  ).join("")}</div></section>`;
}

// Bygger et bogkort til sektionen med relaterede udgivelser.
function relatedCard(publication) {
  return `<article class="bogkort"><a href="/udgivelse.html?slug=${encodeURIComponent(publication.slug)}">
    <div class="bogforside-ramme"><img src="${escapeHtml(publication.forside_sti)}" alt="${escapeHtml(publication.forside_alt)}" loading="lazy" width="600" height="760"></div>
    <div class="bogkort-indhold"><p class="overlinje">Læs videre</p><h3>${escapeHtml(publication.titel)}</h3><p class="bogforfatter">${escapeHtml(publication.forfatter)}</p><span class="tekstlink">Se udgivelsen <span aria-hidden="true">→</span></span></div>
  </a></article>`;
}

// Samler alle dele og skriver den valgte udgivelse ind på siden.
function render(publication, related) {
  document.title = `${publication.titel} · Kokon`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", publication.kort_beskrivelse);
  externalUrls = [];
  const supplementalContent = [
    optionalTextSection("Om forfatteren", publication.forfatter_beskrivelse, publication.forfatter_kilde),
    bookFactsSection(publication),
    optionalTextSection("Om oversætteren", publication.oversaetter_beskrivelse),
    optionalTextSection("Litterær og kulturel kontekst", publication.kontekst),
    detailImageSection(publication.detaljebilleder),
    reviewSection(publication.anmeldelser),
    externalLinkSection(publication.eksterne_links),
  ].join("");
  const synopsis = publication.beskrivelse || "Afventer godkendt bogbeskrivelse.";
  container.innerHTML = `
    <section class="sektion">
      <div class="sektion-indhold">
        <a class="tilbage-link" href="/udgivelser.html"><span aria-hidden="true">←</span><span class="tilbage-link-tekst">Tilbage til udgivelser</span></a>
        <article class="detalje-hero">
          <figure class="detalje-forside">
            <img src="${escapeHtml(publication.forside_sti)}" alt="${escapeHtml(publication.forside_alt)}" width="720" height="912">
          </figure>
          <div class="lodret-indhold">
            <p class="overlinje">${escapeHtml(publication.forfatter)}</p>
            <h1>${escapeHtml(publication.titel)}</h1>
            ${publication.oversaetter ? `<p class="detalje-meta">Oversat af ${escapeHtml(publication.oversaetter)}</p>` : ""}
            <div class="detalje-handling broedtekst">
              <h2>Handling</h2>
              ${renderParagraphs(synopsis)}
            </div>
          </div>
        </article>
      </div>
    </section>
    ${supplementalContent ? `<section class="sektion flade-sektion"><div class="sektion-indhold detalje-indhold">${supplementalContent}</div></section>` : ""}
    ${related.length ? `<section class="sektion relaterede-boeger" aria-labelledby="related-title"><div class="sektion-indhold"><p class="overlinje">Flere udgivelser</p><h2 id="related-title">Læs videre hos Kokon</h2><div class="bog-gitter">${related.map(relatedCard).join("")}</div></div></section>` : ""}`;

  container.querySelectorAll("[data-external-index]").forEach((button) => {
    button.addEventListener("click", () => openExitDialog(Number(button.dataset.externalIndex), button));
  });
  initializeCarousels();
}

// Viser exit-dialogen, før brugeren forlader Kokons website.
function openExitDialog(index, trigger) {
  const external = externalUrls[index];
  if (!external) return;
  let url;
  try { url = new URL(external.url); } catch { return; }
  if (!/^https?:$/.test(url.protocol)) return;
  exitDialog.querySelector("[data-continue]").href = url.href;
  exitDialog.querySelector("#exit-description").textContent = `Du er på vej videre til ${external.label}. Siden åbner i en ny fane.`;
  exitDialogTrigger = trigger;
  exitDialog.showModal();
}

function closeExitDialog() {
  exitDialog?.close();
  if (exitDialogTrigger?.isConnected) exitDialogTrigger.focus();
}

// Henter den rigtige udgivelse ud fra sidens slug og håndterer fejltilstande.
async function load() {
  const slug = getSlug();
  if (!slug) {
    container.innerHTML = '<section class="sektion"><div class="sektion-indhold"><p class="statusbesked">Udgivelsen mangler en gyldig adresse.</p></div></section>';
    return;
  }
  try {
    const publications = await selectPublications();
    const publication = publications.find((item) => item.slug === slug);
    if (!publication) {
      container.innerHTML = '<section class="sektion"><div class="sektion-indhold"><p class="statusbesked">Udgivelsen blev ikke fundet.</p></div></section>';
      return;
    }
    render(publication, publications.filter((item) => item.slug !== slug).slice(0, 3));
  } catch (error) {
    container.innerHTML = `<section class="sektion"><div class="sektion-indhold"><p class="statusbesked" role="status">${escapeHtml(error.message)}</p></div></section>`;
  }
}

exitDialog?.querySelector("[data-cancel]")?.addEventListener("click", closeExitDialog);
exitDialog?.querySelector("[data-continue]")?.addEventListener("click", closeExitDialog);
exitDialog?.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  closeExitDialog();
});
if (container) load();
