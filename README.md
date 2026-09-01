# Kokon website

Mobile-first website for Forlaget Kokon, built with semantic HTML, CSS and JavaScript. Only `Udgivelse` is dynamic Supabase content.

## Run locally

1. Copy `.env.example` to `.env`.
2. Add the available public environment values.
3. Generate the browser configuration:

   ```sh
   npm run build
   ```

4. Serve the project root through a local web server. Do not open the pages with `file://`.
5. Validate the project before a checkpoint:

   ```sh
   npm run check
   ```

Publication pages require valid Supabase settings. If the configuration is missing or the request fails, the website shows a clear error instead of silently displaying a second local copy of the catalogue.

## Public environment values

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
Never use a secret or service-role key in browser code or GitHub.

## Structure

```text
assets/images/        Local WebP and SVG assets
css/                  Layout and visual styling
js/                   Necessary behaviour and Supabase data access
*.html                Static pages and shared detail template
supabase/              Database schema, read-only RLS and repeatable seed data
scripts/              Config generation and project validation
```

Publication details use `/udgivelse.html?slug=BOOK-SLUG`. Netlify runs `npm run build` and publishes the project root (`.`).

## Project documentation

Decisions, content guidance, sources, QA evidence, improvements and manual GitHub/Supabase/Netlify setup are maintained in the [Kokon Notion project](https://app.notion.com/p/3adb53f21201815692c1d098e0188b95). The repository README is intentionally limited to the information needed to run and validate the code.
