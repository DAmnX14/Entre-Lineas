import "server-only";
import { COMMERCE } from "./brand";
import { CATEGORIES } from "./content/taxonomy";
import { cleanPersonalization } from "./personalization";
import type { CartLine, Quote, QuotedLine, ShippingMethod } from "./cart-types";
import { getBook, getBooksBySlugs, getCoupon, getPack, type Book, type Pack } from "./repo";

export function bookPrice(b: Book, format: "fisico" | "pdf") {
  return format === "fisico" ? b.priceFisico : b.pricePdf;
}

export function packPricing(pack: Pack, books: Book[], format: "fisico" | "pdf") {
  const list = books.reduce((s, b) => s + bookPrice(b, format), 0);
  const price = Math.round((list * (100 - pack.discountPercent)) / 100 / 100) * 100;
  return { list, price, saving: list - price };
}

/** Tarifas por código postal argentino (CPA o numérico de 4 dígitos). */
export function shippingOptions(postalCode?: string) {
  const digits = (postalCode ?? "").replace(/\D/g, "");
  const cp = Number(digits.slice(0, 4));
  let zone: "caba" | "amba" | "interior" | null = null;
  if (cp >= 1000 && cp <= 1499) zone = "caba";
  else if (cp >= 1500 && cp <= 1999) zone = "amba";
  else if (cp >= 2000 && cp <= 9999) zone = "interior";
  const table = {
    caba: { domicilio: 4900, sucursal: 3900, days: "1 a 3 días hábiles" },
    amba: { domicilio: 5900, sucursal: 4500, days: "2 a 4 días hábiles" },
    interior: { domicilio: 8900, sucursal: 6900, days: "3 a 7 días hábiles" },
  };
  const opts: Quote["shippingOptions"] = [];
  if (zone) {
    const t = table[zone];
    opts.push({ method: "domicilio", label: "Envío a domicilio", detail: t.days, cost: t.domicilio });
    opts.push({ method: "sucursal", label: "Retiro en sucursal del correo", detail: t.days, cost: t.sucursal });
  }
  opts.push({ method: "retiro", label: "Retiro sin cargo en nuestro taller (CABA)", detail: "Coordinamos día y horario por WhatsApp", cost: 0 });
  return { zone, options: opts };
}

