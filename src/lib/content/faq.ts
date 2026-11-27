import { COMMERCE } from "../brand";

const m = (n: number) => `$${n.toLocaleString("es-AR")}`;

export const FAQ_GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Sobre los libros",
    items: [
      {
        q: "¿Cómo se completa el libro?",
        a: "Cada página tiene una pregunta y espacio para escribir a mano. No hace falta responder en orden ni contestar todo: se puede escribir una línea o varias páginas. Hay secciones para pegar fotos y para escribir cartas.",
      },
      {
        q: "¿Cuánto tiempo lleva completarlo?",
        a: "Lo que la persona quiera. Muchos lo completan de a poco, durante semanas o meses. Otros lo usan como excusa para una charla y lo escriben juntos.",
      },
      {
        q: "¿Las preguntas son muy personales?",
        a: "Están pensadas para invitar a recordar, no para incomodar. Las secciones más íntimas aclaran que se puede contar solo lo que uno tenga ganas.",
      },
      {
        q: "¿Puedo pedir un libro con preguntas propias?",
        a: "Estamos preparando las ediciones personalizadas. Escribinos por WhatsApp y te avisamos cuando estén disponibles.",
      },
    ],
  },
  {
    title: "Formatos",
    items: [
      {
        q: "¿Qué diferencia hay entre el libro físico y el PDF?",
        a: "El libro físico es de tapa dura entelada, 17 × 24 cm, papel de 120 g, con cinta señaladora. El PDF tiene el mismo contenido, preparado para imprimir en A4 en casa o en una imprenta, o para completar en tablet.",
      },
      {
        q: "¿Cuándo recibo el PDF?",
        a: `Apenas se confirma el pago: aparece el enlace de descarga en la página del pedido y en tu cuenta. El enlace funciona ${COMMERCE.pdfLinkDays} días y hasta ${COMMERCE.pdfMaxDownloads} descargas; si vence, te enviamos uno nuevo.`,
      },
      {
        q: "¿Puedo imprimir el PDF más de una vez?",
        a: "Sí, para uso personal y familiar. No está permitido revenderlo ni compartirlo públicamente.",
      },
    ],
  },
  {
    title: "Envíos y regalos",
    items: [
      {
        q: "¿Hacen envíos a todo el país?",
        a: `Sí. Enviamos a domicilio o a sucursal del correo a todo el país. El costo se calcula con tu código postal en el checkout. Desde ${m(COMMERCE.freeShippingFrom)} el envío es sin cargo.`,
      },
      {
        q: "¿Puedo enviarlo directamente a la persona que lo recibe?",
        a: "Sí. En el checkout cargá la dirección de la persona. El paquete no incluye precios.",
      },
      {
        q: "¿Qué incluye el packaging de regalo?",
        a: `Caja de cartón kraft, papel de seda y cinta de algodón (${m(COMMERCE.giftWrapPrice)}). La tarjeta personalizada se escribe a mano con tu mensaje (${m(COMMERCE.giftCardPrice)}).`,
      },
      {
        q: "¿Cuánto tarda en llegar?",
        a: "Despachamos en 24 a 48 horas hábiles. Después, entre 1 y 7 días hábiles según la zona. Te enviamos el código de seguimiento.",
      },
    ],
  },
  {
    title: "Pagos",
    items: [
      {
        q: "¿Qué medios de pago aceptan?",
        a: `Tarjetas de crédito y débito, cuotas y dinero en cuenta a través de Mercado Pago, y transferencia bancaria con ${COMMERCE.bankTransfer.discountPercent}% de descuento.`,
      },
      {
        q: "¿Puedo usar un cupón?",
        a: "Sí, se carga en el carrito o en el checkout. Los cupones no son acumulables.",
      },
    ],
  },
];

export const PRODUCT_FAQ = [FAQ_GROUPS[0].items[0], FAQ_GROUPS[1].items[0], FAQ_GROUPS[1].items[1], FAQ_GROUPS[2].items[1], FAQ_GROUPS[2].items[3]];
