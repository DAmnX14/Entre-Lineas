import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { BRAND } from "./brand";
import type { Book, Personalization } from "./repo";

/**
 * Genera el PDF imprimible de un libro a partir de su estructura editorial.
 * Se usa cuando el libro no tiene un PDF de diseño subido desde el panel.
 * Tamaños: A4 (para imprimir en casa) o editorial 17 × 24 cm.
 */

const MM = 72 / 25.4;
const SIZES = { a4: [210 * MM, 297 * MM], editorial: [170 * MM, 240 * MM] } as const;

const INK = rgb(0.23, 0.165, 0.12);
const SOFT = rgb(0.43, 0.35, 0.29);
const LINE = rgb(0.84, 0.79, 0.72);
const CLAY = rgb(0.66, 0.34, 0.24);

// Las fuentes estándar usan WinAnsi: se reemplazan los caracteres que no admite.
function safe(t: string) {
  return t.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/×/g, "x").replace(/[^\x00-\xFF€…–—•«»¿¡]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = safe(text).split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

export async function renderBookPdf(book: Book, opts: { size?: "a4" | "editorial"; personalization?: Personalization | null } = {}) {
  const [W, H] = SIZES[opts.size ?? "a4"];
  const doc = await PDFDocument.create();
  doc.setTitle(book.title);
  doc.setAuthor(BRAND.name);
  doc.setSubject(book.tagline);
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifIt = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const M = W * 0.12;
  const inner = W - 2 * M;
  let pageNo = 0;

  const newPage = () => {
    const p = doc.addPage([W, H]);
    pageNo++;
    return p;
  };
  const folio = (p: PDFPage) => {
    const t = String(pageNo);
    p.drawText(t, { x: W / 2 - sans.widthOfTextAtSize(t, 8) / 2, y: M * 0.45, size: 8, font: sans, color: SOFT });
  };
  const centered = (p: PDFPage, text: string, y: number, font: PDFFont, size: number, color = INK) => {
    for (const [i, l] of wrap(text, font, size, inner).entries()) {
      p.drawText(l, { x: W / 2 - font.widthOfTextAtSize(l, size) / 2, y: y - i * size * 1.3, size, font, color });
    }
  };
  const ruled = (p: PDFPage, fromY: number, toY: number, gap = 22) => {
    for (let y = fromY; y > toY; y -= gap) {
      p.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: LINE });
    }
  };

  // Portada
  {
    const p = newPage();
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.95, 0.92, 0.87) });
    p.drawRectangle({ x: M * 0.6, y: M * 0.6, width: W - M * 1.2, height: H - M * 1.2, borderColor: CLAY, borderWidth: 0.8 });
    centered(p, book.title, H * 0.62, serif, Math.min(34, W / 16), INK);
    centered(p, book.tagline, H * 0.45, serifIt, 13, SOFT);
    centered(p, BRAND.name, M * 1.1, sans, 9, SOFT);
  }

  // Dedicatoria (la del comprador, si la escribió)
  {
    const p = newPage();
    const pz = opts.personalization;
    centered(p, "Este libro es para", H * 0.72, serifIt, 14, SOFT);
    if (pz?.recipientName) centered(p, pz.recipientName, H * 0.72 - 34, serif, 26);
    else p.drawLine({ start: { x: M * 2, y: H * 0.72 - 34 }, end: { x: W - M * 2, y: H * 0.72 - 34 }, thickness: 0.6, color: LINE });
    if (pz?.dedication) centered(p, `«${pz.dedication}»`, H * 0.52, serifIt, 13, INK);
    else ruled(p, H * 0.55, H * 0.3, 24);
    centered(p, "De parte de", H * 0.24, serifIt, 12, SOFT);
    if (pz?.fromName) centered(p, pz.fromName, H * 0.24 - 26, serif, 18);
    if (pz?.specialDate) centered(p, pz.specialDate, H * 0.24 - 52, sans, 9, SOFT);
    folio(p);
  }

  // Índice
  {
    const p = newPage();
    p.drawText("Índice", { x: M, y: H - M * 1.3, size: 22, font: serif, color: INK });
    let y = H - M * 1.3 - 40;
    book.sections.forEach((s, i) => {
      if (y < M) return;
      p.drawText(safe(`${i + 1}.  ${s.title}`), { x: M, y, size: 11, font: serif, color: INK });
      y -= 19;
    });
    folio(p);
  }

  // Secciones
  for (const s of book.sections) {
    if (s.kind === "dedication") continue;
    // Portadilla de sección
    const op = newPage();
    centered(op, s.title, H * 0.58, serif, 28);
    if (s.intro) centered(op, s.intro, H * 0.58 - 48, serifIt, 12, SOFT);
    op.drawLine({ start: { x: W / 2 - 20, y: H * 0.58 + 40 }, end: { x: W / 2 + 20, y: H * 0.58 + 40 }, thickness: 0.8, color: CLAY });
    folio(op);

    if (s.kind === "questions") {
      for (const prompt of s.prompts) {
        const p = newPage();
        let y = H - M * 1.2;
        for (const l of wrap(prompt, serif, 15, inner)) {
          p.drawText(l, { x: M, y, size: 15, font: serif, color: INK });
          y -= 20;
        }
        ruled(p, y - 18, M * 0.9);
        folio(p);
      }
    } else if (s.kind === "photos") {
      for (const caption of s.prompts) {
        const p = newPage();
        const fw = inner * 0.86;
        const fh = fw * 0.75;
        const fx = (W - fw) / 2;
        const fy = H - M * 1.1 - fh;
        p.drawRectangle({ x: fx, y: fy, width: fw, height: fh, borderColor: LINE, borderWidth: 1, borderDashArray: [4, 4] });
        centered(p, "Pegá tu foto aquí", fy + fh / 2, sans, 9, SOFT);
        p.drawText(safe(caption), { x: M, y: fy - 30, size: 13, font: serifIt, color: INK });
        ruled(p, fy - 58, M * 0.9);
        folio(p);
      }
    } else if (s.kind === "letter") {
      for (const prompt of s.prompts) {
        for (let k = 0; k < 2; k++) {
          const p = newPage();
          let y = H - M * 1.2;
          if (k === 0) {
            for (const l of wrap(prompt, serifIt, 14, inner)) {
              p.drawText(l, { x: M, y, size: 14, font: serifIt, color: INK });
              y -= 19;
            }
          }
          ruled(p, y - 14, M * 0.9, 24);
          folio(p);
        }
      }
    } else if (s.kind === "tree") {
      const p = newPage();
      const rows = s.prompts.length;
      const rowH = (H - M * 2.4) / rows;
      s.prompts.forEach((label, r) => {
        const y = H - M * 1.2 - r * rowH;
        p.drawText(safe(label), { x: M, y: y - 12, size: 10, font: sans, color: SOFT });
        const boxes = Math.min(2 ** (rows - r - 1), 8);
        const bw = Math.min(inner / boxes - 6, 120);
        const total = boxes * (bw + 6) - 6;
        for (let i = 0; i < boxes; i++) {
          p.drawRectangle({ x: (W - total) / 2 + i * (bw + 6), y: y - rowH + 18, width: bw, height: rowH - 40, borderColor: LINE, borderWidth: 0.8 });
        }
      });
      folio(p);
    }
  }

  // Cierre
  {
    const p = newPage();
    centered(p, "Fin de esta historia.", H * 0.55, serifIt, 16, SOFT);
    centered(p, "Y principio de todas las que vendrán.", H * 0.55 - 24, serifIt, 16, SOFT);
    centered(p, `${BRAND.name} · ${BRAND.tagline}`, M, sans, 8, SOFT);
  }

  return doc.save();
}
