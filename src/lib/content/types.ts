export type SectionKind = "dedication" | "questions" | "photos" | "letter" | "tree";

export type BookSection = {
  title: string;
  intro?: string;
  kind: SectionKind;
  prompts: string[];
};

export type CategoryKey =
  | "madres"
  | "padres"
  | "abuelos"
  | "hermanos"
  | "parejas"
  | "hijos"
  | "amigos"
  | "personales";

/** Destinatarios que se muestran en "¿Para quién es este regalo?" */
export type RecipientKey =
  | "mama"
  | "papa"
  | "abuela"
  | "abuelo"
  | "hermano"
  | "hermana"
  | "pareja"
  | "hijos"
  | "amigos"
  | "para-mi";

export type OccasionKey =
  | "cumpleanos"
  | "dia-de-la-madre"
  | "dia-del-padre"
  | "navidad"
  | "aniversario"
  | "porque-si";

export type SeedBook = {
  slug: string;
  title: string;
  category: CategoryKey;
  recipients: RecipientKey[];
  occasions: OccasionKey[];
  tagline: string;
  description: string;
  whoFor: string;
  badge?: "bestseller" | "nuevo" | "regalo-especial";
  featured?: boolean;
  sections: BookSection[];
  priceFisico: number;
  pricePdf: number;
  stock: number;
};
