"use client";

import { useState } from "react";
import { useCart } from "./store";

export function CouponField({ message, valid }: { message: string | null; valid: boolean }) {
  const coupon = useCart((s) => s.coupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const [draft, setDraft] = useState(coupon);
  return (
    <div>
      <div className="flex gap-2">
        <label htmlFor="coupon" className="sr-only">
          Código de descuento
        </label>
        <input
          id="coupon"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setCoupon(draft.trim());
            }
          }} placeholder="Código de descuento" className="field uppercase placeholder:normal-case" />
        <button type="button" onClick={() => setCoupon(draft.trim())} className="btn btn-ghost min-h-0 shrink-0 py-2">
          Aplicar
        </button>
      </div>
      {coupon && message && (
        <p className={`mt-2 text-sm ${valid ? "text-olive" : "text-clay-deep"}`}>
          {message}{" "}
          <button
            className="underline"
            onClick={() => {
              setCoupon("");
              setDraft("");
            }}
          >
            Quitar
          </button>
        </p>
      )}
    </div>
  );
}
