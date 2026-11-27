import type { BookSection } from "@/lib/content/types";

/** Doble página interior: portadilla de sección a la izquierda y una pregunta a la derecha. */
export function InteriorSpread({
  section,
  prompt,
  answer,
  className = "",
}: {
  section: BookSection;
  prompt?: string;
  answer?: string;
  className?: string;
}) {
  const q = prompt ?? section.prompts[0];
  return (
    <div className={`grid grid-cols-2 overflow-hidden rounded-sm bg-cream shadow-[0_24px_40px_-24px_rgba(58,42,31,.45)] ${className}`}>
      <div className="flex aspect-[17/24] flex-col items-center justify-center border-r border-line/80 bg-gradient-to-l from-black/[0.04] to-transparent p-[10%] text-center">
        <span className="block h-px w-8 bg-clay" aria-hidden />
        <p className="serif mt-4 text-[clamp(1rem,2.2vw,1.6rem)] leading-tight">{section.title}</p>
        {section.intro && <p className="serif mt-3 text-[clamp(0.62rem,1vw,0.85rem)] italic text-ink-soft">{section.intro}</p>}
      </div>
      <div className="flex aspect-[17/24] flex-col bg-gradient-to-r from-black/[0.04] to-transparent p-[9%]">
        <p className="serif text-[clamp(0.75rem,1.35vw,1.05rem)] leading-snug">{q}</p>
        <div className="ruled relative mt-3 flex-1 [background-size:100%_1.6rem] sm:[background-size:100%_1.9rem]">
          {answer && <p className="font-hand pt-1 text-[clamp(0.95rem,1.7vw,1.35rem)] leading-[1.6rem] text-[#3b4a6b] sm:leading-[1.9rem]">{answer}</p>}
        </div>
      </div>
    </div>
  );
}
