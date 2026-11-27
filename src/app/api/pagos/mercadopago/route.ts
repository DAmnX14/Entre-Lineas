import { NextResponse } from "next/server";
import { mercadoPagoEnabled, syncMercadoPagoPayment, verifyMercadoPagoSignature } from "@/lib/payments";

/** Notificaciones (webhooks) de Mercado Pago. Configurá esta URL en tu aplicación de Mercado Pago. */
export async function POST(req: Request) {
  if (!mercadoPagoEnabled()) return NextResponse.json({ ok: false }, { status: 404 });
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as { type?: string; action?: string; data?: { id?: string | number } };
  const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = String(body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (type !== "payment" || !id) return NextResponse.json({ ok: true, ignored: true });
  if (!verifyMercadoPagoSignature(req.headers, id)) return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  try {
    await syncMercadoPagoPayment(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[mercadopago]", e);
    return NextResponse.json({ error: "No se pudo procesar" }, { status: 500 });
  }
}
