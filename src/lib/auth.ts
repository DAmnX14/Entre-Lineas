import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { getUser, type User } from "./repo";

const COOKIE = "el_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("Falta SESSION_SECRET. Definila con al menos 32 caracteres aleatorios.");
  }
  return new TextEncoder().encode(s ?? "solo-para-desarrollo-local-cambiar-en-produccion");
}

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return getUser(Number(payload.uid));
  } catch {
    return null;
  }
}

export async function requireUser(next = "/cuenta"): Promise<User> {
  const u = await currentUser();
  if (!u) redirect(`/ingresar?next=${encodeURIComponent(next)}`);
  return u;
}

export async function requireAdmin(): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/ingresar?next=/admin");
  if (u.role !== "admin") redirect("/");
  return u;
}
