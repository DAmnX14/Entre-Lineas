import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { date, money } from "@/lib/format";
import { downloadsForOrder, isDownloadValid, listOrders, ORDER_STATUS_LABEL } from "@/lib/repo";
import { FavoritesList } from "@/components/FavoritesList";
import { RenewDownloads } from "@/components/OrderActions";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireUser("/cuenta");
  const orders = listOrders({ email: user.email });
  const paid = orders.filter((o) => o.paymentStatus === "pagado");
  const downloads = paid.flatMap((o) => downloadsForOrder(o.id).map((d) => ({ ...d, order: o })));

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-hand text-3xl text-clay-deep">Hola, {user.name.split(" ")[0] || "de nuevo"}.</p>
          <h1 className="text-4xl">Mi cuenta</h1>
        </div>
        <div className="flex gap-3">
          {user.role === "admin" && <Link href="/admin" className="btn btn-ink">Panel de administración</Link>}
          <form action={logout}>
            <button className="btn btn-ghost">Cerrar sesión</button>
          </form>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="mis-descargas">
        <h2 id="mis-descargas" className="text-2xl">Mis descargas</h2>
        {downloads.length === 0 ? (
          <p className="mt-3 text-ink-soft">Cuando compres un libro en PDF, vas a poder descargarlo desde acá.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {downloads.map((d) => (
              <li key={d.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="serif text-lg">{d.title}</p>
                  <p className="text-xs text-ink-soft">Pedido {d.order.number}</p>
                </div>
                {isDownloadValid(d) ? (
                  <a href={`/api/descargas/${d.token}`} className="btn btn-primary min-h-0 py-2">Descargar PDF</a>
                ) : (
                  <RenewDownloads number={d.order.number} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12" aria-labelledby="mis-pedidos">
        <h2 id="mis-pedidos" className="text-2xl">Historial de compras</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-ink-soft">Todavía no hiciste pedidos con este correo.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-line text-ink-soft">
                <tr><th className="py-2 font-normal">Pedido</th><th className="font-normal">Fecha</th><th className="font-normal">Estado</th><th className="text-right font-normal">Total</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3"><Link href={`/pedido/${o.number}?t=${o.publicToken}`} className="link font-semibold">{o.number}</Link></td>
                    <td>{date(o.createdAt)}</td>
                    <td>{ORDER_STATUS_LABEL[o.status]}</td>
                    <td className="text-right">{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12" aria-labelledby="mis-favoritos">
        <h2 id="mis-favoritos" className="mb-6 text-2xl">Favoritos</h2>
        <FavoritesList />
      </section>
    </div>
  );
}
