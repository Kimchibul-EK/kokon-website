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
2. Indsæt projektets offentlige Supabase-værdier:

   ```env
   SUPABASE_URL=https://DIT-PROJEKT.supabase.co
   SUPABASE_PUBLISHABLE_KEY=DIN-PUBLISHABLE-KEY
   ```

3. Generér browserens Supabase-konfiguration:

   ```bash
   npm run build
   ```

4. Start en lokal webserver fra projektets rod. HTML-filerne bør ikke åbnes direkte med `file://`.
5. Åbn den lokale adresse i browseren.

Kontaktadressen står som et almindeligt `mailto:`-link i `kontakt.html`. Filler-adressen skal erstattes med Kokons godkendte mail inden aflevering.

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

## Supabase

Supabase-tabellen `udgivelser` indeholder de fem bøger. Browseren må kun læse data gennem projektets publishable key. Row Level Security tillader offentlig `SELECT`, men afviser `INSERT`, `UPDATE` og `DELETE`.

Databasefilerne findes her:

- `supabase/migrations/202608280001_create_udgivelser.sql`
- `supabase/seed.sql`

Brug aldrig en secret- eller service-role-key i browserkode, GitHub eller Netlify.

## Sider

- Forside: `index.html`
- Udgivelser: `udgivelser.html`
- Udgivelsesdetalje: `udgivelse.html?slug=BOG-SLUG`
- Om Kokon: `om-kokon.html`
- Kontakt: `kontakt.html`
- Presse og materialer: `presse-materialer.html`

## Deployment

Netlify skal køre `npm run build` og publicere projektets rod (`.`). De to offentlige Supabase-værdier tilføjes som miljøvariabler i Netlify.

## Beskyttet demo

Netlify-demoen er beskyttet af Edge Function-filen `netlify/edge-functions/password-protection.js`. Beskyttelsen sker på serveren, før websitefilerne sendes til browseren.

Opret miljøvariablen `SITE_PASSWORD` i Netlify, og giv den scope til **Functions**. Adgangskoden må ikke skrives direkte i kode eller pushes til GitHub. Efter en korrekt kode gemmer browseren en sikker adgangscookie i 24 timer.

Søgemaskiner blokeres med både `robots.txt` og headeren `X-Robots-Tag`. Kommentarerne i `netlify.toml` og `robots.txt` viser, hvad der senere skal fjernes, når websitet skal være offentligt og søgbart.

## Projektdokumentation

Beslutninger, indholdskilder, forbedringslog og QA-evidens vedligeholdes i [Kokon-projektet i Notion](https://app.notion.com/p/3adb53f21201815692c1d098e0188b95). README’en indeholder kun den information, der er nødvendig for at forstå, køre og kontrollere koden.
