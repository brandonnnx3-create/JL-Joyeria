/* ============================================================
   CONEXIÓN CON GITHUB
   ------------------------------------------------------------
   Permite que el panel suba fotos y publique los cambios sin que
   nadie tenga que entrar a GitHub a mover archivos.

   El token se guarda en el navegador de quien administra. Nunca
   se manda a ningún lado que no sea api.github.com, no aparece
   en la URL y no se escribe en la consola.
   ============================================================ */

const GIT = (function () {
  "use strict";

  const API = "https://api.github.com";
  const CLAVE = "rj_admin_git_v1";

  let cfg = null;   /* { token, owner, repo, rama } */

  /* ---------- Guardado ---------- */

  function cargar() {
    try {
      const raw = localStorage.getItem(CLAVE);
      cfg = raw ? JSON.parse(raw) : null;
    } catch (e) { cfg = null; }
    return cfg;
  }

  function guardar(nuevo) {
    cfg = nuevo;
    try { localStorage.setItem(CLAVE, JSON.stringify(cfg)); } catch (e) {}
  }

  function olvidar() {
    cfg = null;
    try { localStorage.removeItem(CLAVE); } catch (e) {}
  }

  const conectado = () => !!(cfg && cfg.token && cfg.owner && cfg.repo);
  const datos = () => (cfg ? { owner: cfg.owner, repo: cfg.repo, rama: cfg.rama } : null);

  /* ---------- Adivinar el repositorio desde la dirección ----------
     En usuario.github.io/repositorio/admin.html los dos datos están
     en la propia URL, así que el formulario viene completo. */

  function adivinar() {
    const h = location.hostname || "";
    const partes = (location.pathname || "").split("/").filter(Boolean);
    if (h.endsWith(".github.io")) {
      return { owner: h.replace(".github.io", ""), repo: partes.length > 1 ? partes[0] : "" };
    }
    return { owner: "", repo: "" };
  }

  /* ---------- Llamadas ---------- */

  async function pedir(ruta, opciones) {
    const o = opciones || {};
    const r = await fetch(API + ruta, {
      method: o.method || "GET",
      headers: Object.assign({
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Authorization": "Bearer " + (o.token || (cfg && cfg.token)),
      }, o.body ? { "Content-Type": "application/json" } : {}),
      body: o.body ? JSON.stringify(o.body) : undefined,
    });

    if (!r.ok) {
      let detalle = "";
      try { detalle = (await r.json()).message || ""; } catch (e) {}
      throw new Error(explicar(r.status, detalle));
    }
    return r.status === 204 ? null : r.json();
  }

  /* Mensajes en castellano y accionables, no el error crudo de la API. */
  function explicar(estado, detalle) {
    if (estado === 401) return "El token no es válido o venció. Generá uno nuevo.";
    if (estado === 403) {
      return /rate limit/i.test(detalle)
        ? "GitHub está limitando las llamadas. Esperá un minuto y probá de nuevo."
        : "El token no tiene permiso de escritura sobre el repositorio. Revisá que tenga Contents: Read and write.";
    }
    if (estado === 404) return "No se encontró el repositorio, o el token no tiene acceso a él.";
    if (estado === 409) return "El archivo cambió en GitHub mientras editabas. Recargá el panel y volvé a publicar.";
    if (estado === 422) return "GitHub rechazó el cambio: " + (detalle || "datos inválidos") + ".";
    return "GitHub respondió " + estado + (detalle ? ": " + detalle : "") + ".";
  }

  /* ---------- Probar una conexión antes de guardarla ---------- */

  async function probar(token, owner, repo) {
    const info = await pedir("/repos/" + owner + "/" + repo, { token: token });

    if (!info.permissions || !info.permissions.push) {
      throw new Error("El token llega al repositorio pero no puede escribir en él. " +
                      "Revisá que tenga el permiso Contents: Read and write.");
    }
    return { rama: info.default_branch, nombre: info.full_name, privado: info.private };
  }

  /* ---------- Texto a base64, con acentos ----------
     btoa solo entiende bytes, así que el texto se codifica en UTF-8
     antes. Sin esto, cualquier tilde rompe el archivo subido. */

  function textoABase64(txt) {
    const bytes = new TextEncoder().encode(txt);
    let bin = "";
    const paso = 0x8000;
    for (let i = 0; i < bytes.length; i += paso) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + paso));
    }
    return btoa(bin);
  }

  function blobABase64(blob) {
    return new Promise((ok, mal) => {
      const fr = new FileReader();
      fr.onload = () => ok(String(fr.result).split(",")[1]);
      fr.onerror = () => mal(new Error("No se pudo leer el archivo."));
      fr.readAsDataURL(blob);
    });
  }

  /* ---------- Leer y escribir archivos ---------- */

  /* El sha del archivo actual: GitHub lo exige para reemplazarlo. */
  async function shaDe(ruta) {
    try {
      const r = await pedir("/repos/" + cfg.owner + "/" + cfg.repo +
        "/contents/" + encodeURI(ruta) + "?ref=" + encodeURIComponent(cfg.rama));
      return r && r.sha ? r.sha : null;
    } catch (e) {
      return null;   /* no existe todavía: se crea */
    }
  }

  async function escribir(ruta, contenidoB64, mensaje) {
    const sha = await shaDe(ruta);
    const cuerpo = {
      message: mensaje,
      content: contenidoB64,
      branch: cfg.rama,
    };
    if (sha) cuerpo.sha = sha;

    return pedir("/repos/" + cfg.owner + "/" + cfg.repo + "/contents/" + encodeURI(ruta), {
      method: "PUT",
      body: cuerpo,
    });
  }

  const escribirTexto = (ruta, txt, mensaje) => escribir(ruta, textoABase64(txt), mensaje);

  async function escribirBlob(ruta, blob, mensaje) {
    return escribir(ruta, await blobABase64(blob), mensaje);
  }

  async function borrar(ruta, mensaje) {
    const sha = await shaDe(ruta);
    if (!sha) return null;
    return pedir("/repos/" + cfg.owner + "/" + cfg.repo + "/contents/" + encodeURI(ruta), {
      method: "DELETE",
      body: { message: mensaje, sha: sha, branch: cfg.rama },
    });
  }

  /* ---------- Listar las fotos del repositorio ---------- */

  async function listarFotos() {
    try {
      const r = await pedir("/repos/" + cfg.owner + "/" + cfg.repo +
        "/contents/img/productos?ref=" + encodeURIComponent(cfg.rama));
      return (Array.isArray(r) ? r : [])
        .filter((f) => f.type === "file" && /\.(jpe?g|png|webp)$/i.test(f.name))
        .map((f) => "img/productos/" + f.name)
        .sort();
    } catch (e) {
      return null;   /* sin conexión o sin la carpeta: se usa la lista local */
    }
  }

  /* ---------- Estado de la publicación ----------
     Después de escribir, el workflow tarda cerca de un minuto. Esto
     permite mostrarle al cliente en qué anda en lugar de dejarlo
     adivinando si funcionó. */

  async function ultimaPublicacion() {
    try {
      const r = await pedir("/repos/" + cfg.owner + "/" + cfg.repo +
        "/actions/runs?per_page=1&branch=" + encodeURIComponent(cfg.rama));
      const run = r && r.workflow_runs && r.workflow_runs[0];
      if (!run) return null;
      return {
        estado: run.status,           /* queued | in_progress | completed */
        resultado: run.conclusion,    /* success | failure | ... */
        cuando: run.created_at,
        enlace: run.html_url,
      };
    } catch (e) {
      return null;
    }
  }

  /* ---------- Preparar una foto antes de subirla ----------
     Las fotos de celular pesan varios megas. Subirlas tal cual hace
     lenta la tienda, así que se reescalan y recomprimen acá. */

  function prepararFoto(file, maxLado) {
    const LADO = maxLado || 1351;

    return new Promise((ok, mal) => {
      if (!/^image\//.test(file.type)) {
        mal(new Error("Ese archivo no es una imagen."));
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = function () {
        URL.revokeObjectURL(url);

        let { width: w, height: h } = img;
        const escala = Math.min(1, LADO / Math.max(w, h));
        w = Math.round(w * escala);
        h = Math.round(h * escala);

        const lienzo = document.createElement("canvas");
        lienzo.width = w;
        lienzo.height = h;
        const ctx = lienzo.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        /* Fondo blanco: un PNG con transparencia quedaría negro en JPG. */
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        lienzo.toBlob((blob) => {
          if (!blob) { mal(new Error("No se pudo procesar la imagen.")); return; }
          ok({ blob: blob, ancho: w, alto: h, proporcion: +(w / h).toFixed(4) });
        }, "image/jpeg", 0.82);
      };

      img.onerror = function () {
        URL.revokeObjectURL(url);
        mal(new Error("No se pudo abrir la imagen. Probá con un JPG o un PNG."));
      };

      img.src = url;
    });
  }

  /* Nombre de archivo seguro, sin acentos ni espacios. */
  function nombreDeFoto(base) {
    const limpio = String(base || "foto").toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 36) || "foto";
    /* Sufijo de tiempo: evita pisar una foto existente sin querer. */
    return limpio + "-" + Date.now().toString(36).slice(-5) + ".jpg";
  }

  cargar();

  return {
    cargar, guardar, olvidar, conectado, datos, adivinar, probar,
    escribirTexto, escribirBlob, borrar, listarFotos, ultimaPublicacion,
    prepararFoto, nombreDeFoto,
  };
})();
