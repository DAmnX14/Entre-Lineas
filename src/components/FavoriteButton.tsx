"use client";

import { useHydrated } from "./useHydrated";
import { useFavorites } from "./favorites";
import { IconHeart } from "./Icons";

export function FavoriteButton({ slug, title, className = "" }: { slug: string; title: string; className?: string }) {
  const slugs = useFavorites((s) => s.slugs);
  const toggle = useFavorites((s) => s.toggle);
  const mounted = useHydrated();
  const active = mounted && slugs.includes(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggle(slug);
      }}
      aria-pressed={active}
      aria-label={active ? `Quitar ${title} de favoritos` : `Guardar ${title} en favoritos`}
      className={`grid h-10 w-10 place-items-center rounded-full bg-cream/90 text-clay-deep shadow-sm hover:bg-cream ${className}`}
    >
      <IconHeart filled={active} />
    </button>
  );
}
