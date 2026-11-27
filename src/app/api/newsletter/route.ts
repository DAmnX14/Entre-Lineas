import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribe } from "@/lib/repo";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = z.object({ email: z.email() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ese correo no parece válido. Revisalo e intentá de nuevo." }, { status: 400 });
  subscribe(parsed.data.email);
  return NextResponse.json({ ok: true });
}
