"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useHydrated } from "./useHydrated";
import { BRAND, LOGO } from "@/lib/brand";
import { useCart, useCartCount } from "./cart/store";
import { IconBag, IconClose, IconMenu, IconSearch, IconUser } from "./Icons";

const NAV = [
  { href: "/libros", label: "Libros" },
  { href: "/para-quien", label: "¿Para quién?" },
  { href: "/packs", label: "Packs de regalo" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/preguntas-frecuentes", label: "Preguntas" },
];

export function Header({ user }: { user: { name: string; role: string } | null }) {
  const count = useCartCount();
  const setOpen = useCart((s) => s.setOpen);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const mounted = useHydrated();
  const pathname = usePathname();
  const router = useRouter();

  // Al navegar se cierran el menú y el buscador (ajuste de estado durante el render).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(false);
    setSearch(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[4.5rem]">
        <button className="-ml-2 p-2 lg:hidden" onClick={() => setMenu(true)} aria-label="Abrir menú">
          <IconMenu />
        </button>
        <Link href="/" className="shrink-0" aria-label={`${BRAND.name}, inicio`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO.text} alt={BRAND.name} width={900} height={134} className="h-[1.35rem] w-auto sm:h-[1.6rem]" />
        </Link>
        <nav className="ml-8 hidden items-center gap-7 text-sm lg:flex" aria-label="Principal">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`py-2 hover:text-clay-deep ${pathname.startsWith(n.href) ? "text-clay-deep" : ""}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <button className="p-2.5" onClick={() => setSearch((v) => !v)} aria-label="Buscar libros" aria-expanded={search}>
            <IconSearch />
          </button>
          <Link href={user ? (user.role === "admin" ? "/admin" : "/cuenta") : "/ingresar"} className="p-2.5" aria-label={user ? "Mi cuenta" : "Ingresar"}>
            <IconUser />
          </Link>
          <button className="relative p-2.5" onClick={() => setOpen(true)} aria-label={`Abrir carrito (${mounted ? count : 0} productos)`}>
            <IconBag />
            {mounted && count > 0 && (
              <span className="absolute top-0.5 right-0 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-clay px-1 text-[0.68rem] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {search && (
        <form
          className="border-t border-line/70 bg-cream"
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get("q") as string;
            router.push(`/libros?q=${encodeURIComponent(q)}`);
          }}
        >
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <IconSearch className="h-5 w-5 text-ink-soft" />
            <label htmlFor="site-search" className="sr-only">
              Buscar libros
            </label>
            <input
              id="site-search"
              name="q"
              autoFocus
              placeholder="Buscá por persona, ocasión o título: abuela, aniversario, infancia…"
              className="w-full bg-transparent py-2 text-base outline-none placeholder:text-ink-soft/70"
            />
            <button className="btn btn-ink min-h-0 py-2">Buscar</button>
          </div>
        </form>
      )}

      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[84%] max-w-sm flex-col bg-cream px-6 py-5">
            <div className="flex items-center justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO.text} alt={BRAND.name} width={900} height={134} className="h-6 w-auto" />
              <button className="p-2" onClick={() => setMenu(false)} aria-label="Cerrar menú">
                <IconClose />
              </button>
            </div>
            <nav className="mt-8 flex flex-col" aria-label="Principal">
              {[{ href: "/", label: "Inicio" }, ...NAV].map((n) => (
                <Link key={n.href} href={n.href} className="serif border-b border-line py-4 text-2xl">
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto space-y-3 pt-6 text-sm">
              <Link href={user ? "/cuenta" : "/ingresar"} className="block">
                {user ? `Mi cuenta (${user.name || "perfil"})` : "Ingresar o crear cuenta"}
              </Link>
              <Link href="/contacto" className="block">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
