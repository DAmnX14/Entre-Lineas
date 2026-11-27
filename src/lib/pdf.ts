import "server-only";
import fs from "node:fs";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, degrees, rgb, LineCapStyle, type PDFFont, type PDFImage, type PDFPage, type RGB } from "pdf-lib";
import { BRAND } from "./brand";
import { CATEGORIES } from "./content/taxonomy";
import type { BookSection } from "./content/types";
import type { Book, Personalization } from "./repo";

/**
 * Genera el PDF imprimible de un libro a partir de su estructura editorial,
 * con las tipografías y el logo de la marca, y el color de tela de cada vínculo.
 * Se usa cuando el libro no tiene un PDF de diseño subido desde el panel.
 * Tamaños: A4 (para imprimir en casa) o editorial 17 × 24 cm.
 */

const MM = 72 / 25.4;
const SIZES = { a4: [210 * MM, 297 * MM], editorial: [170 * MM, 240 * MM] } as const;
const ASSETS = path.join(process.cwd(), "assets", "pdf");

/* ------------------------------------------------------------- Colores */

function hex(h: string): RGB {
  const n = parseInt(h.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
function mix(a: RGB, b: RGB, t: number): RGB {
  return rgb(a.red + (b.red - a.red) * t, a.green + (b.green - a.green) * t, a.blue + (b.blue - a.blue) * t);
}
function luminance(c: RGB) {
  return 0.2126 * c.red + 0.7152 * c.green + 0.0722 * c.blue;
}

const INK = hex("#3a2a1f");
const SOFT = hex("#7a6656");
const LINE = hex("#d9ccb9");
const WHITE = rgb(1, 1, 1);
const PAPER = hex("#fbf7f0");

/* --------------------------------------------------------- Ornamentos */

const HEART = "M10 28 C 4 22, 0 17, 0 10 C 0 4, 5 0, 10 5 C 15 0, 20 4, 20 10 C 20 17, 16 22, 10 28 Z";

/** Rama con hojas. `flip` la espeja horizontalmente. */
function sprigPath(flip = false) {
  const X = (x: number) => (flip ? 100 - x : x);
  const leaf = (x: number, y: number, dx: number, dy: number) =>
    `M${X(x)} ${y} C ${X(x + dx * 0.2 - dy * 0.35)} ${y + dy * 0.2 + dx * 0.35}, ${X(x + dx * 0.8 - dy * 0.35)} ${y + dy * 0.8 + dx * 0.35}, ${X(x + dx)} ${y + dy} C ${X(x + dx * 0.8 + dy * 0.35)} ${y + dy * 0.8 - dx * 0.35}, ${X(x + dx * 0.2 + dy * 0.35)} ${y + dy * 0.2 - dx * 0.35}, ${X(x)} ${y} Z`;
  return [
    leaf(20, 34, -12, -14),
    leaf(34, 27, -6, -18),
    leaf(34, 27, 8, 14),
    leaf(52, 20, -2, -18),
    leaf(52, 20, 12, 12),
    leaf(70, 14, 4, -16),
    leaf(70, 14, 14, 8),
    leaf(88, 9, 12, -4),
  ].join(" ");
}
function sprigStem(flip = false) {
  const X = (x: number) => (flip ? 100 - x : x);
  return `M${X(4)} 44 C ${X(30)} 30, ${X(60)} 16, ${X(98)} 8`;
}
/** Línea con rulos, como la del logo. */
function flourishPath(w: number) {
  const m = w / 2;
  return `M0 10 C ${w * 0.12} 0, ${w * 0.25} 2, ${m - 14} 10 C ${m - 6} 15, ${m - 2} 6, ${m} 10 C ${m + 2} 14, ${m + 6} 5, ${m + 14} 10 C ${w * 0.75} 18, ${w * 0.88} 20, ${w} 10`;
}

/* --------------------------------------------------------------- Texto */

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let cur = "";
    for (const w of para.split(/\s+/).filter(Boolean)) {
      const test = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth && cur) {
        lines.push(cur);
        cur = w;
      } else cur = test;
    }
    lines.push(cur);
  }
  return lines;
}

type Fonts = { serif: PDFFont; italic: PDFFont; medium: PDFFont; hand: PDFFont; sans: PDFFont; sansBold: PDFFont };

/* ============================================================ Render */

