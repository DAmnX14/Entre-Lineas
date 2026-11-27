"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { money } from "@/lib/format";
import { IconClose } from "../Icons";
import { LineItem } from "./LineItem";
import { useCart } from "./store";
import { useQuote } from "./useQuote";

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const lines = useCart((s) => s.lines);
  const { quote } = useQuote({ enabled: open });
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open) return null;
  const freeLeft = quote && quote.hasPhysical ? quote.freeShippingFrom - (quote.subtotal - quote.discount) : 0;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Tu carrito">
      <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-2xl">Tu carrito</h2>
          <button className="p-2" onClick={() => setOpen(false)} aria-label="Cerrar carrito">
            <IconClose />
          </button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="font-hand text-3xl text-ink-soft">Todavía no elegiste ninguna historia.</p>
            <Link href="/libros" className="btn btn-primary">
              Ver los libros
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {quote?.lines.map((l) => <LineItem key={l.id} line={l} compact />)}
              {!quote && <li className="py-8 text-center text-ink-soft">Calculando…</li>}
            </ul>
            <div className="border-t border-line px-6 py-5">
              {freeLeft > 0 && (
                <p className="mb-3 text-sm text-ink-soft">
                  Te faltan {money(freeLeft)} para el envío sin cargo.
                </p>
              )}
              <div className="flex items-baseline justify-between">
                <span>Subtotal</span>
                <span className="text-xl font-semibold">{quote ? money(quote.subtotal) : "—"}</span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">El envío y los cupones se calculan en el siguiente paso.</p>
              <div className="mt-4 grid gap-2">
                <Link href="/checkout" className="btn btn-primary w-full">
                  Finalizar compra
                </Link>
                <Link href="/carrito" className="btn btn-ghost w-full">
                  Ver carrito y dedicatorias
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
