import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Ingresar" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await currentUser()) redirect(next ?? "/cuenta");
  return (
    <div className="mx-auto max-w-md px-4 pt-14 pb-24">
      <h1 className="text-4xl">Ingresar</h1>
      <p className="mt-2 text-ink-soft">Para ver tus pedidos, descargar tus PDF y guardar favoritos.</p>
      <AuthForm mode="login" next={next} />
    </div>
  );
}
