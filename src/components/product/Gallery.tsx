"use client";

import { useState } from "react";
import type { BookSection } from "@/lib/content/types";
import { BookCover } from "../BookCover";
import { InteriorSpread } from "../InteriorSpread";
import { BookMockup } from "./BookMockup";

type Props = { title: string; category: string; image: string | null; sections: BookSection[] };

export function Gallery({ title, category, image, sections }: Props) {
  const previews = sections.filter((s) => s.kind !== "dedication").slice(0, 3);
  const views = [
    { key: "tapa", label: "Tapa" },
    { key: "libro", label: "Libro físico" },
    ...previews.map((s, i) => ({ key: `p${i}`, label: s.kind === "photos" ? "Página de fotos" : `Interior: ${s.title}` })),
  ];
  const [view, setView] = useState("tapa");
  const idx = view.startsWith("p") ? Number(view.slice(1)) : -1;

  return (
    <div>
      <div className="flex aspect-square items-center justify-center rounded-lg bg-linen p-[8%] sm:aspect-[5/4]">
        {view === "tapa" && (
          <div className="w-[52%] sm:w-[44%]">
            <BookCover title={title} category={category} image={image} size="lg" />
          </div>
        )}
        {view === "libro" && <BookMockup title={title} category={category} image={image} />}
        {idx >= 0 && <InteriorSpread section={previews[idx]} className="w-full max-w-xl" />}
      </div>
      <div className="scroll-row mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Vistas del libro">
        {views.map((v) => (
          <button
            key={v.key}
            role="tab"
            aria-selected={view === v.key}
            onClick={() => setView(v.key)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm ${view === v.key ? "border-ink bg-ink text-cream" : "border-line bg-cream"}`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
