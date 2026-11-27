import Link from "next/link";
import { notFound } from "next/navigation";
import { downloadsForOrder, getOrder } from "@/lib/repo";
import { date, money } from "@/lib/format";
import { markPaidAction } from "@/lib/actions/admin";
import { RenewDownloads } from "@/components/OrderActions";
import { OrderForm } from "./OrderForm";

const SHIP: Record<string, string> = { domicilio: "Envío a domicilio", sucursal: "Sucursal del correo", retiro: "Retiro en taller", ninguno: "Sin envío" };

export default async function OrderAdmin({ params }: { params: Promise<{ id: string }> }) {
  const order = getOrder(Number((await params).id));
  if (!order) notFound();
  const downloads = order.paymentStatus === "pagado" ? downloadsForOrder(order.id) : [];
  return (
    <div>
      <Link href="/admin/pedidos" className="text-sm text-ink-soft hover:text-ink">← Pedidos</Link>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-4xl">{order.number}</h1>
        <a href={`/pedido/${order.number}?t=${order.publicToken}`} target="_blank" className="link text-sm">Ver como cliente</a>
      </div>
      <p className="text-ink-soft">{date(order.createdAt)} · {order.paymentMethod} · pago {order.paymentStatus}{order.paidAt ? ` el ${date(order.paidAt)}` : ""}</p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className="rounded-xl bg-paper p-6">
            <h2 className="text-xl">Productos</h2>
            <ul className="mt-3 divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.id} className="py-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <p className="font-semibold">{i.qty} × {i.title} <span className="font-normal text-ink-soft">({i.format === "pdf" ? "PDF" : "físico"})</span></p>
                    <p>{money(i.total)}</p>
                  </div>
                  {i.packBooks && <p className="text-ink-soft">Incluye: {i.packBooks.join(", ")}</p>}
                  {i.personalization && (
                    <div className="mt-2 rounded-lg bg-cream p-3">
                      {i.personalization.recipientName && <p>Para: <strong>{i.personalization.recipientName}</strong></p>}
                      {i.personalization.fromName && <p>De: <strong>{i.personalization.fromName}</strong></p>}
                      {i.personalization.dedication && <p className="mt-1 italic">«{i.personalization.dedication}»</p>}
                      {i.personalization.occasion && <p>Ocasión: {i.personalization.occasion}</p>}
                      {i.personalization.specialDate && <p>Fecha: {i.personalization.specialDate}</p>}
                      {i.personalization.giftWrap && <p className="font-semibold text-clay-deep">Con packaging de regalo</p>}
                      {i.personalization.giftCard && <p className="font-semibold text-clay-deep">Tarjeta: «{i.personalization.giftCardText}»</p>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <dl className="mt-3 ml-auto max-w-xs space-y-1 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Descuentos {order.couponCode && `(${order.couponCode})`}</dt><dd>−{money(order.discount)}</dd></div>
              <div className="flex justify-between"><dt>Envío</dt><dd>{money(order.shippingCost)}</dd></div>
              <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{money(order.total)}</dd></div>
            </dl>
          </section>
          <section className="grid gap-6 rounded-xl bg-paper p-6 sm:grid-cols-2">
            <div className="text-sm">
              <h2 className="mb-2 text-xl">Cliente</h2>
              <p>{order.name}</p>
              <p><a className="link" href={`mailto:${order.email}`}>{order.email}</a></p>
              <p>{order.phone}</p>
              {order.dni && <p>DNI {order.dni}</p>}
              {order.billing?.type === "factura_a" && <p className="mt-2">Factura A: {order.billing.name} · CUIT {order.billing.cuit} · {order.billing.address}</p>}
            </div>
            <div className="text-sm">
              <h2 className="mb-2 text-xl">Entrega</h2>
              <p className="font-semibold">{SHIP[order.shippingMethod]}</p>
              {order.shipping && <p>{order.shipping.street} {order.shipping.number} {order.shipping.floor}<br />{order.shipping.city}, {order.shipping.province} ({order.shipping.postalCode})</p>}
              {order.notes && <p className="mt-2 rounded bg-cream p-2">Nota: {order.notes}</p>}
            </div>
          </section>
          {downloads.length > 0 && (
            <section className="rounded-xl bg-paper p-6 text-sm">
              <h2 className="text-xl">Descargas</h2>
              <ul className="mt-2 space-y-1">
                {downloads.map((d) => <li key={d.id}>{d.title}: {d.downloads}/{d.maxDownloads} descargas · vence {date(d.expiresAt)}</li>)}
              </ul>
              <div className="mt-3"><RenewDownloads number={order.number} /></div>
            </section>
          )}
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl bg-paper p-6">
            <OrderForm id={order.id} status={order.status} tracking={order.trackingCode} />
          </div>
          {order.paymentStatus !== "pagado" && (
            <form action={markPaidAction} className="rounded-xl bg-paper p-6">
              <input type="hidden" name="id" value={order.id} />
              <p className="text-sm text-ink-soft">¿Recibiste la transferencia?</p>
              <button className="btn btn-primary mt-3 w-full">Marcar como pagado</button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
