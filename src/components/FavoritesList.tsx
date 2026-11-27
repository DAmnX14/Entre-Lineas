"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import { useFavorites } from "./favorites";
import { BookCover } from "./BookCover";
import { FavoriteButton } from "./FavoriteButton";

type Mini = { slug: string; title: string; tagline: string; category: string; coverImage: string | null; priceFisico: number; pricePdf: number };

export function FavoritesList() {
  const slugs = useFavorites((s) => s.slugs);
  const merge = useFavorites((s) => s.merge);
  const [books, setBooks] = useState<Mini[] | null>(null);

  useEffect(() => {
    fetch("/api/favoritos").then((r) => r.json()).then((d: { slugs: string[] }) => d.slugs.length && merge(d.slugs)).catch(() => {});
  }, [merge]);
  useEffect(() => {
    if (!slugs.length) return;
    fetch(`/api/libros?slugs=${slugs.join(",")}`).then((r) => r.json()).then(setBooks);
  }, [slugs]);

  if (slugs.length && !books) return <p className="text-ink-soft">Cargando…</p>;
  if (!slugs.length || !books || !books.length)
    return (
      <div>
        <p className="font-hand text-3xl text-ink-soft">Todavía no guardaste libros.</p>
        <p className="mt-2 text-ink-soft">Tocá el corazón en cualquier libro para guardarlo acá.</p>
        <Link href="/libros" className="btn btn-ghost mt-5">Ver los libros</Link>
      </div>
    );
  return (
    <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {books.filter((b) => slugs.includes(b.slug)).map((b) => (
        <li key={b.slug} className="relative">
          <Link href={`/libros/${b.slug}`} className="block rounded-md bg-linen px-[14%] py-[12%]">
            <BookCover title={b.title} category={b.category} image={b.coverImage} size="sm" />
          </Link>
          <FavoriteButton slug={b.slug} title={b.title} className="absolute top-2 right-2" />
          <p className="serif mt-3 text-lg leading-snug">{b.title}</p>
          <p className="text-sm text-ink-soft">Desde {money(Math.min(b.pricePdf, b.priceFisico))}</p>
        </li>
      ))}
    </ul>
  );
}
