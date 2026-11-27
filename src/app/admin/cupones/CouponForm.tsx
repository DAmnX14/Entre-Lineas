"use client";

import { useActionState } from "react";
import { saveCouponAction, type AdminState } from "@/lib/actions/admin";
import { FormStatus } from "../FormStatus";

export function CouponForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveCouponAction, undefined);
  return (
    <form action={action} className="grid items-end gap-3 sm:grid-cols-3 lg:grid-cols-7">
      <div className="lg:col-span-2"><label className="label" htmlFor="code">Código</label><input id="code" name="code" required className="field uppercase" placeholder="MAMA2026" /></div>
      <div><label className="label" htmlFor="type">Tipo</label><select id="type" name="type" className="field"><option value="percent">Porcentaje</option><option value="fixed">Monto fijo</option><option value="free_shipping">Envío gratis</option></select></div>
      <div><label className="label" htmlFor="value">Valor</label><input id="value" name="value" inputMode="numeric" className="field" placeholder="10" /></div>
      <div><label className="label" htmlFor="min">Compra mínima</label><input id="min" name="minTotal" inputMode="numeric" className="field" placeholder="0" /></div>
      <div><label className="label" htmlFor="max">Usos máx.</label><input id="max" name="maxUses" inputMode="numeric" className="field" placeholder="sin límite" /></div>
      <div><label className="label" htmlFor="exp">Vence</label><input id="exp" name="expiresAt" type="date" className="field" /></div>
      <div className="flex items-center gap-3 sm:col-span-3 lg:col-span-7">
        <button className="btn btn-ink" disabled={pending}>Crear cupón</button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
