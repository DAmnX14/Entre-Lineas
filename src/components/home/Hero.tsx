import Link from "next/link";

/** Polaroid ilustrada (reemplazable por una fotografía real de la marca). */
function OldPhoto() {
  return (
    <figure className="absolute -bottom-6 -left-4 z-10 w-[38%] rotate-[-6deg] bg-[#fbf8f2] p-[3%] pb-[2%] shadow-[0_14px_24px_-12px_rgba(58,42,31,.5)] sm:-left-10">
      <svg viewBox="0 0 120 100" className="block w-full" role="img" aria-label="Ilustración de una foto antigua en la playa">
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#e9d3b3" />
            <stop offset="1" stopColor="#d9b98f" />
          </linearGradient>
        </defs>
        <rect width="120" height="100" fill="url(#sky)" />
        <circle cx="88" cy="30" r="11" fill="#f3e2c4" />
        <rect y="56" width="120" height="16" fill="#a98a69" />
        <path d="M0 70c20-4 40 4 60 0s40 4 60 0v30H0Z" fill="#cfb08a" />
        <path d="M30 78l-8-26 22 6Z" fill="#9c5f48" />
        <path d="M33 52 34 82" stroke="#5a4433" strokeWidth="1.2" />
        <circle cx="62" cy="70" r="3.2" fill="#5a4433" />
        <path d="M62 74v10M58 78h8M62 84l-3 6M62 84l3 6" stroke="#5a4433" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="72" cy="74" r="2.4" fill="#5a4433" />
        <path d="M72 77v7M69 80h6M72 84l-2 5M72 84l2 5" stroke="#5a4433" strokeWidth="1.3" strokeLinecap="round" />
        <rect width="120" height="100" fill="#7a5a3a" opacity="0.12" />
      </svg>
      <figcaption className="font-hand mt-1 text-center text-[clamp(0.85rem,1.6vw,1.2rem)] text-ink">Mar del Plata, 1979</figcaption>
    </figure>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-16 lg:pb-28">
        <div className="max-w-xl">
          <h1 className="text-[2.75rem] leading-[1.02] sm:text-5xl lg:text-[4.9rem]">Hay historias que merecen ser contadas.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft sm:text-xl">
            Regalá un libro. Descubrí una historia. Guardá recuerdos para toda la vida.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/para-quien" className="btn btn-primary px-7">
              Encontrar el libro perfecto
            </Link>
            <Link href="/libros" className="btn btn-ghost px-7">
              Explorar todos los libros
            </Link>
          </div>
          <p className="mt-8 max-w-sm text-sm text-ink-soft">
            Libros con preguntas para que mamá, papá, los abuelos o tu pareja escriban su historia con su propia letra. En papel o en PDF.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[34rem] lg:mr-0">
          <div className="relative grid rotate-[1.5deg] grid-cols-2 rounded-[4px] bg-[#fbf8f2] shadow-[0_40px_60px_-30px_rgba(58,42,31,.55),0_0_0_1px_rgba(58,42,31,.06)]">
            <div className="aspect-[17/24] border-r border-line/80 bg-gradient-to-l from-black/[0.06] to-transparent p-[11%]">
              <p className="text-[0.6rem] text-ink-soft sm:text-xs">Tu infancia</p>
              <p className="serif mt-3 text-[clamp(1rem,2.4vw,1.55rem)] leading-tight">¿Cuál es el primer recuerdo que tenés?</p>
              <p className="serif mt-3 text-[clamp(0.65rem,1.2vw,0.85rem)] italic text-ink-soft">Contalo con todos los detalles que puedas.</p>
            </div>
            <div className="ruled aspect-[17/24] bg-gradient-to-r from-black/[0.05] to-transparent px-[9%] pt-[14%] [background-position:0_calc(14%+0.2rem)] [background-size:100%_1.9rem]">
              <p className="font-hand text-[clamp(1.05rem,2.1vw,1.45rem)] leading-[1.9rem] text-[#3b4a6b]" aria-label="La cocina de la casa de mi abuela. Los domingos amasábamos tallarines y yo me robaba la masa cruda. Todavía siento el olor a harina.">
                <span className="handwrite block" aria-hidden>La cocina de la casa de mi abuela.</span>
                <span className="handwrite handwrite-2 block" aria-hidden>Los domingos amasábamos tallarines</span>
                <span className="handwrite handwrite-3 block" aria-hidden>y yo me robaba la masa cruda…</span>
              </p>
            </div>
          </div>
          <OldPhoto />
        </div>
      </div>
    </section>
  );
}
