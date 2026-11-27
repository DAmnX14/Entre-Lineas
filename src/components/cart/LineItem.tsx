"use client";

import Link from "next/link";
import type { QuotedLine } from "@/lib/cart-types";
import { money } from "@/lib/format";
import { BookCover } from "../BookCover";
import { IconMinus, IconPlus } from "../Icons";
import { useCart } from "./store";

export function LineItem({ line, compact = false }: { line: QuotedLine; compact?: boolean }) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const update = useCart((s) => s.update);
  const p = line.personalization;
  const href = line.kind === "book" ? `/libros/${line.slug}` : `/packs#${line.slug}`;

  const Root = compact ? "li" : "div";
  return (
    <Root className="flex gap-4 py-5">
      <Link href={href} className="relative w-16 shrink-0 sm:w-20">
        {line.covers.slice(0, 3).map((c, i) => (
          <div key={i} className={i === 0 ? "relative" : "absolute inset-0"} style={i ? { transform: `translate(${i * 7}px, ${-i * 5}px)`, zIndex: -i } : undefined}>
            <BookCover title={c.title} category={c.category} image={c.image} size="sm" />
          </div>
        ))}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} className="serif block text-lg leading-snug hover:text-clay-deep">
              {line.title}
            </Link>
            {line.kind === "pack" && <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{line.subtitle}</p>}
          </div>
          <p className="shrink-0 font-semibold">{money(line.total)}</p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <label className="sr-only" htmlFor={`fmt-${line.id}`}>
            Formato
          </label>
          <select
            id={`fmt-${line.id}`}
            value={line.format}
            onChange={(e) => update(line.id, { format: e.target.value as "fisico" | "pdf" })}
            className="rounded-full border border-line bg-cream px-3 py-1.5 text-sm"
          >
            <option value="fisico">Libro físico</option>
            <option value="pdf">PDF digital</option>
          </select>
          <div className="flex items-center rounded-full border border-line bg-cream">
            <button className="p-2" onClick={() => setQty(line.id, line.qty - 1)} aria-label="Restar uno" disabled={line.qty <= 1}>
              <IconMinus />
            </button>
            <span className="w-6 text-center tabular-nums" aria-live="polite">
              {line.qty}
            </span>
            <button className="p-2" onClick={() => setQty(line.id, line.qty + 1)} aria-label="Sumar uno">
              <IconPlus />
            </button>
          </div>
          <button className="text-ink-soft underline underline-offset-2 hover:text-clay-deep" onClick={() => remove(line.id)}>
            Quitar
          </button>
        </div>

        {line.listUnitPrice > line.unitPrice && (
          <p className="mt-2 text-xs text-olive">
            Ahorrás {money((line.listUnitPrice - line.unitPrice) * line.qty)}
          </p>
        )}

        {!compact && p && (
          <div className="mt-3 rounded-lg bg-linen/70 px-3 py-2 text-sm">
            {p.recipientName && <p>Para: {p.recipientName}</p>}
            {p.fromName && <p>De parte de: {p.fromName}</p>}
            {p.dedication && <p className="font-hand text-xl leading-tight text-ink">«{p.dedication}»</p>}
            {line.format === "fisico" && (p.giftWrap || p.giftCard) && (
              <p className="mt-1 text-xs text-ink-soft">
                {[p.giftWrap && "Packaging de regalo", p.giftCard && "Tarjeta personalizada"].filter(Boolean).join(" y ")} (+
                {money(line.extras)} por unidad)
              </p>
            )}
          </div>
        )}
        {line.error && <p className="mt-2 text-sm text-clay-deep">{line.error}</p>}
      </div>
    </Root>
  );
}
