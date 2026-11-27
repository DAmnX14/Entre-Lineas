import type { Metadata } from "next";
import { PackCard } from "@/components/PackCard";
import { getBooksBySlugs, listBooks, listPacks } from "@/lib/repo";

export const metadata: Metadata = { title: "Packs de regalo", description: "Combos de libros con descuento para regalar a toda la familia." };

export default function PacksPage() {
  const packs = listPacks();
  const all = listBooks();
  const mini = (b: (typeof all)[number]) => ({
    slug: b.slug,
    title: b.title,
    category: b.category,
    coverImage: b.coverImage,
    priceFisico: b.priceFisico,
    pricePdf: b.pricePdf,
  });
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:pt-14">
      <h1 className="text-4xl sm:text-5xl">Packs de regalo</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">
        Varios libros en una sola compra, con descuento. En los packs de fechas especiales elegís vos los libros. Todos se pueden comprar en papel o en PDF.
      </p>
      <div className="mt-12 space-y-8">
        {packs.map((p) => (
          <PackCard
            key={p.id}
            slug={p.slug}
            title={p.title}
            description={p.description}
            discountPercent={p.discountPercent}
            chooseCount={p.chooseCount}
            fixedBooks={getBooksBySlugs(p.bookSlugs).map(mini)}
            options={(p.allowedCategories.length ? all.filter((b) => p.allowedCategories.includes(b.category)) : all).map(mini)}
          />
        ))}
      </div>
    </div>
  );
}
