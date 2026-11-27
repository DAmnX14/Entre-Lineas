import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { quoteCart } from "@/lib/pricing";
import { BRAND, COMMERCE } from "@/lib/brand";
import { currentUser, createSession } from "@/lib/auth";
import { createOrder, createUser, getBook, getPack, getUserByEmail, queueEmail, setOrderPreference } from "@/lib/repo";
import { createMercadoPagoPreference, mercadoPagoEnabled, notifyStore, orderUrl, testPaymentsEnabled } from "@/lib/payments";
import { money } from "@/lib/format";
import type { CartLine } from "@/lib/cart-types";

const schema = z.object({
  lines: z.array(z.any()).min(1, "Tu carrito está vacío."),
  coupon: z.string().optional().nullable(),
  contact: z.object({
    email: z.email("Revisá el correo electrónico."),
    name: z.string().trim().min(2, "Escribí tu nombre y apellido."),
    phone: z.string().trim().min(6, "Escribí un teléfono de contacto."),
    dni: z.string().trim().optional(),
  }),
  shippingMethod: z.enum(["domicilio", "sucursal", "retiro"]).optional().nullable(),
  address: z
    .object({
      street: z.string().trim(),
      number: z.string().trim(),
      floor: z.string().trim().optional(),
      city: z.string().trim(),
      province: z.string().trim(),
      postalCode: z.string().trim(),
    })
    .optional()
    .nullable(),
  billing: z.object({
    type: z.enum(["consumidor_final", "factura_a"]),
    name: z.string().trim().optional(),
    cuit: z.string().trim().optional(),
    address: z.string().trim().optional(),
  }),
  paymentMethod: z.enum(["mercadopago", "transferencia", "prueba"]),
  notes: z.string().max(500).optional(),
  password: z.string().optional(),
});

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Revisá los datos del formulario.");
  const d = parsed.data;

  if (d.paymentMethod === "mercadopago" && !mercadoPagoEnabled()) return fail("Mercado Pago no está disponible en este momento. Elegí otro medio de pago.");
  if (d.paymentMethod === "prueba" && !testPaymentsEnabled()) return fail("Ese medio de pago no está disponible.");

  const postalCode = d.address?.postalCode;
  const quote = quoteCart(d.lines as CartLine[], { couponCode: d.coupon, shippingMethod: d.shippingMethod, postalCode });
  if (quote.lines.length === 0) return fail("Tu carrito está vacío.");
  if (quote.errors.length) return fail(quote.errors[0]);
  if (quote.hasPhysical) {
    if (!quote.shippingMethod) return fail("Elegí cómo querés recibir el pedido.");
    if (quote.shippingMethod !== "retiro") {
      const a = d.address;
      if (!a || !a.street || !a.number || !a.city || !a.province || !a.postalCode) return fail("Completá la dirección de envío.");
    }
  }
  if (d.billing.type === "factura_a" && (!d.billing.cuit || !d.billing.name)) return fail("Para factura A necesitamos razón social y CUIT.");

  let discount = quote.discount;
  if (d.paymentMethod === "transferencia") {
    discount += Math.round(((quote.subtotal - quote.discount) * COMMERCE.bankTransfer.discountPercent) / 100);
  }
  const total = Math.max(0, quote.subtotal - discount + quote.shippingCost);

  // Cuenta: si hay sesión se asocia; si eligió contraseña se crea la cuenta.
  let user = await currentUser();
  if (!user && d.password) {
    if (d.password.length < 8) return fail("La contraseña necesita al menos 8 caracteres.");
    if (getUserByEmail(d.contact.email)) return fail("Ya existe una cuenta con ese correo. Ingresá para continuar, o comprá sin crear cuenta.");
    const id = createUser(d.contact.email, d.contact.name, await bcrypt.hash(d.password, 10));
    await createSession(id);
    user = { id, email: d.contact.email, name: d.contact.name, phone: null, role: "customer", createdAt: "" };
  }

  const order = createOrder({
    userId: user?.id ?? null,
    email: d.contact.email,
    name: d.contact.name,
    phone: d.contact.phone,
    dni: d.contact.dni || null,
    shipping: quote.hasPhysical && quote.shippingMethod !== "retiro" && d.address ? d.address : null,
    billing: d.billing,
    shippingMethod: quote.hasPhysical ? quote.shippingMethod! : "ninguno",
    shippingCost: quote.shippingCost,
    subtotal: quote.subtotal,
    discount,
    total,
    couponCode: quote.couponValid ? quote.couponCode : null,
    paymentMethod: d.paymentMethod,
    notes: d.notes || null,
    items: quote.lines.map((l) => ({
      kind: l.kind,
      bookId: l.kind === "book" ? getBook(l.slug)!.id : null,
      packId: l.kind === "pack" ? getPack(l.slug)!.id : null,
      title: l.title,
      format: l.format,
      qty: l.qty,
      unitPrice: l.unitPrice + l.extras,
      total: l.total,
      personalization: l.personalization ?? null,
      packBooks: l.kind === "pack" ? l.books : null,
    })),
  });

  queueEmail(
    order.email,
    `Recibimos tu pedido ${order.number}`,
    [
      `Hola ${order.name}, recibimos tu pedido ${order.number} por ${money(order.total)}.`,
      d.paymentMethod === "transferencia"
        ? `Para confirmarlo, transferí el total a ${COMMERCE.bankTransfer.holder}, CBU ${COMMERCE.bankTransfer.cbu} (alias ${COMMERCE.bankTransfer.alias}) y respondé este correo con el comprobante.`
        : "Te avisamos apenas se acredite el pago.",
      `Seguimiento: ${orderUrl(order)}`,
    ].join("\n\n"),
  );

  if (d.paymentMethod === "transferencia") {
    notifyStore(
      `Pedido por transferencia: ${order.number} · ${money(order.total)}`,
      `${order.name} (${order.email}, ${order.phone}) eligió transferencia. Cuando llegue el comprobante, marcalo como pagado:\n${BRAND.siteUrl}/admin/pedidos/${order.id}`,
    );
  }

  const next = `/pedido/${order.number}?t=${order.publicToken}`;
  if (d.paymentMethod === "mercadopago") {
    try {
      const pref = await createMercadoPagoPreference(order);
      setOrderPreference(order.id, pref.id);
      return NextResponse.json({ redirect: pref.initPoint, order: order.number });
    } catch (e) {
      console.error("[mercadopago] No se pudo crear el pago:", e);
      return NextResponse.json(
        {
          error: `Creamos tu pedido ${order.number}, pero Mercado Pago no respondió. Intentá de nuevo en unos minutos o elegí transferencia bancaria.`,
        },
        { status: 502 },
      );
    }
  }
  return NextResponse.json({ redirect: next, order: order.number });
}
