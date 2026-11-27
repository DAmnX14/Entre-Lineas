import Link from "next/link";
import type { Metadata } from "next";
import { BookCard } from "@/components/BookCard";
import { listBooks } from "@/lib/repo";
import { CATEGORIES, OCCASIONS, RECIPIENTS, RECIPIENT_LABEL } from "@/lib/content/taxonomy";
import type { CategoryKey, OccasionKey, RecipientKey } from "@/lib/content/types";

export const metadata: Metadata = {
  title: "Todos los libros",
  description: "Libros para completar con recuerdos: para mamá, papá, abuelos, hermanos, parejas, hijos, amigos y para vos.",
};

type SP = { q?: string; para?: string; categoria?: string; formato?: string; ocasion?: string; orden?: string };

function href(current: SP, patch: Partial<SP>) {
  const next = { ...current, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) qs.set(k, v);
  const s = qs.toString();
  return `/libros${s ? `?${s}` : ""}`;
}

function Chip({ active, to, children }: { active: boolean; to: string; children: React.ReactNode }) {
  return (
    <Link
      href={to}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
        active ? "border-ink bg-ink text-cream" : "border-line bg-cream hover:border-ink"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function LibrosPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const books = listBooks({
    q: sp.q,
    recipient: sp.para,
    category: sp.categoria,
    format: sp.formato,
    occasion: sp.ocasion,
    sort: sp.orden,
  });

  let heading = "Todos los libros";
  if (sp.para && RECIPIENT_LABEL[sp.para as RecipientKey]) heading = `Libros para ${RECIPIENT_LABEL[sp.para as RecipientKey].toLowerCase()}`;
  if (sp.para === "para-mi") heading = "Libros para escribir tu propia historia";
  if (sp.categoria && CATEGORIES[sp.categoria as CategoryKey]) heading = CATEGORIES[sp.categoria as CategoryKey].plural;
  if (sp.ocasion && OCCASIONS[sp.ocasion as OccasionKey]) heading = `Ideas para ${OCCASIONS[sp.ocasion as OccasionKey]}`;
  if (sp.q) heading = `Resultados para «${sp.q}»`;
  const filtered = !!(sp.q || sp.para || sp.categoria || sp.formato || sp.ocasion);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:pt-14">
      <h1 className="text-4xl sm:text-5xl">{heading}</h1>
      <p className="mt-3 text-ink-soft">
        {books.length === 1 ? "1 libro" : `${books.length} libros`}
        {filtered && (
          <>
            {" · "}
            <Link href="/libros" className="link">
              Quitar filtros
            </Link>
          </>
        )}
      </p>

      <form action="/libros" className="mt-8 flex max-w-xl gap-2" role="search">
        {sp.para && <input type="hidden" name="para" value={sp.para} />}
        <label htmlFor="q" className="sr-only">
          Buscar
        </label>
        <input id="q" name="q" defaultValue={sp.q} placeholder="Buscar por título, persona o tema" className="field rounded-full px-5" />
        <button className="btn btn-ink">Buscar</button>
      </form>

      <div className="mt-8 space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold">Para quién</p>
          <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip active={!sp.para} to={href(sp, { para: undefined, categoria: undefined })}>
              Todos
            </Chip>
            {RECIPIENTS.map((r) => (
              <Chip key={r.key} active={sp.para === r.key} to={href(sp, { para: r.key, categoria: undefined })}>
                {r.label}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-10">
          <div>
            <p className="mb-2 text-sm font-semibold">Ocasión</p>
            <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {Object.entries(OCCASIONS).map(([k, label]) => (
                <Chip key={k} active={sp.ocasion === k} to={href(sp, { ocasion: sp.ocasion === k ? undefined : k })}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Formato</p>
            <div className="flex gap-2">
              <Chip active={sp.formato === "fisico"} to={href(sp, { formato: sp.formato === "fisico" ? undefined : "fisico" })}>
                Libro físico
              </Chip>
              <Chip active={sp.formato === "pdf"} to={href(sp, { formato: sp.formato === "pdf" ? undefined : "pdf" })}>
                PDF digital
              </Chip>
            </div>
          </div>
          <div className="lg:ml-auto">
            <p className="mb-2 text-sm font-semibold">Ordenar</p>
            <div className="flex gap-2">
              <Chip active={!sp.orden} to={href(sp, { orden: undefined })}>
                Destacados
              </Chip>
              <Chip active={sp.orden === "precio-asc"} to={href(sp, { orden: "precio-asc" })}>
                Menor precio
              </Chip>
              <Chip active={sp.orden === "nuevos"} to={href(sp, { orden: "nuevos" })}>
                Nuevos
              </Chip>
            </div>
          </div>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="mt-16 max-w-lg">
          <p className="font-hand text-3xl text-ink-soft">No encontramos libros con esos filtros.</p>
          <p className="mt-3 text-ink-soft">Probá con otra palabra o quitá algún filtro. Si buscás algo puntual, escribinos y te ayudamos a elegir.</p>
          <Link href="/libros" className="btn btn-ghost mt-6">
            Ver todos los libros
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 md:grid-cols-3 lg:grid-cols-4">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}
