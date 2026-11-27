"use server";

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../auth";
import { PDFS_DIR, UPLOADS_DIR } from "../paths";
import { slugify } from "../format";
import { textToSections } from "../sections-text";
import { confirmPayment } from "../payments";
import {
  addTestimonial,
  deleteBook,
  deleteCoupon,
  deletePack,
  deleteTestimonial,
  getBook,
  getBookById,
  getOrder,
  queueEmail,
  saveBook,
  saveCoupon,
  savePack,
  setTestimonialApproved,
  updateOrderStatus,
  type OrderStatus,
} from "../repo";
import type { CategoryKey } from "../content/types";

export type AdminState = { error?: string; ok?: string } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => {
  const v = str(f, k).replace(/\./g, "");
  return v === "" ? null : Math.max(0, Math.round(Number(v)));
};

async function storeUpload(file: File, dir: "covers" | "pdfs") {
  const ext = path.extname(file.name).toLowerCase();
  const name = `${crypto.randomBytes(8).toString("hex")}${ext}`;
  const base = dir === "covers" ? UPLOADS_DIR : PDFS_DIR;
  await fs.mkdir(base, { recursive: true });
  await fs.writeFile(path.join(base, name), Buffer.from(await file.arrayBuffer()));
  return dir === "covers" ? `/uploads/${name}` : name;
}

/* --------------------------------------------------------------- Libros */

