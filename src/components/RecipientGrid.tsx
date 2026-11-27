import Link from "next/link";
import { RECIPIENTS } from "@/lib/content/taxonomy";

/** Tarjetas de destinatario: el vínculo en serif y una pregunta escrita a mano que solo esa persona puede responder. */
export function RecipientGrid({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 ${className}`}>
      {RECIPIENTS.map((r, i) => (
        <li key={r.key}>
          <Link
            href={`/libros?para=${r.key}`}
            className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-md p-5 transition-transform hover:-translate-y-0.5 sm:p-6"
            style={{ backgroundColor: r.tint }}
          >
            <span className="serif text-[1.65rem] leading-none sm:text-[2rem]">{r.label}</span>
            <span
              className="font-hand block text-[1.3rem] leading-[1.05] text-ink/80 sm:text-[1.55rem]"
              style={{ transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)` }}
            >
              {r.question}
            </span>
            <span className="text-xs font-semibold text-ink-soft group-hover:text-clay-deep">Ver sus libros</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
