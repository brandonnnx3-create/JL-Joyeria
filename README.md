# Romero Joyería — sitio web

**El sitio tiene dos paletas de color, elegibles en el momento, sin cambiar de
URL.** Es una sola página —un solo `index.html`— con dos hojas de estilo
intercambiables. El visitante elige con cuál navegar desde un ícono en el
header, al lado del carrito (sol para pasar a la clara, luna para volver a la
oscura), igual que cualquier selector de tema claro/oscuro. La elección queda
guardada en ese navegador para la próxima visita.

| | Hoja de estilos | Paleta |
|---|---|---|
| **Oscura** (por defecto) | `css/oscura.css` | Negro, dorado y azul de medianoche. Es lo que pidió el cliente. |
| **Clara** | `css/clara.css` | Marfil, carbón y champagne como acento, sobre exactamente la misma estructura. |

Las dos comparten el hero en arco, las tres secciones editoriales numeradas
(01/02/03), la cinta deslizante, el desplazamiento suave de las fotos y el
bloque de garantías —es literalmente el mismo HTML—. Si cambiás algo de
layout o de comportamiento, hacelo en `js/app.js` y replicá el ajuste de
color correspondiente en la hoja que no estés mirando: `css/oscura.css` y
`css/clara.css` comparten exactamente los mismos selectores, solo cambian los
valores de los tokens de color en el bloque `:root`.

### Cómo funciona el cambio de tema

No hay dos páginas ni redirección: cambiar de tema reemplaza el `href` del
`<link id="temaCss">` en caliente (`css/oscura.css` ⇄ `css/clara.css`), sin
recargar. Así se conserva el carrito y la posición de scroll, y la URL nunca
muestra `/clara` ni nada parecido.

- La función que hace el cambio es `cambiarTema()` en `js/app.js`.
- Qué botón se ve (el de "ir a la clara" o el de "ir a la oscura") lo decide
  el CSS: cada hoja oculta el que no corresponde (`.tema-a-oscura` /
  `.tema-a-clara`), así no hace falta JavaScript para eso.
- Al volver a entrar, un script chico en el `<head>` de `index.html` lee la
  preferencia guardada (`localStorage`) y pone la hoja correcta *antes* de
  pintar la página, para que no haya un parpadeo del color equivocado.

Si en algún momento se quisiera dejar una sola paleta, es un paso manual y
reversible con `git`: borrar la hoja que se descarta y, en `index.html`,
sacar el botón correspondiente y dejar fijo el `href` de `#temaCss`.

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

## Las secciones de la portada

Todas viven en el único `index.html`, en este orden:

1. **Hero** — qué vendemos, en una frase, con la pieza a la vista en un marco
   en arco.
2. **Cinta deslizante** — la frase de marca, en bucle.
3. **Tres secciones editoriales numeradas (01/02/03)** — sets, cadenas y
   anillos, alternando foto y texto. La del medio (02) invierte el arco e
   invade el ancho completo con el segundo color de fondo (`--navy` en la
   oscura, el champagne-arena en la clara).
4. **Frase de marca** — "El lujo está en los detalles.", centrada.
5. **Catálogo** — la galería completa con filtros por categoría.
6. **Garantías** — tres puntos de confianza, sin iconografía.
7. **Footer** — marca, colección y contacto.

Todo está escrito a mano en el `.html`. Las fotos de las secciones editoriales
se cambian editando el `src` de su `<img>`.

