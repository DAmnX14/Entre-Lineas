"use client";

import { useActionState } from "react";
import { saveBookAction, deleteBookAction, type AdminState } from "@/lib/actions/admin";
import { CATEGORIES, OCCASIONS, RECIPIENTS, BADGES } from "@/lib/content/taxonomy";
import { FormStatus } from "../FormStatus";

export type BookFormValues = {
  id?: number;
  slug: string;
  title: string;
  category: string;
  recipients: string[];
  occasions: string[];
  tagline: string;
  description: string;
  whoFor: string;
  badge: string | null;
  featured: boolean;
  sectionsText: string;
  priceFisico: number;
  pricePdf: number;
  compareFisico: number | null;
  comparePdf: number | null;
  hasFisico: boolean;
  hasPdf: boolean;
  stock: number;
  active: boolean;
  coverImage: string | null;
  pdfFile: string | null;
};

export function BookForm({ v, saved }: { v: BookFormValues; saved?: boolean }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveBookAction, saved ? { ok: "Libro creado." } : undefined);
  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <div className="space-y-6">
        <section className="space-y-4 rounded-xl bg-paper p-6">
          <div><label className="label" htmlFor="title">Título</label><input id="title" name="title" required defaultValue={v.title} className="field" /></div>
          <div><label className="label" htmlFor="slug">Dirección web</label><input id="slug" name="slug" defaultValue={v.slug} placeholder="se genera con el título" className="field" /><p className="mt-1 text-xs text-ink-soft">/libros/{v.slug || "…"}</p></div>
          <div><label className="label" htmlFor="tagline">Frase breve</label><input id="tagline" name="tagline" defaultValue={v.tagline} className="field" /></div>
          <div><label className="label" htmlFor="description">Descripción emocional</label><textarea id="description" name="description" defaultValue={v.description} className="field min-h-28" /></div>
          <div><label className="label" htmlFor="whoFor">Para quién está pensado</label><textarea id="whoFor" name="whoFor" defaultValue={v.whoFor} className="field min-h-16" /></div>
        </section>
        <section className="rounded-xl bg-paper p-6">
          <label className="label" htmlFor="sections">Estructura del libro</label>
          <p className="mb-2 text-xs text-ink-soft">
            Cada capítulo empieza con <code>## Título [tipo]</code> (tipos: preguntas, fotos, carta, dedicatoria, arbol). Una línea con <code>&gt;</code> es la introducción. Cada línea con <code>-</code> es una pregunta o espacio.
          </p>
          <textarea id="sections" name="sections" defaultValue={v.sectionsText} className="field min-h-[32rem] font-mono text-sm leading-relaxed" spellCheck />
        </section>
      </div>
      <aside className="space-y-6">
        <section className="space-y-3 rounded-xl bg-paper p-6">
          <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={v.active} className="accent-clay" /> Publicado en la tienda</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={v.featured} className="accent-clay" /> Destacado en el inicio</label>
          <div><label className="label" htmlFor="badge">Etiqueta</label>
            <select id="badge" name="badge" defaultValue={v.badge ?? ""} className="field"><option value="">Sin etiqueta</option>{Object.entries(BADGES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </div>
          <FormStatus state={state} />
          <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Guardando…" : v.id ? "Guardar cambios" : "Crear libro"}</button>
        </section>
        <section className="space-y-3 rounded-xl bg-paper p-6">
          <h2 className="text-lg">Formatos y precios</h2>
          <label className="flex items-center gap-2"><input type="checkbox" name="hasFisico" defaultChecked={v.hasFisico} className="accent-clay" /> Libro físico</label>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label" htmlFor="pf">Precio</label><input id="pf" name="priceFisico" inputMode="numeric" defaultValue={v.priceFisico} className="field" /></div>
            <div><label className="label" htmlFor="cf">Precio anterior</label><input id="cf" name="compareFisico" inputMode="numeric" defaultValue={v.compareFisico ?? ""} placeholder="promo" className="field" /></div>
          </div>
          <div><label className="label" htmlFor="stock">Stock físico</label><input id="stock" name="stock" type="number" min={0} defaultValue={v.stock} className="field" /></div>
          <label className="flex items-center gap-2 pt-2"><input type="checkbox" name="hasPdf" defaultChecked={v.hasPdf} className="accent-clay" /> PDF digital</label>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label" htmlFor="pp">Precio</label><input id="pp" name="pricePdf" inputMode="numeric" defaultValue={v.pricePdf} className="field" /></div>
            <div><label className="label" htmlFor="cp">Precio anterior</label><input id="cp" name="comparePdf" inputMode="numeric" defaultValue={v.comparePdf ?? ""} placeholder="promo" className="field" /></div>
          </div>
          <p className="text-xs text-ink-soft">Si cargás un precio anterior mayor, se muestra tachado como promoción.</p>
        </section>
        <section className="space-y-3 rounded-xl bg-paper p-6">
          <h2 className="text-lg">Archivos</h2>
          <div><label className="label" htmlFor="cover">Portada (JPG, PNG o WebP)</label><input id="cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
            {v.coverImage && <label className="mt-1 flex items-center gap-2 text-xs"><input type="checkbox" name="removeCover" /> Quitar la portada subida y usar la tapa generada</label>}
          </div>
          <div><label className="label" htmlFor="pdf">PDF diseñado</label><input id="pdf" name="pdf" type="file" accept="application/pdf" className="text-sm" />
            <p className="mt-1 text-xs text-ink-soft">{v.pdfFile ? "Hay un PDF subido." : "Sin PDF subido: se genera automáticamente desde la estructura, con la dedicatoria del cliente."}</p>
            {v.pdfFile && <label className="mt-1 flex items-center gap-2 text-xs"><input type="checkbox" name="removePdf" /> Quitar el PDF subido</label>}
          </div>
        </section>
        <section className="space-y-3 rounded-xl bg-paper p-6">
          <div><label className="label" htmlFor="category">Categoría</label>
            <select id="category" name="category" defaultValue={v.category} className="field">{Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.plural}</option>)}</select>
          </div>
          <fieldset><legend className="label">Destinatarios</legend>
            <div className="grid grid-cols-2 gap-1 text-sm">{RECIPIENTS.map((r) => <label key={r.key} className="flex items-center gap-2"><input type="checkbox" name="recipients" value={r.key} defaultChecked={v.recipients.includes(r.key)} className="accent-clay" />{r.label}</label>)}</div>
          </fieldset>
          <fieldset><legend className="label">Ocasiones</legend>
            <div className="grid grid-cols-2 gap-1 text-sm">{Object.entries(OCCASIONS).map(([k, l]) => <label key={k} className="flex items-center gap-2"><input type="checkbox" name="occasions" value={k} defaultChecked={v.occasions.includes(k)} className="accent-clay" />{l}</label>)}</div>
          </fieldset>
        </section>
        {v.id && (
          <section className="rounded-xl border border-line p-6">
            <p className="text-sm text-ink-soft">Si el libro tiene ventas, se oculta en lugar de borrarse para conservar el historial.</p>
            <button formAction={deleteBookAction} formNoValidate className="mt-3 text-sm font-semibold text-clay-deep underline" onClick={(e) => { if (!confirm("¿Eliminar este libro?")) e.preventDefault(); }}>Eliminar libro</button>
          </section>
        )}
      </aside>
    </form>
  );
}
