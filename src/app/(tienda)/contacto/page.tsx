import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { ContactForm } from "./ContactForm";
import { waLink } from "@/components/WhatsAppButton";

export const metadata: Metadata = { title: "Contacto" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ tema?: string }> }) {
  const { tema } = await searchParams;
  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 pt-10 pb-24 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:pt-14">
      <div>
        <h1 className="text-4xl sm:text-5xl">{tema === "opinion" ? "Contanos tu experiencia" : "Hablemos"}</h1>
        <p className="mt-4 text-ink-soft">
          {tema === "opinion"
            ? "¿Cómo reaccionó la persona que recibió el libro? ¿Qué descubriste? Nos encanta leerlo."
            : "Te ayudamos a elegir el libro, a armar un pack o con cualquier duda sobre tu pedido."}
        </p>
        <div className="mt-8 space-y-3">
          <a href={waLink("Hola, quiero hacer una consulta.")} target="_blank" rel="noopener noreferrer" className="btn btn-ink">Escribinos por WhatsApp</a>
          <p className="text-sm text-ink-soft">o a <a className="link" href={`mailto:${BRAND.email}`}>{BRAND.email}</a></p>
        </div>
      </div>
      <ContactForm tema={tema} />
    </div>
  );
}