**Los números de las secciones editoriales ("10 sets disponibles", "9 colores
de piedra") están escritos a mano.** Si agregás o sacás productos, actualizalos
ahí.

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

---

## Panel de administración

`admin.html` — en el sitio publicado, `https://TU-USUARIO.github.io/JL-Joyeria/admin.html`

Desde ahí se manejan precios, stock, piezas, categorías, costos de envío y datos
de contacto, sin tocar código.

### Dos formas de publicar

**Conectado con GitHub (recomendado).** El panel sube las fotos y publica los
cambios solo. El flujo completo es: editás, tocás **Publicar cambios**, y un
minuto después la tienda está actualizada. Nadie entra a GitHub.

**Sin conectar.** El botón **Descargar archivos** baja `products.js` y
`config.js` para subirlos a mano a la carpeta `js` del repositorio. Es el
camino largo, pero no necesita token.

### Conectar el panel con GitHub

Se hace una sola vez, desde el botón **Conectar con GitHub**:

1. Entrar a **Settings → Developer settings → Fine-grained tokens** en GitHub.
2. En **Repository access**, elegir **Only select repositories** y marcar
   únicamente este repositorio.
3. En **Permissions → Repository permissions**, poner **Contents** en
   **Read and write**. Ningún otro permiso hace falta.
4. Generar el token, copiarlo y pegarlo en el panel.

El panel prueba la conexión antes de guardarla: si el token no sirve o no tiene
permiso de escritura, lo dice en el momento en lugar de fallar al publicar.

### Sobre el token

Queda guardado **en el navegador de quien administra**, y sólo viaja a
`api.github.com`. No aparece en la dirección ni se escribe en ningún lado.

Un token limitado a este repositorio y al permiso Contents no puede tocar nada
más de la cuenta: ni otros repositorios, ni la configuración, ni los datos
personales. Lo peor que podría hacer alguien con él es cambiar el contenido de
esta tienda, y eso queda registrado en el historial de commits.

**Aun así, es una llave.** Si el panel se usa en una computadora compartida,
conviene usar la descarga a mano, o desconectar al terminar con el botón
**Desconectar**.

### Subir fotos

Al editar una pieza, con el panel conectado aparece una zona para arrastrar la
foto o elegirla del equipo. El panel:

- La achica a 1351 px de lado mayor y la recomprime a JPG de calidad 82,
  para que la tienda no se ponga lenta en el celular.
- Le pone un nombre sin acentos ni espacios, con un sufijo que evita pisar una
  foto existente.
- La sube al repositorio y la deja elegida en la pieza.

La vista previa se ve al instante, pero **en la tienda aparece recién cuando
publicás los cambios**: hasta entonces la foto está en el repositorio y la
página publicada todavía no.

Conviene que sean **verticales**, como las que ya están. Una apaisada entra
igual, pero el panel avisa de que va a quedar con bandas a los costados.

### Lo que no se puede hacer instantáneo

Publicar dispara el workflow de GitHub Pages, que tarda cerca de un minuto. El
panel se queda mirando ese proceso y avisa cuando termina, pero esa demora no
se puede evitar sin cambiar de tecnología.

### En el celular

El panel está pensado para usarse desde el teléfono, que es donde se va a
querer corregir un precio o marcar algo agotado.

A partir de 720 px la tabla deja de ser tabla: cada pieza pasa a ser una ficha
con la foto, el nombre, el precio y el stock **a la vista**, sin desplazar de
costado. Las acciones secundarias se guardan en el menú de puntos de la barra,
y la acción principal queda siempre visible: **Publicar cambios** si hay
conexión, **Descargar archivos** si no.

Si tocás la tabla, tené en cuenta que la ficha del celular se arma con
`grid-template-areas` en `css/admin.css`. Es importante que el precio no herede
la columna de la foto: queda de 58 px y no se puede escribir en él.

### Qué se puede editar

| Pestaña | Qué maneja |
|---|---|
| **Productos** | Precio y stock directo en la tabla. El resto —nombre, categoría, foto, material, descripción, etiqueta y colores de piedra— con el botón Editar. Crear y borrar piezas. Buscador y filtros por categoría y por stock. |
| **Categorías** | Crear, renombrar, reordenar y borrar. Una categoría con piezas no se puede borrar. `Todo` es fija. |
| **Envíos y contacto** | Costo de envío, monto de envío gratis, texto del retiro, WhatsApp, Instagram, email y ciudad. |
| **Cómo publicar** | Estado de la conexión y el paso a paso. |

### El stock

Es un campo opcional por pieza:

- **Vacío** → la pieza se vende sin controlar stock (es como está hoy todo el catálogo).
- **0** → aparece "Agotado", la foto se atenúa y no se puede comprar.
- **1 a 3** → aparece "Últimas unidades", salvo que la pieza ya tenga otra etiqueta.

El carrito no deja pedir más unidades de las que hay, y si bajás el stock de algo
que un cliente tenía en el carrito, la próxima vez que entre se le ajusta solo.

**Conviene cargarlo.** Con stock real, la etiqueta "Últimas unidades" dice la
verdad. Sin stock, sería una urgencia inventada.

### Si algo sale mal

**Descartar cambios** vuelve todo a como está la tienda publicada. Funciona
mientras no hayas subido los archivos. Y como cada cambio publicado es un commit,
siempre se puede volver atrás con `git`.

---

---

## Cuando la tienda pase al cliente

Hoy el panel publica escribiendo en este repositorio de GitHub. Sirve para
trabajar y para mostrar el sitio, pero **no conviene entregarlo así**: ataría al
cliente a la cuenta de GitHub de quien desarrolló, y le exigiría tener cuenta de
GitHub para cambiar un precio.

El motivo de fondo es que GitHub Pages es hosting estático: sirve archivos y no
ejecuta nada, así que no hay dónde guardar una foto ni una base de datos. El
token es un rodeo para escribir en el único lugar disponible.

### Qué hay que cambiar

Para que el cliente suba una foto y la vea publicada al instante, hace falta un
servicio que reciba y guarde. Tres caminos, de menor a mayor esfuerzo:

1. **Supabase o Firebase.** Base de datos, almacenamiento de fotos y login,
   gratis en este tamaño. El sitio puede quedarse donde está. El cliente entra
   con su email y contraseña, sin relación con ninguna cuenta de GitHub.
2. **Cloudflare.** Pages para el sitio, Workers como backend, R2 para las fotos
   y D1 para el catálogo, todo con plan gratuito. Conviene si el dominio
   también se compra ahí, porque queda una sola cuenta para todo.
3. **Hosting con PHP.** El camino clásico: un backend propio con login y subida
   de archivos. Control total, unos dólares por mes, y más para mantener.

En los tres casos el trabajo es el mismo: el catálogo deja de vivir en
`js/products.js` y pasa a leerse del servicio, y el panel deja de escribir en
GitHub para escribir ahí. La tienda, el diseño y el checkout no cambian.

### Sobre el dominio

Es una decisión separada del hosting. Un dominio propio se puede apuntar al
sitio esté donde esté, incluso a GitHub Pages.

## Estructura

```
index.html              La tienda (las dos paletas viven acá)
admin.html              Panel de administración
css/oscura.css          Estilos de la versión oscura
css/clara.css           Estilos de la versión clara
css/admin.css           Estilos del panel
js/config.js            ← TU NÚMERO DE WHATSAPP Y DATOS DE CONTACTO
js/products.js          ← EL CATÁLOGO (lo usan las dos)
js/app.js               Carrito, checkout y catálogo (lo usan las dos)
js/admin.js             El panel de administración
js/admin-git.js         Conexión con GitHub: subir fotos y publicar
img/logo.png            El logo, recortado en círculo
img/productos/          Las 27 fotos
.github/workflows/      Publica el sitio solo en cada push
```

**El catálogo y el checkout son compartidos.** Si cambiás un precio en
`js/products.js`, cambia en las dos versiones. Si aparece un error en el
carrito, se arregla una sola vez.

### El sistema de color

`css/oscura.css` y `css/clara.css` tienen **exactamente los mismos selectores**.
Lo único que cambia es el valor de los tokens de color en el bloque `:root` de
cada una. Si necesitás tocar un color, siempre es ahí arriba, nunca abajo en
una regla suelta.

| Token | Oscura | Clara | Para qué |
|---|---|---|---|
| `--ink` / `--ink-2` / `--ink-3` | negros | marfiles | Fondo de la página y superficies |
| `--line` / `--line-2` | grises fríos | arenas | Bordes y reglas |
| `--navy` / `--navy-2` / `--navy-3` | azul de medianoche | champagne-arena | La superficie que alterna con `--ink` para que el fondo no sea plano |
| `--gold` / `--gold-lt` / `--gold-dim` | dorado vívido | bronce profundo | Acento: precios activos, filtros seleccionados, itálicas |
| `--bone` | marfil (texto claro) | carbón (texto oscuro) | Texto principal |
| `--muted` / `--muted-2` | grises cálidos | grises cálidos más oscuros | Texto secundario y terciario |
| `--on-photo` | igual en las dos | igual en las dos | El numeral de las secciones editoriales (01/02/03), siempre claro con sombra oscura porque se apoya sobre las mismas fotos en ambas versiones |

**Los dorados de la versión clara no son los mismos números que los de la
oscura.** El dorado vívido de la oscura (`#C49A46`) pierde casi todo el
contraste sobre un fondo casi blanco: por eso en clara es más profundo
(`#7A5D30`), verificado contra AA tanto sobre `--ink` como sobre `--navy`.

**Los precios van en el color del texto, no en dorado.** El oro como color de
precio es justamente lo que abarata la percepción: lo usan las tiendas que
quieren parecer caras, no las que lo son.

La etiqueta que se apoya directamente sobre la foto (`card__flag`:
"Últimas unidades" / "Agotado") invierte la polaridad del chip en lugar de
solo cambiar un color: en la oscura es un chip oscuro con texto dorado claro,
en la clara un chip claro con texto dorado oscuro. Es la misma pieza de UI,
en la misma posición, con el mismo comportamiento; lo que cambia es qué
combinación de token se usa para que siga leyéndose bien sobre las mismas
fotografías.

### Tipografía

Dos familias, ni una más. **Bodoni Moda** para la voz de la marca (títulos,
nombres de pieza, cifras) y **Jost** para todo lo que se opera (navegación,
botones, formularios, precios). Es igual en las dos versiones: la tipografía
no es un color, no había nada que tocar ahí.

El tracking se abre en los tamaños chicos (`.3em` en las volantas) y se cierra
en los grandes en los títulos principales. Es lo que separa una tipografía
puesta de una compuesta.

### Formas

Cinco radios según el papel que cumple cada forma (`--r-xs` a `--r-pill`, de
6 a 26 px, más el círculo completo para botones y fichas). El hero remata en
arco (`border-radius: 999px 999px var(--r-lg) var(--r-lg)`), y la segunda
sección editorial invierte ese arco para que las tres no se lean iguales.
Ninguna de estas formas cambia entre versiones: son estructura, no color.

---

## La ficha de producto y el carrito

Se abren en una **ventana centrada**, no en un cajón lateral. En pantalla ancha
la ficha usa dos columnas —foto a la izquierda, información a la derecha— para
que la descripción, el material y los colores se vean sin scrollear. En celular
se apilan, con la foto acotada a 30vh.

**El recuadro de la foto tiene la proporción real de las fotos** (760×1351, o
sea 9:16) y usa `object-fit: contain`. Así la pieza entra entera, sin recorte ni
bandas. Un recuadro apaisado obliga a recortar y corta el producto, que es
justo lo que no se puede hacer en la ficha.

La altura la define el contenedor (`.detail__media`), no la imagen: si se la
deja a la imagen, la fila de la grilla se calcula mal y la foto termina
montándose sobre el título en el celular. Si cambiás el encuadre, cambiá el
`height` del contenedor, no el de la `img`.

**Si subís fotos con otra proporción**, entran completas gracias a `contain`,
pero van a quedar con bandas a los lados. Lo ideal es mantener el formato
vertical 9:16 de las actuales.

El fondo oscurecido vive en el mismo elemento que envuelve la ventana
(`.modal-wrap`), así el clic en el vacío llega al elemento que lo pinta. Cerrar
funciona de tres formas: la cruz, el clic afuera y la tecla Escape.

---

## Los encuadres de las fotos

Las 27 fotos son verticales de 760×1351 (9:16). Cada lugar donde aparecen tiene
su propio encuadre, elegido según cuánto importa ver la pieza completa:

| Dónde | Encuadre | Se recorta |
|---|---|---|
| **Ficha de producto** | 9:16, igual que la foto | **Nada** |
| Tarjeta del catálogo | 2:3 | 16% |
| Tarjeta de categoría | 2:3 | 8% |
| Hero y secciones editoriales | 4:5 | 30% |

En la ficha no se recorta nada porque es donde el cliente decide la compra. En
los encuadres compositivos el recorte es a propósito —una foto 9:16 entera haría
el hero larguísimo— y va corrido hacia arriba (`object-position: center 38%`),
que es donde está la pieza en casi todas las tomas.

---

## Animaciones

Las dos versiones comparten el mismo movimiento, definido una sola vez en
`js/app.js`:

- **Apariciones al scrollear**: los bloques entran con un desplazamiento corto
  y un fundido, una sola vez, la primera vez que entran en pantalla.
- **Parallax en las fotos**: las imágenes con `data-par` se desplazan un poco
  más lento que la página, para dar profundidad sin marear.
- **Cinta deslizante**: la frase de marca se desliza sin corte en un bucle
  infinito entre el hero y las secciones editoriales.
- **Botones**: el relleno se retira hacia abajo en lugar de cambiar de color.
- **Fotos del catálogo**: zoom de 4% en 1,1 segundos al pasar el mouse.
- **Tarjetas**: "Ver pieza" es texto fijo debajo de la foto (nunca se
  superpone a la imagen); se ilumina un poco al pasar el mouse.
- **Header y barra de progreso**: el header se opaca al bajar, y una línea
  dorada arriba marca cuánto falta para llegar al final de la página.

Dos cosas a tener en cuenta si tocás el código:

- **Nada queda invisible sin JavaScript.** La clase `js` que habilita los
  estados de entrada la agrega el propio script. Si falla, el contenido se ve.
- **Se respeta "reducir movimiento"** del sistema: todo queda quieto y legible,
  sin parallax ni cinta, en las dos versiones por igual.

Como `js/app.js` es un solo archivo para la única página, cualquier cambio
acá —agregar una animación, sacar el parallax, lo que sea— aplica a las dos
paletas automáticamente. No hay una rama de código por tema: se eliminó a
propósito para que no puedan volver a desincronizarse.

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
