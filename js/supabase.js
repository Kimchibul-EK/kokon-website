// Samler forbindelsen til Supabase og henter de udgivelsesdata, som siderne bruger.
// Læser den offentlige URL og publishable key, som build-scriptet har gjort tilgængelige.
function hentKonfiguration() {
  const konfiguration = window.KOKON_CONFIG ?? {};
  const url = String(konfiguration.supabaseUrl ?? "").replace(/\/$/, "");
  const noegle = String(konfiguration.supabasePublishableKey ?? "");
  return url && noegle ? { url, noegle } : null;
}

// Kalder Supabase REST API og returnerer alle udgivelser i datoorden.
export async function hentUdgivelser() {
  const konfiguration = hentKonfiguration();
  if (!konfiguration) {
    throw new Error("Supabase mangler konfiguration. Prøv igen senere.");
  }

  const forespoergsel = new URLSearchParams({
    select: "id,slug,titel,forfatter,forfatter_beskrivelse,forfatter_kilde,oversaetter,oversaetter_beskrivelse,kort_beskrivelse,beskrivelse,kontekst,format_og_materialer,isbn,sidetal,format_bind,sprog,dansk_udgivelsesaar,originaludgivelsesaar,originaltitel,forside_sti,forside_alt,detaljebilleder,anmeldelser,udgivelsesdato,status,fremhaevet,eksterne_links",
    order: "udgivelsesdato.desc",
  });
  let svar;
  try {
    svar = await fetch(`${konfiguration.url}/rest/v1/udgivelser?${forespoergsel}`, {
      headers: {
        apikey: konfiguration.noegle,
        Authorization: `Bearer ${konfiguration.noegle}`,
        Accept: "application/json",
      },
    });
  } catch {
    throw new Error("Udgivelserne kunne ikke hentes. Prøv igen senere.");
  }
  if (!svar.ok) throw new Error(`Udgivelserne kunne ikke hentes (fejl ${svar.status}).`);
  return svar.json();
}
