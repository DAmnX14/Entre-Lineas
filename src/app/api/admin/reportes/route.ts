import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const QUERIES: Record<string, string> = {
  ventas: `SELECT i.title AS producto, i.kind AS tipo, i.format AS formato, SUM(i.qty) AS unidades, SUM(i.total) AS ingresos
           FROM order_items i JOIN orders o ON o.id=i.order_id WHERE o.payment_status='pagado'
           GROUP BY i.title, i.kind, i.format ORDER BY unidades DESC`,
  pedidos: `SELECT number AS pedido, created_at AS fecha, paid_at AS pagado_el, name AS cliente, email, phone AS telefono, status AS estado,
           payment_method AS medio_pago, payment_status AS pago, shipping_method AS envio, subtotal, discount AS descuento, shipping_cost AS costo_envio, total, coupon_code AS cupon, tracking_code AS seguimiento
           FROM orders ORDER BY id DESC`,
  clientes: `SELECT email, MAX(name) AS nombre, COUNT(*) AS pedidos, SUM(payment_status='pagado') AS pagados,
           SUM(CASE WHEN payment_status='pagado' THEN total ELSE 0 END) AS total_gastado, MIN(created_at) AS primer_pedido
           FROM orders GROUP BY email ORDER BY total_gastado DESC`,
  stock: `SELECT title AS libro, category AS categoria, stock, price_fisico AS precio_fisico, price_pdf AS precio_pdf, active AS publicado FROM books ORDER BY stock ASC`,
  newsletter: `SELECT email, created_at AS fecha FROM newsletter ORDER BY created_at DESC`,
};

function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "sin datos\n";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s; // evita fórmulas en planillas
    return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export async function GET(req: Request) {
  const user = await currentUser();
  if (user?.role !== "admin") return new Response("No autorizado", { status: 403 });
  const tipo = new URL(req.url).searchParams.get("tipo") ?? "";
  const sql = QUERIES[tipo];
  if (!sql) return new Response("Reporte inexistente", { status: 404 });
  const rows = db().prepare(sql).all() as Record<string, unknown>[];
  return new Response("﻿" + csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${tipo}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
