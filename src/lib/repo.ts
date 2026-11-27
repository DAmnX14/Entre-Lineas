import "server-only";
import crypto from "node:crypto";
import { db, tx } from "./db";
import type { BookSection, CategoryKey, OccasionKey, RecipientKey } from "./content/types";
import type { Personalization } from "./personalization";

/* ------------------------------------------------------------------ Tipos */

export type Format = "fisico" | "pdf";

export type Book = {
  id: number;
  slug: string;
  title: string;
  category: CategoryKey;
  recipients: RecipientKey[];
  occasions: OccasionKey[];
  tagline: string;
  description: string;
  whoFor: string;
  badge: string | null;
  featured: boolean;
  sections: BookSection[];
  priceFisico: number;
  pricePdf: number;
  compareFisico: number | null;
  comparePdf: number | null;
  hasFisico: boolean;
  hasPdf: boolean;
  stock: number;
  pdfFile: string | null;
  coverImage: string | null;
  active: boolean;
  pages: number;
};

export type Pack = {
  id: number;
  slug: string;
  title: string;
  description: string;
  discountPercent: number;
  bookSlugs: string[];
  chooseCount: number;
  allowedCategories: string[];
  occasion: string | null;
  active: boolean;
};

type Row = Record<string, unknown>;

export function estimatePages(sections: BookSection[]) {
  let pages = 8; // portada, guardas, índice y cierre
  for (const s of sections) {
    pages += 1;
    if (s.kind === "questions") pages += s.prompts.length;
    else if (s.kind === "photos") pages += s.prompts.length;
    else if (s.kind === "letter") pages += s.prompts.length * 2;
    else pages += 2;
  }
  return Math.ceil(pages / 4) * 4;
}

function toBook(r: Row): Book {
  const sections = JSON.parse(r.sections as string) as BookSection[];
  return {
    id: r.id as number,
    slug: r.slug as string,
    title: r.title as string,
    category: r.category as CategoryKey,
    recipients: JSON.parse(r.recipients as string),
    occasions: JSON.parse(r.occasions as string),
    tagline: r.tagline as string,
    description: r.description as string,
    whoFor: r.who_for as string,
    badge: (r.badge as string) || null,
    featured: !!r.featured,
    sections,
    priceFisico: r.price_fisico as number,
    pricePdf: r.price_pdf as number,
    compareFisico: (r.compare_fisico as number) ?? null,
    comparePdf: (r.compare_pdf as number) ?? null,
    hasFisico: !!r.has_fisico,
    hasPdf: !!r.has_pdf,
    stock: r.stock as number,
    pdfFile: (r.pdf_file as string) || null,
    coverImage: (r.cover_image as string) || null,
    active: !!r.active,
    pages: estimatePages(sections),
  };
}

function toPack(r: Row): Pack {
  return {
    id: r.id as number,
    slug: r.slug as string,
    title: r.title as string,
    description: r.description as string,
    discountPercent: r.discount_percent as number,
    bookSlugs: JSON.parse(r.book_slugs as string),
    chooseCount: r.choose_count as number,
    allowedCategories: JSON.parse(r.allowed_categories as string),
    occasion: (r.occasion as string) || null,
    active: !!r.active,
  };
}

/* ----------------------------------------------------------------- Libros */

export type BookFilters = {
  q?: string;
  recipient?: string;
  category?: string;
  format?: string;
  occasion?: string;
  sort?: string;
};

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function listBooks(f: BookFilters = {}, includeInactive = false): Book[] {
  const rows = db()
    .prepare(`SELECT * FROM books ${includeInactive ? "" : "WHERE active = 1"} ORDER BY featured DESC, id ASC`)
    .all() as Row[];
  let books = rows.map(toBook);
  if (f.q) {
    const terms = norm(f.q).split(/\s+/).filter(Boolean);
    books = books.filter((b) => {
      const hay = norm(`${b.title} ${b.tagline} ${b.description} ${b.category} ${b.recipients.join(" ")}`);
      return terms.every((t) => hay.includes(t));
    });
  }
  if (f.recipient) books = books.filter((b) => b.recipients.includes(f.recipient as RecipientKey));
  if (f.category) books = books.filter((b) => b.category === f.category);
  if (f.occasion) books = books.filter((b) => b.occasions.includes(f.occasion as OccasionKey));
  if (f.format === "pdf") books = books.filter((b) => b.hasPdf);
  if (f.format === "fisico") books = books.filter((b) => b.hasFisico);
  if (f.sort === "precio-asc") books.sort((a, b) => a.priceFisico - b.priceFisico);
  if (f.sort === "precio-desc") books.sort((a, b) => b.priceFisico - a.priceFisico);
  if (f.sort === "nuevos") books.sort((a, b) => b.id - a.id);
  return books;
}

