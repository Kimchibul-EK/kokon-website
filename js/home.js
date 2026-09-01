// Henter og viser den fremhævede udgivelse på forsiden.
import { selectPublications } from "./supabase.js";

const container = document.querySelector("[data-featured-publication]");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

async function loadFeatured() {
  try {
    const publications = await selectPublications();
    const publication = publications.find((item) => item.fremhaevet) ?? publications[0];
    if (!publication) {
      container.innerHTML = '<p class="statusbesked">Der er endnu ingen fremhævet udgivelse.</p>';
      return;
    }
    container.innerHTML = `
      <div class="fremhaevet-layout">
        <div class="fremhaevet-billede">
          <img src="${escapeHtml(publication.forside_sti)}" alt="${escapeHtml(publication.forside_alt)}" width="600" height="760" loading="lazy">
        </div>
        <div class="lodret-indhold">
          <p class="overlinje">Fremhævet udgivelse</p>
          <h2 id="featured-title">${escapeHtml(publication.titel)}</h2>
          <p class="bogforfatter">${escapeHtml(publication.forfatter)}</p>
          <p class="indledning">${escapeHtml(publication.kort_beskrivelse)}</p>
          <a class="knap" href="/udgivelse.html?slug=${encodeURIComponent(publication.slug)}">Læs om udgivelsen</a>
        </div>
      </div>`;
  } catch (error) {
    container.innerHTML = `<p class="statusbesked" role="status">${escapeHtml(error.message)}</p>`;
  }
}

if (container) loadFeatured();
