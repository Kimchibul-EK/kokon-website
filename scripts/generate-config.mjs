// Læser de lokale miljøværdier og genererer browserens offentlige Supabase-konfiguration.
import { readFile, writeFile } from "node:fs/promises";

// Læser .env lokalt og kopierer værdierne til denne Node-proces.
async function loadLocalEnv() {
  let source;
  try {
    source = await readFile(new URL("../.env", import.meta.url), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const name = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

await loadLocalEnv();

const url = process.env.SUPABASE_URL ?? "";
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";

// Afviser hemmelige Supabase-nøgler, fordi config.js bliver sendt til browseren.
if (/sb_secret_|service[_-]?role/i.test(publishableKey)) {
  throw new Error("SUPABASE_PUBLISHABLE_KEY must not contain a secret or service-role key.");
}

// Skriver kun den offentlige Supabase-konfiguration til den genererede browserfil.
const config = `// Indeholder den offentlige Supabase-konfiguration, som genereres under build.\nwindow.KOKON_CONFIG = ${JSON.stringify({
  supabaseUrl: url,
  supabasePublishableKey: publishableKey,
})};\n`;

await writeFile(new URL("../js/config.js", import.meta.url), config);
console.log(
  url && publishableKey
    ? "Generated Supabase browser configuration."
    : "Generated browser configuration without Supabase; publication requests will show an error.",
);
