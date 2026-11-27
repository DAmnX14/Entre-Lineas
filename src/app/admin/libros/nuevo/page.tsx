import Link from "next/link";
import { BookForm } from "../BookForm";

const TEMPLATE = `## Dedicatoria [dedicatoria]
> Escribí aquí por qué regalás este libro.
- Para:
- De parte de:

## Tu infancia [preguntas]
- ¿Cuál es tu primer recuerdo?
- ¿Cómo era la casa donde creciste?

## Fotografías [fotos]
- Una foto de cuando eras chico o chica

## Una carta para vos [carta]
- Lo que quiero decirte:`;

export default function NewBook() {
  return (
    <div>
      <Link href="/admin/libros" className="text-sm text-ink-soft hover:text-ink">← Libros</Link>
      <h1 className="mt-2 mb-8 text-4xl">Crear libro</h1>
      <BookForm
        v={{ slug: "", title: "", category: "personales", recipients: [], occasions: [], tagline: "", description: "", whoFor: "", badge: "nuevo", featured: false, sectionsText: TEMPLATE, priceFisico: 38900, pricePdf: 12900, compareFisico: null, comparePdf: null, hasFisico: true, hasPdf: true, stock: 0, active: false, coverImage: null, pdfFile: null }}
      />
    </div>
  );
}
