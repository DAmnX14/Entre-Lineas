"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TestPayButton({ number, token }: { number: string; token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn btn-primary"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/pagos/prueba", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number, token }) });
        router.refresh();
        setBusy(false);
      }}
    >
      {busy ? "Aprobando…" : "Simular pago aprobado"}
    </button>
  );
}

export function RenewDownloads({ number, token }: { number: string; token?: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "ok" | "error">("idle");
  return (
    <div>
      <button
        className="text-sm font-semibold text-clay-deep underline underline-offset-2"
        disabled={state === "busy"}
        onClick={async () => {
          setState("busy");
          const res = await fetch("/api/descargas/renovar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number, token }) });
          setState(res.ok ? "ok" : "error");
          router.refresh();
        }}
      >
        Generar enlaces nuevos y reenviarlos por correo
      </button>
      {state === "ok" && <p className="mt-1 text-sm text-olive">Listo. Generamos enlaces nuevos y los enviamos a tu correo.</p>}
      {state === "error" && <p className="mt-1 text-sm text-clay-deep">No pudimos generar los enlaces. Escribinos por WhatsApp y lo resolvemos.</p>}
    </div>
  );
}
