import Link from "next/link";
import { listOrders, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/repo";
import { date, money } from "@/lib/format";

const TABS: (OrderStatus | "")[] = ["", "pendiente", "pagado", "en_preparacion", "enviado", "entregado", "cancelado"];

export default async function OrdersAdmin({ searchParams }: { searchParams: Promise<{ estado?: string; q?: string }> }) {
  const sp = await searchParams;
  const orders = listOrders({ status: sp.estado || undefined, q: sp.q || undefined });
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl">Pedidos</h1>
        <form className="flex gap-2">
          {sp.estado && <input type="hidden" name="estado" value={sp.estado} />}
          <input name="q" defaultValue={sp.q} placeholder="Número, nombre o correo" aria-label="Buscar pedidos" className="field w-64" />
          <button className="btn btn-ink min-h-0 py-2">Buscar</button>
        </form>
      </div>
      <div className="scroll-row mt-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link key={t} href={t ? `/admin/pedidos?estado=${t}` : "/admin/pedidos"} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${(sp.estado ?? "") === t ? "border-ink bg-ink text-cream" : "border-line"}`}>
            {t ? ORDER_STATUS_LABEL[t] : "Todos"}
          </Link>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl bg-paper">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-normal">Pedido</th>
              <th className="font-normal">Cliente</th>
              <th className="font-normal">Fecha</th>
              <th className="font-normal">Contenido</th>
              <th className="font-normal">Pago</th>
              <th className="font-normal">Estado</th>
              <th className="px-4 text-right font-normal">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-soft">No hay pedidos con estos filtros.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-cream/60">
                <td className="px-4 py-3"><Link href={`/admin/pedidos/${o.id}`} className="link font-semibold">{o.number}</Link></td>
                <td>{o.name}<span className="block text-xs text-ink-soft">{o.email}</span></td>
                <td>{date(o.createdAt)}</td>
                <td>{o.items.some((i) => i.format === "fisico") ? "Físico" : ""}{o.items.some((i) => i.format === "fisico") && o.items.some((i) => i.format === "pdf") ? " + " : ""}{o.items.some((i) => i.format === "pdf") ? "PDF" : ""}</td>
                <td className="capitalize">{o.paymentMethod} · <span className={o.paymentStatus === "pagado" ? "text-olive" : "text-ink-soft"}>{o.paymentStatus}</span></td>
                <td>{ORDER_STATUS_LABEL[o.status]}</td>
                <td className="px-4 text-right tabular-nums">{money(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
