/**
 * Normaliza la dirección pública del sitio. Tolera errores comunes al cargarla
 * (incluir el nombre de la variable, faltar https:// o sobrar la barra final)
 * para que un valor mal escrito no impida publicar la tienda.
 */
function cleanSiteUrl(raw: string | undefined) {
  let v = (raw ?? "").trim().replace(/^NEXT_PUBLIC_SITE_URL\s*=\s*/i, "").replace(/^["']|["']$/g, "");
  if (!v) return "http://localhost:3000";
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    return new URL(v).origin;
  } catch {
    console.warn(`[tienda] NEXT_PUBLIC_SITE_URL no es una dirección válida: ${raw}`);
    return "http://localhost:3000";
  }
}

/** Datos de la marca y de la tienda. Cambiá aquí el nombre, los contactos y las reglas comerciales. */
export const BRAND = {
  name: "Entre Líneas",
  tagline: "Libros para guardar historias",
  description:
    "Libros para completar con recuerdos, historias y fotos. Un regalo para que las personas que querés cuenten su historia con su propia letra.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@entrelineas.com.ar",
  /** Número de WhatsApp Business en formato internacional, sin + ni espacios. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "5491100000000",
  social: {
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
    facebook: "https://www.facebook.com/",
    pinterest: "https://www.pinterest.com/",
  },
  siteUrl: cleanSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
};

export const LOGO = {
  /** Logo completo (libro, nombre y frase) */
  full: "/brand/logo.webp",
  /** Logo completo en color claro, para fondos oscuros */
  light: "/brand/logo-claro.webp",
  /** Solo el nombre, para la barra superior */
  text: "/brand/logo-texto.webp",
};

export const COMMERCE = {
  freeShippingFrom: 90000,
  giftWrapPrice: 3900,
  giftCardPrice: 1900,
  pdfLinkDays: 30,
  pdfMaxDownloads: 10,
  bankTransfer: {
    holder: "Entre Líneas",
    cbu: "0000000000000000000000",
    alias: "ENTRE.LINEAS",
    discountPercent: 5,
  },
};
