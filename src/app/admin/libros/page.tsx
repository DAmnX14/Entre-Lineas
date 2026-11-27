import Link from "next/link";
import { listBooks } from "@/lib/repo";
import { CATEGORIES } from "@/lib/content/taxonomy";
import { money } from "@/lib/format";
import { adjustStockAction } from "@/lib/actions/admin";
import { BookCover } from "@/components/BookCover";

export default async function BooksAdmin({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const books = listBooks({ q }, true);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl">Libros</h1>
        <div className="flex gap-2">
          <form><input name="q" defaultValue={q} placeholder="Buscar libro" aria-label="Buscar libro" className="field w-56" /></form>
          <Link href="/admin/libros/nuevo" className="btn btn-primary min-h-0 py-2">Crear libro</Link>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl bg-paper">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr><th className="px-4 py-3 font-normal">Libro</th><th className="font-normal">Categoría</th><th className="font-normal">Físico</th><th className="font-normal">PDF</th><th className="font-normal">Stock</th><th className="px-4 font-normal">Estado</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {books.map((b) => (
              <tr key={b.id} className={b.active ? "" : "opacity-55"}>
                <td className="px-4 py-2">
                  <Link href={`/admin/libros/${b.id}`} className="flex items-center gap-3">
                    <span className="w-8 shrink-0"><BookCover title={b.title} category={b.category} image={b.coverImage} size="sm" /></span>
                    <span className="link font-semibold">{b.title}</span>
                  </Link>
                </td>
                <td>{CATEGORIES[b.category]?.label}</td>
                <td>{b.hasFisico ? money(b.priceFisico) : "—"}</td>
                <td>{b.hasPdf ? money(b.pricePdf) : "—"}{b.pdfFile ? "" : <span className="block text-xs text-ink-soft">PDF generado</span>}</td>
                <td>
                  <form action={adjustStockAction} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={b.id} />
                    <input name="stock" type="number" min={0} defaultValue={b.stock} aria-label={`Stock de ${b.title}`} className={`field w-20 px-2 py-1 ${b.stock <= 10 ? "border-clay" : ""}`} />
                    <button className="rounded px-2 py-1 text-xs underline">Guardar</button>
                  </form>
                </td>
                <td className="px-4">{b.active ? "Publicado" : "Oculto"}{b.featured && " · Destacado"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
