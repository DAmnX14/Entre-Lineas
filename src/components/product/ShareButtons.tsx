"use client";

import { useState } from "react";
import { IconShare } from "../Icons";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const text = `${title} — un libro para regalar historias`;
  const enc = encodeURIComponent;
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "Pinterest", href: `https://www.pinterest.com/pin/create/button/?url=${enc(url)}&description=${enc(text)}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="mr-1 text-ink-soft">Compartir:</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-3 py-1.5 hover:border-ink">
          {l.label}
        </a>
      ))}
      <button
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 hover:border-ink"
        onClick={async () => {
          if (navigator.share) {
            await navigator.share({ title, text, url }).catch(() => {});
            return;
          }
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        <IconShare /> {copied ? "Enlace copiado" : "Copiar enlace"}
      </button>
    </div>
  );
}
