import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_GROUPS } from "@/lib/content/faq";

export const metadata: Metadata = { title: "Preguntas frecuentes", description: "Envíos, formatos, pagos y cómo se completan los libros." };

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap((g) => g.items).map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6 lg:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-4xl sm:text-5xl">Preguntas frecuentes</h1>
      {FAQ_GROUPS.map((g) => (
        <section key={g.title} className="mt-12">
          <h2 className="text-2xl">{g.title}</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {g.items.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none justify-between gap-4 font-semibold">
                  {f.q}
                  <span className="text-ink-soft transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-2 text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
      <p className="mt-12 text-ink-soft">
        ¿No encontraste lo que buscabas? <Link href="/contacto" className="link">Escribinos</Link>.
      </p>
    </div>
  );
}
