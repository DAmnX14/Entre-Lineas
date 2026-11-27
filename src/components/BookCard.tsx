import Link from "next/link";
import type { Book } from "@/lib/repo";
import { money } from "@/lib/format";
import { BADGES } from "@/lib/content/taxonomy";
import { BookCover } from "./BookCover";
import { FavoriteButton } from "./FavoriteButton";

export function BookCard({ book }: { book: Book }) {
  return (
    <article className="group relative flex flex-col">
      <Link href={`/libros/${book.slug}`} className="relative block" aria-label={book.title}>
        <div className="rounded-md bg-linen px-[14%] pt-[12%] pb-[10%] transition-colors group-hover:bg-rose/60">
          <BookCover title={book.title} category={book.category} image={book.coverImage} />
        </div>
        {book.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-cream px-3 py-1 text-xs font-semibold text-clay-deep">
            {BADGES[book.badge] ?? book.badge}
          </span>
        )}
      </Link>
      <FavoriteButton slug={book.slug} title={book.title} className="absolute top-2 right-2" />
      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-xl leading-snug">
          <Link href={`/libros/${book.slug}`} className="hover:text-clay-deep">
            {book.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-ink-soft">{book.tagline}</p>
        <dl className="mt-3 flex gap-5 text-sm">
          {book.hasFisico && (
            <div>
              <dt className="text-xs text-ink-soft">Libro físico</dt>
              <dd className="font-semibold">
                {book.compareFisico && book.compareFisico > book.priceFisico && (
                  <s className="mr-1.5 font-normal text-ink-soft">{money(book.compareFisico)}</s>
                )}
                {money(book.priceFisico)}
              </dd>
            </div>
          )}
          {book.hasPdf && (
            <div>
              <dt className="text-xs text-ink-soft">PDF</dt>
              <dd className="font-semibold">{money(book.pricePdf)}</dd>
            </div>
          )}
        </dl>
        <Link href={`/libros/${book.slug}`} className="link mt-3 self-start text-sm font-semibold">
          Ver libro
        </Link>
      </div>
    </article>
  );
}
