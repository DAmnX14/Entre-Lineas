import { listTestimonials } from "@/lib/repo";
import { testimonialAction } from "@/lib/actions/admin";
import { date } from "@/lib/format";

export default function TestimonialsAdmin() {
  const items = listTestimonials(false);
  return (
    <div>
      <h1 className="text-4xl">Opiniones</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">Solo se publican en el inicio las opiniones aprobadas. Publicá únicamente opiniones reales de clientes, con su permiso.</p>
      <details className="mt-6 rounded-xl bg-paper p-6">
        <summary className="cursor-pointer text-xl">Cargar una opinión recibida por otro medio</summary>
        <form action={testimonialAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="op" value="add" />
          <div><label className="label" htmlFor="tn">Nombre</label><input id="tn" name="name" required className="field" placeholder="Lucía, de Rosario" /></div>
          <div><label className="label" htmlFor="tb">Libro</label><input id="tb" name="book" className="field" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="tt">Opinión</label><textarea id="tt" name="text" required className="field min-h-24" /></div>
          <button className="btn btn-ink w-fit">Publicar opinión</button>
        </form>
      </details>
      <ul className="mt-6 space-y-3">
        {items.length === 0 && <li className="text-ink-soft">Todavía no llegaron opiniones. Se reciben desde /contacto?tema=opinion.</li>}
        {items.map((t) => (
          <li key={t.id} className="rounded-xl bg-paper p-6">
            <p className="serif text-lg">«{t.text}»</p>
            <p className="mt-2 text-sm text-ink-soft">{t.name}{t.bookTitle && ` · ${t.bookTitle}`} · {date(t.createdAt)} · {t.approved ? "Publicada" : "Pendiente"}</p>
            <div className="mt-3 flex gap-4 text-sm">
              <form action={testimonialAction}><input type="hidden" name="id" value={t.id} /><input type="hidden" name="op" value={t.approved ? "hide" : "approve"} /><button className="underline">{t.approved ? "Ocultar" : "Aprobar y publicar"}</button></form>
              <form action={testimonialAction}><input type="hidden" name="id" value={t.id} /><input type="hidden" name="op" value="delete" /><button className="text-clay-deep underline">Eliminar</button></form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
