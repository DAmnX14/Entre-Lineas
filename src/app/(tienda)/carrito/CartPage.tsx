"use client";

import Link from "next/link";
import { useState } from "react";
import { useHydrated } from "@/components/useHydrated";
import { money } from "@/lib/format";
import { useCart } from "@/components/cart/store";
import { useQuote } from "@/components/cart/useQuote";
import { LineItem } from "@/components/cart/LineItem";
import { CouponField } from "@/components/cart/CouponField";
import { PersonalizationForm } from "@/components/product/PersonalizationForm";

export function CartPage() {
  const lines = useCart((s) => s.lines);
  const update = useCart((s) => s.update);
  const [editing, setEditing] = useState<string | null>(null);
  const { quote, loading } = useQuote();
  const mounted = useHydrated();

  if (!mounted) return <p className="py-20 text-center text-ink-soft">Cargando tu carrito…</p>;
  if (lines.length === 0)
    return (
      <div className="py-16">
        <p className="font-hand text-4xl text-ink-soft">Tu carrito está vacío.</p>
        <p className="mt-3 text-ink-soft">Elegí un libro para alguien especial, o para vos.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/para-quien" className="btn btn-primary">
            Encontrar el libro perfecto
          </Link>
          <Link href="/packs" className="btn btn-ghost">
            Ver packs
          </Link>
        </div>
      </div>
    );

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <ul className="divide-y divide-line border-y border-line">
        {quote?.lines.map((l) => {
          const raw = lines.find((x) => x.id === l.id);
          return (
            <li key={l.id}>
              <LineItem line={l} />
              <div className="pb-5 pl-20 sm:pl-24">
                {editing === l.id ? (
                  <div className="rounded-xl border border-line bg-cream/60 p-5">
                    <PersonalizationForm
                      idPrefix={`e-${l.id}`}
                      value={raw?.personalization ?? {}}
                      onChange={(p) => update(l.id, { personalization: p })}
                      format={l.format}
                    />
                    <button className="btn btn-ink mt-4" onClick={() => setEditing(null)}>
                      Guardar dedicatoria
                    </button>
                  </div>
                ) : (
                  <button className="text-sm font-semibold text-clay-deep underline underline-offset-2" onClick={() => setEditing(l.id)}>
                    {raw?.personalization ? "Editar dedicatoria y regalo" : "Agregar dedicatoria o packaging de regalo"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-xl bg-cream p-6 lg:sticky lg:top-24">
        <h2 className="text-2xl">Resumen</h2>
        <div className="mt-5">
          <CouponField message={quote?.couponMessage ?? null} valid={!!quote?.couponValid} />
        </div>
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{quote ? money(quote.subtotal) : "—"}</dd>
          </div>
          {quote && quote.discount > 0 && (
            <div className="flex justify-between text-olive">
              <dt>Descuento</dt>
              <dd>−{money(quote.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-ink-soft">
            <dt>Envío</dt>
            <dd>{quote?.hasPhysical ? "Se calcula en el checkout" : "No aplica (solo PDF)"}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{quote ? money(quote.subtotal - quote.discount) : "—"}</dd>
          </div>
        </dl>
        {quote?.errors.length ? (
          <ul className="mt-4 space-y-1 text-sm text-clay-deep">
            {quote.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : null}
        <Link href="/checkout" aria-disabled={loading || !!quote?.errors.length} className={`btn btn-primary mt-6 w-full ${quote?.errors.length ? "pointer-events-none opacity-50" : ""}`}>
          Continuar con la compra
        </Link>
        <p className="mt-3 text-center text-xs text-ink-soft">Pago seguro con Mercado Pago o transferencia.</p>
      </aside>
    </div>
  );
}