export async function saveBookAction(_: AdminState, f: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = Number(str(f, "id")) || undefined;
  const title = str(f, "title");
  if (!title) return { error: "El libro necesita un título." };
  const slug = slugify(str(f, "slug") || title);
  const clash = getBook(slug);
  if (clash && clash.id !== id) return { error: `Ya existe un libro con la dirección «${slug}». Cambiá el título o la dirección.` };
  const { sections, error } = textToSections(str(f, "sections"));
  if (error) return { error };
  const priceFisico = int(f, "priceFisico");
  const pricePdf = int(f, "pricePdf");
  if (priceFisico === null || pricePdf === null) return { error: "Completá los dos precios." };

  let coverImage: string | null | undefined;
  const cover = f.get("cover");
  if (cover instanceof File && cover.size > 0) {
    if (!/^image\/(jpeg|png|webp)$/.test(cover.type)) return { error: "La portada tiene que ser JPG, PNG o WebP." };
    if (cover.size > 5 * 1024 * 1024) return { error: "La portada no puede pesar más de 5 MB." };
    coverImage = await storeUpload(cover, "covers");
  }
  if (f.get("removeCover") === "on") coverImage = null;
  let pdfFile: string | null | undefined;
  const pdf = f.get("pdf");
  if (pdf instanceof File && pdf.size > 0) {
    if (pdf.type !== "application/pdf") return { error: "El archivo digital tiene que ser PDF." };
    pdfFile = await storeUpload(pdf, "pdfs");
  }
  if (f.get("removePdf") === "on") pdfFile = null;

  const newId = saveBook(
    {
      slug,
      title,
      category: str(f, "category") as CategoryKey,
      recipients: f.getAll("recipients").map(String) as never,
      occasions: f.getAll("occasions").map(String) as never,
      tagline: str(f, "tagline"),
      description: str(f, "description"),
      whoFor: str(f, "whoFor"),
      badge: str(f, "badge") || null,
      featured: f.get("featured") === "on",
      sections,
      priceFisico,
      pricePdf,
      compareFisico: int(f, "compareFisico"),
      comparePdf: int(f, "comparePdf"),
      hasFisico: f.get("hasFisico") === "on",
      hasPdf: f.get("hasPdf") === "on",
      stock: int(f, "stock") ?? 0,
      active: f.get("active") === "on",
      coverImage,
      pdfFile,
    },
    id,
  );
  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/libros/${newId}?ok=1`);
  return { ok: "Cambios guardados." };
}

export async function deleteBookAction(f: FormData) {
  await requireAdmin();
  deleteBook(Number(f.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/libros");
}

export async function adjustStockAction(f: FormData) {
  await requireAdmin();
  const b = getBookById(Number(f.get("id")));
  if (!b) return;
  saveBook({ ...b, stock: Math.max(0, Number(f.get("stock")) || 0) }, b.id);
  revalidatePath("/admin/libros");
}

/* ---------------------------------------------------------------- Packs */

export async function savePackAction(_: AdminState, f: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = Number(str(f, "id")) || undefined;
  const title = str(f, "title");
  if (!title) return { error: "El pack necesita un nombre." };
  const chooseCount = int(f, "chooseCount") ?? 0;
  const bookSlugs = f.getAll("books").map(String);
  if (chooseCount === 0 && bookSlugs.length < 2) return { error: "Elegí al menos dos libros, o definí cuántos elige el cliente." };
  const discount = int(f, "discountPercent") ?? 0;
  if (discount > 80) return { error: "El descuento máximo es 80%." };
  try {
    savePack(
      {
        slug: slugify(str(f, "slug") || title),
        title,
        description: str(f, "description"),
        discountPercent: discount,
        bookSlugs: chooseCount ? [] : bookSlugs,
        chooseCount,
        allowedCategories: f.getAll("allowedCategories").map(String),
        occasion: str(f, "occasion") || null,
        active: f.get("active") === "on",
      },
      id,
    );
  } catch {
    return { error: "Ya existe un pack con ese nombre." };
  }
  revalidatePath("/", "layout");
  return { ok: id ? "Pack actualizado." : "Pack creado." };
}

export async function deletePackAction(f: FormData) {
  await requireAdmin();
  deletePack(Number(f.get("id")));
  revalidatePath("/", "layout");
}

/* -------------------------------------------------------------- Cupones */

export async function saveCouponAction(_: AdminState, f: FormData): Promise<AdminState> {
  await requireAdmin();
  const code = str(f, "code").toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return { error: "El código debe tener entre 3 y 30 letras o números, sin espacios." };
  const type = str(f, "type") as "percent" | "fixed" | "free_shipping";
  const value = int(f, "value") ?? 0;
  if (type === "percent" && (value < 1 || value > 100)) return { error: "El porcentaje tiene que estar entre 1 y 100." };
  try {
    saveCoupon(
      {
        code,
        type,
        value,
        minTotal: int(f, "minTotal") ?? 0,
        maxUses: int(f, "maxUses"),
        expiresAt: str(f, "expiresAt") || null,
        active: true,
      },
      Number(str(f, "id")) || undefined,
    );
  } catch {
    return { error: `El código ${code} ya existe.` };
  }
  revalidatePath("/admin/cupones");
  return { ok: `Cupón ${code} guardado.` };
}

export async function toggleCouponAction(f: FormData) {
  await requireAdmin();
  const { listCoupons } = await import("../repo");
  const c = listCoupons().find((x) => x.id === Number(f.get("id")));
  if (c) saveCoupon({ ...c, active: !c.active }, c.id);
  revalidatePath("/admin/cupones");
}

export async function deleteCouponAction(f: FormData) {
  await requireAdmin();
  deleteCoupon(Number(f.get("id")));
  revalidatePath("/admin/cupones");
}

/* -------------------------------------------------------------- Pedidos */

export async function updateOrderAction(_: AdminState, f: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = Number(f.get("id"));
  const order = getOrder(id);
  if (!order) return { error: "Pedido inexistente." };
  const status = str(f, "status") as OrderStatus;
  const tracking = str(f, "tracking") || null;
  if (status !== "pendiente" && status !== "cancelado" && order.paymentStatus !== "pagado") {
    confirmPayment(id, "manual");
  }
  updateOrderStatus(id, status, tracking);
  if (f.get("notify") === "on") {
    const lines = [`Hola ${order.name}, tu pedido ${order.number} cambió de estado.`];
    if (status === "enviado") lines.push(tracking ? `Ya está en camino. Código de seguimiento: ${tracking}` : "Ya está en camino.");
    if (status === "entregado") lines.push("Figura como entregado. ¡Que lo disfruten!");
    queueEmail(order.email, `Tu pedido ${order.number}`, lines.join("\n\n"));
  }
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/pedidos");
  return { ok: "Pedido actualizado." };
}

export async function markPaidAction(f: FormData) {
  await requireAdmin();
  confirmPayment(Number(f.get("id")), "manual");
  revalidatePath(`/admin/pedidos/${f.get("id")}`);
}

/* ---------------------------------------------------------- Opiniones */

export async function testimonialAction(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const op = str(f, "op");
  if (op === "approve") setTestimonialApproved(id, true);
  if (op === "hide") setTestimonialApproved(id, false);
  if (op === "delete") deleteTestimonial(id);
  if (op === "add" && str(f, "name") && str(f, "text")) addTestimonial(str(f, "name"), str(f, "text"), str(f, "book") || null, true);
  revalidatePath("/", "layout");
}
