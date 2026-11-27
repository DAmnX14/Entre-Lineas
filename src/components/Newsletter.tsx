"use client";

import { useState } from "react";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const email = new FormData(e.currentTarget).get("email");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) setState("ok");
    else {
      setError((await res.json()).error ?? "Revisá el correo e intentá de nuevo.");
      setState("error");
    }
  }

  if (state === "ok")
    return <p className={`font-hand text-3xl ${dark ? "text-cream" : "text-ink"}`}>Listo, ya estás en la lista. Gracias.</p>;

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`nl-${dark}`} className="sr-only">
          Tu correo electrónico
        </label>
        <input
          id={`nl-${dark}`}
          name="email"
          type="email"
          required
          placeholder="tu@correo.com"
          className={`field flex-1 rounded-full px-5 ${dark ? "border-transparent" : ""}`}
        />
        <button className="btn btn-primary" disabled={state === "sending"}>
          {state === "sending" ? "Suscribiendo…" : "Suscribirme"}
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-sm text-clay">{error}</p>}
      <p className={`mt-3 text-xs ${dark ? "text-cream/70" : "text-ink-soft"}`}>
        Un correo por mes, como mucho. Te podés dar de baja cuando quieras.
      </p>
    </form>
  );
}
