/* ============================================================
   ROMERO JOYERÍA — CATÁLOGO
   ------------------------------------------------------------
   ⚠️ LOS PRECIOS SON DE EJEMPLO. Están puestos para que el
   sitio funcione y se vea completo. Reemplazá cada "precio"
   por el tuyo real antes de publicar.

   Cómo agregar un producto: copiá un bloque { ... } completo,
   pegalo abajo y cambiale los valores. El "id" no se puede
   repetir. La "img" es la ruta al archivo dentro de img/productos/.

   categoria: "anillos" | "dijes" | "cadenas" | "aros" | "sets"

   stock:     unidades disponibles. Es opcional:
                sin el campo  -> la pieza se vende sin control de stock
                0             -> se muestra "Agotado" y no se puede comprar
                1, 2 o 3      -> se muestra "Últimas unidades" solo
                                 si la pieza no tiene otra etiqueta
              El carrito no deja pedir más unidades de las que hay.

   etiqueta:  texto corto que aparece sobre la foto. Es opcional y
              conviene usarlo poco: si todas las piezas llevan una,
              ninguna destaca. Tres o cuatro como máximo.

              Podés poner "Nuevo", "Últimas unidades" o "Más vendido",
              PERO sólo si es cierto. Una etiqueta de urgencia falsa
              se nota, y cuando el cliente la descubre pierde la
              confianza en todo el resto del catálogo.
   ============================================================ */

const CATEGORIAS = [
  { id: "todos",   nombre: "Todo",    desc: "La colección completa" },
  { id: "anillos", nombre: "Anillos", desc: "Sellos, marcos y solitarios en plata 925" },
  { id: "sets",    nombre: "Sets",    desc: "Cadena, dije, aros y anillo a juego, en su estuche" },
  { id: "dijes",   nombre: "Dijes",   desc: "Colgantes sueltos para armar tu cadena" },
  { id: "cadenas", nombre: "Cadenas", desc: "Cadenas de plata con dije incluido" },
  { id: "aros",    nombre: "Aros",    desc: "Aros de abroche a presión" },
];