export function getBook(slug: string): Book | null {
  const r = db().prepare("SELECT * FROM books WHERE slug = ?").get(slug) as Row | undefined;
  return r ? toBook(r) : null;
}

export function getBookById(id: number): Book | null {
  const r = db().prepare("SELECT * FROM books WHERE id = ?").get(id) as Row | undefined;
  return r ? toBook(r) : null;
}

export function getBooksBySlugs(slugs: string[]): Book[] {
  if (!slugs.length) return [];
  const rows = db()
    .prepare(`SELECT * FROM books WHERE slug IN (${slugs.map(() => "?").join(",")})`)
    .all(...slugs) as Row[];
  const map = new Map(rows.map((r) => [r.slug as string, toBook(r)]));
  return slugs.map((s) => map.get(s)).filter(Boolean) as Book[];
}

export function featuredBooks(limit = 8): Book[] {
  return listBooks().filter((b) => b.featured).slice(0, limit);
}

export function relatedBooks(book: Book, limit = 4): Book[] {
  return listBooks({ category: book.category })
    .filter((b) => b.id !== book.id)
    .slice(0, limit);
}

export type BookInput = Omit<Book, "id" | "pages" | "pdfFile" | "coverImage"> & {
  pdfFile?: string | null;
  coverImage?: string | null;
};

