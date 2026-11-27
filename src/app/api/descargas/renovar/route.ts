import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { COMMERCE } from "@/lib/brand";
import { createDownload, downloadsForOrder, getOrderByNumber, queueEmail } from "@/lib/repo";

/** Genera enlaces nuevos para los PDF de un pedido pagado y los reenvía por correo. */
export async function POST(req: Request) {
  const { number, token } = (await req.json().catch(() => ({}))) as { number?: string; token?: string };
  const order = number ? getOrderByNumber(number) : null;
  const user = await currentUser();
  const allowed = order && (order.publicToken === token || user?.role === "admin" || (user && user.email === order.email));
  if (!order || !allowed) return NextResponse.json({ error: "Pedido inválido" }, { status: 403 });
  if (order.paymentStatus !== "pagado") return NextResponse.json({ error: "El pedido todavía no está pagado." }, { status: 400 });
  const fresh = downloadsForOrder(order.id).map((d) => ({ ...createDownload(order.id, d.bookId, order.email, COMMERCE.pdfLinkDays, COMMERCE.pdfMaxDownloads), title: d.title }));
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  queueEmail(order.email, `Tus descargas · Pedido ${order.number}`, fresh.map((d) => `${d.title}: ${base}/api/descargas/${d.token}`).join("\n"));
  return NextResponse.json({ ok: true, count: fresh.length });
}
