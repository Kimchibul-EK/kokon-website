// Henter udgivelser fra Supabase og bygger bogkortene på udgivelsesoversigten.
import { selectPublications } from "./supabase.js";

const container = document.querySelector("[data-publications]");

// Gør tekst fra databasen sikker at sætte ind i HTML.
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function publicationUrl(slug) {
  return `/udgivelse.html?slug=${encodeURIComponent(slug)}`;
}

// Forkorter den fulde bogbeskrivelse til en kort tekst på oversigtskortet.
function previewText(description, maxWords = 22) {
  const words = String(description ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")} (...)`;
}

// Bygger HTML til ét bogkort.
function card(publication) {
  return `<article class="bogkort">
    <a href="${publicationUrl(publication.slug)}" aria-label="Læs om ${escapeHtml(publication.titel)}">
      <div class="bogforside-ramme">
        <img src="${escapeHtml(publication.forside_sti)}" alt="${escapeHtml(publication.forside_alt)}" loading="lazy" width="600" height="760">
      </div>
      <div class="bogkort-indhold">
        <p class="overlinje">Udgivelse</p>
        <h2>${escapeHtml(publication.titel)}</h2>
        <p class="bogforfatter">${escapeHtml(publication.forfatter)}</p>
        <p class="bogbeskrivelse">${escapeHtml(previewText(publication.beskrivelse || publication.kort_beskrivelse))}</p>
        <span class="tekstlink">Læs om udgivelsen <span aria-hidden="true">→</span></span>
      </div>
    </a>
  </article>`;
}

// Henter alle bøger og viser enten kortene eller en statusbesked.
async function load() {
  try {
    const publications = await selectPublications();
    container.innerHTML = publications.length
      ? publications.map(card).join("")
      : '<p class="statusbesked indlaesningsfelt">Der er endnu ingen udgivelser i kataloget.</p>';
  } catch (error) {
    container.innerHTML = `<p class="statusbesked indlaesningsfelt" role="status">${escapeHtml(error.message)}</p>`;
  }
}

if (container) load();
