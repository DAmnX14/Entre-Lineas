import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { BRAND } from "@/lib/brand";
import { db } from "@/lib/db";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administración", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const pending = (db().prepare("SELECT COUNT(*) n FROM orders WHERE status IN ('pagado','en_preparacion')").get() as { n: number }).n;
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-paper px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0 lg:py-6">
        <div className="mb-4 flex items-center justify-between lg:mb-8 lg:block">
          <Link href="/admin" className="serif text-2xl">{BRAND.name}</Link>
          <p className="text-xs text-ink-soft lg:mt-1">Panel de administración</p>
        </div>
        <AdminNav pending={pending} />
        <div className="mt-8 hidden space-y-2 text-sm lg:block">
          <Link href="/" className="block text-ink-soft hover:text-ink">Ver la tienda</Link>
          <p className="text-xs text-ink-soft">{user.email}</p>
          <form action={logout}><button className="text-ink-soft underline">Cerrar sesión</button></form>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">{children}</div>
    </div>
  );
}
