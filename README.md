# Romero Joyería — sitio web

Catálogo online con carrito y checkout que termina en un pedido por WhatsApp.
Es un sitio estático: HTML, CSS y JavaScript, sin dependencias ni compilación.
Se abre con doble clic en `index.html` y se publica en cualquier hosting.

---

## ⚠️ Antes de publicarlo: tres cosas pendientes

### 1. Cargar tu número de WhatsApp

Sin esto el checkout no puede enviar nada. Abrí `js/config.js` y cambiá:

```js
whatsapp: "PONE_TU_NUMERO",
```

por tu número en formato internacional, **solo números**: sin `+`, sin espacios,
sin guiones y **sin el 15**.

| Tu número            | Va así            |
|----------------------|-------------------|
| Buenos Aires 11 2345-6789 | `"5491123456789"` |
| Córdoba 351 234-5678      | `"5493512345678"` |
| Rosario 341 234-5678      | `"5493412345678"` |

La fórmula es `54` + `9` + característica sin el 0 + número sin el 15.

Mientras el número no esté cargado, el checkout no rompe: arma el pedido igual y
le ofrece al cliente copiarlo, con un aviso de que falta configurar la tienda.

### 2. Reemplazar los precios

**Todos los precios del catálogo son de ejemplo.** Los puse para que el sitio
funcione y se pueda ver completo, pero no salieron de ningún lado: no conozco tus
costos ni tus márgenes. Están en `js/products.js`, en el campo `precio` de cada
producto. Son números enteros, sin puntos ni símbolo:

```js
precio: 18500,     // se muestra como $18.500
```

### 3. Revisar los nombres y descripciones

Inventé los nombres de línea (Aura, Quadra, Marquise, Sello) y las descripciones
a partir de lo que se ve en las fotos. Revisalos: yo no sé si el aro es a presión
o a rosca, si la cadena mide 45 cm, ni de qué material es realmente el baño.

---

## El logo

El logo está en `img/logo.png`, recortado en círculo con fondo transparente
para que se apoye sobre el negro del sitio sin recuadro. De ahí salen también
`img/favicon-32.png` (el ícono de la pestaña) y `img/icono-180.png` (el ícono
al agregar el sitio a la pantalla de inicio en el celular).

Los dorados del sitio (`--gold`, `--gold-lt`, `--gold-dim` en `css/styles.css`)
se ajustaron a los tonos del propio logo, que son más cálidos que un dorado
estándar.

**El archivo original mide 162 × 176 px.** Alcanza para el header y los íconos,
pero es poco para usarlo en grande: una portada, un banner o una impresión. Si
tenés el archivo original del diseñador (`.ai`, `.svg`, `.pdf` o un PNG grande),
reemplazalo y queda mejor en todos lados.

---

## Las secciones destacadas de la portada

Entre el hero y el catálogo hay tres bloques numerados (01, 02, 03) que
presentan sets, cadenas y anillos con foto grande, texto y un botón que lleva
al catálogo ya filtrado. Están escritos a mano en `index.html`, dentro de
`<section class="stories">`.

Para cambiar uno, editá su `<article class="story">`: la foto (`story__media`),
el título (podés poner una parte en itálica dorada con `<em>`), el texto y los
números de `story__facts`. **Esos números no se calculan solos:** si agregás
sets al catálogo, actualizá el "10" a mano.

El bloque del medio lleva además `story--flip`, que invierte foto y texto para
que la portada alterne de lado. Si agregás un cuarto bloque, ponele `reveal`
para que aparezca al hacer scroll como los otros.

Las frases de la cinta que se desliza están en `js/app.js`, en la lista
`FRASES`.

---

## Cómo editar el catálogo

Todo el catálogo vive en **`js/products.js`**. No hace falta tocar ningún otro archivo.

### Cambiar un producto

Buscá su bloque y editá lo que necesites:

```js
{
  id: "anillo-01",                          // no se repite ni se cambia
  nombre: "Anillo Aura",
  categoria: "anillos",                     // anillos | sets | dijes | cadenas | aros
  precio: 18500,
  img: "img/productos/anillo-01.jpg",
  material: "Plata 925 con terminación dorada",
  desc: "Marco circular grabado...",
  piedras: ["Cristal", "Rosa", "Granate"],  // [] si no tiene variantes de color
  destacado: true,                          // opcional: le pone la cinta "Destacado"
},
```

### Agregar un producto

1. Poné la foto en `img/productos/` (por ejemplo `anillo-11.jpg`).
2. Copiá un bloque `{ ... }` entero, pegalo abajo y cambiale los valores.
3. Asegurate de que el `id` no se repita y que `img` apunte al archivo nuevo.

### Sacar un producto

Borrá su bloque completo, desde `{` hasta `},`. Los carritos que ya tenían esa
pieza guardada la descartan solos, sin romperse.

