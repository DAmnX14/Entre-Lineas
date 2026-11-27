import type { BookSection, SectionKind } from "./content/types";

/**
 * Formato de texto para editar la estructura de un libro desde el panel:
 *
 * ## Tu infancia [preguntas]
 * > Texto de introducción opcional
 * - ¿Cuál es tu primer recuerdo?
 * - ¿Cómo era tu casa?
 */
const TAGS: Record<SectionKind, string> = {
  questions: "preguntas",
  photos: "fotos",
  letter: "carta",
  dedication: "dedicatoria",
  tree: "arbol",
};
const FROM_TAG = Object.fromEntries(Object.entries(TAGS).map(([k, v]) => [v, k])) as Record<string, SectionKind>;

export function sectionsToText(sections: BookSection[]) {
  return sections
    .map((s) =>
      [`## ${s.title} [${TAGS[s.kind]}]`, s.intro ? `> ${s.intro}` : null, ...s.prompts.map((p) => `- ${p}`)].filter(Boolean).join("\n"),
    )
    .join("\n\n");
}

export function textToSections(text: string): { sections: BookSection[]; error?: string } {
  const sections: BookSection[] = [];
  let cur: BookSection | null = null;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      const m = line.slice(3).match(/^(.*?)\s*(?:\[(\w+)\])?$/);
      const kind = FROM_TAG[(m?.[2] ?? "preguntas").toLowerCase()];
      if (!kind) return { sections, error: `Línea ${i + 1}: el tipo «${m?.[2]}» no existe. Usá preguntas, fotos, carta, dedicatoria o arbol.` };
      cur = { title: (m?.[1] ?? "").trim(), kind, prompts: [] };
      sections.push(cur);
    } else if (!cur) {
      return { sections, error: `Línea ${i + 1}: empezá cada capítulo con «## Título».` };
    } else if (line.startsWith(">")) {
      cur.intro = line.slice(1).trim();
    } else {
      cur.prompts.push(line.replace(/^[-*]\s*/, ""));
    }
  }
  if (!sections.length) return { sections, error: "El libro necesita al menos un capítulo." };
  return { sections };
}
