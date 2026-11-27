"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession } from "../auth";
import { createUser, getUserByEmail } from "../repo";

export type FormState = { error?: string } | undefined;

function safeNext(n: FormDataEntryValue | null) {
  const s = typeof n === "string" ? n : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "";
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const user = getUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return { error: "El correo o la contraseña no coinciden." };
  await createSession(user.id);
  redirect(safeNext(form.get("next")) || (user.role === "admin" ? "/admin" : "/cuenta"));
}

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Escribí tu nombre."),
      email: z.email("Revisá el correo electrónico."),
      password: z.string().min(8, "La contraseña necesita al menos 8 caracteres."),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (getUserByEmail(parsed.data.email)) return { error: "Ya existe una cuenta con ese correo. Ingresá con tu contraseña." };
  const id = createUser(parsed.data.email, parsed.data.name, await bcrypt.hash(parsed.data.password, 10));
  await createSession(id);
  redirect(safeNext(form.get("next")) || "/cuenta");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
