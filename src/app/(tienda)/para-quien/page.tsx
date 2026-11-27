import type { Metadata } from "next";
import Link from "next/link";
import { RecipientGrid } from "@/components/RecipientGrid";
import { OCCASIONS } from "@/lib/content/taxonomy";

export const metadata: Metadata = { title: "Encontrá el libro perfecto", description: "Elegí a quién querés regalarle su historia." };

export default function Page() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:pt-14">
      <h1 className="max-w-3xl text-4xl sm:text-5xl">¿A quién querés regalarle su historia?</h1>
      <p className="mt-4 max-w-xl text-lg text-ink-soft">Cada libro tiene preguntas escritas para ese vínculo. Elegí a la persona y te mostramos sus libros.</p>
      <RecipientGrid className="mt-10" />
      <h2 className="mt-20 text-3xl">O buscá por ocasión</h2>
      <ul className="mt-6 flex flex-wrap gap-3">
        {Object.entries(OCCASIONS).map(([k, l]) => (
          <li key={k}>
            <Link href={`/libros?ocasion=${k}`} className="serif block rounded-full border border-line bg-cream px-6 py-3 text-xl hover:border-ink">{l}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
