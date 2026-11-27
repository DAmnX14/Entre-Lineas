"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, type FormState } from "@/lib/actions/auth";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : register, undefined);
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      {mode === "register" && (
        <div>
          <label className="label" htmlFor="name">Nombre</label>
          <input id="name" name="name" required autoComplete="name" className="field" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required minLength={mode === "register" ? 8 : undefined} autoComplete={mode === "login" ? "current-password" : "new-password"} className="field" />
      </div>
      {state?.error && <p role="alert" className="rounded-lg bg-rose/60 p-3 text-sm">{state.error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Un momento…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
      </button>
      <p className="text-center text-sm text-ink-soft">
        {mode === "login" ? (
          <>¿No tenés cuenta? <Link className="link" href={`/registro${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Creá una</Link></>
        ) : (
          <>¿Ya tenés cuenta? <Link className="link" href={`/ingresar${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Ingresá</Link></>
        )}
      </p>
    </form>
  );
}
