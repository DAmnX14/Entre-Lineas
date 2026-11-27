import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/paths";

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

/** Sirve las portadas subidas desde el panel (guardadas en la carpeta de datos). */
export async function GET(_: Request, ctx: { params: Promise<{ file: string }> }) {
  const name = path.basename((await ctx.params).file);
  const type = TYPES[path.extname(name).toLowerCase()];
  if (!type) return new Response("No encontrado", { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOADS_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("No encontrado", { status: 404 });
  }
}
