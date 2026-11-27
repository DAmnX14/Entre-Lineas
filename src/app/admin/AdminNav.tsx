"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  ["/admin", "Resumen"],
  ["/admin/pedidos", "Pedidos"],
  ["/admin/libros", "Libros"],
  ["/admin/packs", "Packs"],
  ["/admin/cupones", "Cupones"],
  ["/admin/clientes", "Clientes"],
  ["/admin/opiniones", "Opiniones"],
  ["/admin/mensajes", "Mensajes y correos"],
  ["/admin/reportes", "Reportes"],
];

export function AdminNav({ pending }: { pending: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Administración" className="scroll-row flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map(([href, label]) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm ${active ? "bg-ink text-cream" : "hover:bg-linen"}`}
          >
            {label}
            {href === "/admin/pedidos" && pending > 0 && (
              <span className="rounded-full bg-clay px-2 text-xs font-bold text-white">{pending}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
