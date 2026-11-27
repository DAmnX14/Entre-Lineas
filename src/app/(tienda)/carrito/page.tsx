import type { Metadata } from "next";
import { CartPage } from "./CartPage";

export const metadata: Metadata = { title: "Carrito" };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6">
      <h1 className="text-4xl">Tu carrito</h1>
      <CartPage />
    </div>
  );
}
