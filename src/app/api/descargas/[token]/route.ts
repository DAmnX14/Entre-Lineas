import fs from "node:fs/promises";
import path from "node:path";
import { getBookById, getDownload, getOrder, isDownloadValid, registerDownload } from "@/lib/repo";
import { renderBookPdf } from "@/lib/pdf";
import { slugify } from "@/lib/format";
import { PDFS_DIR } from "@/lib/paths";

export async function GET(req: Request, ctx: RouteContext<"/api/descargas/[token]">) {
  const { token } = await ctx.params;
  const d = getDownload(token);
  if (!d) return new Response("Este enlace de descarga no existe. Revisá el correo o pedí uno nuevo desde tu pedido.", { status: 404 });
  if (!isDownloadValid(d))
    return new Response("Este enlace venció o alcanzó el máximo de descargas. Podés generar uno nuevo desde la página de tu pedido.", { status: 410 });
  const order = getOrder(d.orderId);
  const book = getBookById(d.bookId);
  if (!order || order.paymentStatus !== "pagado" || !book) return new Response("Descarga no disponible.", { status: 403 });

  const size = new URL(req.url).searchParams.get("tamano") === "editorial" ? "editorial" : "a4";
  let bytes: Uint8Array;
  if (book.pdfFile) {
    bytes = await fs.readFile(path.join(PDFS_DIR, path.basename(book.pdfFile)));
  } else {
    const item = order.items.find((i) => i.bookId === book.id && i.format === "pdf") ?? order.items.find((i) => i.format === "pdf");
    bytes = await renderBookPdf(book, { size, personalization: item?.personalization });
  }
  registerDownload(d.id);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slugify(book.title)}${size === "editorial" ? "-17x24" : ""}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
