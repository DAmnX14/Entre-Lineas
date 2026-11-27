import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { COMMERCE, BRAND } from "@/lib/brand";
import { date, money } from "@/lib/format";
import { downloadsForOrder, getOrderByNumber, isDownloadValid, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/repo";
import { mercadoPagoEnabled, syncMercadoPagoPayment } from "@/lib/payments";
import { RenewDownloads, TestPayButton } from "@/components/OrderActions";
import { waLink } from "@/components/WhatsAppButton";

export const metadata: Metadata = { title: "Tu pedido", robots: { index: false } };

const STEPS: OrderStatus[] = ["pendiente", "pagado", "en_preparacion", "enviado", "entregado"];
const SHIP_LABEL: Record<string, string> = { domicilio: "Envío a domicilio", sucursal: "Retiro en sucursal del correo", retiro: "Retiro en nuestro taller", ninguno: "Sin envío (digital)" };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string; payment_id?: string; collection_id?: string }> }) {
  const { number } = await params;
  const sp = await searchParams;
  let order = getOrderByNumber(number);
  if (!order) notFound();
  const user = await currentUser();
  const allowed = order.publicToken === sp.t || user?.role === "admin" || (user && user.email === order.email);
  if (!allowed) notFound();

  // Al volver de Mercado Pago se consulta el pago directamente a su API.
  const paymentId = sp.payment_id ?? sp.collection_id;
  if (paymentId && mercadoPagoEnabled() && order.paymentStatus !== "pagado") {
    await syncMercadoPagoPayment(paymentId).catch((e) => console.error(e));
    order = getOrderByNumber(number)!;
  }

  const paid = order.paymentStatus === "pagado";
  const downloads = paid ? downloadsForOrder(order.id) : [];
  const physical = order.items.some((i) => i.format === "fisico");
  const steps = physical ? STEPS : (["pendiente", "pagado", "entregado"] as OrderStatus[]);
  const current = order.status === "cancelado" ? -1 : steps.indexOf(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 pb-24 sm:px-6">
      {paid ? (
        <p className="font-hand text-4xl text-clay-deep">¡Gracias, {order.name.split(" ")[0]}!</p>
      ) : (
        <p className="font-hand text-4xl text-ink-soft">Tu pedido está reservado.</p>
      )}
      <h1 className="mt-2 text-3xl sm:text-4xl">Pedido {order.number}</h1>
      <p className="mt-2 text-ink-soft">
        {date(order.createdAt)} · {order.email}
      </p>

      {order.status !== "cancelado" ? (
        <ol className="mt-8 grid gap-2 sm:flex sm:gap-0" aria-label="Estado del pedido">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:items-start sm:gap-2">
              <span className={`h-1.5 w-8 rounded-full sm:h-1.5 sm:w-full ${i <= current ? "bg-clay" : "bg-line"}`} aria-hidden />
              <span className={`text-sm ${i === current ? "font-semibold" : i < current ? "" : "text-ink-soft"}`}>
                {s === "entregado" && !physical ? "Descargas listas" : ORDER_STATUS_LABEL[s]}
                {i === current && <span className="sr-only"> (estado actual)</span>}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 rounded-lg bg-rose/60 p-4">Este pedido fue cancelado. Si tenés dudas, escribinos.</p>
      )}

      {!paid && order.paymentStatus === "rechazado" && (
        <div className="mt-8 rounded-xl bg-rose/50 p-6">
          <p className="font-semibold">El pago fue rechazado.</p>
          <p className="mt-1 text-sm">Podés intentarlo de nuevo desde el carrito con otro medio de pago, o escribirnos y lo resolvemos juntos.</p>
        </div>
      )}

      {!paid && order.paymentMethod === "transferencia" && (
        <div className="mt-8 rounded-xl bg-cream p-6">
          <h2 className="text-2xl">Para confirmar tu pedido, transferí {money(order.total)}</h2>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
            <dt className="text-ink-soft">Titular</dt>
            <dd>{COMMERCE.bankTransfer.holder}</dd>
            <dt className="text-ink-soft">CBU</dt>
            <dd className="font-mono">{COMMERCE.bankTransfer.cbu}</dd>
            <dt className="text-ink-soft">Alias</dt>
            <dd className="font-mono">{COMMERCE.bankTransfer.alias}</dd>
          </dl>
          <a className="btn btn-ink mt-5" href={waLink(`Hola, envío el comprobante del pedido ${order.number}.`)} target="_blank" rel="noopener noreferrer">
            Enviar comprobante por WhatsApp
          </a>
          <p className="mt-3 text-xs text-ink-soft">Guardamos el stock por 48 horas.</p>
        </div>
      )}

      {!paid && order.paymentMethod === "prueba" && (
        <div className="mt-8 rounded-xl border border-dashed border-clay p-6">
          <p className="font-semibold">Modo de prueba</p>
          <p className="mt-1 text-sm text-ink-soft">Mercado Pago no está configurado todavía. Este botón simula la aprobación del pago para probar el flujo completo.</p>
          <div className="mt-4">
            <TestPayButton number={order.number} token={order.publicToken} />
          </div>
        </div>
      )}

      {!paid && order.paymentMethod === "mercadopago" && order.paymentStatus === "pendiente" && (
        <p className="mt-8 rounded-xl bg-cream p-6 text-sm">
          Estamos esperando la confirmación de Mercado Pago. Si pagaste en efectivo, puede demorar hasta 48 horas. Esta página se actualiza sola cuando se acredita.
        </p>
      )}

      {downloads.length > 0 && (
        <section className="mt-10 rounded-xl bg-ink p-6 text-cream sm:p-8" aria-labelledby="descargas">
          <h2 id="descargas" className="text-2xl text-white">
            Tus descargas
          </h2>
          <ul className="mt-5 space-y-3">
            {downloads.map((d) => {
              const valid = isDownloadValid(d);
              return (
                <li key={d.id} className="flex flex-col gap-2 border-b border-cream/15 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="serif text-lg">{d.title}</span>
                  {valid ? (
                    <span className="flex flex-wrap gap-2">
                      <a href={`/api/descargas/${d.token}`} className="btn btn-primary min-h-0 py-2">
                        Descargar PDF (A4)
                      </a>
                      <a href={`/api/descargas/${d.token}?tamano=editorial`} className="btn min-h-0 border border-cream/30 py-2 text-cream hover:bg-cream hover:text-ink">
                        17 × 24 cm
                      </a>
                    </span>
                  ) : (
                    <span className="text-sm text-cream/70">Enlace vencido</span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-cream/70">
            Cada enlace funciona {COMMERCE.pdfLinkDays} días y hasta {COMMERCE.pdfMaxDownloads} descargas.
          </p>
          <div className="mt-3 [&_button]:text-cream">
            <RenewDownloads number={order.number} token={sp.t} />
          </div>
        </section>
      )}

      <section className="mt-10" aria-labelledby="detalle">
        <h2 id="detalle" className="text-2xl">
          Detalle
        </h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-3">
              <div>
                <p className="font-semibold">
                  {i.qty} × {i.title}
                </p>
                <p className="text-sm text-ink-soft">
                  {i.format === "pdf" ? "PDF digital" : "Libro físico"}
                  {i.personalization?.recipientName && ` · Para ${i.personalization.recipientName}`}
                  {i.personalization?.giftWrap && " · Packaging de regalo"}
                </p>
              </div>
              <p>{money(i.total)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-olive"><dt>Descuentos</dt><dd>−{money(order.discount)}</dd></div>}
          {physical && <div className="flex justify-between"><dt>Envío</dt><dd>{order.shippingCost ? money(order.shippingCost) : "Sin cargo"}</dd></div>}
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold"><dt>Total</dt><dd>{money(order.total)}</dd></div>
        </dl>
        {physical && (
          <div className="mt-6 text-sm">
            <p className="font-semibold">{SHIP_LABEL[order.shippingMethod]}</p>
            {order.shipping && (
              <p className="text-ink-soft">
                {order.shipping.street} {order.shipping.number} {order.shipping.floor}, {order.shipping.city}, {order.shipping.province} ({order.shipping.postalCode})
              </p>
            )}
            {order.trackingCode && <p className="mt-2">Código de seguimiento: <span className="font-mono font-semibold">{order.trackingCode}</span></p>}
          </div>
        )}
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/libros" className="btn btn-ghost">Seguir mirando libros</Link>
        <a href={waLink(`Hola, tengo una consulta sobre el pedido ${order.number}.`)} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
          Consultar por WhatsApp
        </a>
      </div>
      <p className="mt-6 text-xs text-ink-soft">Guardá esta página: es el enlace privado de tu pedido en {BRAND.name}.</p>
    </div>
  );
}