export function saveBook(input: BookInput, id?: number): number {
  const vals = [
    input.slug,
    input.title,
    input.category,
    JSON.stringify(input.recipients),
    JSON.stringify(input.occasions),
    input.tagline,
    input.description,
    input.whoFor,
    input.badge,
    input.featured ? 1 : 0,
    JSON.stringify(input.sections),
    input.priceFisico,
    input.pricePdf,
    input.compareFisico,
    input.comparePdf,
    input.hasFisico ? 1 : 0,
    input.hasPdf ? 1 : 0,
    input.stock,
    input.active ? 1 : 0,
  ];
  if (id) {
    db()
      .prepare(
        `UPDATE books SET slug=?,title=?,category=?,recipients=?,occasions=?,tagline=?,description=?,who_for=?,badge=?,featured=?,sections=?,price_fisico=?,price_pdf=?,compare_fisico=?,compare_pdf=?,has_fisico=?,has_pdf=?,stock=?,active=? WHERE id=?`,
      )
      .run(...vals, id);
  } else {
    const r = db()
      .prepare(
        `INSERT INTO books (slug,title,category,recipients,occasions,tagline,description,who_for,badge,featured,sections,price_fisico,price_pdf,compare_fisico,compare_pdf,has_fisico,has_pdf,stock,active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(...vals);
    id = Number(r.lastInsertRowid);
  }
  if (input.pdfFile !== undefined) db().prepare("UPDATE books SET pdf_file=? WHERE id=?").run(input.pdfFile, id);
  if (input.coverImage !== undefined) db().prepare("UPDATE books SET cover_image=? WHERE id=?").run(input.coverImage, id);
  return id;
}

export function deleteBook(id: number) {
  const sold = db().prepare("SELECT COUNT(*) n FROM order_items WHERE book_id=?").get(id) as { n: number };
  if (sold.n > 0) {
    // Con ventas registradas se desactiva para conservar el historial.
    db().prepare("UPDATE books SET active=0 WHERE id=?").run(id);
    return "desactivado";
  }
  db().prepare("DELETE FROM books WHERE id=?").run(id);
  db().prepare("DELETE FROM favorites WHERE book_id=?").run(id);
  return "eliminado";
}

/* ------------------------------------------------------------------ Packs */

export function listPacks(includeInactive = false): Pack[] {
  return (
    db()
      .prepare(`SELECT * FROM packs ${includeInactive ? "" : "WHERE active=1"} ORDER BY choose_count ASC, id ASC`)
      .all() as Row[]
  ).map(toPack);
}

export function getPack(slug: string): Pack | null {
  const r = db().prepare("SELECT * FROM packs WHERE slug=?").get(slug) as Row | undefined;
  return r ? toPack(r) : null;
}

export function getPackById(id: number): Pack | null {
  const r = db().prepare("SELECT * FROM packs WHERE id=?").get(id) as Row | undefined;
  return r ? toPack(r) : null;
}

export function savePack(p: Omit<Pack, "id">, id?: number) {
  const vals = [
    p.slug,
    p.title,
    p.description,
    p.discountPercent,
    JSON.stringify(p.bookSlugs),
    p.chooseCount,
    JSON.stringify(p.allowedCategories),
    p.occasion,
    p.active ? 1 : 0,
  ];
  if (id) {
    db()
      .prepare(
        "UPDATE packs SET slug=?,title=?,description=?,discount_percent=?,book_slugs=?,choose_count=?,allowed_categories=?,occasion=?,active=? WHERE id=?",
      )
      .run(...vals, id);
    return id;
  }
  const r = db()
    .prepare(
      "INSERT INTO packs (slug,title,description,discount_percent,book_slugs,choose_count,allowed_categories,occasion,active) VALUES (?,?,?,?,?,?,?,?,?)",
    )
    .run(...vals);
  return Number(r.lastInsertRowid);
}

export function deletePack(id: number) {
  db().prepare("DELETE FROM packs WHERE id=?").run(id);
}

/* ---------------------------------------------------------------- Cupones */

export type Coupon = {
  id: number;
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  minTotal: number;
  maxUses: number | null;
  uses: number;
  expiresAt: string | null;
  active: boolean;
};

function toCoupon(r: Row): Coupon {
  return {
    id: r.id as number,
    code: r.code as string,
    type: r.type as Coupon["type"],
    value: r.value as number,
    minTotal: r.min_total as number,
    maxUses: (r.max_uses as number) ?? null,
    uses: r.uses as number,
    expiresAt: (r.expires_at as string) || null,
    active: !!r.active,
  };
}

export function listCoupons(): Coupon[] {
  return (db().prepare("SELECT * FROM coupons ORDER BY id DESC").all() as Row[]).map(toCoupon);
}

export function getCoupon(code: string): Coupon | null {
  const r = db().prepare("SELECT * FROM coupons WHERE code = ? COLLATE NOCASE").get(code.trim()) as Row | undefined;
  return r ? toCoupon(r) : null;
}

export function saveCoupon(c: Omit<Coupon, "id" | "uses">, id?: number) {
  const vals = [c.code.toUpperCase(), c.type, c.value, c.minTotal, c.maxUses, c.expiresAt, c.active ? 1 : 0];
  if (id) {
    db().prepare("UPDATE coupons SET code=?,type=?,value=?,min_total=?,max_uses=?,expires_at=?,active=? WHERE id=?").run(...vals, id);
  } else {
    db().prepare("INSERT INTO coupons (code,type,value,min_total,max_uses,expires_at,active) VALUES (?,?,?,?,?,?,?)").run(...vals);
  }
}

export function deleteCoupon(id: number) {
  db().prepare("DELETE FROM coupons WHERE id=?").run(id);
}

/* --------------------------------------------------------------- Usuarios */

export type User = { id: number; email: string; name: string; phone: string | null; role: "customer" | "admin"; createdAt: string };

function toUser(r: Row): User {
  return {
    id: r.id as number,
    email: r.email as string,
    name: r.name as string,
    phone: (r.phone as string) || null,
    role: r.role as User["role"],
    createdAt: r.created_at as string,
  };
}

export function getUserByEmail(email: string): (User & { passwordHash: string }) | null {
  const r = db().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim()) as Row | undefined;
  return r ? { ...toUser(r), passwordHash: r.password_hash as string } : null;
}

export function getUser(id: number): User | null {
  const r = db().prepare("SELECT * FROM users WHERE id = ?").get(id) as Row | undefined;
  return r ? toUser(r) : null;
}

export function createUser(email: string, name: string, passwordHash: string): number {
  const r = db()
    .prepare("INSERT INTO users (email,name,password_hash) VALUES (?,?,?)")
    .run(email.toLowerCase().trim(), name.trim(), passwordHash);
  return Number(r.lastInsertRowid);
}

export function listCustomers() {
  return db()
    .prepare(
      `SELECT u.id, u.email, u.name, u.created_at,
        (SELECT COUNT(*) FROM orders o WHERE o.email = u.email AND o.payment_status='pagado') AS orders,
        (SELECT COALESCE(SUM(total),0) FROM orders o WHERE o.email = u.email AND o.payment_status='pagado') AS spent
       FROM users u WHERE u.role='customer'
       UNION ALL
       SELECT NULL, o.email, MAX(o.name), MIN(o.created_at), SUM(o.payment_status='pagado'), SUM(CASE WHEN o.payment_status='pagado' THEN o.total ELSE 0 END)
       FROM orders o WHERE o.email NOT IN (SELECT email FROM users) GROUP BY o.email
       ORDER BY 6 DESC`,
    )
    .all() as { id: number | null; email: string; name: string; created_at: string; orders: number; spent: number }[];
}

/* -------------------------------------------------------------- Favoritos */

export function listFavoriteIds(userId: number): number[] {
  return (db().prepare("SELECT book_id FROM favorites WHERE user_id=?").all(userId) as { book_id: number }[]).map((r) => r.book_id);
}

export function toggleFavorite(userId: number, bookId: number): boolean {
  const exists = db().prepare("SELECT 1 FROM favorites WHERE user_id=? AND book_id=?").get(userId, bookId);
  if (exists) {
    db().prepare("DELETE FROM favorites WHERE user_id=? AND book_id=?").run(userId, bookId);
    return false;
  }
  db().prepare("INSERT INTO favorites (user_id,book_id) VALUES (?,?)").run(userId, bookId);
  return true;
}

/* ---------------------------------------------------------------- Pedidos */

import { ORDER_STATUS_LABEL, type OrderStatus } from "./order-status";
export { ORDER_STATUS_LABEL, type OrderStatus };

export type Address = { street: string; number: string; floor?: string; city: string; province: string; postalCode: string };
export type Billing = { type: "consumidor_final" | "factura_a"; name?: string; cuit?: string; address?: string };

export type OrderItem = {
  id: number;
  kind: "book" | "pack";
  bookId: number | null;
  packId: number | null;
  title: string;
  format: Format;
  qty: number;
  unitPrice: number;
  total: number;
  personalization: Personalization | null;
  packBooks: string[] | null;
};

export type { Personalization };

export type Order = {
  id: number;
  number: string;
  publicToken: string;
  userId: number | null;
  email: string;
  name: string;
  phone: string | null;
  dni: string | null;
  shipping: Address | null;
  billing: Billing | null;
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  paymentMethod: string;
  paymentStatus: "pendiente" | "pagado" | "rechazado";
  status: OrderStatus;
  trackingCode: string | null;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  notes: string | null;
  createdAt: string;
  paidAt: string | null;
  items: OrderItem[];
};

function toOrder(r: Row, items: OrderItem[]): Order {
  return {
    id: r.id as number,
    number: r.number as string,
    publicToken: r.public_token as string,
    userId: (r.user_id as number) ?? null,
    email: r.email as string,
    name: r.name as string,
    phone: (r.phone as string) || null,
    dni: (r.dni as string) || null,
    shipping: r.shipping ? JSON.parse(r.shipping as string) : null,
    billing: r.billing ? JSON.parse(r.billing as string) : null,
    shippingMethod: r.shipping_method as string,
    shippingCost: r.shipping_cost as number,
    subtotal: r.subtotal as number,
    discount: r.discount as number,
    total: r.total as number,
    couponCode: (r.coupon_code as string) || null,
    paymentMethod: r.payment_method as string,
    paymentStatus: r.payment_status as Order["paymentStatus"],
    status: r.status as OrderStatus,
    trackingCode: (r.tracking_code as string) || null,
    mpPreferenceId: (r.mp_preference_id as string) || null,
    mpPaymentId: (r.mp_payment_id as string) || null,
    notes: (r.notes as string) || null,
    createdAt: r.created_at as string,
    paidAt: (r.paid_at as string) || null,
    items,
  };
}

function itemsFor(orderId: number): OrderItem[] {
  return (db().prepare("SELECT * FROM order_items WHERE order_id=? ORDER BY id").all(orderId) as Row[]).map((r) => ({
    id: r.id as number,
    kind: r.kind as OrderItem["kind"],
    bookId: (r.book_id as number) ?? null,
    packId: (r.pack_id as number) ?? null,
    title: r.title as string,
    format: r.format as Format,
    qty: r.qty as number,
    unitPrice: r.unit_price as number,
    total: r.total as number,
    personalization: r.personalization ? JSON.parse(r.personalization as string) : null,
    packBooks: r.pack_books ? JSON.parse(r.pack_books as string) : null,
  }));
}

export function getOrder(id: number): Order | null {
  const r = db().prepare("SELECT * FROM orders WHERE id=?").get(id) as Row | undefined;
  return r ? toOrder(r, itemsFor(id)) : null;
}

export function getOrderByNumber(number: string): Order | null {
  const r = db().prepare("SELECT * FROM orders WHERE number=?").get(number) as Row | undefined;
  return r ? toOrder(r, itemsFor(r.id as number)) : null;
}

export function listOrders(filter: { status?: string; email?: string; q?: string } = {}): Order[] {
  const where: string[] = [];
  const args: string[] = [];
  if (filter.status) {
    where.push("status = ?");
    args.push(filter.status);
  }
  if (filter.email) {
    where.push("email = ?");
    args.push(filter.email.toLowerCase());
  }
  if (filter.q) {
    where.push("(number LIKE ? OR email LIKE ? OR name LIKE ?)");
    args.push(`%${filter.q}%`, `%${filter.q}%`, `%${filter.q}%`);
  }
  const rows = db()
    .prepare(`SELECT * FROM orders ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC LIMIT 500`)
    .all(...args) as Row[];
  return rows.map((r) => toOrder(r, itemsFor(r.id as number)));
}

export type NewOrder = Omit<
  Order,
  "id" | "number" | "publicToken" | "createdAt" | "paidAt" | "items" | "paymentStatus" | "status" | "trackingCode" | "mpPreferenceId" | "mpPaymentId"
> & { items: Omit<OrderItem, "id">[] };

export function createOrder(o: NewOrder): Order {
  const id = tx(() => {
    const token = crypto.randomBytes(18).toString("base64url");
    const r = db()
      .prepare(
        `INSERT INTO orders (number,public_token,user_id,email,name,phone,dni,shipping,billing,shipping_method,shipping_cost,subtotal,discount,total,coupon_code,payment_method,notes)
         VALUES ('tmp',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        token,
        o.userId,
        o.email.toLowerCase().trim(),
        o.name,
        o.phone,
        o.dni,
        o.shipping ? JSON.stringify(o.shipping) : null,
        o.billing ? JSON.stringify(o.billing) : null,
        o.shippingMethod,
        o.shippingCost,
        o.subtotal,
        o.discount,
        o.total,
        o.couponCode,
        o.paymentMethod,
        o.notes,
      );
    const id = Number(r.lastInsertRowid);
    db().prepare("UPDATE orders SET number=? WHERE id=?").run(`EL-${String(1000 + id).padStart(6, "0")}`, id);
    const ins = db().prepare(
      "INSERT INTO order_items (order_id,kind,book_id,pack_id,title,format,qty,unit_price,total,personalization,pack_books) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    );
    for (const it of o.items) {
      ins.run(
        id,
        it.kind,
        it.bookId,
        it.packId,
        it.title,
        it.format,
        it.qty,
        it.unitPrice,
        it.total,
        it.personalization ? JSON.stringify(it.personalization) : null,
        it.packBooks ? JSON.stringify(it.packBooks) : null,
      );
    }
    return id;
  });
  return getOrder(id)!;
}

export function setOrderPreference(id: number, prefId: string) {
  db().prepare("UPDATE orders SET mp_preference_id=? WHERE id=?").run(prefId, id);
}

export function updateOrderStatus(id: number, status: OrderStatus, trackingCode?: string | null) {
  db().prepare("UPDATE orders SET status=?, tracking_code=COALESCE(?, tracking_code) WHERE id=?").run(status, trackingCode ?? null, id);
}

/** Libros (y cantidades) incluidos en un pedido, abriendo los packs. */
export function orderBookUnits(order: Order) {
  const units: { bookId: number; format: Format; qty: number; personalization: Personalization | null }[] = [];
  for (const it of order.items) {
    if (it.kind === "book" && it.bookId) units.push({ bookId: it.bookId, format: it.format, qty: it.qty, personalization: it.personalization });
    if (it.kind === "pack" && it.packBooks) {
      for (const b of getBooksBySlugs(it.packBooks)) units.push({ bookId: b.id, format: it.format, qty: it.qty, personalization: it.personalization });
    }
  }
  return units;
}

/**
 * Marca un pedido como pagado de forma idempotente: descuenta stock de los
 * libros físicos, suma el uso del cupón y genera los enlaces de descarga.
 */
export function markOrderPaid(id: number, mpPaymentId?: string): boolean {
  return tx(() => {
    const row = db().prepare("SELECT payment_status FROM orders WHERE id=?").get(id) as { payment_status: string } | undefined;
    if (!row || row.payment_status === "pagado") return false;
    const order = getOrder(id)!;
    db()
      .prepare("UPDATE orders SET payment_status='pagado', status='pagado', paid_at=datetime('now'), mp_payment_id=COALESCE(?, mp_payment_id) WHERE id=?")
      .run(mpPaymentId ?? null, id);
    const units = orderBookUnits(order);
    for (const u of units) {
      if (u.format === "fisico") db().prepare("UPDATE books SET stock = MAX(stock - ?, 0) WHERE id=?").run(u.qty, u.bookId);
    }
    if (order.couponCode) db().prepare("UPDATE coupons SET uses = uses + 1 WHERE code=? COLLATE NOCASE").run(order.couponCode);
    const pdfBookIds = [...new Set(units.filter((u) => u.format === "pdf").map((u) => u.bookId))];
    for (const bookId of pdfBookIds) createDownload(order.id, bookId, order.email);
    if (!order.items.some((i) => i.format === "fisico")) {
      db().prepare("UPDATE orders SET status='entregado' WHERE id=?").run(id);
    }
    return true;
  });
}

export function markOrderRejected(id: number) {
  db().prepare("UPDATE orders SET payment_status='rechazado' WHERE id=? AND payment_status != 'pagado'").run(id);
}

/* -------------------------------------------------------------- Descargas */

export type Download = {
  id: number;
  token: string;
  orderId: number;
  bookId: number;
  email: string;
  expiresAt: string;
  maxDownloads: number;
  downloads: number;
};

function toDownload(r: Row): Download {
  return {
    id: r.id as number,
    token: r.token as string,
    orderId: r.order_id as number,
    bookId: r.book_id as number,
    email: r.email as string,
    expiresAt: r.expires_at as string,
    maxDownloads: r.max_downloads as number,
    downloads: r.downloads as number,
  };
}

export function createDownload(orderId: number, bookId: number, email: string, days = 30, max = 10): Download {
  const token = crypto.randomBytes(24).toString("base64url");
  db()
    .prepare(
      "INSERT INTO downloads (token,order_id,book_id,email,expires_at,max_downloads) VALUES (?,?,?,?,datetime('now', ?),?)",
    )
    .run(token, orderId, bookId, email, `+${days} days`, max);
  return getDownload(token)!;
}

export function getDownload(token: string): Download | null {
  const r = db().prepare("SELECT * FROM downloads WHERE token=?").get(token) as Row | undefined;
  return r ? toDownload(r) : null;
}

export function downloadsForOrder(orderId: number): (Download & { title: string; slug: string })[] {
  return (
    db()
      .prepare(
        `SELECT d.*, b.title, b.slug FROM downloads d JOIN books b ON b.id = d.book_id
         WHERE d.order_id=? AND d.id IN (SELECT MAX(id) FROM downloads WHERE order_id=? GROUP BY book_id) ORDER BY d.id`,
      )
      .all(orderId, orderId) as Row[]
  ).map((r) => ({ ...toDownload(r), title: r.title as string, slug: r.slug as string }));
}

export function registerDownload(id: number) {
  db().prepare("UPDATE downloads SET downloads = downloads + 1 WHERE id=?").run(id);
}

export function isDownloadValid(d: Download) {
  const expired = (db().prepare("SELECT datetime('now') > ? AS e").get(d.expiresAt) as { e: number }).e === 1;
  return !expired && d.downloads < d.maxDownloads;
}

/* ------------------------------------------------- Newsletter y mensajes */

export function subscribe(email: string) {
  db().prepare("INSERT OR IGNORE INTO newsletter (email) VALUES (?)").run(email.toLowerCase().trim());
}

export function listSubscribers() {
  return db().prepare("SELECT * FROM newsletter ORDER BY created_at DESC").all() as { email: string; created_at: string }[];
}

export function saveMessage(name: string, email: string, message: string) {
  db().prepare("INSERT INTO messages (name,email,message) VALUES (?,?,?)").run(name, email, message);
}

export function listMessages() {
  return db().prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 200").all() as {
    id: number;
    name: string;
    email: string;
    message: string;
    created_at: string;
  }[];
}

