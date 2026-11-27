import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 pt-14 pb-24">
      <h1 className="text-4xl">Crear cuenta</h1>
      <p className="mt-2 text-ink-soft">Tus pedidos anteriores hechos con el mismo correo aparecen automáticamente.</p>
      <AuthForm mode="register" next={next} />
    </div>
  );
}
