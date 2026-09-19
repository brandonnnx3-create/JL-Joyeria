/* ============================================================
   API DEL PANEL
   ------------------------------------------------------------
   El panel no habla con GitHub: le pide los cambios al propio
   sitio (las rutas /api/* del Worker), y ese Worker es el que
   publica, con un token que vive del lado del servidor.

   Acá no hay ningún token: lo único que se manda es la misma
   contraseña con la que se entró al panel.
   ============================================================ */

const API = (function () {
  "use strict";

  let clave = "";

  function autenticar(pass) { clave = pass || ""; }
  const listo = () => !!clave;

  async function pedir(ruta, opciones) {
    const o = opciones || {};
    let r;
    try {
      r = await fetch(ruta, {
        method: o.method || "GET",
        headers: Object.assign({ "Authorization": "Bearer " + clave }, o.headers || {}),
        body: o.body,
      });
    } catch (e) {
      throw new Error("No se pudo conectar con el sitio. Revisá tu conexión y probá de nuevo.");
    }

    let datos = null;
    try { datos = await r.json(); } catch (e) {}

    if (!r.ok) throw new Error(explicar(r.status, datos && datos.error));
    return datos || {};
  }

  function explicar(estado, detalle) {
    if (estado === 401) return "La sesión del panel no es válida. Cerrá sesión y volvé a entrar.";
    if (estado === 500) return detalle || "El sitio todavía no está configurado para publicar.";
    if (estado === 502) return "No se pudo guardar el cambio: " + (detalle || "error del servidor") + ".";
    return detalle || ("El sitio respondió " + estado + ".");
  }

  /* ---------- Publicar ---------- */

  function publicar(productosTxt, configTxt) {
    return pedir("/api/publicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productos: productosTxt, config: configTxt }),
    });
  }

  function subirFoto(blob, nombre) {
    return pedir("/api/foto", {
      method: "POST",
      headers: { "X-Nombre": nombre },
      body: blob,
    });
  }

  async function listarFotos() {
    try {
      const r = await pedir("/api/fotos");
      return r.fotos || null;
    } catch (e) {
      return null;   /* sin conexión: se usa la lista local */
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

  /* Nombre de archivo seguro: sin acentos, sin espacios y con un
     sufijo de tiempo para no pisar una foto existente sin querer.
     El Worker sólo acepta este formato. */
  function nombreDeFoto(base) {
    const limpio = String(base || "foto").toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 36) || "foto";
    return limpio + "-" + Date.now().toString(36).slice(-5) + ".jpg";
  }

  return { autenticar, listo, publicar, subirFoto, listarFotos, prepararFoto, nombreDeFoto };
})();
