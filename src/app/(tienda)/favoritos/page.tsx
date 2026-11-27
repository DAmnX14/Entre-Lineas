import type { Metadata } from "next";
import { FavoritesList } from "@/components/FavoritesList";

export const metadata: Metadata = { title: "Favoritos" };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6">
      <h1 className="text-4xl">Tus favoritos</h1>
      <div className="mt-10">
        <FavoritesList />
      </div>
    </div>
  );
}