export function queueEmail(to: string, subject: string, body: string) {
  db().prepare("INSERT INTO outbox (to_email,subject,body) VALUES (?,?,?)").run(to, subject, body);
}

export function listOutbox() {
  return db().prepare("SELECT * FROM outbox ORDER BY id DESC LIMIT 100").all() as {
    id: number;
    to_email: string;
    subject: string;
    body: string;
    created_at: string;
  }[];
}

/* ------------------------------------------------------------ Testimonios */

export type Testimonial = { id: number; name: string; text: string; bookTitle: string | null; approved: boolean; createdAt: string };

export function listTestimonials(onlyApproved = true): Testimonial[] {
  return (
    db()
      .prepare(`SELECT * FROM testimonials ${onlyApproved ? "WHERE approved=1" : ""} ORDER BY id DESC`)
      .all() as Row[]
  ).map((r) => ({
    id: r.id as number,
    name: r.name as string,
    text: r.text as string,
    bookTitle: (r.book_title as string) || null,
    approved: !!r.approved,
    createdAt: r.created_at as string,
  }));
}

export function addTestimonial(name: string, text: string, bookTitle: string | null, approved = false) {
  db().prepare("INSERT INTO testimonials (name,text,book_title,approved) VALUES (?,?,?,?)").run(name, text, bookTitle, approved ? 1 : 0);
}

