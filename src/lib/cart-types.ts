import type { Personalization } from "./personalization";

export type Format = "fisico" | "pdf";

export type CartLine =
  | {
      id: string;
      kind: "book";
      slug: string;
      format: Format;
      qty: number;
      personalization?: Personalization;
    }
  | {
      id: string;
      kind: "pack";
      slug: string;
      format: Format;
      qty: number;
      /** Libros elegidos en packs de tipo "elegí N". */
      books?: string[];
      personalization?: Personalization;
    };

export type ShippingMethod = "domicilio" | "sucursal" | "retiro";

export type QuotedLine = {
  id: string;
  kind: "book" | "pack";
  slug: string;
  title: string;
  subtitle: string;
  format: Format;
  qty: number;
  unitPrice: number;
  listUnitPrice: number;
  extras: number;
  total: number;
  category: string;
  books: string[];
  covers: { title: string; category: string; image: string | null }[];
  personalization?: Personalization;
  error?: string;
};

export type Quote = {
  lines: QuotedLine[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  couponMessage: string | null;
  couponValid: boolean;
  hasPhysical: boolean;
  shippingMethod: ShippingMethod | null;
  shippingCost: number;
  shippingOptions: { method: ShippingMethod; label: string; detail: string; cost: number }[];
  freeShippingFrom: number;
  total: number;
  errors: string[];
};
