import { BRAND } from "@/lib/brand";
import { IconWhatsApp } from "./Icons";

export function waLink(text: string) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function WhatsAppButton() {
  return (
    <a
      href={waLink("Hola, quiero hacer una consulta sobre los libros.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#3f6b4f] text-white shadow-lg hover:bg-[#335a41] sm:right-6 sm:bottom-6"
      aria-label="Escribinos por WhatsApp"
    >
      <IconWhatsApp className="h-7 w-7" />
    </a>
  );
}
