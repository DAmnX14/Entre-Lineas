import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { paymentMethods } from "@/lib/payments";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await currentUser();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6">
      <h1 className="text-4xl">Finalizar compra</h1>
      <CheckoutForm user={user ? { email: user.email, name: user.name, phone: user.phone } : null} methods={paymentMethods()} />
    </div>
  );
}
