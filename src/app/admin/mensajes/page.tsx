import { listMessages, listOutbox, listSubscribers } from "@/lib/repo";
import { date } from "@/lib/format";

export default function MessagesAdmin() {
  const messages = listMessages();
  const subs = listSubscribers();
  const outbox = listOutbox();
  return (
    <div className="space-y-10">
      <h1 className="text-4xl">Mensajes y correos</h1>
      <section>
        <h2 className="text-2xl">Mensajes de contacto</h2>
        <ul className="mt-3 space-y-2">
          {messages.length === 0 && <li className="text-sm text-ink-soft">Sin mensajes.</li>}
          {messages.map((m) => (
            <li key={m.id} className="rounded-lg bg-paper p-4 text-sm">
              <p className="font-semibold">{m.name} · <a className="link" href={`mailto:${m.email}`}>{m.email}</a> <span className="font-normal text-ink-soft">· {date(m.created_at)}</span></p>
              <p className="mt-1 whitespace-pre-line">{m.message}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl">Newsletter ({subs.length})</h2>
          <a href="/api/admin/reportes?tipo=newsletter" className="link text-sm">Descargar CSV</a>
        </div>
        <p className="mt-2 text-sm text-ink-soft">{subs.slice(0, 30).map((s) => s.email).join(", ") || "Sin suscriptores todavía."}</p>
      </section>
      <section>
        <h2 className="text-2xl">Correos generados</h2>
        <p className="mt-1 text-sm text-ink-soft">Confirmaciones, descargas y avisos de envío. Para enviarlos de verdad, conectá un proveedor de correo (ver README).</p>
        <ul className="mt-3 space-y-2">
          {outbox.map((o) => (
            <li key={o.id}>
              <details className="rounded-lg bg-paper p-4 text-sm">
                <summary className="cursor-pointer"><strong>{o.subject}</strong> → {o.to_email} <span className="text-ink-soft">· {date(o.created_at)}</span></summary>
                <pre className="mt-2 font-sans whitespace-pre-wrap">{o.body}</pre>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
