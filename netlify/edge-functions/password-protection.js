// Beskytter hele Netlify-demoen med en serverstyret adgangskode og en sikker cookie.

const COOKIE_NAME = "kokon_demo_access";
const COOKIE_LIFETIME_SECONDS = 60 * 60 * 24;
const encoder = new TextEncoder();

function htmlPage(message = "") {
  const errorMessage = message
    ? `<p class="fejl" role="alert">${message}</p>`
    : "";

  return `<!doctype html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>Beskyttet demo · Kokon</title>
  <style>
    :root { color-scheme: light dark; font-family: Arial, sans-serif; }
    * { box-sizing: border-box; }
    body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 1.5rem; background: #f4efe5; color: #20241f; }
    main { width: min(100%, 28rem); padding: clamp(1.5rem, 5vw, 2.5rem); border: 1px solid #a8a398; border-radius: .25rem; background: #fffaf0; box-shadow: 0 .5rem 2rem rgb(32 36 31 / .1); }
    .overlinje { margin: 0 0 .75rem; color: #3f5c4b; font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
    h1 { margin: 0 0 1rem; font-family: Georgia, serif; font-size: clamp(2rem, 8vw, 3rem); line-height: 1; }
    p { line-height: 1.6; }
    label { display: block; margin: 1.5rem 0 .5rem; font-weight: 700; }
    input, button { width: 100%; min-height: 3rem; border-radius: .2rem; font: inherit; }
    input { border: 1px solid #79766f; padding: .75rem; background: #fff; color: #20241f; }
    button { margin-top: .75rem; border: 1px solid #283e32; padding: .75rem 1rem; background: #283e32; color: #fff; cursor: pointer; font-weight: 700; }
    button:hover { background: #3f5c4b; }
    :focus-visible { outline: .2rem solid #a5402c; outline-offset: .2rem; }
    .fejl { color: #8d2f20; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <p class="overlinje">Forlaget Kokon</p>
    <h1>Beskyttet demo</h1>
    <p>Indtast adgangskoden for at se websitet.</p>
    ${errorMessage}
    <form method="post">
      <label for="password">Adgangskode</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
      <button type="submit">Se demoen</button>
    </form>
  </main>
</body>
</html>`;
}

function htmlResponse(message = "", status = 401) {
  return new Response(htmlPage(message), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

function toBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

function readCookie(request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return cookie?.slice(COOKIE_NAME.length + 1) ?? "";
}

async function hasValidCookie(request, secret) {
  const [expires, signature] = readCookie(request).split(".");
  if (!expires || !signature || Number(expires) <= Date.now()) return false;
  return signature === await sign(expires, secret);
}

function protectedResponse(response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default async function passwordProtection(request, context) {
  const password = Netlify.env.get("SITE_PASSWORD");

  if (!password) {
    return htmlResponse("Demoens adgangskode mangler i Netlify-konfigurationen.", 503);
  }

  if (await hasValidCookie(request, password)) {
    return protectedResponse(await context.next());
  }

  if (request.method === "POST") {
    const formData = await request.formData();
    if (formData.get("password") === password) {
      const expires = String(Date.now() + COOKIE_LIFETIME_SECONDS * 1000);
      const signature = await sign(expires, password);
      return new Response(null, {
        status: 303,
        headers: {
          "Cache-Control": "no-store",
          "Location": request.url,
          "Set-Cookie": `${COOKIE_NAME}=${expires}.${signature}; Path=/; Max-Age=${COOKIE_LIFETIME_SECONDS}; HttpOnly; Secure; SameSite=Strict`,
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      });
    }
    return htmlResponse("Adgangskoden er ikke korrekt.");
  }

  return htmlResponse();
}