### Agregar una categoría (por ejemplo, pulseras)

En el mismo archivo, arriba de todo, agregá la categoría a la lista:

```js
{ id: "pulseras", nombre: "Pulseras", desc: "Pulseras de plata 925" },
```

y después cargá productos con `categoria: "pulseras"`. Las categorías sin ningún
producto no se muestran, así que podés dejarla lista de antemano.

### Colores de piedra

Los puntitos de color de cada ficha salen de la lista `piedras`. Los colores
reconocidos son: Cristal, Blanco, Rosa, Azul, Turquesa, Verde, Violeta, Granate,
Negro, Ámbar, Dorado. Si escribís un color que no está en esa lista, el punto
sale gris — para agregarlo, buscá `STONE_HEX` en `js/app.js`.

---

## Envíos y datos de contacto

También en `js/config.js`:

```js
envioGratisDesde: 60000,   // desde este monto el envío es gratis (0 = nunca)
costoEnvio: 6500,          // costo de envío por correo
puntoRetiro: "Coordinamos punto de encuentro por WhatsApp",
instagram: "",             // ej: "rj.joyeria" (sin @). Vacío = no se muestra
email: "",                 // vacío = no se muestra
ciudad: "Buenos Aires, Argentina",
```

---

## Cómo funciona el checkout

1. El cliente agrega piezas al carrito (se guardan en su navegador, sobreviven al cierre de la pestaña).
2. Completa nombre y teléfono.
3. Elige envío o retiro, y transferencia o efectivo.
4. Revisa el pedido completo con el total.
5. Al confirmar se abre WhatsApp **con el mensaje ya escrito**, hacia tu número.

El cliente **no paga en el sitio**. El pedido llega a tu WhatsApp y desde ahí
coordinás stock, talle y cobro. No hay servidor, base de datos ni claves de
pasarela: nada que mantener ni que se pueda caer.

Si más adelante querés cobrar con tarjeta desde el sitio, eso sí necesita un
backend y una cuenta de Mercado Pago. Es un cambio de otro tamaño, no un ajuste.

---

## Publicarlo

**GitHub Pages** (gratis): en el repositorio, Settings → Pages → Source: rama
`main`, carpeta `/ (root)`. En un par de minutos queda en
`https://TU-USUARIO.github.io/JL-Joyeria/`.

**Netlify** (gratis, permite dominio propio): arrastrá la carpeta entera a
[app.netlify.com/drop](https://app.netlify.com/drop).

Los dos sirven el sitio por HTTPS sin configurar nada.

---

## Estructura

```
index.html              La página: hero, secciones destacadas, catálogo, pie
css/styles.css          Estilos (paleta negro y dorado) y animaciones
js/config.js            ← TU NÚMERO DE WHATSAPP Y DATOS DE CONTACTO
js/products.js          ← EL CATÁLOGO
js/app.js               Carrito, checkout y animaciones (no hace falta tocarlo)
img/logo.png            El logo, recortado en círculo
img/productos/          Las 27 fotos, renombradas por categoría
.github/workflows/      Publica el sitio solo en cada push
```

## Animaciones

El sitio anima al hacer scroll: las secciones aparecen, las fotos se desplazan
más lento que la página, las tarjetas del catálogo entran una detrás de otra y
la cinta dorada se desliza sin corte.

Dos cosas a tener en cuenta si tocás el código:

- **Nada queda invisible sin JavaScript.** La clase `js` que habilita los
  estados de entrada la agrega el propio script. Si falla, el contenido se ve.
- **Se respeta la configuración del sistema.** Si en el celular está activado
  "reducir movimiento", todo queda quieto y legible. Es una opción de
  accesibilidad para quienes sufren mareos con las animaciones.

---

## Sobre las fotos y la marca grabada en las piezas

Las 27 fotos que pasaste están en `img/productos/`, renombradas según lo que se
ve en cada una (`anillo-01.jpg`, `set-03.jpg`, etc.). Había dos archivos idénticos:
se cargó uno solo.

**En las piezas se lee "BVLGARI" grabado.** Bulgari es una marca registrada de
LVMH. Por eso el sitio no usa ese nombre en ningún lado: ni en los nombres de
producto, ni en las descripciones, ni en los textos de la página, ni en los datos
que leen Google y las redes sociales. Las piezas están descritas por lo que son
—plata 925, forma del marco, color de la piedra—.

El logo igual se ve en las fotos. Publicar una tienda online con esas imágenes
implica un riesgo concreto de reclamo por marca: baja del sitio o del dominio,
cierre de la cuenta de la pasarela de pago si más adelante usás una, y acciones
civiles o penales previstas en la Ley 22.362 de Marcas.

Es tu decisión, pero conviene tomarla sabiendo esto. La alternativa de menor
riesgo es fotografiar las piezas con encuadres donde el grabado no se lea.
