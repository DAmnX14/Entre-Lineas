"use client";

import { useEffect, useState } from "react";
import type { Quote, ShippingMethod } from "@/lib/cart-types";
import { useCart } from "./store";

export function useQuote(opts: { shippingMethod?: ShippingMethod | null; postalCode?: string; enabled?: boolean } = {}) {
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const enabled = opts.enabled ?? true;
  const key = JSON.stringify([lines, coupon, opts.shippingMethod, opts.postalCode]);

  useEffect(() => {
    if (!enabled) return;
    const ctrl = new AbortController();
    fetch("/api/carrito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, coupon, shippingMethod: opts.shippingMethod, postalCode: opts.postalCode }),
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((q: Quote) => {
        setQuote(q);
        setLoadedKey(key);
      })
      .catch(() => {});
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return { quote, loading: loadedKey !== key };
}