const PRODUCTOS = [

  /* ---------------- ANILLOS ---------------- */
  {
    id: "anillo-01",
    nombre: "Anillo Aura",
    categoria: "anillos",
    precio: 18500,
    img: "img/productos/anillo-01.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Marco circular grabado alrededor de una piedra central facetada. El modelo más pedido de la casa.",
    piedras: ["Cristal", "Rosa", "Granate"],
  },
  {
    id: "anillo-02",
    nombre: "Anillo Quadra",
    categoria: "anillos",
    precio: 18500,
    img: "img/productos/anillo-02.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Marco cuadrado de canto ancho con piedra talla princesa. Base sólida, cómodo de usar todo el día.",
    piedras: ["Rosa", "Azul", "Verde", "Violeta"],
  },
  {
    id: "anillo-03",
    nombre: "Anillo Quadra Fino",
    categoria: "anillos",
    precio: 16900,
    img: "img/productos/anillo-03.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "La versión liviana del Quadra: mismo frente cuadrado sobre una banda más delgada. Ideal para combinar de a dos.",
    piedras: ["Verde", "Granate", "Rosa", "Cristal", "Negro"],
  },
  {
    id: "anillo-04",
    nombre: "Anillo Aura Fino",
    categoria: "anillos",
    precio: 16900,
    img: "img/productos/anillo-04.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Frente circular sobre banda delgada. El más discreto de la línea, pensado para uso diario.",
    piedras: ["Rosa", "Cristal", "Dorado"],
  },
  {
    id: "anillo-05",
    nombre: "Anillo Sello Plata",
    categoria: "anillos",
    precio: 21900,
    img: "img/productos/anillo-05.jpg",
    material: "Plata 925",
    desc: "Sello redondo con frente labrado, sin piedra. Plata pulida sin baño, para quien prefiere el tono frío.",
    piedras: [],
  },
  {
    id: "anillo-06",
    nombre: "Anillo Quadra Color",
    categoria: "anillos",
    precio: 18500,
    img: "img/productos/anillo-06.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "El Quadra en toda su carta de piedras. Elegí el color al hacer el pedido.",
    etiqueta: "Selección",
    piedras: ["Negro", "Granate", "Verde", "Turquesa", "Violeta", "Cristal", "Ámbar"],
  },
  {
    id: "anillo-07",
    nombre: "Anillo Aura Color",
    categoria: "anillos",
    precio: 18500,
    img: "img/productos/anillo-07.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "El Aura en toda su carta de piedras, del turquesa al negro profundo.",
    piedras: ["Turquesa", "Verde", "Violeta", "Cristal", "Rosa", "Azul", "Blanco"],
  },
  {
    id: "anillo-08",
    nombre: "Anillo Aura Estriado",
    categoria: "anillos",
    precio: 19900,
    img: "img/productos/anillo-08.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Los flancos llevan estrías talladas que acompañan la curva del dedo y hacen que la pieza tome más luz.",
    piedras: ["Rosa", "Negro", "Granate", "Cristal", "Azul"],
  },
  {
    id: "anillo-09",
    nombre: "Anillo Sello Quadra",
    categoria: "anillos",
    precio: 23900,
    img: "img/productos/anillo-09.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "El de mayor cuerpo del catálogo: frente cuadrado amplio sobre banda gruesa. Se usa solo, sin acompañantes.",
    piedras: ["Azul", "Granate", "Negro", "Violeta", "Rosa", "Turquesa"],
  },
  {
    id: "anillo-10",
    nombre: "Anillo Marquise",
    categoria: "anillos",
    precio: 20900,
    img: "img/productos/anillo-10.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Frente en forma de ojo, alargado sobre el dedo. La silueta más distinta de la colección.",
    piedras: ["Violeta", "Cristal", "Rosa", "Ámbar"],
  },

  /* ---------------- SETS ---------------- */
  {
    id: "set-01",
    nombre: "Set Aura Rosa",
    categoria: "sets",
    precio: 46900,
    img: "img/productos/set-01.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Cadena con dije, aros y anillo a juego, en piedra rosa. Viene en estuche, listo para regalar.",
    piezas: ["Cadena con dije", "Aros", "Anillo"],
  },
  {
    id: "set-02",
    nombre: "Set Aura Violeta",
    categoria: "sets",
    precio: 46900,
    img: "img/productos/set-02.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Las tres piezas del Aura en amatista. Cadena eslabón figaro y estuche incluido.",
    piezas: ["Cadena con dije", "Aros", "Anillo"],
  },
  {
    id: "set-03",
    nombre: "Set Aura Azul",
    categoria: "sets",
    precio: 46900,
    img: "img/productos/set-03.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Piedra azul profunda sobre cadena fina. El contraste más marcado de la línea.",
    piezas: ["Cadena con dije", "Aros", "Anillo"],
  },
  {
    id: "set-04",
    nombre: "Set Quadra Cristal",
    categoria: "sets",
    precio: 44900,
    img: "img/productos/set-04.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Dije cuadrado y anillo a juego en piedra cristal. Dos piezas, en estuche.",
    piezas: ["Cadena con dije", "Anillo"],
  },
  {
    id: "set-05",
    nombre: "Set Aura Verde",
    categoria: "sets",
    precio: 46900,
    img: "img/productos/set-05.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Verde esmeralda en las tres piezas, sobre cadena figaro. Uno de los más elegidos para regalo.",
    piezas: ["Cadena con dije", "Aros", "Anillo"],
  },
  {
    id: "set-06",
    nombre: "Set Aura Ámbar",
    categoria: "sets",
    precio: 46900,
    img: "img/productos/set-06.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Piedra ámbar cálida sobre cadena fina de plata. El tono más suave del catálogo.",
    piezas: ["Cadena con dije", "Aros", "Anillo"],
  },
  {
    id: "set-07",
    nombre: "Set Quadra Granate",
    categoria: "sets",
    precio: 46900,
    img: "img/productos/set-07.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Rojo granate en marco cuadrado, las tres piezas a juego dentro del estuche.",
    piezas: ["Cadena con dije", "Aros", "Anillo"],
  },
  {
    id: "set-08",
    nombre: "Set Quadra Azul",
    categoria: "sets",
    precio: 46900,
    img: "img/productos/set-08.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Dije y aros cuadrados en azul noche, sobre cadena eslabón figaro.",
    piezas: ["Cadena con dije", "Aros"],
  },
  {
    id: "set-09",
    nombre: "Set Quadra Rosa",
    categoria: "sets",
    precio: 44900,
    img: "img/productos/set-09.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Cadena con dije cuadrado rosa y anillo a juego. Dos piezas, en estuche.",
    piezas: ["Cadena con dije", "Anillo"],
  },
  {
    id: "set-10",
    nombre: "Set Barra Azul",
    categoria: "sets",
    precio: 48900,
    img: "img/productos/set-10.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Dije rectangular de dos barras en azul, con aros a juego. La pieza de mayor tamaño del catálogo.",
    etiqueta: "Selección",
    piezas: ["Cadena con dije", "Aros"],
  },

  /* ---------------- DIJES ---------------- */
  {
    id: "dije-01",
    nombre: "Dije Quadra",
    categoria: "dijes",
    precio: 12900,
    img: "img/productos/dije-01.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Colgante cuadrado suelto, sin cadena. Entra en cualquier cadena fina. Elegí el color de la piedra.",
    piedras: ["Rosa", "Granate", "Negro", "Cristal", "Azul", "Verde"],
  },
  {
    id: "dije-02",
    nombre: "Dije Aura",
    categoria: "dijes",
    precio: 12900,
    img: "img/productos/dije-02.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Colgante circular suelto en tres tamaños, del más chico al más marcado.",
    piedras: ["Cristal", "Rosa", "Granate"],
  },
  {
    id: "dije-03",
    nombre: "Dije Quadra Mini",
    categoria: "dijes",
    precio: 10900,
    img: "img/productos/dije-03.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "La versión chica del Quadra, para usar de a varios en la misma cadena o de a uno bien discreto.",
    piedras: ["Cristal", "Negro", "Granate", "Azul", "Verde", "Violeta", "Rosa", "Blanco"],
  },

  /* ---------------- CADENAS ---------------- */
  {
    id: "cadena-01",
    nombre: "Cadena con Dije Aura",
    categoria: "cadenas",
    precio: 27900,
    img: "img/productos/cadena-01.jpg",
    material: "Plata 925, dije con terminación dorada",
    desc: "Cadena de plata tejido trenzado con dije circular incluido. Largo 45 cm.",
    piedras: ["Cristal", "Granate", "Rosa", "Negro"],
  },
  {
    id: "cadena-02",
    nombre: "Cadena Trenzada con Dije",
    categoria: "cadenas",
    precio: 27900,
    img: "img/productos/cadena-02.jpg",
    material: "Plata 925, dije con terminación dorada",
    desc: "El mismo tejido en cuatro largos, de 40 a 55 cm, para superponer varias a distinta altura.",
    etiqueta: "Selección",
    piedras: ["Cristal", "Granate", "Rosa", "Negro"],
  },
  {
    id: "cadena-03",
    nombre: "Cadena con Dije Quadra",
    categoria: "cadenas",
    precio: 27900,
    img: "img/productos/cadena-03.jpg",
    material: "Plata 925, dije con terminación dorada",
    desc: "Cadena de plata con dije cuadrado incluido. Largo 45 cm.",
    piedras: ["Negro", "Cristal", "Granate"],
  },

  /* ---------------- AROS ---------------- */
  {
    id: "aro-01",
    nombre: "Aros Aura y Quadra",
    categoria: "aros",
    precio: 14900,
    img: "img/productos/aro-01.jpg",
    material: "Plata 925 con terminación dorada",
    desc: "Aros de abroche a presión, en marco redondo o cuadrado. Toda la carta de piedras disponible.",
    piedras: ["Violeta", "Verde", "Turquesa", "Negro", "Azul", "Cristal", "Granate", "Ámbar", "Rosa"],
  },
];
