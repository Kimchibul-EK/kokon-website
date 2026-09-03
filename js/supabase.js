// Samler forbindelsen til Supabase og henter de udgivelsesdata, som siderne bruger.
// Læser den offentlige URL og publishable key, som build-scriptet har gjort tilgængelige.
function getConfig() {
  const config = window.KOKON_CONFIG ?? {};
  const url = String(config.supabaseUrl ?? "").replace(/\/$/, "");
  const key = String(config.supabasePublishableKey ?? "");
  return url && key ? { url, key } : null;
}

// Kalder Supabase REST API og returnerer alle udgivelser i datoorden.
export async function selectPublications() {
  const config = getConfig();
  if (!config) {
    throw new Error("Supabase mangler konfiguration. Prøv igen senere.");
  }

  const params = new URLSearchParams({
    select: "id,slug,titel,forfatter,forfatter_beskrivelse,forfatter_kilde,oversaetter,oversaetter_beskrivelse,kort_beskrivelse,beskrivelse,kontekst,format_og_materialer,isbn,sidetal,format_bind,sprog,dansk_udgivelsesaar,originaludgivelsesaar,originaltitel,forside_sti,forside_alt,detaljebilleder,anmeldelser,udgivelsesdato,status,fremhaevet,eksterne_links",
    order: "udgivelsesdato.desc",
  });
  let response;
  try {
    response = await fetch(`${config.url}/rest/v1/udgivelser?${params}`, {
      headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, Accept: "application/json" },
    });
  } catch {
    throw new Error("Udgivelserne kunne ikke hentes. Prøv igen senere.");
  }
  if (!response.ok) throw new Error(`Udgivelserne kunne ikke hentes (fejl ${response.status}).`);
  return response.json();
}
