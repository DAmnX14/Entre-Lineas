import type { CategoryKey, OccasionKey, RecipientKey } from "./types";

export const CATEGORIES: Record<CategoryKey, { label: string; plural: string; cloth: string; ink: string }> = {
  madres: { label: "Para mamá", plural: "Libros para madres", cloth: "#B77A62", ink: "#F7E9DC" },
  padres: { label: "Para papá", plural: "Libros para padres", cloth: "#56624F", ink: "#EEF0E2" },
  abuelos: { label: "Para los abuelos", plural: "Libros para abuelos", cloth: "#8B6B50", ink: "#F5E8D6" },
  hermanos: { label: "Para hermanos", plural: "Libros para hermanos", cloth: "#6F8087", ink: "#EAF0EF" },
  parejas: { label: "Para la pareja", plural: "Libros para parejas", cloth: "#94585A", ink: "#F7E6E2" },
  hijos: { label: "Para hijos", plural: "Libros para hijos", cloth: "#C3A26A", ink: "#3A2A1F" },
  amigos: { label: "Para amigos", plural: "Libros para amigos", cloth: "#7E8D6C", ink: "#F1F2E6" },
  personales: { label: "Para mí", plural: "Libros personales", cloth: "#46505E", ink: "#EDE7DC" },
};

export const RECIPIENTS: {
  key: RecipientKey;
  label: string;
  question: string;
  tint: string;
}[] = [
  { key: "mama", label: "Mamá", question: "¿Cómo elegiste mi nombre?", tint: "#EBD6CB" },
  { key: "papa", label: "Papá", question: "¿Qué hiciste con tu primer sueldo?", tint: "#DCDDC8" },
  { key: "abuela", label: "Abuela", question: "¿Qué se bailaba en tus tiempos?", tint: "#E9DCC8" },
  { key: "abuelo", label: "Abuelo", question: "¿Cómo era el barrio cuando eras chico?", tint: "#E2D5C3" },
  { key: "hermano", label: "Hermano", question: "¿Qué travesura nunca descubrieron?", tint: "#D9E0DD" },
  { key: "hermana", label: "Hermana", question: "¿Qué secreto me guardaste?", tint: "#E6D9D3" },
  { key: "pareja", label: "Pareja", question: "¿Qué pensaste la primera vez que me viste?", tint: "#ECD3CF" },
  { key: "hijos", label: "Hijo o hija", question: "¿Cuál fue tu primera palabra?", tint: "#EFE1C4" },
  { key: "amigos", label: "Amigo o amiga", question: "¿Cuándo pasamos de conocidos a amigos?", tint: "#DFE2CF" },
  { key: "para-mi", label: "Para mí", question: "¿Qué me hubiera gustado saber antes?", tint: "#DADDE1" },
];

export const RECIPIENT_LABEL: Record<RecipientKey, string> = Object.fromEntries(
  RECIPIENTS.map((r) => [r.key, r.label]),
) as Record<RecipientKey, string>;

export const OCCASIONS: Record<OccasionKey, string> = {
  cumpleanos: "Cumpleaños",
  "dia-de-la-madre": "Día de la Madre",
  "dia-del-padre": "Día del Padre",
  navidad: "Navidad",
  aniversario: "Aniversario",
  "porque-si": "Porque sí",
};

export const BADGES: Record<string, string> = {
  bestseller: "Más elegido",
  nuevo: "Nuevo",
  "regalo-especial": "Regalo especial",
};
