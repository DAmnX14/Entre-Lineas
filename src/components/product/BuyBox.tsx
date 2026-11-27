"use client";

import { useState } from "react";
import { money } from "@/lib/format";
import type { Personalization } from "@/lib/personalization";
import { useCart } from "../cart/store";
import { DedicationPreview, PersonalizationForm } from "./PersonalizationForm";

type Props = {
  slug: string;
  title: string;
  priceFisico: number;
  pricePdf: number;
  compareFisico: number | null;
  comparePdf: number | null;
  hasFisico: boolean;
  hasPdf: boolean;
  stock: number;
  pages: number;
  defaultRecipient: string;
};

export function BuyBox(p: Props) {
  const [format, setFormat] = useState<"fisico" | "pdf">(p.hasFisico && p.stock > 0 ? "fisico" : "pdf");
  const [gifting, setGifting] = useState(false);
  const [pz, setPz] = useState<Personalization>({ recipientName: p.defaultRecipient });
  const add = useCart((s) => s.add);

  const price = format === "fisico" ? p.priceFisico : p.pricePdf;
  const compare = format === "fisico" ? p.compareFisico : p.comparePdf;
  const outOfStock = format === "fisico" && p.stock <= 0;

  const details =
    format === "fisico"
      ? [
          `Tapa dura entelada, ${p.pages} páginas, 17 × 24 cm.`,
          "Papel ilustración de 120 g, apto para lapicera y fotos pegadas.",
          "Cinta señaladora y bolsillo final para guardar cartas.",
          p.stock > 0 && p.stock <= 5 ? `Quedan ${p.stock} unidades.` : "Despacho en 24 a 48 horas hábiles.",
        ]
      : [
          "Descarga inmediata después de confirmar el pago.",
          "PDF en alta calidad, en tamaño A4 para imprimir en casa.",
          "Se puede completar a mano impreso o en tablet con lápiz.",
          "Acceso desde tu cuenta y por enlace seguro.",
        ];

  return (
    <div>
      <fieldset>
        <legend className="sr-only">Formato</legend>
        <div className="grid grid-cols-2 gap-2 rounded-full bg-linen p-1">
          {(["fisico", "pdf"] as const).map((f) => {
            const available = f === "fisico" ? p.hasFisico : p.hasPdf;
            return (
              <label
                key={f}
                className={`cursor-pointer rounded-full px-3 py-2.5 text-center text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-clay ${
                  format === f ? "bg-ink text-cream" : "text-ink"
                } ${available ? "" : "pointer-events-none opacity-40"}`}
              >
                <input type="radio" name="format" value={f} checked={format === f} onChange={() => setFormat(f)} className="sr-only" disabled={!available} />
                {f === "fisico" ? "Libro físico" : "PDF digital"}
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-6 flex items-baseline gap-3" aria-live="polite">
        <span className="text-3xl font-semibold">{money(price)}</span>
        {compare && compare > price && <s className="text-ink-soft">{money(compare)}</s>}
      </p>
      <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
        {details.map((d) => (
          <li key={d} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-clay" aria-hidden />
            {d}
          </li>
        ))}
      </ul>

      {outOfStock && <p className="mt-4 rounded-lg bg-rose/60 p-3 text-sm">Sin stock en formato físico por ahora. El PDF está disponible para descarga inmediata.</p>}

      {!gifting ? (
        <div className="mt-7 grid gap-3">
          <button className="btn btn-primary w-full text-base" disabled={outOfStock} onClick={() => setGifting(true)}>
            Regalar esta historia
          </button>
          <button className="btn btn-ghost w-full" disabled={outOfStock} onClick={() => add({ kind: "book", slug: p.slug, format })}>
            Comprar para mí
          </button>
        </div>
      ) : (
        <div className="mt-7 rounded-xl border border-line bg-cream/60 p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl">Personalizá tu regalo</h2>
            <button className="text-sm text-ink-soft underline" onClick={() => setGifting(false)}>
              Cancelar
            </button>
          </div>
          <p className="mt-1 text-sm text-ink-soft">Todo es opcional. Podés cambiarlo después desde el carrito.</p>
          <div className="mt-5">
            <PersonalizationForm value={pz} onChange={setPz} format={format} />
          </div>
          <div className="mt-5">
            <DedicationPreview value={pz} />
          </div>
          <button
            className="btn btn-primary mt-5 w-full text-base"
            disabled={outOfStock}
            onClick={() => {
              add({ kind: "book", slug: p.slug, format, personalization: pz });
              setGifting(false);
            }}
          >
            Agregar el regalo al carrito
          </button>
        </div>
      )}
    </div>
  );
}
