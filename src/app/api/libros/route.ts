import { NextResponse } from "next/server";
import { getBooksBySlugs, listBooks } from "@/lib/repo";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slugs = url.searchParams.get("slugs");
  const books = slugs ? getBooksBySlugs(slugs.split(",").slice(0, 60)) : listBooks();
  return NextResponse.json(
    books.map((b) => ({
      slug: b.slug,
      title: b.title,
      tagline: b.tagline,
      category: b.category,
      coverImage: b.coverImage,
      priceFisico: b.priceFisico,
      pricePdf: b.pricePdf,
    })),
  );
}
