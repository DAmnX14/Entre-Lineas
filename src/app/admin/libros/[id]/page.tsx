import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookById } from "@/lib/repo";
import { sectionsToText } from "@/lib/sections-text";
import { BookForm } from "../BookForm";

export default async function EditBook({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const b = getBookById(Number((await params).id));
  if (!b) notFound();
  const { ok } = await searchParams;
  return (
    <div>
      <Link href="/admin/libros" className="text-sm text-ink-soft hover:text-ink">← Libros</Link>
      <div className="mt-2 mb-8 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-4xl">{b.title}</h1>
        <Link href={`/libros/${b.slug}`} target="_blank" className="link text-sm">Ver en la tienda</Link>
      </div>
      <BookForm key={b.id} saved={!!ok} v={{ ...b, sectionsText: sectionsToText(b.sections) }} />
    </div>
  );
}
