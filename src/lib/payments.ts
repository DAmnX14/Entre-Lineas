import "server-only";
import crypto from "node:crypto";
import { BRAND, COMMERCE } from "./brand";
import { money } from "./format";
import { downloadsForOrder, getOrder, getOrderByNumber, markOrderPaid, markOrderRejected, queueEmail, type Order } from "./repo";

/**
 * Pagos con Mercado Pago Checkout Pro (tarjetas, débito, dinero en cuenta,
 * cuotas y medios en efectivo). Se activa al definir MP_ACCESS_TOKEN.
 * Sin token, en desarrollo se habilita un "pago de prueba" para recorrer el flujo.
 */

const MP_API = "https://api.mercadopago.com";

export function mercadoPagoEnabled() {
  return !!process.env.MP_ACCESS_TOKEN;
}

export function testPaymentsEnabled() {
  return !mercadoPagoEnabled() && (process.env.NODE_ENV !== "production" || process.env.ALLOW_TEST_PAYMENTS === "1");
}

export function paymentMethods() {
  const list: { id: "mercadopago" | "transferencia" | "prueba"; label: string; detail: string }[] = [];
  if (mercadoPagoEnabled())
    list.push({ id: "mercadopago", label: "Mercado Pago", detail: "Tarjetas de crédito y débito, cuotas, dinero en cuenta o efectivo." });
  if (testPaymentsEnabled())
    list.push({ id: "prueba", label: "Pago de prueba", detail: "Solo en desarrollo: simula un pago aprobado sin cobrar." });
  list.push({
    id: "transferencia",
    label: "Transferencia bancaria",
    detail: `${COMMERCE.bankTransfer.discountPercent}% de descuento. Confirmamos el pedido al recibir el comprobante.`,
  });
  return list;
}

function baseUrl() {
  return BRAND.siteUrl;
}

export function orderUrl(order: Pick<Order, "number" | "publicToken">) {
  return `${baseUrl()}/pedido/${order.number}?t=${order.publicToken}`;
}

export async function createMercadoPagoPreference(order: Order): Promise<{ id: string; initPoint: string }> {
  const url = orderUrl(order);
  // Mercado Pago no acepta direcciones locales (http://localhost) para el
  // regreso automático ni para las notificaciones: solo se envían con https.
  const isPublic = baseUrl().startsWith("https://");
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": `pref-${order.number}`,
    },
    body: JSON.stringify({
      items: [
        {
          id: order.number,
          title: `${BRAND.name} · Pedido ${order.number}`,
          description: order.items.map((i) => `${i.qty}× ${i.title}`).join(", ").slice(0, 250),
          quantity: 1,
          unit_price: order.total,
          currency_id: "ARS",
        },
      ],
      payer: { email: order.email, name: order.name },
      external_reference: order.number,
      back_urls: { success: url, pending: url, failure: url },
      ...(isPublic ? { auto_return: "approved", notification_url: `${baseUrl()}/api/pagos/mercadopago` } : {}),
      statement_descriptor: BRAND.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().slice(0, 22),
    }),
  });
  if (!res.ok) throw new Error(`Mercado Pago respondió ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { id: string; init_point: string };
  return { id: data.id, initPoint: data.init_point };
}

/** Verifica la firma x-signature de las notificaciones (si MP_WEBHOOK_SECRET está definido). */
export function verifyMercadoPagoSignature(headers: Headers, dataId: string) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;
  const sig = headers.get("x-signature");
  // Sin firma (avisos IPN antiguos) se acepta igual: el pago siempre se vuelve a consultar en la API.
  if (!sig) return true;
  const requestId = headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(sig.split(",").map((p) => p.trim().split("=") as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Consulta el pago en Mercado Pago y actualiza el pedido. Nunca confía en datos del navegador. */
export async function syncMercadoPagoPayment(paymentId: string) {
  const res = await fetch(`${MP_API}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    cache: "no-store",
  });
  // 404: el pago no existe en esta cuenta (por ejemplo, la notificación simulada del panel).
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`No se pudo consultar el pago ${paymentId}: ${res.status}`);
  const p = (await res.json()) as { status: string; external_reference: string; transaction_amount: number };
  const order = getOrderByNumber(p.external_reference);
  if (!order) return null;
  if (p.status === "approved") {
    if (Math.round(p.transaction_amount) < order.total) throw new Error(`Monto pagado menor al total del pedido ${order.number}`);
    confirmPayment(order.id, paymentId);
  } else if (p.status === "rejected" || p.status === "cancelled") {
    markOrderRejected(order.id);
  }
  return order.number;
}

/** Aviso interno para la tienda (STORE_NOTIFY_EMAIL o, si no está, ADMIN_EMAIL). */
export function notifyStore(subject: string, body: string) {
  const to = process.env.STORE_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  if (to) queueEmail(to, subject, body);
}

/** Marca el pedido como pagado y deja los correos de confirmación en la bandeja de salida. */
export function confirmPayment(orderId: number, paymentId?: string) {
  const changed = markOrderPaid(orderId, paymentId);
  if (!changed) return;
  const order = getOrder(orderId)!;
  const downloads = downloadsForOrder(order.id);
  const lines = [
    `Hola ${order.name}, recibimos tu pago. ¡Gracias por elegirnos!`,
    "",
    `Pedido ${order.number} · Total ${money(order.total)}`,
    ...order.items.map((i) => `· ${i.qty} × ${i.title} (${i.format === "pdf" ? "PDF" : "libro físico"})`),
  ];
  if (downloads.length) {
    lines.push("", "Tus descargas:");
    for (const d of downloads) lines.push(`${d.title}: ${baseUrl()}/api/descargas/${d.token}`);
  }
  if (order.items.some((i) => i.format === "fisico")) lines.push("", "Te avisamos por este medio cuando despachemos tu libro.");
  lines.push("", `Podés ver tu pedido en ${orderUrl(order)}`);
  queueEmail(order.email, `Recibimos tu pago · Pedido ${order.number}`, lines.join("\n"));
  notifyStore(
    `Nueva venta: ${order.number} · ${money(order.total)}`,
    [
      `${order.name} (${order.email}${order.phone ? `, ${order.phone}` : ""}) pagó el pedido ${order.number}.`,
      ...order.items.map((i) => `· ${i.qty} × ${i.title} (${i.format === "pdf" ? "PDF" : "físico"})${i.personalization?.giftWrap ? " · con packaging" : ""}`),
      order.items.some((i) => i.format === "fisico") ? "Hay libros físicos para preparar y despachar." : "Solo PDF: las descargas ya están disponibles para el cliente.",
      `${baseUrl()}/admin/pedidos/${order.id}`,
    ].join("\n"),
  );
}
