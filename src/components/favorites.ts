"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavState = { slugs: string[]; toggle: (slug: string) => boolean; merge: (slugs: string[]) => void };

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const has = get().slugs.includes(slug);
        set({ slugs: has ? get().slugs.filter((s) => s !== slug) : [...get().slugs, slug] });
        // Si hay sesión iniciada, también se guarda en la cuenta.
        fetch("/api/favoritos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) }).catch(() => {});
        return !has;
      },
      merge: (slugs) => set({ slugs: [...new Set([...get().slugs, ...slugs])] }),
    }),
    { name: "pyl-favs" },
  ),
);
