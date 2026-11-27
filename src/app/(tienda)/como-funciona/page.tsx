import type { Metadata } from "next";
import Link from "next/link";
import { getBook } from "@/lib/repo";
import { InteriorSpread } from "@/components/InteriorSpread";

export const metadata: Metadata = { title: "Cómo funciona" };

const STEPS = [
  ["Elegí a quién querés regalarle su historia.", "Mamá, papá, los abuelos, tus hermanos, tu pareja, tus hijos, un amigo o vos. Cada libro tiene entre 30 y 90 preguntas pensadas para esa persona y ese vínculo."],
  ["Elegí el libro físico o digital.", "El libro físico es de tapa dura entelada y llega listo para regalar, con packaging y tarjeta opcionales. El PDF se descarga apenas se confirma el pago, para imprimir en casa o completar en tablet."],
  ["Personalizalo, si querés.", "Escribí una dedicatoria y el nombre de la persona: se imprimen en la primera página. Es opcional y lo podés cambiar hasta confirmar la compra."],
  ["Regalá un espacio para escribir, recordar y compartir.", "La persona lo completa a su ritmo, con su letra y sus fotos. No hay respuestas correctas ni un orden obligatorio. Cuando termina, queda un libro único que se guarda para siempre."],
];

export default function Page() {
  const book = getBook("abuela-contame-tu-historia");
  const section = book?.sections.find((s) => s.title === "Cómo era el mundo entonces");
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:pt-14">
      <h1 className="max-w-3xl text-4xl sm:text-5xl">Cómo funciona</h1>
      <ol className="mt-12 max-w-3xl space-y-12">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="relative pl-16">
            <span className="serif absolute top-[-0.4rem] left-0 text-5xl text-clay">{i + 1}</span>
            <h2 className="text-2xl">{t}</h2>
            <p className="mt-2 text-ink-soft">{d}</p>
          </li>
        ))}
      </ol>
      {section && (
        <div className="mt-20 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl">Así se ven las páginas por dentro</h2>
            <p className="mt-3 text-ink-soft">Cada capítulo abre con una portadilla. Cada pregunta tiene su página con renglones amplios para escribir a mano.</p>
            <Link href="/libros" className="btn btn-primary mt-6">Elegir un libro</Link>
          </div>
          <InteriorSpread section={section} prompt="¿Cuánto costaban las cosas? ¿Qué se podía comprar con unas monedas?" answer="Con veinte centavos me compraba un helado de palito y todavía me sobraba para el colectivo…" />
        </div>
      )}
    </div>
  );
}
