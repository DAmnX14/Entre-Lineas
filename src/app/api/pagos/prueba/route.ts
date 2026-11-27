import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/repo";
import { confirmPayment, testPaymentsEnabled } from "@/lib/payments";

/** Solo en desarrollo: aprueba un pedido creado con el medio "Pago de prueba". */
export async function POST(req: Request) {
  if (!testPaymentsEnabled()) return NextResponse.json({ error: "No disponible" }, { status: 404 });
  const { number, token } = (await req.json().catch(() => ({}))) as { number?: string; token?: string };
  const order = number ? getOrderByNumber(number) : null;
  if (!order || order.publicToken !== token || order.paymentMethod !== "prueba") return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  confirmPayment(order.id, `prueba-${Date.now()}`);
  return NextResponse.json({ ok: true });
}
