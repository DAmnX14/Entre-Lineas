"use server";

import { z } from "zod";
import { addTestimonial, saveMessage } from "../repo";

export type ContactState = { ok?: boolean; error?: string } | undefined;

export async function sendContact(_: ContactState, form: FormData): Promise<ContactState> {
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Escribí tu nombre."),
      email: z.email("Revisá el correo electrónico."),
      message: z.string().trim().min(5, "Contanos un poco más.").max(3000),
      tema: z.string().optional(),
      book: z.string().optional(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.tema === "opinion") addTestimonial(d.name, d.message, d.book || null, false);
  saveMessage(d.name, d.email, d.tema === "opinion" ? `[Opinión] ${d.message}` : d.message);
  return { ok: true };
}
