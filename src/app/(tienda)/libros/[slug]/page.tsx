import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBook, relatedBooks } from "@/lib/repo";
import { BRAND } from "@/lib/brand";
import { CATEGORIES, OCCASIONS, RECIPIENT_LABEL } from "@/lib/content/taxonomy";
import { PRODUCT_FAQ } from "@/lib/content/faq";
import { money } from "@/lib/format";
import { Gallery } from "@/components/product/Gallery";
import { BuyBox } from "@/components/product/BuyBox";
import { ShareButtons } from "@/components/product/ShareButtons";
import { BookCard } from "@/components/BookCard";
import { FavoriteButton } from "@/components/FavoriteButton";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const book = getBook((await params).slug);
  if (!book) return {};
  return {
    title: book.title,
    description: `${book.tagline} ${book.description}`.slice(0, 160),
    openGraph: { title: book.title, description: book.tagline, url: `/libros/${book.slug}` },
  };
}

const DEFAULT_RECIPIENT: Record<string, string> = {
  madres: "Mamá",
  padres: "Papá",
  abuelos: "",
  hermanos: "",
  parejas: "",
  hijos: "",
  amigos: "",
  personales: "",
};

export default async function BookPage({ params }: Params) {
  const book = getBook((await params).slug);
  if (!book || !book.active) notFound();
  const related = relatedBooks(book);
  const cat = CATEGORIES[book.category];
  const questionCount = book.sections.reduce((n, s) => n + (s.kind === "questions" ? s.prompts.length : 0), 0);
  const photoCount = book.sections.reduce((n, s) => n + (s.kind === "photos" ? s.prompts.length : 0), 0);
  const url = `${BRAND.siteUrl}/libros/${book.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: book.title,
    description: book.description,
    brand: BRAND.name,
    offers: [
      book.hasFisico && { "@type": "Offer", name: "Libro físico", price: book.priceFisico, priceCurrency: "ARS", availability: book.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url },
      book.hasPdf && { "@type": "Offer", name: "PDF digital", price: book.pricePdf, priceCurrency: "ARS", availability: "https://schema.org/InStock", url },
    ].filter(Boolean),
  };

  return (
    <div className="pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <nav aria-label="Ruta" className="text-sm text-ink-soft">
          <Link href="/libros" className="hover:text-ink">Libros</Link>
          <span className="mx-2">/</span>
          <Link href={`/libros?categoria=${book.category}`} className="hover:text-ink">{cat.plural}</Link>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Gallery title={book.title} category={book.category} image={book.coverImage} sections={book.sections} />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl sm:text-[3.2rem]">{book.title}</h1>
              <FavoriteButton slug={book.slug} title={book.title} className="mt-1 shrink-0 bg-linen" />
            </div>
            <p className="serif mt-3 text-xl text-ink-soft italic">{book.tagline}</p>
            <p className="mt-6 leading-relaxed">{book.description}</p>
            <p className="mt-4 text-sm text-ink-soft">
              {book.pages} páginas · {questionCount} preguntas · {book.sections.length} capítulos{photoCount > 0 && ` · ${photoCount} páginas para fotos`}
            </p>

            <div className="mt-8 border-t border-line pt-8">
              <BuyBox
                slug={book.slug}
                title={book.title}
                priceFisico={book.priceFisico}
                pricePdf={book.pricePdf}
                compareFisico={book.compareFisico}
                comparePdf={book.comparePdf}
                hasFisico={book.hasFisico}
                hasPdf={book.hasPdf}
                stock={book.stock}
                pages={book.pages}
                defaultRecipient={DEFAULT_RECIPIENT[book.category] ?? ""}
              />
            </div>

            <div className="mt-8">
              <ShareButtons url={url} title={book.title} />
            </div>

            <section className="mt-12" aria-labelledby="para-quien">
              <h2 id="para-quien" className="text-2xl">Para quién está pensado</h2>
              <p className="mt-3 text-ink-soft">{book.whoFor}</p>
              <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                {book.recipients.map((r) => (
                  <li key={r}><Link href={`/libros?para=${r}`} className="rounded-full bg-linen px-3 py-1.5 hover:bg-rose">{RECIPIENT_LABEL[r]}</Link></li>
                ))}
                {book.occasions.map((o) => (
                  <li key={o}><Link href={`/libros?ocasion=${o}`} className="rounded-full border border-line px-3 py-1.5 hover:border-ink">{OCCASIONS[o]}</Link></li>
                ))}
              </ul>
            </section>

            <section className="mt-12" aria-labelledby="contenido-libro">
              <h2 id="contenido-libro" className="text-2xl">Qué contiene</h2>
              <ol className="mt-4 divide-y divide-line border-y border-line">
                {book.sections.map((s, i) => (
                  <li key={i}>
                    <details className="group py-3">
                      <summary className="flex cursor-pointer list-none items-baseline gap-4">
                        <span className="w-6 shrink-0 text-sm text-ink-soft tabular-nums">{i + 1}</span>
                        <span className="serif flex-1 text-lg">{s.title}</span>
                        <span className="text-xs text-ink-soft">
                          {s.kind === "questions" ? `${s.prompts.length} preguntas` : s.kind === "photos" ? "Fotos" : s.kind === "letter" ? "Cartas" : s.kind === "tree" ? "Árbol" : "Dedicatoria"}
                        </span>
                        <span className="text-ink-soft transition-transform group-open:rotate-45" aria-hidden>+</span>
                      </summary>
                      <div className="pt-2 pb-1 pl-10">
                        {s.intro && <p className="serif mb-2 text-ink-soft italic">{s.intro}</p>}
                        <ul className="space-y-1.5 text-[0.95rem]">
                          {s.prompts.slice(0, s.kind === "questions" ? 2 : 4).map((p) => <li key={p}>{p}</li>)}
                          {s.kind === "questions" && s.prompts.length > 2 && <li className="text-ink-soft">y {s.prompts.length - 2} preguntas más…</li>}
                        </ul>
                      </div>
                    </details>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-12 grid gap-6 sm:grid-cols-2" aria-label="Formatos">
              <div className="rounded-lg bg-cream p-6">
                <h3 className="text-xl">Libro físico · {money(book.priceFisico)}</h3>
                <p className="mt-2 text-sm text-ink-soft">Tapa dura entelada, 17 × 24 cm, papel de 120 g, cinta señaladora y bolsillo para cartas. Packaging de regalo y tarjeta opcionales.</p>
              </div>
              <div className="rounded-lg bg-cream p-6">
                <h3 className="text-xl">PDF digital · {money(book.pricePdf)}</h3>
                <p className="mt-2 text-sm text-ink-soft">Descarga inmediata, A4 listo para imprimir, compatible con tablet. Tu dedicatoria incluida en el archivo.</p>
              </div>
            </section>

            <section className="mt-12" aria-labelledby="faq">
              <h2 id="faq" className="text-2xl">Preguntas frecuentes</h2>
              <div className="mt-4 divide-y divide-line border-y border-line">
                {PRODUCT_FAQ.map((f) => (
                  <details key={f.q} className="group py-4">
                    <summary className="flex cursor-pointer list-none justify-between gap-4 font-semibold">
                      {f.q}
                      <span className="text-ink-soft transition-transform group-open:rotate-45" aria-hidden>+</span>
                    </summary>
                    <p className="mt-2 text-ink-soft">{f.a}</p>
                  </details>
                ))}
              </div>
              <Link href="/preguntas-frecuentes" className="link mt-4 inline-block text-sm">Ver todas las preguntas</Link>
            </section>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6" aria-labelledby="relacionados">
          <h2 id="relacionados" className="text-3xl">También para {cat.label.replace("Para ", "").toLowerCase()}</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
            {related.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
}
