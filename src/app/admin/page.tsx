import Link from "next/link";
import { salesStats, ORDER_STATUS_LABEL, listOrders } from "@/lib/repo";
import { money, date } from "@/lib/format";
import { SalesChart } from "./SalesChart";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const days = [7, 30, 90].includes(Number((await searchParams).dias)) ? Number((await searchParams).dias) : 30;
  const s = salesStats(days);
  const fisico = s.byFormat.find((f) => f.format === "fisico") ?? { revenue: 0, units: 0 };
  const pdf = s.byFormat.find((f) => f.format === "pdf") ?? { revenue: 0, units: 0 };
  const toShip = listOrders({ status: "pagado" }).concat(listOrders({ status: "en_preparacion" })).slice(0, 6);
  const maxTop = Math.max(1, ...s.top.map((t) => t.units));

  const tiles = [
    ["Ingresos", money(s.totals.revenue)],
    ["Pedidos pagados", String(s.totals.orders)],
    ["Ticket promedio", money(Math.round(s.totals.avg))],
    ["Libros físicos", `${fisico.units} u. · ${money(fisico.revenue)}`],
    ["PDF", `${pdf.units} u. · ${money(pdf.revenue)}`],
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl">Resumen</h1>
        <div className="flex gap-1 rounded-full bg-linen p-1 text-sm" role="group" aria-label="Período">
          {[7, 30, 90].map((d) => (
            <Link key={d} href={`/admin?dias=${d}`} aria-current={d === days ? "true" : undefined} className={`rounded-full px-4 py-1.5 ${d === days ? "bg-ink text-cream" : ""}`}>
              {d} días
            </Link>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map(([k, v]) => (
          <div key={k} className="rounded-lg bg-paper p-5">
            <dt className="text-sm text-ink-soft">{k}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="rounded-xl bg-paper p-6">
        <h2 className="mb-4 text-2xl">Ventas de productos por día</h2>
        <SalesChart data={s.series} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl bg-paper p-6">
          <h2 className="text-2xl">Más vendidos</h2>
          {s.top.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Aparecen cuando haya ventas pagadas.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {s.top.map((t) => (
                <li key={t.title + t.kind}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span>{t.title}</span>
                    <span className="tabular-nums text-ink-soft">{t.units} u. · {money(t.revenue)}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-linen">
                    <div className="h-2 rounded-full bg-clay" style={{ width: `${(t.units / maxTop) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl bg-paper p-6">
          <h2 className="text-2xl">Para despachar</h2>
          {toShip.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">No hay pedidos pagados esperando envío.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {toShip.map((o) => (
                <li key={o.id} className="flex justify-between gap-3 py-2 text-sm">
                  <Link href={`/admin/pedidos/${o.id}`} className="link font-semibold">{o.number}</Link>
                  <span className="text-ink-soft">{o.name} · {date(o.paidAt)}</span>
                  <span>{ORDER_STATUS_LABEL[o.status]}</span>
                </li>
              ))}
            </ul>
          )}
          <h3 className="mt-8 text-lg">Pedidos por estado</h3>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {s.byStatus.map((b) => (
              <li key={b.status}>
                <Link href={`/admin/pedidos?estado=${b.status}`} className="block rounded-full bg-cream px-3 py-1.5 hover:bg-linen">
                  {ORDER_STATUS_LABEL[b.status]}: <strong>{b.n}</strong>
                </Link>
              </li>
            ))}
          </ul>
          {s.lowStock.length > 0 && (
            <>
              <h3 className="mt-8 text-lg">Stock bajo</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {s.lowStock.map((b) => (
                  <li key={b.id}><Link href={`/admin/libros/${b.id}`} className="link">{b.title}</Link>: {b.stock} u.</li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
