/* ============================================================
   PANEL DE ADMINISTRACIÓN — Romero Joyería
   ------------------------------------------------------------
   Edita el catálogo y la configuración de la tienda y genera los
   archivos js/products.js y js/config.js listos para subir.

   Importante: lo que se edita acá vive en ESTE navegador hasta
   que se descargan los archivos y se suben al repositorio. La
   tienda publicada no cambia sola.
   ============================================================ */

(function () {
  "use strict";

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const CLAVE = "rj_admin_borrador_v1";

  /* Colores de piedra que entiende la tienda (js/app.js, STONE_HEX). */
  const PIEDRAS = {
    "Cristal": "#E6E9EC", "Blanco": "#F2F0EC", "Rosa": "#E38FB0",
    "Azul": "#2B4C9B", "Turquesa": "#2BA6B5", "Verde": "#1F7A4C",
    "Violeta": "#7A4BA8", "Granate": "#8E1D2B", "Negro": "#15161A",
    "Ámbar": "#C98A2E", "Dorado": "#C9A227",
  };

  /* Fotos disponibles. Arranca con las que usa el catálogo y, si hay
     conexión con GitHub, se completa con todo lo que haya en la
     carpeta, incluidas las que se suban desde acá. */
  let FOTOS = Array.from(new Set(PRODUCTOS.map((p) => p.img))).sort();

  function sumarFoto(ruta) {
    if (FOTOS.indexOf(ruta) === -1) { FOTOS.push(ruta); FOTOS.sort(); }
  }

  /* Una foto recién subida tarda cerca de un minuto en quedar
     publicada. Hasta entonces la ruta del sitio da 404, así que las
     vistas previas usan el archivo que sigue en memoria. */
  const VISTAS = {};

  function recordarVista(ruta, blob) {
    try { VISTAS[ruta] = URL.createObjectURL(blob); } catch (e) {}
  }

  const fotoSrc = (ruta) => VISTAS[ruta] || ruta;

  async function refrescarFotos() {
    if (!GIT.conectado()) return;
    const lista = await GIT.listarFotos();
    if (lista && lista.length) {
      lista.forEach(sumarFoto);
    }
  }

  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);

  const plata = (n) => "$" + new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(n || 0);

  const clonar = (o) => JSON.parse(JSON.stringify(o));

  /* ---------- Estado ---------- */

  const ORIGINAL = {
    productos: clonar(PRODUCTOS),
    categorias: clonar(CATEGORIAS),
    config: clonar(CONFIG),
  };

  let D = null;        /* borrador en edición */
  let sucio = false;

  function cargar() {
    let guardado = null;
    try {
      const raw = localStorage.getItem(CLAVE);
      if (raw) guardado = JSON.parse(raw);
    } catch (e) { /* almacenamiento bloqueado: se arranca del original */ }

    if (guardado && guardado.productos && guardado.categorias && guardado.config) {
      D = guardado;
      sucio = true;
    } else {
      D = clonar(ORIGINAL);
      sucio = false;
    }
  }

  function guardar() {
    sucio = true;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(D));
    } catch (e) {
      aviso("No se pudo guardar el borrador en este navegador. Descargá los archivos antes de cerrar.");
    }
    pintarEstado();
  }

  function pintarEstado() {
    const caja = $("#estado");
    caja.dataset.sucio = String(sucio);
    $("#estadoTxt").textContent = sucio
      ? "Cambios sin descargar"
      : "Sin cambios";
    $("#btnDescartar").disabled = !sucio;
  }

  /* ---------- Aviso flotante ---------- */

  let tToast = null;

  function aviso(txt) {
    let t = $(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.textContent = txt;
    requestAnimationFrame(() => t.classList.add("ver"));
    clearTimeout(tToast);
    tToast = setTimeout(() => t.classList.remove("ver"), 3200);
  }

  /* ---------- Ventanas ---------- */

  const capa = $("#capa");
  let focoPrevio = null;

  function abrir(html, alMontar, chica) {
    focoPrevio = document.activeElement;
    capa.innerHTML =
      '<div class="capa-fondo" data-fondo="1">' +
      '<div class="dlg' + (chica ? " dlg--sm" : "") + '" role="dialog" aria-modal="true">' +
      html + "</div></div>";
    document.body.classList.add("trabado");
    const dlg = $(".dlg", capa);
    if (alMontar) alMontar(dlg);
    const primero = $("[data-foco]", dlg) || $("button", dlg);
    if (primero) primero.focus();
  }

  function cerrar() {
    capa.innerHTML = "";
    document.body.classList.remove("trabado");
    if (focoPrevio && focoPrevio.focus) focoPrevio.focus();
    focoPrevio = null;
  }

  document.addEventListener("click", (e) => {
    if (e.target.dataset && e.target.dataset.fondo) { cerrar(); return; }
    if (e.target.closest("[data-cerrar]")) cerrar();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && capa.innerHTML) cerrar();
  });

  const cabecera = (titulo) =>
    '<div class="dlg__cab"><h2>' + esc(titulo) + "</h2>" +
    '<button class="icono" data-cerrar="1" aria-label="Cerrar">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
    "</button></div>";

  /* Confirmación para lo que no se puede deshacer. */
  function confirmar(titulo, texto, textoBoton, alConfirmar) {
    abrir(
      cabecera(titulo) +
      '<div class="dlg__cuerpo"><p class="prosa" style="margin:0">' + esc(texto) + "</p></div>" +
      '<div class="dlg__pie">' +
        '<button class="btn btn--quiet" data-cerrar="1">Cancelar</button>' +
        '<button class="btn btn--danger" id="ok" data-foco>' + esc(textoBoton) + "</button>" +
      "</div>",
      (dlg) => {
        $("#ok", dlg).addEventListener("click", () => { cerrar(); alConfirmar(); });
      }, true);
  }

  /* ============================================================
     PESTAÑAS
     ============================================================ */

  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      ["productos", "categorias", "tienda", "publicar"].forEach((id) => {
        $("#p-" + id).hidden = id !== tab.dataset.panel;
      });
    });
  });

  /* ============================================================
     PRODUCTOS
     ============================================================ */

  const nombreCat = (id) => {
    const c = D.categorias.find((x) => x.id === id);
    return c ? c.nombre : id;
  };

  function estadoStock(p) {
    if (typeof p.stock !== "number" || isNaN(p.stock)) {
      return { clase: "", txt: "—" };
    }
    if (p.stock <= 0) return { clase: "pill--out", txt: "Agotado" };
    if (p.stock <= 3) return { clase: "pill--low", txt: p.stock + " u." };
    return { clase: "pill--ok", txt: p.stock + " u." };
  }

  function productosFiltrados() {
    const q = $("#buscar").value.trim().toLowerCase();
    const cat = $("#filtroCat").value;
    const st = $("#filtroStock").value;

    return D.productos.filter((p) => {
      if (q && p.nombre.toLowerCase().indexOf(q) === -1 && p.id.toLowerCase().indexOf(q) === -1) return false;
      if (cat && p.categoria !== cat) return false;
      const tiene = typeof p.stock === "number" && !isNaN(p.stock);
      if (st === "sin" && tiene) return false;
      if (st === "bajo" && (!tiene || p.stock > 3 || p.stock <= 0)) return false;
      if (st === "cero" && (!tiene || p.stock > 0)) return false;
      return true;
    });
  }

  function pintarProductos() {
    const lista = productosFiltrados();
    const cuerpo = $("#filas");

    if (!lista.length) {
      cuerpo.innerHTML = '<tr><td colspan="7" class="vacio">No hay piezas que coincidan con el filtro.</td></tr>';
    } else {
      cuerpo.innerHTML = lista.map((p) => {
        const st = estadoStock(p);
        return '<tr data-id="' + esc(p.id) + '">' +
          '<td class="t-img"><img class="mini" src="' + esc(fotoSrc(p.img)) + '" alt=""></td>' +
          '<td class="t-nom nom">' + esc(p.nombre) + "<small>" + esc(p.id) + "</small></td>" +
          '<td class="t-cat">' + esc(nombreCat(p.categoria)) + "</td>" +
          '<td class="t-precio c-num" data-etq="Precio">' +
            '<input class="in in--num" type="number" min="0" step="100" ' +
            'inputmode="numeric" value="' + Number(p.precio || 0) + '" data-campo="precio" ' +
            'aria-label="Precio de ' + esc(p.nombre) + '"></td>' +
          '<td class="t-stock c-num" data-etq="Stock">' +
            '<input class="in in--num" type="number" min="0" step="1" ' +
            'inputmode="numeric" placeholder="—" value="' +
            (typeof p.stock === "number" ? p.stock : "") + '" data-campo="stock" ' +
            'aria-label="Stock de ' + esc(p.nombre) + '"></td>' +
          '<td class="t-eti">' + (p.etiqueta
              ? '<span class="pill">' + esc(p.etiqueta) + "</span>"
              : st.txt === "—"
                ? ""
                : '<span class="pill ' + st.clase + '">' + esc(st.txt) + "</span>") + "</td>" +
          '<td class="t-act c-act"><div class="acciones">' +
            '<button class="btn btn--quiet btn--sm" data-editar="' + esc(p.id) + '">Editar</button>' +
            '<button class="icono" data-borrar="' + esc(p.id) + '" aria-label="Borrar ' + esc(p.nombre) + '">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>' +
            "</button>" +
          "</div></td></tr>";
      }).join("");
    }

    $("#nProd").textContent = D.productos.length;
  }

  /* Edición directa de precio y stock en la tabla. */
  $("#filas").addEventListener("change", (e) => {
    const input = e.target.closest("[data-campo]");
    if (!input) return;
    const id = input.closest("tr").dataset.id;
    const p = D.productos.find((x) => x.id === id);
    if (!p) return;

    if (input.dataset.campo === "precio") {
      const v = Math.max(0, Math.round(Number(input.value) || 0));
      p.precio = v;
      input.value = v;
    } else {
      const crudo = input.value.trim();
      if (crudo === "") delete p.stock;                     /* sin control de stock */
      else p.stock = Math.max(0, Math.round(Number(crudo) || 0));
    }
    guardar();
    pintarProductos();
  });

  $("#filas").addEventListener("click", (e) => {
    const ed = e.target.closest("[data-editar]");
    if (ed) { editarProducto(ed.dataset.editar); return; }

    const bo = e.target.closest("[data-borrar]");
    if (bo) {
      const p = D.productos.find((x) => x.id === bo.dataset.borrar);
      if (!p) return;
      confirmar("Borrar pieza",
        "Se va a quitar “" + p.nombre + "” del catálogo. Podés recuperarla con Descartar cambios, mientras no hayas descargado los archivos.",
        "Borrar", () => {
          D.productos = D.productos.filter((x) => x.id !== p.id);
          guardar(); pintarProductos(); pintarCategorias();
          aviso("Pieza borrada");
        });
    }
  });

  ["#buscar", "#filtroCat", "#filtroStock"].forEach((sel) => {
    $(sel).addEventListener("input", pintarProductos);
  });

  /* ---------- Editor de pieza ---------- */

  function editarProducto(id) {
    const nuevo = !id;
    const base = nuevo
      ? { id: "", nombre: "", categoria: (D.categorias.find((c) => c.id !== "todos") || {}).id || "",
          precio: 0, img: FOTOS[0] || "", material: "Plata 925 con terminación dorada",
          desc: "", piedras: [] }
      : clonar(D.productos.find((p) => p.id === id));

    if (!base) return;

    const opsCat = D.categorias.filter((c) => c.id !== "todos").map((c) =>
      '<option value="' + esc(c.id) + '"' + (c.id === base.categoria ? " selected" : "") + ">" +
      esc(c.nombre) + "</option>").join("");

    const opsFoto = FOTOS.map((f) =>
      '<option value="' + esc(f) + '"' + (f === base.img ? " selected" : "") + ">" +
      esc(f.replace("img/productos/", "")) + "</option>").join("");

    const piedras = Object.keys(PIEDRAS).map((nom) =>
      '<button type="button" class="pie-op" data-piedra="' + esc(nom) + '" aria-pressed="' +
      ((base.piedras || []).indexOf(nom) !== -1) + '">' +
      '<i style="background:' + PIEDRAS[nom] + '"></i>' + esc(nom) + "</button>").join("");

    abrir(
      cabecera(nuevo ? "Nueva pieza" : base.nombre) +
      '<div class="dlg__cuerpo"><div class="dlg-cols">' +
        '<div><div class="preview" id="prev"><img src="' + esc(fotoSrc(base.img)) + '" alt=""></div>' +
          '<label class="campo" style="margin-top:14px"><span>Foto</span>' +
          '<select class="in" id="fImg">' + opsFoto + "</select></label>" +

          (GIT.conectado()
            ? '<button type="button" class="soltar" id="zonaFoto">' +
                "<strong>Subir una foto</strong>" +
                "Arrastrala acá o tocá para elegirla" +
                "<small>Se achica y se sube sola. Mejor vertical.</small>" +
              "</button>" +
              '<input type="file" id="archivoFoto" accept="image/*" hidden>' +
              '<div id="estadoFoto"></div>'
            : '<p class="campo" style="margin-top:10px"><small>' +
              "Para usar una foto nueva hay que subirla a <code>img/productos/</code>. " +
              "Conectando el panel con GitHub se puede subir desde acá.</small></p>") +
        "</div>" +

        "<div>" +
          '<label class="campo"><span>Nombre</span>' +
          '<input class="in" id="fNombre" type="text" value="' + esc(base.nombre) + '" data-foco>' +
          '<span class="mal" id="eNombre"></span></label>' +

          '<div class="par">' +
            '<label class="campo"><span>Categoría</span><select class="in" id="fCat">' + opsCat + "</select></label>" +
            '<label class="campo"><span>Identificador</span>' +
            '<input class="in" id="fId" type="text" value="' + esc(base.id) + '"' +
            (nuevo ? "" : " readonly") + ">" +
            "<small>" + (nuevo ? "Se arma solo con el nombre." : "No se puede cambiar.") + "</small>" +
            '<span class="mal" id="eId"></span></label>' +
          "</div>" +

          '<div class="par">' +
            '<label class="campo"><span>Precio</span>' +
            '<input class="in in--num" id="fPrecio" type="number" min="0" step="100" inputmode="numeric" value="' +
            Number(base.precio || 0) + '"></label>' +
            '<label class="campo"><span>Stock</span>' +
            '<input class="in in--num" id="fStock" type="number" min="0" step="1" inputmode="numeric" placeholder="sin control" value="' +
            (typeof base.stock === "number" ? base.stock : "") + '">' +
            "<small>Vacío: se vende sin controlar stock.</small></label>" +
          "</div>" +

          '<label class="campo"><span>Material</span>' +
          '<input class="in" id="fMaterial" type="text" value="' + esc(base.material || "") + '"></label>' +

          '<label class="campo"><span>Descripción</span>' +
          '<textarea class="in" id="fDesc" rows="3">' + esc(base.desc || "") + "</textarea></label>" +

          '<label class="campo"><span>Etiqueta sobre la foto</span>' +
          '<input class="in" id="fEtiqueta" type="text" value="' + esc(base.etiqueta || "") + '" placeholder="vacío: la decide el stock">' +
          "<small>Usala poco. Si ponés una urgencia que no es cierta, se nota.</small></label>" +

          '<div class="campo"><span>Colores de piedra</span>' +
          '<div class="piedras" id="fPiedras">' + piedras + "</div>" +
          "<small>Los que elijas aparecen como opción al comprar.</small></div>" +
        "</div>" +
      "</div></div>" +

      '<div class="dlg__pie">' +
        '<button class="btn btn--quiet" data-cerrar="1">Cancelar</button>' +
        '<button class="btn" id="fGuardar">' + (nuevo ? "Crear pieza" : "Guardar") + "</button>" +
      "</div>",

      (dlg) => {
        $("#fImg", dlg).addEventListener("change", (e) => {
          $("#prev img", dlg).src = fotoSrc(e.target.value);
        });

        /* ---------- Subir una foto sin salir del panel ---------- */
        const zona = $("#zonaFoto", dlg);
        if (zona) {
          const archivo = $("#archivoFoto", dlg);
          const estado = $("#estadoFoto", dlg);

          zona.addEventListener("click", () => archivo.click());
          archivo.addEventListener("change", () => {
            if (archivo.files && archivo.files[0]) subirFoto(archivo.files[0]);
          });

          ["dragenter", "dragover"].forEach((ev) =>
            zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add("encima"); }));
          ["dragleave", "drop"].forEach((ev) =>
            zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.remove("encima"); }));
          zona.addEventListener("drop", (e) => {
            const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (f) subirFoto(f);
          });

          async function subirFoto(file) {
            zona.hidden = true;
            estado.innerHTML = '<div class="subiendo"><span class="giro"></span><span id="foTxt">Preparando la foto…</span></div>';
            const txt = $("#foTxt", estado);

            try {
              const lista = await GIT.prepararFoto(file);
              const kb = Math.round(lista.blob.size / 1024);
              txt.textContent = "Subiendo… " + lista.ancho + "×" + lista.alto + ", " + kb + " KB";

              const ruta = "img/productos/" + GIT.nombreDeFoto(file.name);
              await GIT.escribirBlob(ruta, lista.blob, "Subir foto desde el panel: " + ruta);

              sumarFoto(ruta);
              recordarVista(ruta, lista.blob);

              /* La lista se rearma para que aparezca la recién subida. */
              const sel = $("#fImg", dlg);
              sel.innerHTML = FOTOS.map((f) =>
                '<option value="' + esc(f) + '">' + esc(f.replace("img/productos/", "")) + "</option>").join("");
              sel.value = ruta;
              $("#prev img", dlg).src = fotoSrc(ruta);

              const apaisada = lista.proporcion > 0.95;
              estado.innerHTML = '<p class="campo" style="margin:10px 0 0"><small style="color:var(--ok)">' +
                "Foto subida. Va a aparecer en la tienda cuando publiques los cambios." +
                (apaisada
                  ? " Ojo: es apaisada y el sitio está armado con fotos verticales; " +
                    "en la ficha va a quedar con bandas a los costados."
                  : "") +
                "</small></p>";
              aviso("Foto subida");
            } catch (e) {
              estado.innerHTML = '<p class="campo" style="margin:10px 0 0"><small class="mal">' +
                esc(e.message) + "</small></p>";
              zona.hidden = false;
            }
          }
        }

        /* El identificador se arma con el nombre, sólo al crear. */
        if (nuevo) {
          $("#fNombre", dlg).addEventListener("input", (e) => {
            $("#fId", dlg).value = idDesde(e.target.value);
          });
        }

        $("#fPiedras", dlg).addEventListener("click", (e) => {
          const b = e.target.closest("[data-piedra]");
          if (!b) return;
          b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
        });

        $("#fGuardar", dlg).addEventListener("click", () => {
          const nombre = $("#fNombre", dlg).value.trim();
          const pid = $("#fId", dlg).value.trim();

          $("#eNombre", dlg).textContent = "";
          $("#eId", dlg).textContent = "";

          if (nombre.length < 2) {
            $("#eNombre", dlg).textContent = "Escribí el nombre de la pieza.";
            $("#fNombre", dlg).focus();
            return;
          }
          if (!pid) {
            $("#eId", dlg).textContent = "Falta el identificador.";
            return;
          }
          if (nuevo && D.productos.some((p) => p.id === pid)) {
            $("#eId", dlg).textContent = "Ya hay una pieza con este identificador.";
            return;
          }

          const stockCrudo = $("#fStock", dlg).value.trim();
          const piezas = nuevo ? undefined : (D.productos.find((p) => p.id === id) || {}).piezas;

          const armado = {
            id: pid,
            nombre: nombre,
            categoria: $("#fCat", dlg).value,
            precio: Math.max(0, Math.round(Number($("#fPrecio", dlg).value) || 0)),
            img: $("#fImg", dlg).value,
            material: $("#fMaterial", dlg).value.trim(),
            desc: $("#fDesc", dlg).value.trim(),
            piedras: $$("[data-piedra][aria-pressed='true']", dlg).map((b) => b.dataset.piedra),
          };

          if (piezas) armado.piezas = piezas;
          if (stockCrudo !== "") armado.stock = Math.max(0, Math.round(Number(stockCrudo) || 0));
          const eti = $("#fEtiqueta", dlg).value.trim();
          if (eti) armado.etiqueta = eti;

          if (nuevo) D.productos.push(armado);
          else D.productos = D.productos.map((p) => (p.id === id ? armado : p));

          guardar();
          pintarProductos();
          pintarCategorias();
          cerrar();
          aviso(nuevo ? "Pieza creada" : "Pieza guardada");
        });
      });
  }

  function idDesde(txt) {
    return txt.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")   /* saca los acentos */
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  }

  $("#btnNuevo").addEventListener("click", () => editarProducto(null));

  /* ============================================================
     CATEGORÍAS
     ============================================================ */

  const cuentaEn = (catId) =>
    catId === "todos" ? D.productos.length : D.productos.filter((p) => p.categoria === catId).length;

  function pintarCategorias() {
    $("#filasCat").innerHTML = D.categorias.map((c, i) => {
      const fija = c.id === "todos";
      return '<tr data-cat="' + esc(c.id) + '">' +
        '<td class="t-orden c-num">' +
          '<button class="icono" data-mover="-1" ' + (i === 0 ? "disabled" : "") + ' aria-label="Subir">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 15l-6-6-6 6"/></svg></button>' +
          '<button class="icono" data-mover="1" ' + (i === D.categorias.length - 1 ? "disabled" : "") + ' aria-label="Bajar">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 9l6 6 6-6"/></svg></button>' +
        "</td>" +
        '<td class="t-cnom" data-etq="Nombre"><input class="in" type="text" value="' + esc(c.nombre) + '" data-campo="nombre" aria-label="Nombre"></td>' +
        '<td class="t-cdesc" data-etq="Bajada"><input class="in" type="text" value="' + esc(c.desc) + '" data-campo="desc" aria-label="Bajada"></td>' +
        '<td class="t-cn c-num" data-etq="Piezas">' + cuentaEn(c.id) + "</td>" +
        '<td class="t-cact c-act"><div class="acciones">' +
          (fija
            ? '<span class="pill">Fija</span>'
            : '<button class="icono" data-borrarcat="' + esc(c.id) + '" aria-label="Borrar categoría">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>') +
        "</div></td></tr>";
    }).join("");

    $("#nCat").textContent = D.categorias.length;

    /* El filtro de la pestaña de productos se mantiene al día. */
    const sel = $("#filtroCat");
    const antes = sel.value;
    sel.innerHTML = '<option value="">Todas las categorías</option>' +
      D.categorias.filter((c) => c.id !== "todos").map((c) =>
        '<option value="' + esc(c.id) + '">' + esc(c.nombre) + "</option>").join("");
    sel.value = antes;
  }

  $("#filasCat").addEventListener("change", (e) => {
    const input = e.target.closest("[data-campo]");
    if (!input) return;
    const c = D.categorias.find((x) => x.id === input.closest("tr").dataset.cat);
    if (!c) return;
    c[input.dataset.campo] = input.value.trim();
    guardar();
  });

  $("#filasCat").addEventListener("click", (e) => {
    const mov = e.target.closest("[data-mover]");
    if (mov) {
      const id = mov.closest("tr").dataset.cat;
      const i = D.categorias.findIndex((c) => c.id === id);
      const j = i + Number(mov.dataset.mover);
      if (i < 0 || j < 0 || j >= D.categorias.length) return;
      const t = D.categorias[i];
      D.categorias[i] = D.categorias[j];
      D.categorias[j] = t;
      guardar();
      pintarCategorias();
      return;
    }

    const bo = e.target.closest("[data-borrarcat]");
    if (bo) {
      const id = bo.dataset.borrarcat;
      const c = D.categorias.find((x) => x.id === id);
      const n = cuentaEn(id);
      if (n > 0) {
        aviso("No se puede borrar: “" + c.nombre + "” tiene " + n + " pieza" + (n === 1 ? "" : "s") + ".");
        return;
      }
      confirmar("Borrar categoría",
        "Se va a quitar “" + c.nombre + "”. No tiene piezas asignadas.",
        "Borrar", () => {
          D.categorias = D.categorias.filter((x) => x.id !== id);
          guardar(); pintarCategorias();
          aviso("Categoría borrada");
        });
    }
  });

  $("#btnNuevaCat").addEventListener("click", () => {
    abrir(
      cabecera("Nueva categoría") +
      '<div class="dlg__cuerpo">' +
        '<label class="campo"><span>Nombre</span>' +
        '<input class="in" id="cNombre" type="text" placeholder="Pulseras" data-foco>' +
        '<span class="mal" id="cErr"></span></label>' +
        '<label class="campo"><span>Bajada</span>' +
        '<input class="in" id="cDesc" type="text" placeholder="Pulseras de plata 925">' +
        "<small>Aparece debajo del título cuando se filtra por esta categoría.</small></label>" +
      "</div>" +
      '<div class="dlg__pie">' +
        '<button class="btn btn--quiet" data-cerrar="1">Cancelar</button>' +
        '<button class="btn" id="cOk">Crear</button>' +
      "</div>",
      (dlg) => {
        $("#cOk", dlg).addEventListener("click", () => {
          const nombre = $("#cNombre", dlg).value.trim();
          const id = idDesde(nombre);
          if (nombre.length < 2) {
            $("#cErr", dlg).textContent = "Escribí un nombre.";
            return;
          }
          if (D.categorias.some((c) => c.id === id)) {
            $("#cErr", dlg).textContent = "Ya existe una categoría con ese nombre.";
            return;
          }
          D.categorias.push({ id: id, nombre: nombre, desc: $("#cDesc", dlg).value.trim() || nombre });
          guardar(); pintarCategorias(); cerrar();
          aviso("Categoría creada");
        });
      }, true);
  });

  /* ============================================================
     ENVÍOS Y CONTACTO
     ============================================================ */

  const CAMPOS_CFG = [
    ["#cfgEnvio",  "costoEnvio",      "num"],
    ["#cfgGratis", "envioGratisDesde", "num"],
    ["#cfgRetiro", "puntoRetiro",     "txt"],
    ["#cfgWa",     "whatsapp",        "txt"],
    ["#cfgIg",     "instagram",       "txt"],
    ["#cfgMail",   "email",           "txt"],
    ["#cfgCiudad", "ciudad",          "txt"],
  ];

  function pintarTienda() {
    CAMPOS_CFG.forEach(([sel, clave]) => { $(sel).value = D.config[clave] != null ? D.config[clave] : ""; });
    revisarWa();
  }

  function revisarWa() {
    const n = String($("#cfgWa").value || "").replace(/\D/g, "");
    const ayuda = $("#waAyuda");
    const input = $("#cfgWa");
    if (!n) {
      input.setAttribute("aria-invalid", "true");
      ayuda.className = "mal";
      ayuda.textContent = "Sin número, el checkout no puede enviar el pedido.";
    } else if (n.length < 10) {
      input.setAttribute("aria-invalid", "true");
      ayuda.className = "mal";
      ayuda.textContent = "Faltan números: tiene que quedar como 5491165668692.";
    } else {
      input.setAttribute("aria-invalid", "false");
      ayuda.className = "";
      ayuda.textContent = "Se usará https://wa.me/" + n;
    }
  }

  CAMPOS_CFG.forEach(([sel, clave, tipo]) => {
    $(sel).addEventListener("input", () => {
      const v = $(sel).value;
      D.config[clave] = tipo === "num" ? Math.max(0, Math.round(Number(v) || 0)) : v.trim();
      if (clave === "whatsapp") {
        D.config.whatsapp = v.replace(/\D/g, "");
        revisarWa();
      }
      guardar();
    });
  });

  /* ============================================================
     GENERAR LOS ARCHIVOS
     ============================================================ */

  const txt = (v) => JSON.stringify(String(v == null ? "" : v));

  function armarProductos() {
    const L = [];
    L.push("/* ============================================================");
    L.push("   ROMERO JOYERÍA — CATÁLOGO");
    L.push("   ------------------------------------------------------------");
    L.push("   Generado desde el panel el " +
      new Date().toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" }) + ".");
    L.push("   Se puede editar a mano igual: es un archivo común.");
    L.push("");
    L.push("   categoria: " + D.categorias.map((c) => '"' + c.id + '"').join(" | "));
    L.push("");
    L.push("   stock:     unidades disponibles. Sin el campo, la pieza se");
    L.push("              vende sin control. 0 es agotado y 3 o menos");
    L.push('              muestra "Últimas unidades".');
    L.push("   ============================================================ */");
    L.push("");
    L.push("const CATEGORIAS = [");
    D.categorias.forEach((c) => {
      L.push("  { id: " + txt(c.id) + ", nombre: " + txt(c.nombre) + ", desc: " + txt(c.desc) + " },");
    });
    L.push("];");
    L.push("");
    L.push("const PRODUCTOS = [");
    L.push("");

    D.categorias.filter((c) => c.id !== "todos").forEach((cat) => {
      const dentro = D.productos.filter((p) => p.categoria === cat.id);
      if (!dentro.length) return;
      L.push("  /* ---------------- " + cat.nombre.toUpperCase() + " ---------------- */");
      dentro.forEach((p) => {
        L.push("  {");
        L.push("    id: " + txt(p.id) + ",");
        L.push("    nombre: " + txt(p.nombre) + ",");
        L.push("    categoria: " + txt(p.categoria) + ",");
        L.push("    precio: " + Number(p.precio || 0) + ",");
        if (typeof p.stock === "number") L.push("    stock: " + p.stock + ",");
        L.push("    img: " + txt(p.img) + ",");
        L.push("    material: " + txt(p.material) + ",");
        L.push("    desc: " + txt(p.desc) + ",");
        if (p.piezas && p.piezas.length)
          L.push("    piezas: [" + p.piezas.map(txt).join(", ") + "],");
        L.push("    piedras: [" + (p.piedras || []).map(txt).join(", ") + "],");
        if (p.etiqueta) L.push("    etiqueta: " + txt(p.etiqueta) + ",");
        L.push("  },");
      });
      L.push("");
    });

    /* Piezas cuya categoría ya no existe: se conservan al final. */
    const sueltas = D.productos.filter((p) => !D.categorias.some((c) => c.id === p.categoria));
    if (sueltas.length) {
      L.push("  /* ---------------- SIN CATEGORÍA VÁLIDA ---------------- */");
      sueltas.forEach((p) => {
        L.push("  { id: " + txt(p.id) + ", nombre: " + txt(p.nombre) +
               ", categoria: " + txt(p.categoria) + ", precio: " + Number(p.precio || 0) +
               ", img: " + txt(p.img) + ", material: " + txt(p.material) +
               ", desc: " + txt(p.desc) + ", piedras: [" + (p.piedras || []).map(txt).join(", ") + "] },");
      });
      L.push("");
    }

    L.push("];");
    L.push("");
    return L.join("\n");
  }

  function armarConfig() {
    const c = D.config;
    return [
      "/* ============================================================",
      "   ROMERO JOYERÍA — CONFIGURACIÓN",
      "   ------------------------------------------------------------",
      "   Generado desde el panel el " +
        new Date().toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" }) + ".",
      "",
      "   El WhatsApp va en formato internacional, sólo números:",
      "   54 + 9 + característica sin el 0 + número sin el 15.",
      "   ============================================================ */",
      "",
      "const CONFIG = {",
      "  whatsapp: " + txt(c.whatsapp) + ",",
      "",
      "  marca: " + txt(c.marca) + ",",
      "  instagram: " + txt(c.instagram) + ",",
      "  email: " + txt(c.email) + ",",
      "  ciudad: " + txt(c.ciudad) + ",",
      "",
      "  envioGratisDesde: " + Number(c.envioGratisDesde || 0) + ",",
      "  costoEnvio: " + Number(c.costoEnvio || 0) + ",",
      "  puntoRetiro: " + txt(c.puntoRetiro) + ",",
      "",
      "  moneda: " + txt(c.moneda || "$") + ",",
      "  localeMoneda: " + txt(c.localeMoneda || "es-AR") + ",",
      "};",
      "",
    ].join("\n");
  }

  function bajarArchivo(nombre, contenido) {
    const blob = new Blob([contenido], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  $("#btnExportar").addEventListener("click", () => {
    const sinWa = String(D.config.whatsapp || "").replace(/\D/g, "").length < 10;
    const sinPrecio = D.productos.filter((p) => !p.precio);

    const problemas = [];
    if (sinWa) problemas.push("El WhatsApp de la tienda está vacío o incompleto: el checkout no va a poder enviar pedidos.");
    if (sinPrecio.length) problemas.push(sinPrecio.length + " pieza" + (sinPrecio.length === 1 ? "" : "s") + " sin precio.");

    /* Dos botones en lugar de una descarga doble: el navegador bloquea
       la segunda descarga seguida y el archivo se perdía sin aviso. */
    abrir(
      cabecera("Descargar archivos") +
      '<div class="dlg__cuerpo">' +
        (problemas.length
          ? '<div class="aviso"><strong>Revisá esto antes:</strong><br>' +
            problemas.map(esc).join("<br>") + "</div>"
          : "") +
        '<p class="prosa">Descargá los dos y subilos a la carpeta <code>js</code> del ' +
          "repositorio, reemplazando los que están. En la pestaña " +
          "<strong>Cómo publicar</strong> está el paso a paso.</p>" +
        '<div class="par" style="margin-top:4px">' +
          '<button class="btn btn--quiet" id="dProd" data-foco>' +
            "products.js<br><small style=\"opacity:.6\">" + D.productos.length +
            " piezas · " + D.categorias.length + " categorías</small></button>" +
          '<button class="btn btn--quiet" id="dCfg">' +
            "config.js<br><small style=\"opacity:.6\">envíos y contacto</small></button>" +
        "</div>" +
      "</div>" +
      '<div class="dlg__pie">' +
        '<span class="izq small" id="dEstado" style="color:var(--txt-3);font-size:.8125rem">Falta descargar los dos.</span>' +
        '<button class="btn" data-cerrar="1">Listo</button>' +
      "</div>",
      (dlg) => {
        const hechos = {};

        function marcar(cual, boton) {
          hechos[cual] = true;
          boton.textContent = "✓ " + cual + " descargado";
          boton.disabled = true;
          const faltan = ["products.js", "config.js"].filter((f) => !hechos[f]);
          $("#dEstado", dlg).textContent = faltan.length
            ? "Falta " + faltan.join(" y ") + "."
            : "Listo. Ahora subilos al repositorio.";
          if (!faltan.length) aviso("Archivos descargados. Ahora subilos al repositorio.");
        }

        $("#dProd", dlg).addEventListener("click", (e) => {
          bajarArchivo("products.js", armarProductos());
          marcar("products.js", e.currentTarget);
        });

        $("#dCfg", dlg).addEventListener("click", (e) => {
          bajarArchivo("config.js", armarConfig());
          marcar("config.js", e.currentTarget);
        });
      }, true);
  });

  $("#btnDescartar").addEventListener("click", () => {
    confirmar("Descartar cambios",
      "Se vuelve a como estaba la tienda publicada. Se pierde todo lo que editaste y no descargaste.",
      "Descartar", () => {
        try { localStorage.removeItem(CLAVE); } catch (e) {}
        D = clonar(ORIGINAL);
        sucio = false;
        pintarTodo();
        aviso("Cambios descartados");
      });
  });

  /* Aviso del navegador al cerrar con cambios pendientes. */
  window.addEventListener("beforeunload", (e) => {
    if (!sucio) return;
    e.preventDefault();
    e.returnValue = "";
  });


  /* ============================================================
     CONEXIÓN CON GITHUB
     Con el token cargado, el panel sube las fotos y publica los
     archivos solo. Sin él, sigue estando la descarga a mano.
     ============================================================ */

  function pintarConexion() {
    const banda = $("#conexion");
    const btnPub = $("#btnPublicar");
    const btnExp = $("#btnExportar");

    if (GIT.conectado()) {
      const d = GIT.datos();
      banda.hidden = true;
      btnPub.hidden = false;
      btnExp.classList.add("btn--quiet");
      btnExp.classList.remove("btn--principal");
      btnPub.title = "Publica en " + d.owner + "/" + d.repo;
    } else {
      banda.hidden = false;
      banda.dataset.tono = "";
      $("#conexionTxt").textContent =
        "Conectá con GitHub y publicá los cambios sin salir de acá.";
      btnPub.hidden = true;
      /* Sin conexión, descargar es la acción principal. */
      btnExp.classList.remove("btn--quiet");
      btnExp.classList.add("btn--principal");
    }
    pintarEstadoGit();
  }

  function pintarEstadoGit() {
    const caja = $("#estadoConexion");
    if (!caja) return;

    if (GIT.conectado()) {
      const d = GIT.datos();
      caja.innerHTML =
        '<div class="estado-git"><span class="luz luz--ok"></span><div class="estado-git__p">' +
          '<div class="estado-git__t">Conectado</div>' +
          '<p class="estado-git__d">Publicando en <code>' + esc(d.owner + "/" + d.repo) +
            "</code>, rama <code>" + esc(d.rama) + "</code>.<br>" +
            "El botón <strong>Publicar cambios</strong> sube todo y la tienda se " +
            "actualiza cerca de un minuto después.</p>" +
          '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">' +
            '<button class="btn btn--quiet btn--sm" id="gitCambiar">Cambiar repositorio</button>' +
            '<button class="btn btn--danger btn--sm" id="gitSalir">Desconectar</button>' +
          "</div>" +
        "</div></div>";

      $("#gitCambiar", caja).addEventListener("click", dialogoConexion);
      $("#gitSalir", caja).addEventListener("click", () => {
        confirmar("Desconectar",
          "Se borra el token de este navegador. Los cambios que tengas sin publicar no se pierden, " +
          "pero vas a tener que descargar los archivos a mano o volver a conectar.",
          "Desconectar", () => {
            GIT.olvidar();
            pintarConexion();
            aviso("Panel desconectado");
          });
      });
    } else {
      caja.innerHTML =
        '<div class="estado-git"><span class="luz luz--mal"></span><div class="estado-git__p">' +
          '<div class="estado-git__t">Sin conectar</div>' +
          '<p class="estado-git__d">Ahora mismo los cambios hay que bajarlos y subirlos a mano. ' +
            "Conectando el panel con GitHub, las fotos y los archivos se publican desde acá.</p>" +
          '<div style="margin-top:12px">' +
            '<button class="btn btn--sm" id="gitConectar2">Conectar con GitHub</button>' +
          "</div>" +
        "</div></div>";
      $("#gitConectar2", caja).addEventListener("click", dialogoConexion);
    }
  }

  function dialogoConexion() {
    const previo = GIT.datos() || GIT.adivinar();

    abrir(
      cabecera("Conectar con GitHub") +
      '<div class="dlg__cuerpo">' +
        '<p class="prosa">Una sola vez. Después, publicar es un botón.</p>' +
        "<ol class=\"receta\">" +
          "<li>Entrá a <a href=\"https://github.com/settings/personal-access-tokens/new\" " +
            "target=\"_blank\" rel=\"noopener\">github.com → tokens</a> " +
            "(Settings → Developer settings → Fine-grained tokens).</li>" +
          "<li>En <strong>Repository access</strong> elegí <strong>Only select repositories</strong> " +
            "y marcá únicamente este repositorio.</li>" +
          "<li>En <strong>Permissions → Repository permissions</strong>, poné " +
            "<strong>Contents</strong> en <strong>Read and write</strong>. " +
            "No hace falta ningún otro permiso.</li>" +
          "<li>Generá el token y copialo. GitHub lo muestra una sola vez.</li>" +
        "</ol>" +

        '<div class="par" style="margin-top:18px">' +
          '<label class="campo"><span>Usuario u organización</span>' +
          '<input class="in" id="gOwner" type="text" value="' + esc(previo.owner || "") + '" placeholder="tu-usuario"></label>' +
          '<label class="campo"><span>Repositorio</span>' +
          '<input class="in" id="gRepo" type="text" value="' + esc(previo.repo || "") + '" placeholder="JL-Joyeria"></label>' +
        "</div>" +

        '<label class="campo"><span>Token</span>' +
        '<input class="in token-in" id="gToken" type="password" autocomplete="off" ' +
          'placeholder="github_pat_..." data-foco>' +
        "<small>Se guarda solo en este navegador y viaja únicamente a github.com.</small>" +
        '<span class="mal" id="gErr"></span></label>' +

        '<div class="aviso" style="margin-top:4px;margin-bottom:0">' +
          "<strong>Sobre el token:</strong> queda guardado en esta computadora. " +
          "Si es una máquina compartida, mejor usá la descarga a mano. " +
          "Un token limitado a este repositorio y a Contents no puede tocar nada más de tu cuenta." +
        "</div>" +
      "</div>" +
      '<div class="dlg__pie">' +
        '<button class="btn btn--quiet" data-cerrar="1">Cancelar</button>' +
        '<button class="btn" id="gOk">Conectar</button>' +
      "</div>",

      (dlg) => {
        $("#gOk", dlg).addEventListener("click", async () => {
          const owner = $("#gOwner", dlg).value.trim();
          const repo = $("#gRepo", dlg).value.trim().replace(/\.git$/, "");
          const token = $("#gToken", dlg).value.trim();
          const err = $("#gErr", dlg);
          const btn = $("#gOk", dlg);

          err.textContent = "";
          if (!owner || !repo) { err.textContent = "Faltan el usuario y el repositorio."; return; }
          if (!token) { err.textContent = "Pegá el token."; return; }

          btn.disabled = true;
          btn.textContent = "Probando…";
          try {
            const info = await GIT.probar(token, owner, repo);
            GIT.guardar({ token: token, owner: owner, repo: repo, rama: info.rama });
            cerrar();
            pintarConexion();
            await refrescarFotos();
            aviso("Conectado a " + info.nombre);
          } catch (e) {
            err.textContent = e.message;
            btn.disabled = false;
            btn.textContent = "Conectar";
          }
        });
      });
  }

  $("#btnConectar").addEventListener("click", dialogoConexion);

  /* En celular no entran las tres acciones: las secundarias se
     despliegan desde el botón de puntos. */
  const mas = $("#btnMas");
  if (mas) {
    mas.addEventListener("click", () => {
      const caja = $(".bar__acts");
      const abierto = caja.classList.toggle("abierto");
      mas.setAttribute("aria-expanded", String(abierto));
    });
  }

  /* ============================================================
     PUBLICAR
     ============================================================ */

  function pasoHTML(id, txt) {
    return '<li id="' + id + '" data-est="espera"><span class="progreso__m">·</span><span>' + esc(txt) + "</span></li>";
  }

  function marcarPaso(dlg, id, estado, txt) {
    const li = $("#" + id, dlg);
    if (!li) return;
    li.dataset.est = estado;
    li.querySelector(".progreso__m").textContent =
      estado === "listo" ? "✓" : estado === "mal" ? "!" : "·";
    if (txt) li.querySelector("span:last-child").textContent = txt;
  }

  $("#btnPublicar").addEventListener("click", () => {
    if (!GIT.conectado()) { dialogoConexion(); return; }

    const sinWa = String(D.config.whatsapp || "").replace(/\D/g, "").length < 10;
    const sinPrecio = D.productos.filter((p) => !p.precio);
    const problemas = [];
    if (sinWa) problemas.push("El WhatsApp está vacío o incompleto: el checkout no va a poder enviar pedidos.");
    if (sinPrecio.length) problemas.push(sinPrecio.length + " pieza" + (sinPrecio.length === 1 ? "" : "s") + " sin precio.");

    const d = GIT.datos();

    abrir(
      cabecera("Publicar cambios") +
      '<div class="dlg__cuerpo" id="pubCuerpo">' +
        (problemas.length
          ? '<div class="aviso"><strong>Revisá esto antes:</strong><br>' + problemas.map(esc).join("<br>") + "</div>"
          : "") +
        '<p class="prosa">Se sube el catálogo y la configuración a <code>' +
          esc(d.owner + "/" + d.repo) + "</code>. La tienda se actualiza cerca de un minuto después.</p>" +
        '<ul class="progreso">' +
          pasoHTML("pasoProd", "Subir el catálogo") +
          pasoHTML("pasoCfg", "Subir la configuración") +
          pasoHTML("pasoDeploy", "Esperar a que la tienda se publique") +
        "</ul>" +
      "</div>" +
      '<div class="dlg__pie">' +
        '<button class="btn btn--quiet" data-cerrar="1" id="pubCerrar">Cancelar</button>' +
        '<button class="btn" id="pubOk" data-foco>Publicar</button>' +
      "</div>",

      (dlg) => {
        $("#pubOk", dlg).addEventListener("click", async () => {
          const btn = $("#pubOk", dlg);
          btn.disabled = true;
          btn.textContent = "Publicando…";
          $("#pubCerrar", dlg).textContent = "Cerrar";

          const sello = new Date().toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });

          try {
            marcarPaso(dlg, "pasoProd", "haciendo");
            await GIT.escribirTexto("js/products.js", armarProductos(),
              "Actualizar el catálogo desde el panel (" + sello + ")");
            marcarPaso(dlg, "pasoProd", "listo");

            marcarPaso(dlg, "pasoCfg", "haciendo");
            await GIT.escribirTexto("js/config.js", armarConfig(),
              "Actualizar la configuración desde el panel (" + sello + ")");
            marcarPaso(dlg, "pasoCfg", "listo");
          } catch (e) {
            marcarPaso(dlg, $("#pasoProd", dlg).dataset.est === "listo" ? "pasoCfg" : "pasoProd", "mal", e.message);
            btn.disabled = false;
            btn.textContent = "Reintentar";
            return;
          }

          /* Los cambios ya están en GitHub: el borrador deja de estar sucio. */
          sucio = false;
          try { localStorage.removeItem(CLAVE); } catch (e) {}
          pintarEstado();

          marcarPaso(dlg, "pasoDeploy", "haciendo", "Esperando a que la tienda se publique…");
          const listo = await esperarPublicacion(dlg);

          if (listo === true) {
            marcarPaso(dlg, "pasoDeploy", "listo", "Tienda actualizada");
            btn.textContent = "Listo";
            aviso("Cambios publicados");
          } else if (listo === false) {
            marcarPaso(dlg, "pasoDeploy", "mal",
              "La publicación falló. Los archivos se subieron igual: revisá Actions en GitHub.");
            btn.textContent = "Listo";
          } else {
            marcarPaso(dlg, "pasoDeploy", "listo",
              "Archivos subidos. La tienda termina de publicarse en un minuto.");
            btn.textContent = "Listo";
          }
          btn.disabled = false;
          btn.onclick = cerrar;
        });
      }, true);
  });

  /* Sigue el estado del workflow hasta que termina o se agota la espera. */
  async function esperarPublicacion(dlg) {
    const limite = Date.now() + 150000;   /* dos minutos y medio */
    await new Promise((r) => setTimeout(r, 4000));

    while (Date.now() < limite) {
      const r = await GIT.ultimaPublicacion();
      if (r && r.estado === "completed") return r.resultado === "success";
      if (r && r.estado === "in_progress") {
        marcarPaso(dlg, "pasoDeploy", "haciendo", "Publicando la tienda…");
      }
      await new Promise((r2) => setTimeout(r2, 5000));
    }
    return null;   /* tardó más de la cuenta: no es un error */
  }

  /* ============================================================
     ARRANQUE
     ============================================================ */

  function pintarTodo() {
    pintarCategorias();
    pintarProductos();
    pintarTienda();
    pintarEstado();
  }

  cargar();
  pintarTodo();
  pintarConexion();
  refrescarFotos();
})();
