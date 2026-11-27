import { listBooks, listPacks } from "@/lib/repo";
import { deletePackAction } from "@/lib/actions/admin";
import { PackForm } from "./PackForm";

export default function PacksAdmin() {
  const packs = listPacks(true);
  const books = listBooks({}, true).map((b) => ({ slug: b.slug, title: b.title }));
  return (
    <div>
      <h1 className="text-4xl">Packs</h1>
      <details className="mt-6 rounded-xl bg-paper p-6">
        <summary className="cursor-pointer text-xl">Crear un pack nuevo</summary>
        <div className="mt-5"><PackForm p={{ title: "", slug: "", description: "", discountPercent: 15, bookSlugs: [], chooseCount: 0, allowedCategories: [], occasion: null, active: true }} books={books} /></div>
      </details>
      <div className="mt-6 space-y-3">
        {packs.map((p) => (
          <details key={p.id} className="rounded-xl bg-paper p-6">
            <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2">
              <span className="text-xl">{p.title} <span className="text-sm text-ink-soft">−{p.discountPercent}% · {p.chooseCount ? `elige ${p.chooseCount}` : `${p.bookSlugs.length} libros`}{p.active ? "" : " · oculto"}</span></span>
            </summary>
            <div className="mt-5"><PackForm p={p} books={books} /></div>
            <form action={deletePackAction} className="mt-4"><input type="hidden" name="id" value={p.id} /><button className="text-sm text-clay-deep underline">Eliminar pack</button></form>
          </details>
        ))}
      </div>
    </div>
  );
}
