"use client";

import { useActionState } from "react";
import { sendContact, type ContactState } from "@/lib/actions/contact";

export function ContactForm({ tema }: { tema?: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, undefined);
  if (state?.ok)
    return <p className="font-hand text-3xl text-clay-deep">{tema === "opinion" ? "Gracias por contarnos tu experiencia." : "Recibimos tu mensaje. Te respondemos en menos de 24 horas hábiles."}</p>;
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="tema" value={tema ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Nombre</label>
          <input id="name" name="name" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" required className="field" />
        </div>
      </div>
      {tema === "opinion" && (
        <div>
          <label className="label" htmlFor="book">¿Qué libro regalaste?</label>
          <input id="book" name="book" className="field" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="message">{tema === "opinion" ? "Tu experiencia" : "Mensaje"}</label>
        <textarea id="message" name="message" required className="field min-h-36" />
        {tema === "opinion" && <p className="mt-1 text-xs text-ink-soft">Si nos das permiso, podemos publicarla en la web con tu nombre. La revisamos antes.</p>}
      </div>
      {state?.error && <p role="alert" className="rounded-lg bg-rose/60 p-3 text-sm">{state.error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Enviando…" : tema === "opinion" ? "Enviar mi opinión" : "Enviar mensaje"}</button>
    </form>
  );
}