export async function renderBookPdf(book: Book, opts: { size?: "a4" | "editorial"; personalization?: Personalization | null } = {}) {
  const [W, H] = SIZES[opts.size ?? "a4"];
  const u = W / 595; // escala relativa a A4
  const M = 62 * u; // margen
  const inner = W - 2 * M;

  const cat = CATEGORIES[book.category] ?? CATEGORIES.personales;
  const ACCENT = hex(cat.cloth);
  const COVER_INK = hex(cat.ink);
  const TINT = mix(ACCENT, WHITE, 0.86);
  const TINT_SOFT = mix(ACCENT, WHITE, 0.93);
  const pz = opts.personalization ?? null;

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(book.title);
  doc.setAuthor(BRAND.name);
  doc.setSubject(book.tagline);
  doc.setCreator(BRAND.name);
  const read = (f: string) => fs.readFileSync(path.join(ASSETS, f));
  const F: Fonts = {
    serif: await doc.embedFont(read("serif.woff"), { subset: true }),
    italic: await doc.embedFont(read("serif-italic.woff"), { subset: true }),
    medium: await doc.embedFont(read("serif-medium.woff"), { subset: true }),
    hand: await doc.embedFont(read("hand.woff"), { subset: true }),
    sans: await doc.embedFont(read("sans.woff"), { subset: true }),
    sansBold: await doc.embedFont(read("sans-semibold.woff"), { subset: true }),
  };
  const logoDark: PDFImage = await doc.embedPng(read("logo.png"));
  const logoLight: PDFImage = await doc.embedPng(read("logo-light.png"));
  const logoText: PDFImage = await doc.embedPng(read("logo-text.png"));

  /* ---- plan de páginas (para el índice con números de página) ---- */
  const chapters = book.sections.filter((s) => s.kind !== "dedication");
  const pagesFor = (s: BookSection) =>
    1 + (s.kind === "questions" ? s.prompts.length : s.kind === "photos" ? Math.ceil(s.prompts.length / 2) : s.kind === "letter" ? s.prompts.length * 2 : 1);
  const FRONT = 6; // tapa, pertenece, dedicatoria, cómo usarlo, índice, página en blanco decorada
  const chapterStart: number[] = [];
  let acc = FRONT + 1;
  for (const c of chapters) {
    chapterStart.push(acc);
    acc += pagesFor(c);
  }
  const notesPage = acc;

  let pageNo = 0;
  const newPage = () => {
    pageNo++;
    return doc.addPage([W, H]);
  };

  /* ---- primitivas ---- */
  const T = (
    p: PDFPage,
    s: string,
    x: number,
    y: number,
    o: { font?: PDFFont; size?: number; color?: RGB; align?: "left" | "center" | "right"; maxWidth?: number; lh?: number; opacity?: number } = {},
  ) => {
    const font = o.font ?? F.serif;
    const size = o.size ?? 11 * u;
    const lines = o.maxWidth ? wrap(s, font, size, o.maxWidth) : [s];
    const lh = o.lh ?? size * 1.32;
    lines.forEach((l, i) => {
      const w = font.widthOfTextAtSize(l, size);
      const dx = o.align === "center" ? -w / 2 : o.align === "right" ? -w : 0;
      p.drawText(l, { x: x + dx, y: y - i * lh, size, font, color: o.color ?? INK, opacity: o.opacity });
    });
    return y - lines.length * lh;
  };
  const heart = (p: PDFPage, cx: number, y: number, s: number, color = ACCENT, opacity = 1) =>
    p.drawSvgPath(HEART, { x: cx - 10 * s, y: y + 14 * s, scale: s, color, opacity });
  const sprig = (p: PDFPage, x: number, y: number, s: number, flip = false, color = ACCENT, opacity = 0.85) => {
    p.drawSvgPath(sprigStem(flip), { x, y: y + 44 * s, scale: s, borderColor: color, borderWidth: 1.1, borderOpacity: opacity });
    p.drawSvgPath(sprigPath(flip), { x, y: y + 44 * s, scale: s, color, opacity: opacity * 0.75 });
  };
  const flourish = (p: PDFPage, cx: number, y: number, w: number, color = ACCENT, opacity = 0.9) =>
    p.drawSvgPath(flourishPath(w), { x: cx - w / 2, y: y + 10, borderColor: color, borderWidth: 0.9, borderOpacity: opacity });
  const dotted = (p: PDFPage, x0: number, x1: number, yTop: number, yBottom: number, gap = 25 * u) => {
    for (let y = yTop; y >= yBottom; y -= gap) {
      p.drawLine({ start: { x: x0, y }, end: { x: x1, y }, thickness: 0.9, color: LINE, dashArray: [0.1, 4.2], lineCap: LineCapStyle.Round });
    }
  };
  const ruled = (p: PDFPage, x0: number, x1: number, yTop: number, yBottom: number, gap = 25 * u) => {
    for (let y = yTop; y >= yBottom; y -= gap) p.drawLine({ start: { x: x0, y }, end: { x: x1, y }, thickness: 0.5, color: LINE });
  };
  const folio = (p: PDFPage, runningHead?: string) => {
    const y = 30 * u;
    const n = String(pageNo);
    T(p, n, W / 2, y, { font: F.sans, size: 8 * u, color: SOFT, align: "center" });
    const w = F.sans.widthOfTextAtSize(n, 8 * u);
    p.drawLine({ start: { x: W / 2 - w / 2 - 22 * u, y: y + 3 * u }, end: { x: W / 2 - w / 2 - 8 * u, y: y + 3 * u }, thickness: 0.5, color: ACCENT });
    p.drawLine({ start: { x: W / 2 + w / 2 + 8 * u, y: y + 3 * u }, end: { x: W / 2 + w / 2 + 22 * u, y: y + 3 * u }, thickness: 0.5, color: ACCENT });
    if (runningHead) {
      T(p, runningHead, M, H - 34 * u, { font: F.sansBold, size: 7.5 * u, color: ACCENT });
      T(p, book.title, W - M, H - 34 * u, { font: F.italic, size: 8 * u, color: SOFT, align: "right" });
      p.drawLine({ start: { x: M, y: H - 42 * u }, end: { x: W - M, y: H - 42 * u }, thickness: 0.4, color: LINE });
    }
  };
  /** Rectángulo rotado alrededor de su centro. */
  const rotRect = (p: PDFPage, cx: number, cy: number, w: number, h: number, a: number, o: Parameters<PDFPage["drawRectangle"]>[0]) => {
    const r = (a * Math.PI) / 180;
    const x = cx + (-w / 2) * Math.cos(r) - (-h / 2) * Math.sin(r);
    const y = cy + (-w / 2) * Math.sin(r) + (-h / 2) * Math.cos(r);
    p.drawRectangle({ ...o, x, y, width: w, height: h, rotate: degrees(a) });
  };
  const rotPoint = (cx: number, cy: number, dx: number, dy: number, a: number) => {
    const r = (a * Math.PI) / 180;
    return { x: cx + dx * Math.cos(r) - dy * Math.sin(r), y: cy + dx * Math.sin(r) + dy * Math.cos(r) };
  };
  const photoCorners = (p: PDFPage, x: number, y: number, w: number, h: number, color = ACCENT) => {
    const s = 14 * u;
    const tri = (pts: [number, number][]) =>
      p.drawSvgPath(`M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]} L${pts[2][0]} ${pts[2][1]} Z`, { x: 0, y: H, color, opacity: 0.55 });
    // coordenadas SVG: y hacia abajo desde el borde superior de la página
    const Y = (yy: number) => H - yy;
    tri([[x, Y(y + h)], [x + s, Y(y + h)], [x, Y(y + h - s)]]);
    tri([[x + w, Y(y + h)], [x + w - s, Y(y + h)], [x + w, Y(y + h - s)]]);
    tri([[x, Y(y)], [x + s, Y(y)], [x, Y(y + s)]]);
    tri([[x + w, Y(y)], [x + w - s, Y(y)], [x + w, Y(y + s)]]);
  };

  /* ================================================== 1. Tapa */
  {
    const p = newPage();
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: ACCENT });
    // trama de tela
    for (let x = -H; x < W; x += 5 * u) {
      p.drawLine({ start: { x, y: 0 }, end: { x: x + H, y: H }, thickness: 0.35, color: WHITE, opacity: 0.05 });
    }
    for (let y = 0; y < H; y += 3.2 * u) p.drawLine({ start: { x: 0, y }, end: { x: W, y }, thickness: 0.3, color: rgb(0, 0, 0), opacity: 0.035 });
    // sombra del lomo
    for (let i = 0; i < 14; i++) p.drawRectangle({ x: i * 1.6 * u, y: 0, width: 1.6 * u, height: H, color: rgb(0, 0, 0), opacity: 0.16 * (1 - i / 14) });
    // marcos
    const f1 = 26 * u;
    p.drawRectangle({ x: f1, y: f1, width: W - 2 * f1, height: H - 2 * f1, borderColor: COVER_INK, borderWidth: 0.9, borderOpacity: 0.55 });
    p.drawRectangle({ x: f1 + 6 * u, y: f1 + 6 * u, width: W - 2 * f1 - 12 * u, height: H - 2 * f1 - 12 * u, borderColor: COVER_INK, borderWidth: 0.4, borderOpacity: 0.4 });
    // esquinas
    sprig(p, f1 + 10 * u, H - f1 - 60 * u, 0.9 * u, false, COVER_INK, 0.45);
    sprig(p, W - f1 - 100 * 0.9 * u - 10 * u, H - f1 - 60 * u, 0.9 * u, true, COVER_INK, 0.45);
    // título
    const titleSize = (book.title.length > 34 ? 34 : 40) * u;
    let y = H * 0.66;
    // Título en renglones parejos: se achica el ancho mientras no aumenten los renglones.
    let maxW = W - 2 * (f1 + 46 * u);
    const n0 = wrap(book.title, F.serif, titleSize, maxW).length;
    while (n0 > 1 && maxW > W * 0.3 && wrap(book.title, F.serif, titleSize, maxW - 8 * u).length === n0) maxW -= 8 * u;
    const tl = wrap(book.title, F.serif, titleSize, maxW);
    y += ((tl.length - 1) * titleSize * 1.1) / 2;
    tl.forEach((l, i) => T(p, l, W / 2, y - i * titleSize * 1.1, { size: titleSize, color: COVER_INK, align: "center" }));
    y -= tl.length * titleSize * 1.1 + 6 * u;
    flourish(p, W / 2, y, 150 * u, COVER_INK, 0.75);
    T(p, book.tagline, W / 2, y - 34 * u, { font: F.italic, size: 14 * u, color: COVER_INK, align: "center", maxWidth: W * 0.62 });
    if (pz?.recipientName) {
      T(p, `Para ${pz.recipientName}`, W / 2, H * 0.3, { font: F.hand, size: 26 * u, color: COVER_INK, align: "center" });
    }
    // logo
    const logo = luminance(COVER_INK) > 0.5 ? logoLight : logoDark;
    const lw = 150 * u;
    p.drawImage(logo, { x: W / 2 - lw / 2, y: f1 + 26 * u, width: lw, height: (lw * logo.height) / logo.width, opacity: 0.95 });
  }

  /* ================================= 2. Este libro pertenece a */
  {
    const p = newPage();
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: PAPER });
    heart(p, W / 2, H * 0.68, 0.9 * u);
    T(p, "Este libro pertenece a", W / 2, H * 0.6, { font: F.italic, size: 15 * u, color: SOFT, align: "center" });
    p.drawLine({ start: { x: W * 0.22, y: H * 0.52 }, end: { x: W * 0.78, y: H * 0.52 }, thickness: 0.7, color: ACCENT, opacity: 0.6 });
    T(p, "Lo empecé a escribir el", W * 0.25, H * 0.4, { font: F.sans, size: 9 * u, color: SOFT });
    dotted(p, W * 0.52, W * 0.78, H * 0.4, H * 0.4);
    T(p, "Lo terminé el", W * 0.25, H * 0.36, { font: F.sans, size: 9 * u, color: SOFT });
    dotted(p, W * 0.52, W * 0.78, H * 0.36, H * 0.36);
    flourish(p, W / 2, H * 0.2, 120 * u, ACCENT, 0.5);
  }

  /* ========================================== 3. Dedicatoria */
  {
    const p = newPage();
    const fx = M * 0.8;
    const fy = H * 0.16;
    const fw = W - 2 * fx;
    const fh = H * 0.68;
    p.drawRectangle({ x: fx, y: fy, width: fw, height: fh, color: TINT_SOFT, borderColor: ACCENT, borderWidth: 0.8 });
    p.drawRectangle({ x: fx + 7 * u, y: fy + 7 * u, width: fw - 14 * u, height: fh - 14 * u, borderColor: ACCENT, borderWidth: 0.35, borderOpacity: 0.6 });
    sprig(p, fx + 14 * u, fy + fh - 58 * u, 0.75 * u, false);
    sprig(p, fx + fw - 89 * u, fy + 12 * u, 0.75 * u, true);
    const ded = book.sections.find((s) => s.kind === "dedication");
    let y = fy + fh - 90 * u;
    T(p, "Este libro es para", W / 2, y, { font: F.italic, size: 15 * u, color: SOFT, align: "center" });
    y -= 46 * u;
    if (pz?.recipientName) T(p, pz.recipientName, W / 2, y, { font: F.hand, size: 40 * u, align: "center" });
    else p.drawLine({ start: { x: W * 0.28, y }, end: { x: W * 0.72, y }, thickness: 0.6, color: ACCENT });
    y -= 44 * u;
    if (pz?.dedication) {
      y = T(p, pz.dedication, W / 2, y, { font: F.hand, size: 21 * u, color: hex("#3b4a6b"), align: "center", maxWidth: fw - 110 * u, lh: 26 * u });
    } else {
      if (ded?.intro) T(p, ded.intro, W / 2, y + 6 * u, { font: F.italic, size: 10 * u, color: SOFT, align: "center", maxWidth: fw - 120 * u });
      ruled(p, fx + 50 * u, fx + fw - 50 * u, y - 26 * u, y - 170 * u, 27 * u);
      y -= 180 * u;
    }
    y = Math.min(y - 20 * u, fy + 140 * u);
    T(p, "De parte de", W / 2, y, { font: F.italic, size: 13 * u, color: SOFT, align: "center" });
    if (pz?.fromName) T(p, pz.fromName, W / 2, y - 36 * u, { font: F.hand, size: 30 * u, align: "center" });
    else p.drawLine({ start: { x: W * 0.32, y: y - 34 * u }, end: { x: W * 0.68, y: y - 34 * u }, thickness: 0.6, color: ACCENT });
    const when = [pz?.occasion, pz?.specialDate ? new Date(pz.specialDate + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }) : null]
      .filter(Boolean)
      .join(" · ");
    if (when) T(p, when, W / 2, y - 62 * u, { font: F.sans, size: 9 * u, color: SOFT, align: "center" });
    folio(p);
  }

  /* ===================================== 4. Cómo usar este libro */
  {
    const p = newPage();
    T(p, "Antes de empezar", M, H - M * 1.5, { font: F.serif, size: 30 * u });
    flourish(p, M + 70 * u, H - M * 1.5 - 30 * u, 140 * u, ACCENT, 0.7);
    const tips = [
      ["No hay respuestas correctas.", "Una línea también es una respuesta. Escribí como hablás, con tus palabras y tus muletillas."],
      ["No hace falta seguir el orden.", "Abrí el libro donde quieras. Algunas preguntas van a pedir pausa; otras, una sonrisa."],
      ["Pegá lo que quieras.", "Fotos, entradas de cine, recetas, cartas, una flor seca. El libro aguanta todo."],
      ["Anotá la fecha.", "Cada página tiene un espacio para la fecha. Dentro de unos años, eso también va a ser un recuerdo."],
      ["Cuando lo termines, compartilo.", "Este libro es para leerlo en familia. O para guardarlo hasta el momento justo."],
    ];
    let y = H - M * 1.5 - 90 * u;
    for (const [t, d] of tips) {
      heart(p, M + 8 * u, y + 2 * u, 0.5 * u);
      T(p, t, M + 28 * u, y, { font: F.medium, size: 14 * u });
      y = T(p, d, M + 28 * u, y - 20 * u, { font: F.serif, size: 11.5 * u, color: SOFT, maxWidth: inner - 40 * u, lh: 16 * u }) - 24 * u;
    }
    T(p, "«Hay historias que merecen ser contadas.»", W / 2, M * 1.3, { font: F.hand, size: 22 * u, color: ACCENT, align: "center" });
    folio(p);
  }

  /* ================================================= 5. Índice */
  {
    const p = newPage();
    T(p, "Índice", M, H - M * 1.5, { font: F.serif, size: 30 * u });
    flourish(p, M + 40 * u, H - M * 1.5 - 30 * u, 80 * u, ACCENT, 0.7);
    const rows = [{ n: "", t: "Dedicatoria", pg: 3 }, ...chapters.map((c, i) => ({ n: String(i + 1), t: c.title, pg: chapterStart[i] })), { n: "", t: "Notas y recuerdos sueltos", pg: notesPage }];
    const avail = H - M * 1.5 - 80 * u - M;
    const step = Math.min(24 * u, avail / rows.length);
    const size = Math.min(12.5 * u, step * 0.55);
    let y = H - M * 1.5 - 76 * u;
    for (const r of rows) {
      if (r.n) T(p, r.n, M + 14 * u, y, { font: F.sansBold, size: size * 0.8, color: ACCENT, align: "right" });
      T(p, r.t, M + 26 * u, y, { size });
      const tw = F.serif.widthOfTextAtSize(r.t, size);
      const pg = String(r.pg);
      const pw = F.sans.widthOfTextAtSize(pg, size * 0.85);
      p.drawLine({ start: { x: M + 32 * u + tw, y: y + 2 }, end: { x: W - M - pw - 8 * u, y: y + 2 }, thickness: 0.8, color: LINE, dashArray: [0.1, 3.5], lineCap: LineCapStyle.Round });
      T(p, pg, W - M, y, { font: F.sans, size: size * 0.85, color: SOFT, align: "right" });
      y -= step;
    }
    folio(p);
  }

  /* ======================================= 6. Página decorada */
  {
    const p = newPage();
    const cy = H * 0.55;
    p.drawImage(logoDark, { x: W / 2 - 110 * u, y: cy, width: 220 * u, height: (220 * u * logoDark.height) / logoDark.width, opacity: 0.18 });
    T(p, "Lo que vas a escribir acá no está en ningún otro libro del mundo.", W / 2, cy - 30 * u, {
      font: F.italic,
      size: 14 * u,
      color: SOFT,
      align: "center",
      maxWidth: inner * 0.75,
    });
    folio(p);
  }

  /* ===================================================== Capítulos */
  const EMPTY_INTRO: Record<string, string> = {
    questions: "Tomate tu tiempo. No hace falta responder todo hoy.",
    photos: "Fotos que cuentan lo que las palabras no alcanzan.",
    letter: "Palabras para guardar y releer.",
    tree: "Las raíces de la familia, para que nadie se olvide de dónde venimos.",
  };

  chapters.forEach((s, ci) => {
    const head = `Capítulo ${ci + 1} · ${s.title}`;

    /* ---- portadilla ---- */
    {
      const p = newPage();
      const bandH = H * 0.5;
      p.drawRectangle({ x: 0, y: H - bandH, width: W, height: bandH, color: TINT });
      const num = String(ci + 1).padStart(2, "0");
      T(p, num, W - M, H - bandH + 30 * u, { font: F.serif, size: 150 * u, color: ACCENT, align: "right", opacity: 0.22 });
      T(p, `Capítulo ${ci + 1}`, M, H - 96 * u, { font: F.sansBold, size: 9 * u, color: ACCENT });
      const ty = T(p, s.title, M, H - 140 * u, { font: F.serif, size: 34 * u, maxWidth: inner * 0.8, lh: 38 * u });
      flourish(p, M + 70 * u, ty - 12 * u, 140 * u, ACCENT, 0.8);
      sprig(p, W - M - 100 * u, H - bandH - 22 * u, 1 * u, true, ACCENT, 0.7);
      const intro = s.intro ?? EMPTY_INTRO[s.kind] ?? "";
      T(p, intro, M, H - bandH - 80 * u, { font: F.italic, size: 15 * u, color: SOFT, maxWidth: inner * 0.78, lh: 21 * u });
      if (s.kind === "questions") {
        // Adelanto de las preguntas del capítulo
        let y = H - bandH - 160 * u;
        T(p, "En este capítulo", M, y, { font: F.sansBold, size: 8 * u, color: ACCENT });
        y -= 24 * u;
        for (const q of s.prompts.slice(0, 4)) {
          heart(p, M + 4 * u, y + 3 * u, 0.32 * u, ACCENT, 0.7);
          y = T(p, q, M + 16 * u, y, { font: F.italic, size: 11.5 * u, color: INK, maxWidth: inner * 0.82, lh: 15 * u }) - 9 * u;
          if (y < M * 1.9) break;
        }
        T(p, `${s.prompts.length} preguntas para recordar`, M, M * 1.6, { font: F.sans, size: 9 * u, color: SOFT });
      }
      folio(p);
    }

    /* ---- contenido ---- */
    if (s.kind === "questions") {
      s.prompts.forEach((prompt, qi) => {
        const p = newPage();
        const top = H - 82 * u;
        heart(p, M + 6 * u, top + 4 * u, 0.42 * u);
        T(p, `${qi + 1} de ${s.prompts.length}`, M + 20 * u, top, { font: F.sans, size: 8 * u, color: SOFT });
        const qy = T(p, prompt, M, top - 34 * u, { font: F.serif, size: 19 * u, maxWidth: inner, lh: 25 * u });
        const withBox = qi % 3 === 2;
        const bottom = 70 * u;
        const boxH = 170 * u;
        const linesEnd = withBox ? bottom + boxH + 30 * u : bottom + 26 * u;
        dotted(p, M, W - M, qy - 26 * u, linesEnd);
        if (withBox) {
          const bx = M;
          const by = bottom + 10 * u;
          p.drawRectangle({ x: bx, y: by, width: inner, height: boxH, color: TINT_SOFT, borderColor: LINE, borderWidth: 0.6, borderDashArray: [3, 3] });
          photoCorners(p, bx + 10 * u, by + 10 * u, inner - 20 * u, boxH - 20 * u);
          T(p, "Una foto, un dibujo o un recuerdo pegado", W / 2, by + boxH / 2, { font: F.hand, size: 17 * u, color: SOFT, align: "center" });
        }
        T(p, "Lo escribí el ......... / ......... / ..............", W - M, 50 * u, { font: F.sans, size: 7.5 * u, color: SOFT, align: "right" });
        folio(p, head);
      });
    } else if (s.kind === "photos") {
      for (let i = 0; i < s.prompts.length; i += 2) {
        const p = newPage();
        const pair = s.prompts.slice(i, i + 2);
        pair.forEach((caption, k) => {
          const a = k === 0 ? -2.5 : 2;
          const cw = inner * 0.78;
          const ch = (H - 200 * u) / 2 - 20 * u;
          const cx = W / 2 + (k === 0 ? -14 * u : 14 * u);
          const cy = H - 84 * u - ch / 2 - k * (ch + 40 * u);
          // sombra + polaroid
          rotRect(p, cx + 3 * u, cy - 4 * u, cw, ch, a, { color: rgb(0, 0, 0), opacity: 0.07 });
          rotRect(p, cx, cy, cw, ch, a, { color: WHITE, borderColor: LINE, borderWidth: 0.6 });
          const pad = 14 * u;
          const capH = 58 * u;
          const ph = ch - pad - capH;
          const pc = rotPoint(cx, cy, 0, (capH - pad) / 2, a);
          rotRect(p, pc.x, pc.y, cw - 2 * pad, ph, a, { color: TINT_SOFT, borderColor: LINE, borderWidth: 0.4, borderDashArray: [3, 3] });
          const lbl = rotPoint(cx, cy, -F.sans.widthOfTextAtSize("Pegá tu foto aquí", 9 * u) / 2, (capH - pad) / 2, a);
          p.drawText("Pegá tu foto aquí", { x: lbl.x, y: lbl.y, size: 9 * u, font: F.sans, color: SOFT, rotate: degrees(a) });
          const cap = rotPoint(cx, cy, -cw / 2 + pad, -ch / 2 + capH * 0.48, a);
          p.drawText(caption, { x: cap.x, y: cap.y, size: 16 * u, font: F.hand, color: INK, rotate: degrees(a) });
          const sub = rotPoint(cx, cy, -cw / 2 + pad, -ch / 2 + capH * 0.18, a);
          p.drawText("¿Quién? ¿Dónde? ¿Cuándo?", { x: sub.x, y: sub.y, size: 7.5 * u, font: F.sans, color: SOFT, rotate: degrees(a) });
          // cinta
          const tp = rotPoint(cx, cy, 0, ch / 2, a);
          rotRect(p, tp.x, tp.y, 70 * u, 20 * u, a + (k === 0 ? -6 : 5), { color: ACCENT, opacity: 0.28 });
        });
        folio(p, head);
      }
    } else if (s.kind === "letter") {
      s.prompts.forEach((prompt) => {
        // página 1
        {
          const p = newPage();
          const top = H - 80 * u;
          // solapa de sobre
          const ew = 90 * u;
          p.drawSvgPath(`M0 0 L${ew / 2} ${ew * 0.32} L${ew} 0`, { x: W / 2 - ew / 2, y: top + 10 * u, borderColor: ACCENT, borderWidth: 0.9 });
          heart(p, W / 2, top - 18 * u, 0.45 * u);
          let y = T(p, prompt, W / 2, top - 52 * u, { font: F.italic, size: 15 * u, color: SOFT, align: "center", maxWidth: inner });
          y -= 26 * u;
          T(p, "Querido/a", M, y, { font: F.hand, size: 22 * u, color: ACCENT });
          p.drawLine({ start: { x: M + 80 * u, y: y - 2 }, end: { x: M + 240 * u, y: y - 2 }, thickness: 0.5, color: LINE });
          ruled(p, M, W - M, y - 34 * u, 70 * u, 27 * u);
          folio(p, head);
        }
        // página 2
        {
          const p = newPage();
          ruled(p, M, W - M, H - 84 * u, 170 * u, 27 * u);
          T(p, "Con todo mi cariño,", W - M - 170 * u, 132 * u, { font: F.hand, size: 22 * u, color: ACCENT });
          p.drawLine({ start: { x: W - M - 170 * u, y: 92 * u }, end: { x: W - M, y: 92 * u }, thickness: 0.6, color: INK, opacity: 0.6 });
          T(p, "firma y fecha", W - M - 170 * u, 80 * u, { font: F.sans, size: 7.5 * u, color: SOFT });
          sprig(p, M, 70 * u, 0.8 * u, false, ACCENT, 0.6);
          folio(p, head);
        }
      });
    } else if (s.kind === "tree") {
      const p = newPage();
      const rows = s.prompts;
      const counts = rows.map((_, i) => [4, 2, 3, 3, 4][i] ?? 3);
      const top = H - 96 * u;
      const bottom = 80 * u;
      const rowH = (top - bottom) / rows.length;
      const centers: { x: number; y: number; w: number }[][] = [];
      rows.forEach((label, r) => {
        const n = counts[r];
        const gap = 10 * u;
        const bw = Math.min((inner - gap * (n - 1)) / n, 118 * u);
        const bh = rowH - 34 * u;
        const total = n * bw + (n - 1) * gap;
        const y = top - r * rowH - bh;
        T(p, label, W / 2, top - r * rowH + 6 * u, { font: F.sansBold, size: 8 * u, color: ACCENT, align: "center" });
        const row: { x: number; y: number; w: number }[] = [];
        for (let i = 0; i < n; i++) {
          const x = (W - total) / 2 + i * (bw + gap);
          p.drawRectangle({ x, y, width: bw, height: bh, color: TINT_SOFT, borderColor: ACCENT, borderWidth: 0.6, borderOpacity: 0.7 });
          const fields = ["nombre", "nació", "lugar"];
          fields.forEach((f, k) => {
            const ly = y + bh - 20 * u - k * ((bh - 24 * u) / 3);
            p.drawLine({ start: { x: x + 8 * u, y: ly }, end: { x: x + bw - 8 * u, y: ly }, thickness: 0.7, color: LINE, dashArray: [0.1, 3.2], lineCap: LineCapStyle.Round });
            T(p, f, x + 8 * u, ly - 8 * u, { font: F.sans, size: 6 * u, color: SOFT });
          });
          row.push({ x: x + bw / 2, y, w: bw });
        }
        centers.push(row);
      });
      // ramas entre generaciones
      for (let r = 0; r < centers.length - 1; r++) {
        const a = centers[r];
        const b = centers[r + 1];
        const midY = (a[0].y + (b[0].y + rowH - 34 * u)) / 2 + 4 * u;
        const ax = a.reduce((s, c) => s + c.x, 0) / a.length;
        p.drawLine({ start: { x: a[0].x, y: midY }, end: { x: a[a.length - 1].x, y: midY }, thickness: 0.7, color: ACCENT, opacity: 0.6 });
        for (const c of a) p.drawLine({ start: { x: c.x, y: c.y }, end: { x: c.x, y: midY }, thickness: 0.7, color: ACCENT, opacity: 0.6 });
        const by = b[0].y + rowH - 34 * u;
        p.drawLine({ start: { x: ax, y: midY }, end: { x: ax, y: by + 12 * u }, thickness: 0.7, color: ACCENT, opacity: 0.6 });
      }
      sprig(p, M - 20 * u, bottom - 50 * u, 0.8 * u, false, ACCENT, 0.5);
      sprig(p, W - M - 60 * u, bottom - 50 * u, 0.8 * u, true, ACCENT, 0.5);
      folio(p, head);
    }
  });

  /* ======================================== Notas y recuerdos sueltos */
  {
    const p = newPage();
    T(p, "Notas y recuerdos sueltos", M, H - M * 1.5, { font: F.serif, size: 26 * u });
    T(p, "Lo que no entró en ninguna pregunta, también vale.", M, H - M * 1.5 - 26 * u, { font: F.italic, size: 12 * u, color: SOFT });
    dotted(p, M, W - M, H - M * 1.5 - 70 * u, 80 * u);
    folio(p);
  }

  /* ==================================================== Cierre */
  {
    const p = newPage();
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: PAPER });
    const lw = 230 * u;
    p.drawImage(logoDark, { x: W / 2 - lw / 2, y: H * 0.5, width: lw, height: (lw * logoDark.height) / logoDark.width });
    T(p, "Fin de esta historia.", W / 2, H * 0.42, { font: F.italic, size: 17 * u, color: SOFT, align: "center" });
    T(p, "Y principio de todas las que vendrán.", W / 2, H * 0.42 - 24 * u, { font: F.italic, size: 17 * u, color: SOFT, align: "center" });
    heart(p, W / 2, H * 0.32, 0.6 * u);
    T(p, "Para uso personal y familiar.", W / 2, 46 * u, { font: F.sans, size: 7.5 * u, color: SOFT, align: "center" });
  }

  return doc.save();
}
