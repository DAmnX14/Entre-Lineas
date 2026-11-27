import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { BookCard } from "@/components/BookCard";
import { BookCover } from "@/components/BookCover";
import { InteriorSpread } from "@/components/InteriorSpread";
import { NewsletterForm } from "@/components/Newsletter";
import { RecipientGrid } from "@/components/RecipientGrid";
import { featuredBooks, getBook, getBooksBySlugs, listPacks, listTestimonials } from "@/lib/repo";
import { packPricing } from "@/lib/pricing";
import { money } from "@/lib/format";

export default function Home() {
  const featured = featuredBooks(8);
  const mama = getBook("mama-contame-tu-historia");
  const packs = listPacks().filter((p) => p.chooseCount === 0).slice(0, 4);
  const testimonials = listTestimonials(true).slice(0, 6);

  return (
    <>
      <Hero />

      {/* ¿Para quién es este regalo? */}
      <section className="bg-cream py-20 sm:py-24" aria-labelledby="para-quien">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 id="para-quien" className="text-3xl sm:text-4xl">
              ¿Para quién es este regalo?
            </h2>
            <p className="mt-3 text-ink-soft">Cada libro tiene preguntas pensadas para ese vínculo. Elegí a la persona y te mostramos sus libros.</p>
          </div>
          <RecipientGrid className="mt-10" />
        </div>
      </section>

      {/* Más elegidos */}
      <section className="py-20 sm:py-24" aria-labelledby="mas-elegidos">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="mas-elegidos" className="text-3xl sm:text-4xl">
              Nuestros libros más elegidos
            </h2>
            <Link href="/libros" className="link text-sm font-semibold">
              Ver todos los libros
            </Link>
          </div>
          <div className="scroll-row -mx-4 mt-10 flex snap-x gap-6 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {featured.map((b) => (
              <div key={b.id} className="w-[68vw] shrink-0 snap-start sm:w-auto">
                <BookCard book={b} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-y border-line bg-linen/60 py-20 sm:py-24" aria-labelledby="como-funciona">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 id="como-funciona" className="max-w-xl text-3xl sm:text-4xl">
            ¿Cómo funciona?
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-12">
            {[
              ["Elegí a quién querés regalarle su historia.", "Mamá, papá, los abuelos, tu pareja, un amigo o vos. Cada libro tiene preguntas pensadas para esa persona."],
              ["Elegí el libro físico o digital.", "El libro impreso llega con tapa dura y packaging de regalo opcional. El PDF se descarga al instante para imprimir o completar en tablet."],
              ["Regalá un espacio para escribir, recordar y compartir.", "La persona lo completa a su ritmo, con su letra y sus fotos. Cuando termina, queda un libro único para toda la familia."],
            ].map(([title, text], i) => (
              <li key={i} className="relative pl-14">
                <span className="serif absolute top-[-0.35rem] left-0 text-5xl leading-none text-clay">{i + 1}</span>
                <h3 className="text-xl">{title}</h3>
                <p className="mt-2 text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Más allá de lo material */}
      <section className="py-20 sm:py-28" aria-labelledby="mas-alla">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 id="mas-alla" className="text-3xl sm:text-4xl">
              Un regalo que va más allá de lo material
            </h2>
            <blockquote className="serif mt-8 border-l-2 border-clay pl-6 text-2xl leading-snug text-ink sm:text-[1.9rem]">
              Hay regalos que se guardan en un cajón. Y hay regalos que se convierten en parte de una familia para siempre.
            </blockquote>
            <p className="mt-8 max-w-lg text-ink-soft">
              Las preguntas están escritas para que nadie se sienta frente a un interrogatorio: invitan a recordar de a poco, a reírse, a emocionarse. Se puede responder con una línea o con tres páginas.
            </p>
            <Link href="/libros/mama-contame-tu-historia" className="btn btn-ink mt-8">
              Ver las páginas de «Mamá, contame tu historia»
            </Link>
          </div>
          {mama && (
            <div className="relative">
              <InteriorSpread
                section={mama.sections.find((s) => s.title.startsWith("Cuando te convertiste")) ?? mama.sections[1]}
                prompt="¿Cómo eligieron mi nombre?"
                answer="Tu papá quería Lucía y yo quería Clara. Lo decidimos con una moneda en el pasillo del sanatorio…"
              />
            </div>
          )}
        </div>
      </section>

      {/* Packs */}
      <section className="bg-ink py-20 text-cream sm:py-24" aria-labelledby="packs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="packs" className="text-3xl sm:text-4xl">
                Packs de regalo
              </h2>
              <p className="mt-3 max-w-lg text-cream/75">Varios libros en una sola compra, con descuento. También hay packs para Día de la Madre, Día del Padre, cumpleaños y Navidad en los que elegís vos.</p>
            </div>
            <Link href="/packs" className="btn border border-cream/40 text-cream hover:bg-cream hover:text-ink">
              Ver todos los packs
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {packs.map((p) => {
              const books = getBooksBySlugs(p.bookSlugs);
              const { list, price } = packPricing(p, books, "fisico");
              return (
                <Link key={p.id} href={`/packs#${p.slug}`} className="group flex flex-col rounded-lg bg-cream/[0.06] p-6 ring-1 ring-cream/10 hover:bg-cream/[0.1]">
                  <div className="relative flex h-40 items-end justify-center">
                    {books.slice(0, 4).map((b, i) => (
                      <div
                        key={b.id}
                        className="absolute bottom-0 w-[30%]"
                        style={{ transform: `translateX(${(i - (books.length - 1) / 2) * 38}%) rotate(${(i - (books.length - 1) / 2) * 5}deg)`, zIndex: i }}
                      >
                        <BookCover title={b.title} category={b.category} image={b.coverImage} size="sm" />
                      </div>
                    ))}
                    <span className="absolute -top-2 right-0 z-10 grid h-16 w-16 rotate-12 place-items-center rounded-full bg-clay text-center text-sm leading-none font-bold text-white">
                      −{p.discountPercent}%
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl">{p.title}</h3>
                  <p className="mt-1 text-sm text-cream/70">{p.description}</p>
                  <p className="mt-4">
                    <s className="mr-2 text-sm text-cream/50">{money(list)}</s>
                    <span className="text-lg font-semibold">{money(price)}</span>
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Opiniones */}
      <section className="py-20 sm:py-24" aria-labelledby="opiniones">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 id="opiniones" className="text-3xl sm:text-4xl">
            Lo que cuentan quienes ya regalaron
          </h2>
          {testimonials.length > 0 ? (
            <div className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="mb-6 break-inside-avoid rounded-lg bg-cream p-7">
                  <blockquote className="serif text-xl leading-snug">«{t.text}»</blockquote>
                  <figcaption className="mt-4 text-sm text-ink-soft">
                    {t.name}
                    {t.bookTitle && ` · regaló ${t.bookTitle}`}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-start gap-5 rounded-lg border border-dashed border-line p-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-hand max-w-xl text-3xl leading-tight text-ink-soft">
                Las primeras historias se están escribiendo. Cuando lleguen las opiniones de nuestros clientes, las vas a leer acá.
              </p>
              <Link href="/contacto?tema=opinion" className="btn btn-ghost shrink-0">
                Contanos tu experiencia
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-clay py-20 text-cream sm:py-24" aria-labelledby="newsletter">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 id="newsletter" className="text-3xl text-white sm:text-5xl">
              Las historias también se heredan.
            </h2>
            <p className="mt-4 text-cream/85">Recibí los libros nuevos, ideas para regalar en cada fecha especial y descuentos para suscriptores.</p>
          </div>
          <NewsletterForm dark />
        </div>
      </section>
    </>
  );
}
