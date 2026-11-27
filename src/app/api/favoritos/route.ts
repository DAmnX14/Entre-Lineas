import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { getBook, listFavoriteIds, getBookById, toggleFavorite } from "@/lib/repo";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ slugs: [] });
  const slugs = listFavoriteIds(user.id)
    .map((id) => getBookById(id)?.slug)
    .filter(Boolean);
  return NextResponse.json({ slugs });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ saved: false, reason: "sin-sesion" });
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  const book = slug ? getBook(slug) : null;
  if (!book) return NextResponse.json({ error: "Libro inexistente" }, { status: 404 });
  return NextResponse.json({ saved: toggleFavorite(user.id, book.id) });
}
