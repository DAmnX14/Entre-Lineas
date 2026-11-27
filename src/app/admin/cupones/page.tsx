import { listCoupons } from "@/lib/repo";
import { money, date } from "@/lib/format";
import { deleteCouponAction, toggleCouponAction } from "@/lib/actions/admin";
import { CouponForm } from "./CouponForm";

export default function CouponsAdmin() {
  const coupons = listCoupons();
  return (
    <div>
      <h1 className="text-4xl">Cupones y promociones</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">Los cupones se cargan en el carrito. Para promociones por libro (precio tachado), editá el libro y cargá un precio anterior.</p>
      <section className="mt-6 rounded-xl bg-paper p-6"><CouponForm /></section>
      <div className="mt-6 overflow-x-auto rounded-xl bg-paper">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-line text-ink-soft"><tr><th className="px-4 py-3 font-normal">Código</th><th className="font-normal">Beneficio</th><th className="font-normal">Mínimo</th><th className="font-normal">Usos</th><th className="font-normal">Vence</th><th className="px-4 font-normal">Acciones</th></tr></thead>
          <tbody className="divide-y divide-line">
            {coupons.map((c) => (
              <tr key={c.id} className={c.active ? "" : "opacity-55"}>
                <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                <td>{c.type === "percent" ? `${c.value}%` : c.type === "fixed" ? money(c.value) : "Envío gratis"}</td>
                <td>{c.minTotal ? money(c.minTotal) : "—"}</td>
                <td>{c.uses}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                <td>{c.expiresAt ? date(c.expiresAt) : "—"}</td>
                <td className="px-4">
                  <div className="flex gap-3">
                    <form action={toggleCouponAction}><input type="hidden" name="id" value={c.id} /><button className="underline">{c.active ? "Pausar" : "Activar"}</button></form>
                    <form action={deleteCouponAction}><input type="hidden" name="id" value={c.id} /><button className="text-clay-deep underline">Eliminar</button></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
