/** Datos de la marca y de la tienda. Cambiá aquí el nombre, los contactos y las reglas comerciales. */
export const BRAND = {
  name: "Puño y Letra",
  tagline: "Libros para contar la vida",
  description:
    "Libros para completar con recuerdos, historias y fotos. Un regalo para que las personas que querés cuenten su historia con su propia letra.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@punoyletra.com.ar",
  /** Número de WhatsApp Business en formato internacional, sin + ni espacios. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "5491100000000",
  social: {
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
    facebook: "https://www.facebook.com/",
    pinterest: "https://www.pinterest.com/",
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const COMMERCE = {
  freeShippingFrom: 90000,
  giftWrapPrice: 3900,
  giftCardPrice: 1900,
  pdfLinkDays: 30,
  pdfMaxDownloads: 10,
  bankTransfer: {
    holder: "Puño y Letra",
    cbu: "0000000000000000000000",
    alias: "PUNO.Y.LETRA",
    discountPercent: 5,
  },
};
