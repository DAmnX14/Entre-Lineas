"use client";

import { useActionState } from "react";
import { updateOrderAction, type AdminState } from "@/lib/actions/admin";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/order-status";
import { FormStatus } from "../../FormStatus";

export function OrderForm({ id, status, tracking }: { id: number; status: OrderStatus; tracking: string | null }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(updateOrderAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <div>
        <label className="label" htmlFor="status">Estado</label>
        <select id="status" name="status" defaultValue={status} className="field">
          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="tracking">Código de seguimiento</label>
        <input id="tracking" name="tracking" defaultValue={tracking ?? ""} className="field" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="notify" defaultChecked className="accent-clay" /> Avisar al cliente por correo
      </label>
      <FormStatus state={state} />
      <button className="btn btn-ink w-full" disabled={pending}>{pending ? "Guardando…" : "Guardar cambios"}</button>
      <p className="text-xs text-ink-soft">Pasar un pedido pendiente a «Pagado» o posterior lo registra como pagado: descuenta stock y habilita las descargas.</p>
    </form>
  );
}
