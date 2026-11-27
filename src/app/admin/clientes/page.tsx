import Link from "next/link";
import { listCustomers } from "@/lib/repo";
import { date, money } from "@/lib/format";

export default function CustomersAdmin() {
  const customers = listCustomers();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl">Clientes</h1>
        <a href="/api/admin/reportes?tipo=clientes" className="btn btn-ghost min-h-0 py-2">Descargar CSV</a>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl bg-paper">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-line text-ink-soft"><tr><th className="px-4 py-3 font-normal">Cliente</th><th className="font-normal">Cuenta</th><th className="font-normal">Desde</th><th className="font-normal">Compras</th><th className="px-4 text-right font-normal">Total gastado</th></tr></thead>
          <tbody className="divide-y divide-line">
            {customers.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-soft">Todavía no hay clientes.</td></tr>}
            {customers.map((c) => (
              <tr key={c.email}>
                <td className="px-4 py-3">{c.name}<Link href={`/admin/pedidos?q=${encodeURIComponent(c.email)}`} className="link block text-xs">{c.email}</Link></td>
                <td>{c.id ? "Registrado" : "Invitado"}</td>
                <td>{date(c.created_at)}</td>
                <td>{c.orders}</td>
                <td className="px-4 text-right tabular-nums">{money(c.spent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
