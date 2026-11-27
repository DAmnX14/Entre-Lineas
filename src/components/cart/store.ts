"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Format } from "@/lib/cart-types";
import type { Personalization } from "@/lib/personalization";

type NewLine =
  | { kind: "book"; slug: string; format: Format; qty?: number; personalization?: Personalization }
  | { kind: "pack"; slug: string; format: Format; qty?: number; books?: string[]; personalization?: Personalization };

type CartState = {
  lines: CartLine[];
  coupon: string;
  open: boolean;
  add: (line: NewLine) => void;
  setQty: (id: string, qty: number) => void;
  update: (id: string, patch: Partial<Pick<CartLine, "format" | "personalization">>) => void;
  remove: (id: string) => void;
  clear: () => void;
  setCoupon: (c: string) => void;
  setOpen: (o: boolean) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      coupon: "",
      open: false,
      add: (line) =>
        set((s) => {
          // Sin personalización, el mismo producto y formato se agrupan en una línea.
          const samePlain = !line.personalization
            ? s.lines.find(
                (l) =>
                  l.kind === line.kind &&
                  l.slug === line.slug &&
                  l.format === line.format &&
                  !l.personalization &&
                  JSON.stringify("books" in l ? l.books : null) === JSON.stringify("books" in line ? line.books ?? null : null),
              )
            : undefined;
          if (samePlain) {
            return {
              open: true,
              lines: s.lines.map((l) => (l.id === samePlain.id ? { ...l, qty: Math.min(20, l.qty + (line.qty ?? 1)) } : l)),
            };
          }
          return { open: true, lines: [...s.lines, { ...line, qty: line.qty ?? 1, id: uid() } as CartLine] };
        }),
      setQty: (id, qty) =>
        set((s) => ({ lines: s.lines.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l)) })),
      update: (id, patch) => set((s) => ({ lines: s.lines.map((l) => (l.id === id ? ({ ...l, ...patch } as CartLine) : l)) })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [], coupon: "" }),
      setCoupon: (coupon) => set({ coupon }),
      setOpen: (open) => set({ open }),
    }),
    { name: "el-cart", partialize: (s) => ({ lines: s.lines, coupon: s.coupon }) },
  ),
);

export function useCartCount() {
  return useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
}
