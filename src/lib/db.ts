import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { SEED_BOOKS, SEED_PACKS } from "./content/catalog";
import { DATA_DIR } from "./paths";

/**
 * Capa de datos sobre SQLite (node:sqlite).
 * Todo el SQL vive en src/lib/db.ts y src/lib/repo.ts para que migrar a
 * PostgreSQL (Neon, Supabase) solo requiera reemplazar estos dos archivos.
 */

const DB_FILE = path.join(DATA_DIR, "tienda.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  recipients TEXT NOT NULL DEFAULT '[]',
  occasions TEXT NOT NULL DEFAULT '[]',
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  who_for TEXT NOT NULL DEFAULT '',
  badge TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  sections TEXT NOT NULL DEFAULT '[]',
  price_fisico INTEGER NOT NULL,
  price_pdf INTEGER NOT NULL,
  compare_fisico INTEGER,
  compare_pdf INTEGER,
  has_fisico INTEGER NOT NULL DEFAULT 1,
  has_pdf INTEGER NOT NULL DEFAULT 1,
  stock INTEGER NOT NULL DEFAULT 0,
  pdf_file TEXT,
  cover_image TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS packs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  discount_percent INTEGER NOT NULL DEFAULT 0,
  book_slugs TEXT NOT NULL DEFAULT '[]',
  choose_count INTEGER NOT NULL DEFAULT 0,
  allowed_categories TEXT NOT NULL DEFAULT '[]',
  occasion TEXT,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  min_total INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, book_id)
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL UNIQUE,
  public_token TEXT NOT NULL,
  user_id INTEGER,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  dni TEXT,
  shipping TEXT,
  billing TEXT,
  shipping_method TEXT NOT NULL DEFAULT 'ninguno',
  shipping_cost INTEGER NOT NULL DEFAULT 0,
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  coupon_code TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pendiente',
  status TEXT NOT NULL DEFAULT 'pendiente',
  tracking_code TEXT,
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  book_id INTEGER,
  pack_id INTEGER,
  title TEXT NOT NULL,
  format TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  total INTEGER NOT NULL,
  personalization TEXT,
  pack_books TEXT
);
CREATE TABLE IF NOT EXISTS downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  order_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  max_downloads INTEGER NOT NULL DEFAULT 10,
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS newsletter (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  book_title TEXT,
  approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_order ON downloads(order_id);
`;

function seed(db: DatabaseSync) {
  const count = db.prepare("SELECT COUNT(*) AS n FROM books").get() as { n: number };
  if (count.n > 0) return;

  const insertBook = db.prepare(`INSERT INTO books
    (slug,title,category,recipients,occasions,tagline,description,who_for,badge,featured,sections,price_fisico,price_pdf,stock)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  db.exec("BEGIN");
  for (const b of SEED_BOOKS) {
    insertBook.run(
      b.slug,
      b.title,
      b.category,
      JSON.stringify(b.recipients),
      JSON.stringify(b.occasions),
      b.tagline,
      b.description,
      b.whoFor,
      b.badge ?? null,
      b.featured ? 1 : 0,
      JSON.stringify(b.sections),
      b.priceFisico,
      b.pricePdf,
      b.stock,
    );
  }
  const insertPack = db.prepare(`INSERT INTO packs
    (slug,title,description,discount_percent,book_slugs,choose_count,allowed_categories,occasion)
    VALUES (?,?,?,?,?,?,?,?)`);
  for (const p of SEED_PACKS) {
    insertPack.run(
      p.slug,
      p.title,
      p.description,
      p.discountPercent,
      JSON.stringify(p.bookSlugs),
      p.chooseCount,
      JSON.stringify(p.allowedCategories),
      p.occasion ?? null,
    );
  }
  db.prepare("INSERT INTO coupons (code,type,value,min_total) VALUES (?,?,?,?)").run("BIENVENIDA10", "percent", 10, 0);
  db.prepare("INSERT INTO coupons (code,type,value,min_total) VALUES (?,?,?,?)").run("ENVIOGRATIS", "free_shipping", 0, 50000);
  db.exec("COMMIT");
}

function ensureAdmin(db: DatabaseSync) {
  const email = (process.env.ADMIN_EMAIL ?? "admin@entrelineas.local").toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return;
  const password = process.env.ADMIN_PASSWORD ?? "cambiar-esta-clave";
  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      `[tienda] Se creó el usuario administrador ${email} con la clave por defecto. Definí ADMIN_EMAIL y ADMIN_PASSWORD antes de publicar.`,
    );
  }
  db.prepare("INSERT INTO users (email,name,password_hash,role) VALUES (?,?,?,?)").run(
    email,
    "Administración",
    bcrypt.hashSync(password, 10),
    "admin",
  );
}

/** Cambios de esquema sobre bases ya creadas. */
function migrate(db: DatabaseSync) {
  const cols = (db.prepare("PRAGMA table_info(outbox)").all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes("status")) db.exec("ALTER TABLE outbox ADD COLUMN status TEXT NOT NULL DEFAULT 'pendiente'");
  if (!cols.includes("error")) db.exec("ALTER TABLE outbox ADD COLUMN error TEXT");
  if (!cols.includes("sent_at")) db.exec("ALTER TABLE outbox ADD COLUMN sent_at TEXT");
}

function open(): DatabaseSync {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_FILE);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA);
  migrate(db);
  seed(db);
  ensureAdmin(db);
  return db;
}

const globalForDb = globalThis as unknown as { __tiendaDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (!globalForDb.__tiendaDb) globalForDb.__tiendaDb = open();
  return globalForDb.__tiendaDb;
}

export function tx<T>(fn: () => T): T {
  const d = db();
  d.exec("BEGIN IMMEDIATE");
  try {
    const r = fn();
    d.exec("COMMIT");
    return r;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}
