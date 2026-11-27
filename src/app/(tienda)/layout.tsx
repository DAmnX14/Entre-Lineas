import { currentUser } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-cream focus:p-3">
        Saltar al contenido
      </a>
      <Header user={user ? { name: user.name, role: user.role } : null} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </>
  );
}
