import Link from "next/link";
import { BRAND, LOGO } from "@/lib/brand";
import { CATEGORIES } from "@/lib/content/taxonomy";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-cream/85">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO.light} alt={`${BRAND.name}: ${BRAND.tagline}`} width={1000} height={487} className="w-full max-w-[17rem]" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/70">{BRAND.description}</p>
          <div className="mt-6 flex gap-4 text-sm">
            <a href={BRAND.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
            <a href={BRAND.social.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-white">TikTok</a>
            <a href={BRAND.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a>
            <a href={BRAND.social.pinterest} target="_blank" rel="noopener noreferrer" className="hover:text-white">Pinterest</a>
          </div>
        </div>
        <div>
          <p className="mb-3 font-semibold text-cream">Libros</p>
          <ul className="space-y-2 text-sm">
            {Object.entries(CATEGORIES).map(([k, c]) => (
              <li key={k}>
                <Link href={`/libros?categoria=${k}`} className="hover:text-white">{c.plural}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-cream">Comprar</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/packs" className="hover:text-white">Packs de regalo</Link></li>
            <li><Link href="/como-funciona" className="hover:text-white">Cómo funciona</Link></li>
            <li><Link href="/preguntas-frecuentes" className="hover:text-white">Envíos y preguntas frecuentes</Link></li>
            <li><Link href="/cuenta" className="hover:text-white">Mis pedidos y descargas</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-cream">Hablemos</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
            <li><a href={`https://wa.me/${BRAND.whatsapp}`} className="hover:text-white">WhatsApp</a></li>
            <li><a href={`mailto:${BRAND.email}`} className="hover:text-white">{BRAND.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-cream/55 sm:px-6">
          © {new Date().getFullYear()} {BRAND.name}. Precios en pesos argentinos, IVA incluido.
        </p>
      </div>
    </footer>
  );
}