export function quoteCart(
  rawLines: CartLine[],
  opts: { couponCode?: string | null; shippingMethod?: ShippingMethod | null; postalCode?: string } = {},
): Quote {
  const errors: string[] = [];
  const lines: QuotedLine[] = [];

  for (const raw of rawLines.slice(0, 50)) {
    const qty = Math.max(1, Math.min(20, Math.floor(Number(raw.qty) || 1)));
    const format = raw.format === "pdf" ? "pdf" : "fisico";
    const personalization = cleanPersonalization(raw.personalization);
    const physical = format === "fisico";
    const extras = physical
      ? (personalization?.giftWrap ? COMMERCE.giftWrapPrice : 0) + (personalization?.giftCard ? COMMERCE.giftCardPrice : 0)
      : 0;

    if (raw.kind === "book") {
      const b = getBook(raw.slug);
      if (!b || !b.active) {
        errors.push("Uno de los libros de tu carrito ya no está disponible. Lo quitamos del total.");
        continue;
      }
      let error: string | undefined;
      if (format === "fisico" && !b.hasFisico) error = "Este libro no se vende en formato físico.";
      if (format === "pdf" && !b.hasPdf) error = "Este libro no se vende en PDF.";
      if (format === "fisico" && b.stock < qty) error = b.stock > 0 ? `Quedan ${b.stock} unidades.` : "Sin stock en formato físico. Podés elegir el PDF.";
      const unit = bookPrice(b, format);
      const compare = format === "fisico" ? b.compareFisico : b.comparePdf;
      if (error) errors.push(`${b.title}: ${error}`);
      lines.push({
        id: raw.id,
        kind: "book",
        slug: b.slug,
        title: b.title,
        subtitle: CATEGORIES[b.category].label,
        format,
        qty,
        unitPrice: unit,
        listUnitPrice: compare && compare > unit ? compare : unit,
        extras,
        total: (unit + extras) * qty,
        category: b.category,
        books: [b.slug],
        covers: [{ title: b.title, category: b.category, image: b.coverImage }],
        personalization,
        error,
      });
    } else {
      const p = getPack(raw.slug);
      if (!p || !p.active) {
        errors.push("Uno de los packs de tu carrito ya no está disponible. Lo quitamos del total.");
        continue;
      }
      let slugs = p.chooseCount > 0 ? (raw.books ?? []).slice(0, p.chooseCount) : p.bookSlugs;
      const books = getBooksBySlugs(slugs).filter((b) => b.active);
      slugs = books.map((b) => b.slug);
      let error: string | undefined;
      if (p.chooseCount > 0 && books.length !== p.chooseCount) error = `Elegí ${p.chooseCount} libros para este pack.`;
      if (p.chooseCount > 0 && p.allowedCategories.length && books.some((b) => !p.allowedCategories.includes(b.category)))
        error = "Algún libro elegido no corresponde a este pack.";
      if (format === "fisico" && books.some((b) => b.stock < qty)) error = "Algún libro del pack no tiene stock físico. Probá con el PDF.";
      const { list, price } = packPricing(p, books, format);
      if (error) errors.push(`${p.title}: ${error}`);
      lines.push({
        id: raw.id,
        kind: "pack",
        slug: p.slug,
        title: p.title,
        subtitle: books.map((b) => b.title).join(" + "),
        format,
        qty,
        unitPrice: price,
        listUnitPrice: list,
        extras,
        total: (price + extras) * qty,
        category: "pack",
        books: slugs,
        covers: books.map((b) => ({ title: b.title, category: b.category, image: b.coverImage })),
        personalization,
        error,
      });
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const hasPhysical = lines.some((l) => l.format === "fisico");

  // Cupón
  let discount = 0;
  let couponMessage: string | null = null;
  let couponValid = false;
  let freeShippingByCoupon = false;
  const code = opts.couponCode?.trim() || null;
  if (code) {
    const c = getCoupon(code);
    const expired = c?.expiresAt ? new Date(c.expiresAt) < new Date() : false;
    if (!c || !c.active || expired) couponMessage = "Este código no existe o ya venció.";
    else if (c.maxUses !== null && c.uses >= c.maxUses) couponMessage = "Este código ya alcanzó su límite de usos.";
    else if (subtotal < c.minTotal) couponMessage = `Este código se aplica a compras desde $${c.minTotal.toLocaleString("es-AR")}.`;
    else {
      couponValid = true;
      if (c.type === "percent") {
        discount = Math.round((subtotal * Math.min(c.value, 100)) / 100);
        couponMessage = `${c.value}% de descuento aplicado.`;
      } else if (c.type === "fixed") {
        discount = Math.min(c.value, subtotal);
        couponMessage = `Descuento de $${c.value.toLocaleString("es-AR")} aplicado.`;
      } else {
        freeShippingByCoupon = true;
        couponMessage = hasPhysical ? "Envío sin cargo aplicado." : "Este código es de envío gratis y tu pedido es solo digital.";
      }
    }
  }

  // Envío
  const { options } = shippingOptions(opts.postalCode);
  const freeShipping = freeShippingByCoupon || subtotal - discount >= COMMERCE.freeShippingFrom;
  const shippingOpts = hasPhysical ? options.map((o) => ({ ...o, cost: freeShipping ? 0 : o.cost })) : [];
  let shippingMethod: ShippingMethod | null = null;
  let shippingCost = 0;
  if (hasPhysical && opts.shippingMethod) {
    const chosen = shippingOpts.find((o) => o.method === opts.shippingMethod);
    if (chosen) {
      shippingMethod = chosen.method;
      shippingCost = chosen.cost;
    }
  }

  return {
    lines,
    subtotal,
    discount,
    couponCode: couponValid ? code!.toUpperCase() : code,
    couponMessage,
    couponValid,
    hasPhysical,
    shippingMethod,
    shippingCost,
    shippingOptions: shippingOpts,
    freeShippingFrom: COMMERCE.freeShippingFrom,
    total: Math.max(0, subtotal - discount + shippingCost),
    errors,
  };
}
