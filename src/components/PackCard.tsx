"use client";

import { useMemo, useState } from "react";
import { money } from "@/lib/format";
import { useCart } from "./cart/store";
import { BookCover } from "./BookCover";

type MiniBook = { slug: string; title: string; category: string; coverImage: string | null; priceFisico: number; pricePdf: number };

type Props = {
  slug: string;
  title: string;
  description: string;
  discountPercent: number;
  chooseCount: number;
  fixedBooks: MiniBook[];
  options: MiniBook[];
};

export function PackCard(p: Props) {
  const [format, setFormat] = useState<"fisico" | "pdf">("fisico");
  const [chosen, setChosen] = useState<string[]>([]);
  const add = useCart((s) => s.add);
  const books = p.chooseCount > 0 ? p.options.filter((b) => chosen.includes(b.slug)) : p.fixedBooks;
  const list = books.reduce((s, b) => s + (format === "fisico" ? b.priceFisico : b.pricePdf), 0);
  const price = Math.round((list * (100 - p.discountPercent)) / 100 / 100) * 100;
  const ready = p.chooseCount === 0 || chosen.length === p.chooseCount;
  const shown = useMemo(() => (books.length ? books : p.options.slice(0, p.chooseCount)), [books, p.options, p.chooseCount]);

  return (
    <article id={p.slug} className="scroll-mt-24 rounded-xl bg-cream p-6 sm:p-8">
      <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative flex h-56 items-end justify-center rounded-lg bg-linen px-6 pb-6 sm:h-64">
          {shown.map((b, i) => {
            const mid = (shown.length - 1) / 2;
            return (
              <div
                key={b.slug + i}
                className={`absolute bottom-6 w-[26%] ${books.length ? "" : "opacity-30 grayscale"}`}
                style={{ transform: `translateX(${(i - mid) * 92}%) rotate(${(i - mid) * 4}deg)`, zIndex: i }}
              >
                <BookCover title={books.length ? b.title : "Tu elección"} category={b.category} image={books.length ? b.coverImage : null} size="sm" />
              </div>
            );
          })}
          <span className="absolute top-4 right-4 z-10 grid h-[4.5rem] w-[4.5rem] rotate-12 place-items-center rounded-full bg-clay text-center leading-none font-bold text-white">
            −{p.discountPercent}%
          </span>
        </div>
        <div className="flex flex-col">
          <h2 className="text-3xl">{p.title}</h2>
          <p className="mt-2 text-ink-soft">{p.description}</p>

          {p.chooseCount > 0 ? (
            <fieldset className="mt-5">
              <legend className="label">
                Elegí {p.chooseCount} libros ({chosen.length}/{p.chooseCount})
              </legend>
              <div className="scroll-row mt-1 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-line bg-paper/50 p-2">
                {p.options.map((b) => {
                  const on = chosen.includes(b.slug);
                  const full = !on && chosen.length >= p.chooseCount;
                  return (
                    <label key={b.slug} className={`flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-cream ${full ? "opacity-40" : ""}`}>
                      <input
                        type="checkbox"
                        className="accent-clay"
                        checked={on}
                        disabled={full}
                        onChange={() => setChosen((c) => (on ? c.filter((x) => x !== b.slug) : [...c, b.slug]))}
                      />
                      <span className="flex-1">{b.title}</span>
                      <span className="text-ink-soft">{money(format === "fisico" ? b.priceFisico : b.pricePdf)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <ul className="mt-4 space-y-1 text-sm">
              {p.fixedBooks.map((b) => (
                <li key={b.slug}>· {b.title}</li>
              ))}
            </ul>
          )}

          <div className="mt-5 grid max-w-xs grid-cols-2 gap-1 rounded-full bg-linen p-1 text-sm font-semibold" role="radiogroup" aria-label="Formato del pack">
            {(["fisico", "pdf"] as const).map((f) => (
              <button key={f} role="radio" aria-checked={format === f} onClick={() => setFormat(f)} className={`rounded-full py-2 ${format === f ? "bg-ink text-cream" : ""}`}>
                {f === "fisico" ? "Libros físicos" : "PDF digitales"}
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
            <p aria-live="polite">
              {list > 0 ? (
                <>
                  <s className="mr-2 text-ink-soft">{money(list)}</s>
                  <span className="text-2xl font-semibold">{money(price)}</span>
                  <span className="block text-sm text-olive">Ahorrás {money(list - price)}</span>
                </>
              ) : (
                <span className="text-ink-soft">Elegí los libros para ver el precio.</span>
              )}
            </p>
            <button
              className="btn btn-primary"
              disabled={!ready}
              onClick={() => add({ kind: "pack", slug: p.slug, format, books: p.chooseCount ? chosen : undefined })}
            >
              Agregar el pack
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
