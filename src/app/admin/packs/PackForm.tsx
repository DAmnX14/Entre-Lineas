"use client";

import { useActionState } from "react";
import { savePackAction, type AdminState } from "@/lib/actions/admin";
import { CATEGORIES, OCCASIONS } from "@/lib/content/taxonomy";
import { FormStatus } from "../FormStatus";

type P = { id?: number; title: string; slug: string; description: string; discountPercent: number; bookSlugs: string[]; chooseCount: number; allowedCategories: string[]; occasion: string | null; active: boolean };

export function PackForm({ p, books }: { p: P; books: { slug: string; title: string }[] }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(savePackAction, undefined);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <div><label className="label" htmlFor={`t${p.id}`}>Nombre</label><input id={`t${p.id}`} name="title" required defaultValue={p.title} className="field" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label" htmlFor={`d${p.id}`}>Descuento %</label><input id={`d${p.id}`} name="discountPercent" type="number" min={0} max={80} defaultValue={p.discountPercent} className="field" /></div>
        <div><label className="label" htmlFor={`c${p.id}`}>El cliente elige</label><input id={`c${p.id}`} name="chooseCount" type="number" min={0} max={6} defaultValue={p.chooseCount} className="field" /></div>
      </div>
      <div className="md:col-span-2"><label className="label" htmlFor={`ds${p.id}`}>Descripción</label><input id={`ds${p.id}`} name="description" defaultValue={p.description} className="field" /></div>
      <fieldset className="md:col-span-2">
        <legend className="label">Libros fijos del pack (si «el cliente elige» es 0)</legend>
        <div className="grid max-h-48 gap-1 overflow-y-auto rounded-lg border border-line bg-cream p-2 text-sm sm:grid-cols-2">
          {books.map((b) => <label key={b.slug} className="flex items-center gap-2"><input type="checkbox" name="books" value={b.slug} defaultChecked={p.bookSlugs.includes(b.slug)} className="accent-clay" />{b.title}</label>)}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">Si el cliente elige, limitar a</legend>
        <div className="grid grid-cols-2 gap-1 text-sm">{Object.entries(CATEGORIES).map(([k, c]) => <label key={k} className="flex items-center gap-2"><input type="checkbox" name="allowedCategories" value={k} defaultChecked={p.allowedCategories.includes(k)} className="accent-clay" />{c.label}</label>)}</div>
      </fieldset>
      <div className="space-y-3">
        <div><label className="label" htmlFor={`o${p.id}`}>Ocasión</label><select id={`o${p.id}`} name="occasion" defaultValue={p.occasion ?? ""} className="field"><option value="">Ninguna</option>{Object.entries(OCCASIONS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={p.active} className="accent-clay" /> Publicado</label>
      </div>
      <div className="flex items-center gap-3 md:col-span-2">
        <button className="btn btn-ink" disabled={pending}>{p.id ? "Guardar pack" : "Crear pack"}</button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
