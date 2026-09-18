/* ============================================================
   RJ JOYERÍA — CONFIGURACIÓN
   Este es el único archivo que necesitás tocar para poner el
   sitio en marcha. Cambiá los valores entre comillas y listo.
   ============================================================ */

const CONFIG = {

  /* --- TU NÚMERO DE WHATSAPP ---------------------------------
     Formato internacional, SOLO números: sin +, sin espacios,
     sin guiones y sin el 15.
     Argentina = 54, luego 9, luego característica sin el 0.
     Ejemplo Buenos Aires 11-2345-6789  ->  "5491123456789"
     Ejemplo Córdoba    351-234-5678    ->  "5493512345678"

     ⚠️ PENDIENTE: reemplazá este número por el tuyo.
        Mientras diga PONE_TU_NUMERO, el checkout avisa al
        cliente en lugar de abrir un WhatsApp equivocado.        */
  whatsapp: "PONE_TU_NUMERO",

  /* --- DATOS DE LA MARCA ------------------------------------ */
  marca: "RJ Joyería",
  instagram: "",            // ej: "rj.joyeria" (sin @). Vacío = no se muestra.
  email: "",                // ej: "hola@rjjoyeria.com". Vacío = no se muestra.
  ciudad: "Buenos Aires, Argentina",

  /* --- ENVÍOS Y PAGOS --------------------------------------- */
  envioGratisDesde: 60000,  // $ a partir del cual el envío es gratis. 0 = nunca.
  costoEnvio: 6500,         // $ de envío por correo.
  puntoRetiro: "Coordinamos punto de encuentro por WhatsApp",

  /* --- MONEDA ----------------------------------------------- */
  moneda: "$",
  localeMoneda: "es-AR",
};
