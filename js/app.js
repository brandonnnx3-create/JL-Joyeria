/* ============================================================
   ROMERO JOYERÍA — LÓGICA DEL SITIO
   Catálogo, carrito y checkout por WhatsApp.
   No hace falta tocar este archivo para cargar productos:
   eso se hace en js/products.js
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Utilidades ---------- */

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const money = (n) =>
    CONFIG.moneda + new Intl.NumberFormat(CONFIG.localeMoneda, {
      maximumFractionDigits: 0,
    }).format(n);

  /* Escapa texto antes de meterlo en el HTML. Todo lo que escribe
     el cliente pasa por acá. */
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);

  /* Colores aproximados de cada piedra, para los puntitos de la ficha. */
  const STONE_HEX = {
    "Cristal": "#E6E9EC", "Blanco": "#F2F0EC", "Rosa": "#E38FB0",
    "Azul": "#2B4C9B", "Turquesa": "#2BA6B5", "Verde": "#1F7A4C",
    "Violeta": "#7A4BA8", "Granate": "#8E1D2B", "Negro": "#15161A",
    "Ámbar": "#C98A2E", "Dorado": "#C9A227",
  };

  const IVA_NOTE = "Los precios pueden cambiar sin aviso previo.";

  /* ---------- Estado ---------- */

  const STORE_KEY = "rj_carrito_v1";
  let cart = [];
  let activeCat = "todos";
  let lastFocus = null;

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      /* Descartamos ítems de productos que ya no existen en el catálogo. */
      cart = Array.isArray(parsed)
        ? parsed.filter((i) => i && PRODUCTOS.some((p) => p.id === i.id))
        : [];
    } catch (e) {
      cart = [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(cart));
    } catch (e) {
      /* Modo incógnito o almacenamiento bloqueado: el carrito sigue
         funcionando en memoria hasta que se cierre la pestaña. */
    }
  }

  const findProduct = (id) => PRODUCTOS.find((p) => p.id === id);

  const lineKey = (id, piedra) => id + "::" + (piedra || "");

  function addToCart(id, piedra, qty) {
    const key = lineKey(id, piedra);
    const found = cart.find((i) => lineKey(i.id, i.piedra) === key);
    if (found) found.qty += qty || 1;
    else cart.push({ id: id, piedra: piedra || "", qty: qty || 1 });
    saveCart();
    renderCartCount();
  }

  function setQty(key, delta) {
    const item = cart.find((i) => lineKey(i.id, i.piedra) === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty < 1) cart = cart.filter((i) => i !== item);
    saveCart();
    renderCartCount();
    renderCartPanel();
  }

  function removeLine(key) {
    cart = cart.filter((i) => lineKey(i.id, i.piedra) !== key);
    saveCart();
    renderCartCount();
    renderCartPanel();
  }

  const cartCount = () => cart.reduce((n, i) => n + i.qty, 0);

  const subtotal = () =>
    cart.reduce((n, i) => {
      const p = findProduct(i.id);
      return n + (p ? p.precio * i.qty : 0);
    }, 0);

  function shippingCost(metodo) {
    if (metodo === "retiro") return 0;
    const sub = subtotal();
    if (CONFIG.envioGratisDesde > 0 && sub >= CONFIG.envioGratisDesde) return 0;
    return CONFIG.costoEnvio;
  }

  /* ---------- Capa de paneles ---------- */

  const layer = $("#layer");

  function openLayer(html, onMount) {
    lastFocus = document.activeElement;
    layer.innerHTML =
      '<div class="scrim" data-close="1"></div><aside class="panel" role="dialog" aria-modal="true">' +
      html + "</aside>";
    document.body.classList.add("no-scroll");
    const panel = $(".panel", layer);
    if (onMount) onMount(panel);
    const first = $("[data-autofocus]", panel) || $(".panel__head button", panel);
    if (first) first.focus();
  }

  function closeLayer() {
    layer.innerHTML = "";
    document.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeLayer();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && layer.innerHTML) closeLayer();
  });

  const headHTML = (title) =>
    '<div class="panel__head"><h2 class="panel__title">' + esc(title) + "</h2>" +
    '<button class="icon-btn" data-close="1" aria-label="Cerrar">' +
    '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
    "</button></div>";

  /* ============================================================
     CATÁLOGO
     ============================================================ */

  function countIn(catId) {
    return catId === "todos"
      ? PRODUCTOS.length
      : PRODUCTOS.filter((p) => p.categoria === catId).length;
  }

  function renderCatbar() {
    const bar = $("#catbar");
    bar.innerHTML = CATEGORIAS.filter((c) => countIn(c.id) > 0)
      .map((c) =>
        '<button class="cat" role="tab" data-cat="' + c.id + '" aria-selected="' +
        (c.id === activeCat) + '">' + esc(c.nombre) +
        '<span class="cat__n">' + countIn(c.id) + "</span></button>"
      ).join("");

    const list = $("#footerCats");
    if (list) {
      list.innerHTML = CATEGORIAS.filter((c) => c.id !== "todos" && countIn(c.id) > 0)
        .map((c) => '<li><a href="#catalogo" data-cat="' + c.id + '">' + esc(c.nombre) + "</a></li>")
        .join("");
    }
  }

  function stoneDots(p) {
    const list = p.piedras || [];
    if (!list.length) return "";
    const shown = list.slice(0, 6);
    const rest = list.length - shown.length;
    return '<div class="card__stones">' +
      shown.map((s) =>
        '<span class="dot" style="background:' + (STONE_HEX[s] || "#555") +
        '" title="' + esc(s) + '"></span>'
      ).join("") +
      (rest > 0 ? '<span class="dot--more">+' + rest + "</span>" : "") +
      "</div>";
  }

  function cardHTML(p, i) {
    const cat = CATEGORIAS.find((c) => c.id === p.categoria);
    return (
      '<button class="card" data-product="' + p.id + '" style="--i:' + (i % 8) + '"' +
      ' aria-label="Ver ' + esc(p.nombre) + '">' +
      '<div class="card__media">' +
        '<img src="' + p.img + '" alt="' + esc(p.nombre) + '" loading="lazy" width="760" height="1351">' +
        (p.destacado ? '<span class="card__flag">Destacado</span>' : "") +
        '<span class="card__view">Ver pieza</span>' +
      "</div>" +
      '<div class="card__body">' +
        '<span class="card__meta">' + esc(cat ? cat.nombre : p.categoria) + "</span>" +
        '<span class="card__name">' + esc(p.nombre) + "</span>" +
        '<span class="card__price">' + money(p.precio) + "</span>" +
        stoneDots(p) +
      "</div></button>"
    );
  }

  function renderGrid() {
    const items = activeCat === "todos"
      ? PRODUCTOS
      : PRODUCTOS.filter((p) => p.categoria === activeCat);

    const cat = CATEGORIAS.find((c) => c.id === activeCat) || CATEGORIAS[0];
    $("#catTitle").textContent = cat.nombre;
    $("#catDesc").textContent = cat.desc;
    $("#catEyebrow").textContent =
      items.length + (items.length === 1 ? " pieza" : " piezas");

    $("#grid").innerHTML = items.length
      ? items.map(cardHTML).join("")
      : '<p class="empty">Todavía no hay piezas en esta categoría.</p>';

    revealCards();
  }

  function selectCat(id) {
    activeCat = id;
    $$(".cat").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.cat === id)));
    renderGrid();
  }

  /* ============================================================
     FICHA DE PRODUCTO
     ============================================================ */

  function openProduct(id) {
    const p = findProduct(id);
    if (!p) return;

    const stones = p.piedras || [];
    const piezas = p.piezas || [];

    const html = headHTML(p.nombre) +
      '<div class="panel__body">' +
        '<img class="detail__img" src="' + p.img + '" alt="' + esc(p.nombre) + '" width="760" height="1351">' +
        '<p class="eyebrow">' + esc((CATEGORIAS.find((c) => c.id === p.categoria) || {}).nombre || "") + "</p>" +
        '<h3 class="detail__name">' + esc(p.nombre) + "</h3>" +
        '<p class="detail__price">' + money(p.precio) + "</p>" +
        '<p class="detail__desc">' + esc(p.desc) + "</p>" +
        '<dl class="detail__spec"><dt>Material</dt><dd>' + esc(p.material) + "</dd></dl>" +
        (piezas.length
          ? '<dl class="detail__spec"><dt>Incluye</dt><dd>' + esc(piezas.join(" · ")) + "</dd></dl>"
          : "") +
        (stones.length
          ? '<div class="field"><span class="field__label" id="lblPiedra">Color de piedra</span>' +
            '<div class="chips" role="group" aria-labelledby="lblPiedra">' +
            stones.map((s, i) =>
              '<button type="button" class="chip" data-stone="' + esc(s) + '" aria-pressed="' + (i === 0) + '">' +
              '<span class="dot" style="background:' + (STONE_HEX[s] || "#555") + '"></span>' + esc(s) +
              "</button>"
            ).join("") + "</div></div>"
          : "") +
        '<p class="note">' + esc(IVA_NOTE) + "</p>" +
      "</div>" +
      '<div class="panel__foot">' +
        '<button class="btn btn--block" id="addBtn" data-autofocus>Agregar al carrito</button>' +
      "</div>";

    openLayer(html, (panel) => {
      let chosen = stones.length ? stones[0] : "";

      $$(".chip", panel).forEach((chip) => {
        chip.addEventListener("click", () => {
          chosen = chip.dataset.stone;
          $$(".chip", panel).forEach((c) =>
            c.setAttribute("aria-pressed", String(c === chip)));
        });
      });

      $("#addBtn", panel).addEventListener("click", () => {
        addToCart(p.id, chosen, 1);
        openCart();
      });
    });
  }

  /* ============================================================
     CARRITO
     ============================================================ */

  let lastCount = 0;

  function renderCartCount() {
    const n = cartCount();
    const el = $("#cartCount");
    el.textContent = n;
    el.setAttribute("data-empty", String(n === 0));

    if (n > lastCount) {
      const btn = $("#openCart");
      btn.classList.remove("bump");
      void btn.offsetWidth;          /* reinicia la animación */
      btn.classList.add("bump");
    }
    lastCount = n;
  }

  function cartLinesHTML() {
    if (!cart.length) {
      return '<p class="empty">Tu carrito está vacío.<br><br>' +
             '<button class="btn btn--ghost" data-close="1">Ver la colección</button></p>';
    }
    return cart.map((i) => {
      const p = findProduct(i.id);
      if (!p) return "";
      const key = lineKey(i.id, i.piedra);
      return '<div class="line">' +
        '<img class="line__img" src="' + p.img + '" alt="" width="760" height="1351">' +
        "<div>" +
          '<div class="line__name">' + esc(p.nombre) + "</div>" +
          (i.piedra ? '<div class="line__opt">' + esc(i.piedra) + "</div>" : "") +
          '<div class="line__row">' +
            '<span class="qty">' +
              '<button type="button" data-qty="-1" data-key="' + esc(key) + '" aria-label="Quitar una unidad">−</button>' +
              "<span>" + i.qty + "</span>" +
              '<button type="button" data-qty="1" data-key="' + esc(key) + '" aria-label="Agregar una unidad">+</button>' +
            "</span>" +
            '<span class="line__price">' + money(p.precio * i.qty) + "</span>" +
          "</div>" +
          '<div class="line__row">' +
            '<button type="button" class="link-btn" data-remove="' + esc(key) + '">Quitar</button>' +
          "</div>" +
        "</div></div>";
    }).join("");
  }

  function cartFootHTML() {
    if (!cart.length) return "";
    const sub = subtotal();
    const falta = CONFIG.envioGratisDesde - sub;
    return '<div class="totals">' +
        '<div class="totals__row"><span>Subtotal</span><span>' + money(sub) + "</span></div>" +
        '<div class="totals__row"><span>Envío</span><span>Se calcula en el checkout</span></div>' +
        '<div class="totals__row totals__row--big"><span>Total</span><strong>' + money(sub) + "</strong></div>" +
      "</div>" +
      (CONFIG.envioGratisDesde > 0 && falta > 0
        ? '<p class="note">Te faltan ' + money(falta) + " para el envío gratis.</p>"
        : "") +
      '<button class="btn btn--block" id="toCheckout">Finalizar compra</button>';
  }

  function renderCartPanel() {
    const panel = $(".panel", layer);
    if (!panel || !panel.dataset.cart) return;
    $(".panel__body", panel).innerHTML = cartLinesHTML();
    $(".panel__foot", panel).innerHTML = cartFootHTML();
  }

  function openCart() {
    const html = headHTML("Tu carrito") +
      '<div class="panel__body">' + cartLinesHTML() + "</div>" +
      '<div class="panel__foot">' + cartFootHTML() + "</div>";

    openLayer(html, (panel) => {
      panel.dataset.cart = "1";

      panel.addEventListener("click", (e) => {
        const q = e.target.closest("[data-qty]");
        if (q) { setQty(q.dataset.key, Number(q.dataset.qty)); return; }

        const r = e.target.closest("[data-remove]");
        if (r) { removeLine(r.dataset.remove); return; }

        if (e.target.closest("#toCheckout")) openCheckout();
      });
    });
  }

  /* ============================================================
     CHECKOUT
     ============================================================ */

  const order = {
    nombre: "", telefono: "", email: "",
    entrega: "envio", direccion: "", localidad: "", cp: "",
    pago: "transferencia", notas: "",
  };

  function stepsHTML(step) {
    const labels = ["Tus datos", "Entrega", "Confirmar"];
    return '<div class="steps">' + labels.map((l, i) => {
      const n = i + 1;
      const state = n === step ? "active" : n < step ? "done" : "todo";
      return '<div class="steps__item" data-state="' + state + '">' + n + ". " + l + "</div>";
    }).join("") + "</div>";
  }

  function fieldHTML(id, label, attrs, value) {
    return '<div class="field"><label class="field__label" for="' + id + '">' + label + "</label>" +
      '<input class="input" id="' + id + '" value="' + esc(value || "") + '" ' + attrs + ">" +
      '<span class="error" id="err_' + id + '" hidden></span></div>';
  }

  /* --- Paso 1: datos del cliente --- */
  function stepDatos() {
    const body = stepsHTML(1) +
      fieldHTML("f_nombre", "Nombre y apellido", 'autocomplete="name" placeholder="Ana García" data-autofocus', order.nombre) +
      fieldHTML("f_tel", "Teléfono / WhatsApp", 'autocomplete="tel" inputmode="tel" placeholder="11 2345 6789"', order.telefono) +
      fieldHTML("f_email", "Email (opcional)", 'type="email" autocomplete="email" placeholder="ana@email.com"', order.email);

    setPanel("Finalizar compra", body,
      '<button class="btn btn--block" id="next1">Continuar</button>',
      (panel) => {
        $("#next1", panel).addEventListener("click", () => {
          order.nombre = $("#f_nombre", panel).value.trim();
          order.telefono = $("#f_tel", panel).value.trim();
          order.email = $("#f_email", panel).value.trim();

          let ok = true;
          ok = check(panel, "f_nombre", order.nombre.length >= 3,
            "Escribí tu nombre y apellido.") && ok;
          ok = check(panel, "f_tel", order.telefono.replace(/\D/g, "").length >= 8,
            "Escribí un teléfono de al menos 8 números.") && ok;
          ok = check(panel, "f_email",
            !order.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email),
            "Revisá el email: falta el @ o el punto.") && ok;

          if (ok) stepEntrega();
        });
      });
  }

  /* --- Paso 2: entrega y pago --- */
  function stepEntrega() {
    const envioTxt = CONFIG.envioGratisDesde > 0 && subtotal() >= CONFIG.envioGratisDesde
      ? "Gratis por superar " + money(CONFIG.envioGratisDesde)
      : money(CONFIG.costoEnvio);

    const body = stepsHTML(2) +
      '<div class="field"><span class="field__label">¿Cómo lo recibís?</span>' +
        '<div class="radio-set">' +
          radio("entrega", "envio", "Envío por correo", envioTxt, order.entrega === "envio") +
          radio("entrega", "retiro", "Retiro en persona", CONFIG.puntoRetiro, order.entrega === "retiro") +
        "</div></div>" +
      '<div id="envioBox"' + (order.entrega === "retiro" ? " hidden" : "") + ">" +
        fieldHTML("f_dir", "Dirección y número", 'autocomplete="street-address" placeholder="Av. Siempreviva 742"', order.direccion) +
        fieldHTML("f_loc", "Localidad y provincia", 'autocomplete="address-level2" placeholder="Quilmes, Buenos Aires"', order.localidad) +
        fieldHTML("f_cp", "Código postal", 'autocomplete="postal-code" inputmode="numeric" placeholder="1878"', order.cp) +
      "</div>" +
      '<div class="field"><span class="field__label">¿Cómo pagás?</span>' +
        '<div class="radio-set">' +
          radio("pago", "transferencia", "Transferencia bancaria", "Te pasamos el CBU por WhatsApp", order.pago === "transferencia") +
          radio("pago", "efectivo", "Efectivo", "Al recibir o al retirar", order.pago === "efectivo") +
        "</div></div>" +
      '<div class="field"><label class="field__label" for="f_notas">Aclaraciones (opcional)</label>' +
        '<textarea class="textarea" id="f_notas" placeholder="Talle del anillo, horario de entrega, si es para regalo...">' +
        esc(order.notas) + "</textarea></div>";

    setPanel("Entrega y pago", body,
      '<button class="btn btn--block" id="next2">Revisar el pedido</button>' +
      '<button class="btn btn--ghost btn--block" id="back2" style="margin-top:8px">Volver</button>',
      (panel) => {
        $$('input[name="entrega"]', panel).forEach((r) => {
          r.addEventListener("change", () => {
            order.entrega = r.value;
            $("#envioBox", panel).hidden = r.value === "retiro";
          });
        });

        $("#back2", panel).addEventListener("click", stepDatos);

        $("#next2", panel).addEventListener("click", () => {
          const sel = $('input[name="pago"]:checked', panel);
          order.pago = sel ? sel.value : "transferencia";
          order.notas = $("#f_notas", panel).value.trim();

          if (order.entrega === "envio") {
            order.direccion = $("#f_dir", panel).value.trim();
            order.localidad = $("#f_loc", panel).value.trim();
            order.cp = $("#f_cp", panel).value.trim();

            let ok = true;
            ok = check(panel, "f_dir", order.direccion.length >= 5,
              "Escribí la calle y el número.") && ok;
            ok = check(panel, "f_loc", order.localidad.length >= 3,
              "Escribí la localidad y la provincia.") && ok;
            ok = check(panel, "f_cp", /^\d{4}$/.test(order.cp.replace(/\D/g, "")),
              "El código postal tiene 4 números.") && ok;
            if (!ok) return;
          }
          stepConfirmar();
        });
      });
  }

  /* --- Paso 3: confirmar y enviar --- */
  function stepConfirmar() {
    const sub = subtotal();
    const envio = shippingCost(order.entrega);
    const total = sub + envio;

    const rows = cart.map((i) => {
      const p = findProduct(i.id);
      if (!p) return "";
      return '<div class="review__row"><span>' + esc(p.nombre) +
        (i.piedra ? " · " + esc(i.piedra) : "") + " × " + i.qty +
        "</span><span>" + money(p.precio * i.qty) + "</span></div>";
    }).join("");

    const entregaTxt = order.entrega === "retiro"
      ? "Retiro en persona"
      : esc(order.direccion) + ", " + esc(order.localidad) + " (CP " + esc(order.cp) + ")";

    const body = stepsHTML(3) +
      '<div class="review"><p class="review__h">Tu pedido</p>' + rows +
        '<div class="review__row" style="border-top:1px solid var(--line);margin-top:8px;padding-top:8px">' +
          "<span>Subtotal</span><span>" + money(sub) + "</span></div>" +
        '<div class="review__row"><span>Envío</span><span>' +
          (envio === 0 ? "Sin cargo" : money(envio)) + "</span></div>" +
        '<div class="review__row" style="font-size:1rem"><span>Total</span><span style="color:var(--gold)">' +
          money(total) + "</span></div>" +
      "</div>" +
      '<div class="review"><p class="review__h">Tus datos</p>' +
        row("Nombre", order.nombre) +
        row("Teléfono", order.telefono) +
        (order.email ? row("Email", order.email) : "") +
        row("Entrega", entregaTxt, true) +
        row("Pago", order.pago === "efectivo" ? "Efectivo" : "Transferencia bancaria") +
        (order.notas ? row("Notas", order.notas) : "") +
      "</div>" +
      '<p class="note">Al enviar el pedido se abre WhatsApp con el detalle ya escrito. ' +
      "Ahí confirmamos stock, talle y la forma de pago. Todavía no estás pagando nada.</p>";

    setPanel("Confirmar pedido", body,
      '<button class="btn btn--block" id="send">Enviar pedido por WhatsApp</button>' +
      '<button class="btn btn--ghost btn--block" id="back3" style="margin-top:8px">Volver</button>',
      (panel) => {
        $("#back3", panel).addEventListener("click", stepEntrega);
        $("#send", panel).addEventListener("click", () => sendOrder(total, envio));
      });
  }

  function row(k, v, raw) {
    return '<div class="review__row"><span>' + esc(k) + "</span><span>" +
      (raw ? v : esc(v)) + "</span></div>";
  }

  function radio(name, value, title, sub, checked) {
    return '<label class="radio"><input type="radio" name="' + name + '" value="' + value + '"' +
      (checked ? " checked" : "") + "><span>" +
      '<span class="radio__title">' + esc(title) + "</span>" +
      '<span class="radio__sub">' + esc(sub) + "</span></span></label>";
  }

  function check(panel, id, valid, msg) {
    const input = $("#" + id, panel);
    const err = $("#err_" + id, panel);
    if (!input) return true;
    input.setAttribute("aria-invalid", String(!valid));
    if (err) { err.textContent = valid ? "" : msg; err.hidden = valid; }
    return valid;
  }

  function setPanel(title, body, foot, onMount) {
    const panel = $(".panel", layer);
    if (!panel) return;
    delete panel.dataset.cart;
    panel.innerHTML = headHTML(title) +
      '<div class="panel__body">' + body + "</div>" +
      '<div class="panel__foot">' + foot + "</div>";
    if (onMount) onMount(panel);
    const first = $("[data-autofocus]", panel);
    if (first) first.focus();
    $(".panel__body", panel).scrollTop = 0;
  }

  /* --- Armado del mensaje y salto a WhatsApp --- */

  function buildMessage(total, envio) {
    const L = [];
    L.push("*Nuevo pedido — " + CONFIG.marca + "*");
    L.push("");
    L.push("*Pedido:*");
    cart.forEach((i) => {
      const p = findProduct(i.id);
      if (!p) return;
      L.push("• " + p.nombre + (i.piedra ? " (" + i.piedra + ")" : "") +
             " × " + i.qty + " — " + money(p.precio * i.qty));
    });
    L.push("");
    L.push("Subtotal: " + money(subtotal()));
    L.push("Envío: " + (envio === 0 ? "sin cargo" : money(envio)));
    L.push("*Total: " + money(total) + "*");
    L.push("");
    L.push("*Mis datos:*");
    L.push("Nombre: " + order.nombre);
    L.push("Teléfono: " + order.telefono);
    if (order.email) L.push("Email: " + order.email);
    L.push("");
    if (order.entrega === "retiro") {
      L.push("*Entrega:* retiro en persona");
    } else {
      L.push("*Envío a:*");
      L.push(order.direccion);
      L.push(order.localidad + " (CP " + order.cp + ")");
    }
    L.push("*Pago:* " + (order.pago === "efectivo" ? "Efectivo" : "Transferencia bancaria"));
    if (order.notas) { L.push(""); L.push("*Aclaraciones:* " + order.notas); }
    return L.join("\n");
  }

  function sendOrder(total, envio) {
    const msg = buildMessage(total, envio);
    const numero = String(CONFIG.whatsapp || "").replace(/\D/g, "");
    const configurado = numero.length >= 8;

    /* Si el número todavía no se configuró, no mandamos al cliente a un
       WhatsApp inexistente: le mostramos el pedido para que lo copie. */
    const aviso = configurado ? "" :
      '<div class="warnbox"><strong>Falta configurar el WhatsApp de la tienda.</strong><br>' +
      "El pedido está listo pero no hay número cargado. Copialo y mandalo por el medio que prefieras. " +
      "Si sos quien administra el sitio: cargá tu número en <code>js/config.js</code>.</div>";

    const body = '<div class="done">' +
      '<div class="done__mark" aria-hidden="true">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m5 13 4 4L19 7"/></svg>' +
      "</div>" +
      '<h3 class="done__title">Pedido listo</h3>' +
      '<p class="done__text">' +
        (configurado
          ? "Se abrió WhatsApp con el detalle. Si no se abrió solo, tocá el botón de abajo."
          : "Tu pedido quedó armado.") +
      "</p>" + aviso +
      '<div class="review" style="text-align:left"><p class="review__h">Detalle</p>' +
        '<pre style="white-space:pre-wrap;font-family:inherit;font-size:.82rem;color:var(--muted);margin:0">' +
        esc(msg) + "</pre></div>" +
      "</div>";

    const foot = (configurado
        ? '<a class="btn btn--block" id="waLink" href="https://wa.me/' + numero +
          "?text=" + encodeURIComponent(msg) + '" target="_blank" rel="noopener">Abrir WhatsApp</a>'
        : '<button class="btn btn--block" id="copyBtn">Copiar el pedido</button>') +
      '<button class="btn btn--ghost btn--block" id="closeDone" style="margin-top:8px">Cerrar</button>';

    setPanel("Pedido enviado", body, foot, (panel) => {
      $("#closeDone", panel).addEventListener("click", () => {
        cart = [];
        saveCart();
        renderCartCount();
        closeLayer();
      });

      const copy = $("#copyBtn", panel);
      if (copy) {
        copy.addEventListener("click", () => {
          const done = () => { copy.textContent = "¡Copiado!"; };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(msg).then(done, () => {
              copy.textContent = "Copialo a mano desde el detalle";
            });
          } else {
            copy.textContent = "Copialo a mano desde el detalle";
          }
        });
      }

      if (configurado) window.open($("#waLink", panel).href, "_blank", "noopener");
    });
  }

  function openCheckout() {
    if (!cart.length) return;
    stepDatos();
  }

  /* ============================================================
     ARRANQUE
     ============================================================ */

  function renderFooter() {
    const list = $("#footerContact");
    const items = [];
    if (CONFIG.instagram) {
      items.push('<li><a href="https://instagram.com/' + esc(CONFIG.instagram) +
        '" target="_blank" rel="noopener">@' + esc(CONFIG.instagram) + "</a></li>");
    }
    if (CONFIG.email) {
      items.push('<li><a href="mailto:' + esc(CONFIG.email) + '">' + esc(CONFIG.email) + "</a></li>");
    }
    const num = String(CONFIG.whatsapp || "").replace(/\D/g, "");
    if (num.length >= 8) {
      items.push('<li><a href="https://wa.me/' + num + '" target="_blank" rel="noopener">WhatsApp</a></li>');
    }
    if (CONFIG.ciudad) items.push("<li>" + esc(CONFIG.ciudad) + "</li>");
    list.innerHTML = items.join("") || "<li>Escribinos por WhatsApp</li>";

    $("#footerCopy").textContent = "© " + new Date().getFullYear() + " " + CONFIG.marca;
  }

  document.addEventListener("click", (e) => {
    const card = e.target.closest("[data-product]");
    if (card) { openProduct(card.dataset.product); return; }

    const cat = e.target.closest("[data-cat]");
    if (cat) {
      selectCat(cat.dataset.cat);
      document.getElementById("catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const goto = e.target.closest("[data-goto]");
    if (goto) {
      document.getElementById(goto.dataset.goto).scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (e.target.closest("#openCart")) openCart();
  });


  /* ============================================================
     MOVIMIENTO
     Apariciones al hacer scroll, desplazamiento suave de las
     fotos, cinta de texto y barra de progreso.

     Todo esto es decorativo: si el navegador no soporta algo,
     o el sistema pide menos animación, el contenido igual se ve.
     ============================================================ */

  const quieto = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* La clase .js habilita los estados de entrada en el CSS. Se agrega
     desde acá para que, sin JavaScript, nada quede invisible. */
  if (!quieto) document.documentElement.classList.add("js");

  /* --- Apariciones --- */

  let verObs = null;

  if (!quieto && "IntersectionObserver" in window) {
    verObs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        verObs.unobserve(e.target);           /* una sola vez */
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    $$(".reveal").forEach((el) => verObs.observe(el));
  }

  function revealCards() {
    const cards = $$("#grid .card");
    if (!verObs) { cards.forEach((c) => c.classList.add("in")); return; }
    cards.forEach((c) => verObs.observe(c));
  }

  /* --- Desplazamiento suave de las fotos ---
     Cada foto se mueve un poco más lento que la página. El recorte
     lo absorbe el alto extra que las imágenes tienen en el CSS. */

  const capas = $$("[data-par]");
  let tic = false;

  function moverCapas() {
    const vh = window.innerHeight;
    capas.forEach((capa) => {
      const img = capa.querySelector("img");
      if (!img) return;
      const r = capa.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) return;

      /* -1 cuando la foto entra por abajo, +1 cuando sale por arriba. */
      const centro = r.top + r.height / 2 - vh / 2;
      const rango = (vh + r.height) / 2;
      let p = centro / rango;
      p = p < -1 ? -1 : p > 1 ? 1 : p;

      const amp = parseFloat(capa.dataset.par) || 0.07;
      img.style.transform =
        "translate3d(0," + (-amp * 100 + p * amp * 100).toFixed(2) + "%,0)";
    });
    tic = false;
  }

  /* --- Header, progreso y botón de volver arriba --- */

  const header = $("#header");
  const barra = $("#progress");
  const arriba = $("#toTop");

  function alScrollear() {
    const y = window.pageYOffset || document.documentElement.scrollTop;

    if (header) header.classList.toggle("is-stuck", y > 12);

    if (barra) {
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.transform = "scaleX(" + (alto > 0 ? Math.min(y / alto, 1) : 0) + ")";
    }

    if (arriba) {
      const visible = y > 700;
      if (visible && arriba.hidden) arriba.hidden = false;
      arriba.classList.toggle("show", visible);
    }

    if (!quieto && !tic) { tic = true; requestAnimationFrame(moverCapas); }
  }

  window.addEventListener("scroll", alScrollear, { passive: true });
  window.addEventListener("resize", alScrollear, { passive: true });

  if (arriba) {
    arriba.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" });
    });
  }

  /* --- Cinta deslizante ---
     El contenido se escribe dos veces seguidas: cuando la animación
     llegó a la mitad, la segunda copia está exactamente donde estaba
     la primera, así el bucle no tiene corte. */

  const FRASES = [
    "Calidad y elegancia en cada detalle",
    "Plata 925 de ley",
    "Envíos a todo el país",
    "Revisada una por una",
    "El lujo está en los detalles",
  ];

  const cinta = $("#ticker");
  if (cinta) {
    const bloque = FRASES.map(
      (f) => '<span class="ticker__item">' + esc(f) + "</span>"
    ).join("");
    cinta.innerHTML = bloque + bloque;
  }

  alScrollear();

  loadCart();
  renderCatbar();
  renderGrid();
  renderCartCount();
  renderFooter();
})();