export function setTestimonialApproved(id: number, approved: boolean) {
  db().prepare("UPDATE testimonials SET approved=? WHERE id=?").run(approved ? 1 : 0, id);
}

export function deleteTestimonial(id: number) {
  db().prepare("DELETE FROM testimonials WHERE id=?").run(id);
}

/* ------------------------------------------------------------ Estadísticas */

export function salesStats(days = 30) {
  const d = db();
  const since = `-${days} days`;
  const totals = d
    .prepare(
      `SELECT COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue, COALESCE(AVG(total),0) AS avg
       FROM orders WHERE payment_status='pagado' AND paid_at >= datetime('now', ?)`,
    )
    .get(since) as { orders: number; revenue: number; avg: number };
  const byFormat = d
    .prepare(
      `SELECT i.format, COALESCE(SUM(i.total),0) AS revenue, COALESCE(SUM(i.qty),0) AS units
       FROM order_items i JOIN orders o ON o.id=i.order_id
       WHERE o.payment_status='pagado' AND o.paid_at >= datetime('now', ?) GROUP BY i.format`,
    )
    .all(since) as { format: Format; revenue: number; units: number }[];
  const daily = d
    .prepare(
      `SELECT date(o.paid_at) AS day,
        COALESCE(SUM(CASE WHEN i.format='fisico' THEN i.total END),0) AS fisico,
        COALESCE(SUM(CASE WHEN i.format='pdf' THEN i.total END),0) AS pdf
       FROM orders o JOIN order_items i ON i.order_id=o.id
       WHERE o.payment_status='pagado' AND o.paid_at >= datetime('now', ?)
       GROUP BY day ORDER BY day`,
    )
    .all(since) as { day: string; fisico: number; pdf: number }[];
  const top = d
    .prepare(
      `SELECT i.title, i.kind, SUM(i.qty) AS units, SUM(i.total) AS revenue
       FROM order_items i JOIN orders o ON o.id=i.order_id
       WHERE o.payment_status='pagado' GROUP BY i.title, i.kind ORDER BY units DESC LIMIT 8`,
    )
    .all() as { title: string; kind: string; units: number; revenue: number }[];
  const byStatus = d.prepare("SELECT status, COUNT(*) AS n FROM orders GROUP BY status").all() as { status: OrderStatus; n: number }[];
  const lowStock = d
    .prepare("SELECT id, title, stock FROM books WHERE active=1 AND has_fisico=1 AND stock <= 10 ORDER BY stock ASC LIMIT 10")
    .all() as { id: number; title: string; stock: number }[];

  // Completar los días sin ventas para que el gráfico sea continuo.
  const map = new Map(daily.map((r) => [r.day, r]));
  const series: { day: string; fisico: number; pdf: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const r = map.get(dt);
    series.push({ day: dt, fisico: Number(r?.fisico ?? 0), pdf: Number(r?.pdf ?? 0) });
  }
  return { totals, byFormat, series, top, byStatus, lowStock };
}
