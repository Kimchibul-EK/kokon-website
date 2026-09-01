# Kokon website

Et mobile-first website for Forlaget Kokon, udviklet som eksamensprojekt på multimediedesigneruddannelsen.

Sitet præsenterer forlaget og dets japanske udgivelser, før brugeren sendes videre til en ekstern forhandler. Løsningen er bygget med semantisk HTML, CSS og almindelig JavaScript. Kun indholdstypen `Udgivelse` hentes dynamisk fra Supabase.

## Teknologier

- HTML
- CSS
- JavaScript
- Supabase
- Netlify

## Kør projektet lokalt

1. Kopiér `.env.example`, og kald kopien `.env`.
2. Indsæt projektets offentlige Supabase-værdier, som du har fået tilsendt af Kim.

   ```env
   SUPABASE_URL=https://(...).supabase.co
   SUPABASE_PUBLISHABLE_KEY=(...)
   ```

3. Generér browserens Supabase-konfiguration:

   ```bash
   npm run build
   ```

4. Start en lokal webserver fra projektets rod. HTML-filerne bør ikke åbnes direkte med `file://`.
5. Åbn den lokale adresse i browseren.

Kontaktadressen står som et almindeligt `mailto:`-link i `kontakt.html`. Adressen skal erstattes når Kokon får en mailadresse. 

## Projektkontrol

Kør kontrollen før et commit eller deployment:

```bash
npm run check
```

Kontrollen gennemgår blandt andet nødvendige filer, lokale links, billedstier, Supabase-felter og JavaScript-syntaks.

## Mappestruktur

```text
assets/images/       Lokale WebP- og SVG-billeder
css/                 Layout og visuel styling
js/                  Navigation, tema, karussel og Supabase-data
scripts/             Build- og kontrolscripts
supabase/            Databaseskema, read-only RLS og seed-data
*.html               Sitets statiske sider og fælles bogskabelon
```

## Sider

- Forside: `index.html`
- Udgivelser: `udgivelser.html`
- Udgivelsesdetalje: `udgivelse.html?slug=BOG-SLUG`
- Om Kokon: `om-kokon.html`
- Kontakt: `kontakt.html`
- Presse og materialer: `presse-materialer.html`

## Deployment

Netlify skal køre `npm run build` og publicere projektets rod (`.`). De to offentlige Supabase-værdier tilføjes som miljøvariabler i Netlify.
