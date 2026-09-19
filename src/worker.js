/* ============================================================
   ROMERO JOYERÍA — WORKER
   ------------------------------------------------------------
   Sirve el sitio (archivos estáticos) y, además, atiende las
   rutas /api/* que usa el panel de administración para publicar
   cambios.

   El panel nunca ve ni guarda un token de GitHub: quien publica
   es este Worker, con el token que vive acá como secreto
   (GITHUB_TOKEN, configurado en Cloudflare). Del lado del panel
   sólo se manda la contraseña del panel (ADMIN_KEY) para probar
   que quien pide el cambio ya inició sesión ahí.
   ============================================================ */

const OWNER = "brandonnnx3-create";
const REPO = "JL-Joyeria";
const BRANCH = "claude/serene-bohr-xumxlb";
const GITHUB_API = "https://api.github.com";

function json(datos, estado) {
  return new Response(JSON.stringify(datos), {
    status: estado || 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function autorizado(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  return !!env.ADMIN_KEY && !!token && token === env.ADMIN_KEY;
}

/* ---------- GitHub ---------- */

async function ghFetch(env, ruta, opciones) {
  const o = opciones || {};
  const r = await fetch(GITHUB_API + ruta, {
    method: o.method || "GET",
    headers: Object.assign(
      {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Authorization": "Bearer " + env.GITHUB_TOKEN,
        "User-Agent": "romero-joyeria-worker",
      },
      o.body ? { "Content-Type": "application/json" } : {}
    ),
    body: o.body ? JSON.stringify(o.body) : undefined,
  });

  if (!r.ok) {
    let detalle = "";
    try { detalle = (await r.json()).message || ""; } catch (e) {}
    throw new Error("GitHub respondió " + r.status + (detalle ? ": " + detalle : ""));
  }
  return r.status === 204 ? null : r.json();
}

async function shaDe(env, ruta) {
  try {
    const r = await ghFetch(
      env,
      "/repos/" + OWNER + "/" + REPO + "/contents/" + encodeURI(ruta) + "?ref=" + encodeURIComponent(BRANCH)
    );
    return r && r.sha ? r.sha : null;
  } catch (e) {
    return null; /* no existe todavía: se crea */
  }
}

async function escribirArchivo(env, ruta, contenidoB64, mensaje) {
  const sha = await shaDe(env, ruta);
  const cuerpo = { message: mensaje, content: contenidoB64, branch: BRANCH };
  if (sha) cuerpo.sha = sha;
  return ghFetch(env, "/repos/" + OWNER + "/" + REPO + "/contents/" + encodeURI(ruta), {
    method: "PUT",
    body: cuerpo,
  });
}

function textoABase64(txt) {
  const bytes = new TextEncoder().encode(txt);
  let bin = "";
  const paso = 0x8000;
  for (let i = 0; i < bytes.length; i += paso) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + paso));
  }
  return btoa(bin);
}

function bufferABase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const paso = 0x8000;
  for (let i = 0; i < bytes.length; i += paso) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + paso));
  }
  return btoa(bin);
}

/* ---------- Rutas ---------- */

async function manejarApi(request, env, url) {
  if (!env.GITHUB_TOKEN || !env.ADMIN_KEY) {
    return json({ error: "El panel todavía no está configurado del lado del servidor." }, 500);
  }

  if (url.pathname === "/api/publicar" && request.method === "POST") {
    if (!autorizado(request, env)) return json({ error: "No autorizado." }, 401);

    let datos;
    try { datos = await request.json(); } catch (e) { return json({ error: "JSON inválido." }, 400); }
    if (typeof datos.productos !== "string" || typeof datos.config !== "string") {
      return json({ error: "Faltan 'productos' o 'config'." }, 400);
    }

    const sello = new Date().toISOString();
    try {
      await escribirArchivo(env, "js/products.js", textoABase64(datos.productos),
        "Actualizar el catálogo desde el panel (" + sello + ")");
      await escribirArchivo(env, "js/config.js", textoABase64(datos.config),
        "Actualizar la configuración desde el panel (" + sello + ")");
    } catch (e) {
      return json({ error: e.message }, 502);
    }
    return json({ ok: true });
  }

  if (url.pathname === "/api/foto" && request.method === "POST") {
    if (!autorizado(request, env)) return json({ error: "No autorizado." }, 401);

    const nombre = request.headers.get("X-Nombre") || "";
    if (!/^[a-z0-9-]+\.jpg$/i.test(nombre)) {
      return json({ error: "Nombre de archivo inválido." }, 400);
    }
    const buf = await request.arrayBuffer();
    if (!buf.byteLength) return json({ error: "El archivo llegó vacío." }, 400);

    try {
      await escribirArchivo(env, "img/productos/" + nombre, bufferABase64(buf),
        "Subir foto desde el panel: " + nombre);
    } catch (e) {
      return json({ error: e.message }, 502);
    }
    return json({ ok: true, ruta: "img/productos/" + nombre });
  }

  if (url.pathname === "/api/fotos" && request.method === "GET") {
    if (!autorizado(request, env)) return json({ error: "No autorizado." }, 401);

    try {
      const r = await ghFetch(env, "/repos/" + OWNER + "/" + REPO + "/contents/img/productos?ref=" + encodeURIComponent(BRANCH));
      const fotos = (Array.isArray(r) ? r : [])
        .filter((f) => f.type === "file" && /\.(jpe?g|png|webp)$/i.test(f.name))
        .map((f) => "img/productos/" + f.name)
        .sort();
      return json({ fotos: fotos });
    } catch (e) {
      return json({ error: e.message }, 502);
    }
  }

  return json({ error: "No encontrado." }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return manejarApi(request, env, url);
    }
    return env.ASSETS.fetch(request);
  },
};
