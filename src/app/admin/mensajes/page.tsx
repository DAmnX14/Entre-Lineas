import { listMessages, listOutbox, listSubscribers } from "@/lib/repo";
import { date } from "@/lib/format";
import { mailConfigured } from "@/lib/mailer";
import { retryEmailAction } from "@/lib/actions/admin";
import { TestEmailForm } from "./TestEmailForm";

const STATUS: Record<string, [string, string]> = {
  enviado: ["Enviado", "bg-sage text-ink"],
  pendiente: ["Enviando", "bg-linen text-ink-soft"],
  error: ["Error", "bg-rose text-clay-deep"],
  sin_configurar: ["Sin enviar", "bg-linen text-ink-soft"],
};

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
        <h2 className="text-2xl">Correos</h2>
        {mailConfigured() ? (
          <p className="mt-1 text-sm text-olive">El envío de correos está configurado.</p>
        ) : (
          <p className="mt-1 text-sm text-clay-deep">
            El envío de correos no está configurado: los correos se guardan acá pero no salen. Cargá SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y MAIL_FROM en las variables del servidor.
          </p>
        )}
        <div className="mt-4 rounded-xl bg-paper p-5"><TestEmailForm /></div>
        <ul className="mt-4 space-y-2">
          {outbox.length === 0 && <li className="text-sm text-ink-soft">Todavía no se generaron correos.</li>}
          {outbox.map((o) => {
            const [label, cls] = STATUS[o.status] ?? STATUS.pendiente;
            return (
              <li key={o.id}>
                <details className="rounded-lg bg-paper p-4 text-sm">
                  <summary className="flex cursor-pointer flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
                    <strong>{o.subject}</strong> → {o.to_email} <span className="text-ink-soft">· {date(o.created_at)}</span>
                  </summary>
                  {o.error && <p className="mt-2 rounded bg-rose/50 p-2 text-xs">{o.error}</p>}
                  <pre className="mt-2 font-sans whitespace-pre-wrap">{o.body}</pre>
                  {o.status !== "enviado" && (
                    <form action={retryEmailAction} className="mt-2">
                      <input type="hidden" name="id" value={o.id} />
                      <button className="text-sm font-semibold text-clay-deep underline">Enviar ahora</button>
                    </form>
                  )}
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
