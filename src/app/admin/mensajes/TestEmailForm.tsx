"use client";

import { useActionState } from "react";
import { testEmailAction, type AdminState } from "@/lib/actions/admin";
import { FormStatus } from "../FormStatus";

export function TestEmailForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(testEmailAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="label" htmlFor="to">Enviar un correo de prueba a</label>
        <input id="to" name="to" type="email" placeholder="tu correo (por defecto, el del administrador)" className="field" />
      </div>
      <button className="btn btn-ink min-h-0 py-2.5" disabled={pending}>{pending ? "Enviando…" : "Enviar prueba"}</button>
      <div className="sm:basis-full"><FormStatus state={state} /></div>
    </form>
  );
}
