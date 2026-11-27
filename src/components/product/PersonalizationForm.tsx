"use client";

import type { Personalization } from "@/lib/personalization";
import { COMMERCE } from "@/lib/brand";
import { OCCASIONS } from "@/lib/content/taxonomy";
import { money } from "@/lib/format";

const SAMPLE =
  "Quiero conocer todas esas historias que todavía no me contaste. Quiero guardar tu voz, tus recuerdos y todo lo que te hace ser vos.";

export function PersonalizationForm({
  value,
  onChange,
  format,
  idPrefix = "pz",
}: {
  value: Personalization;
  onChange: (p: Personalization) => void;
  format: "fisico" | "pdf";
  idPrefix?: string;
}) {
  const set = (patch: Partial<Personalization>) => onChange({ ...value, ...patch });
  const id = (k: string) => `${idPrefix}-${k}`;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={id("to")}>
            Este libro es para
          </label>
          <input id={id("to")} className="field" placeholder="Mamá" maxLength={60} value={value.recipientName ?? ""} onChange={(e) => set({ recipientName: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor={id("from")}>
            De parte de
          </label>
          <input id={id("from")} className="field" placeholder="Antonio" maxLength={60} value={value.fromName ?? ""} onChange={(e) => set({ fromName: e.target.value })} />
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label className="label" htmlFor={id("ded")}>
            Dedicatoria
          </label>
          <button type="button" className="text-xs text-clay-deep underline underline-offset-2" onClick={() => set({ dedication: SAMPLE })}>
            Usar un ejemplo
          </button>
        </div>
        <textarea
          id={id("ded")}
          className="field min-h-28"
          maxLength={600}
          placeholder="Escribí unas palabras. Van impresas en la primera página."
          value={value.dedication ?? ""}
          onChange={(e) => set({ dedication: e.target.value })}
        />
        <p className="mt-1 text-xs text-ink-soft">{(value.dedication ?? "").length}/600 · {format === "pdf" ? "En el PDF aparece en la página de dedicatoria." : "Se imprime en la página de dedicatoria del libro."}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={id("occ")}>
            Ocasión
          </label>
          <select id={id("occ")} className="field" value={value.occasion ?? ""} onChange={(e) => set({ occasion: e.target.value || undefined })}>
            <option value="">Sin ocasión</option>
            {Object.values(OCCASIONS).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor={id("date")}>
            Fecha especial
          </label>
          <input id={id("date")} type="date" className="field" value={value.specialDate ?? ""} onChange={(e) => set({ specialDate: e.target.value })} />
        </div>
      </div>
      {format === "fisico" ? (
        <fieldset className="space-y-2">
          <legend className="label">Para regalar</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-cream p-3">
            <input type="checkbox" className="mt-1 accent-clay" checked={!!value.giftWrap} onChange={(e) => set({ giftWrap: e.target.checked })} />
            <span>
              <span className="font-semibold">Packaging de regalo</span> <span className="text-ink-soft">+{money(COMMERCE.giftWrapPrice)}</span>
              <span className="block text-sm text-ink-soft">Caja de cartón kraft, papel de seda y cinta de algodón.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-cream p-3">
            <input type="checkbox" className="mt-1 accent-clay" checked={!!value.giftCard} onChange={(e) => set({ giftCard: e.target.checked })} />
            <span>
              <span className="font-semibold">Tarjeta personalizada</span> <span className="text-ink-soft">+{money(COMMERCE.giftCardPrice)}</span>
              <span className="block text-sm text-ink-soft">Una tarjeta escrita a mano con tu mensaje.</span>
            </span>
          </label>
          {value.giftCard && (
            <textarea
              aria-label="Texto de la tarjeta"
              className="field min-h-20"
              maxLength={300}
              placeholder="¡Feliz cumpleaños, ma! Te quiero."
              value={value.giftCardText ?? ""}
              onChange={(e) => set({ giftCardText: e.target.value })}
            />
          )}
        </fieldset>
      ) : (
        <p className="rounded-lg bg-linen/70 p-3 text-sm text-ink-soft">
          En el formato PDF, la dedicatoria se incluye en el archivo. El packaging y la tarjeta están disponibles para el libro físico.
        </p>
      )}
    </div>
  );
}

export function DedicationPreview({ value }: { value: Personalization }) {
  if (!value.recipientName && !value.dedication && !value.fromName) return null;
  return (
    <div className="ruled rounded-md bg-cream px-6 pt-5 pb-6 [background-size:100%_2rem]" aria-label="Vista previa de la dedicatoria">
      <p className="serif text-sm text-ink-soft italic">Este libro es para</p>
      <p className="font-hand text-3xl leading-[2rem]">{value.recipientName || "…"}</p>
      {value.dedication && <p className="font-hand mt-2 text-2xl leading-[2rem] text-[#3b4a6b]">{value.dedication}</p>}
      {value.fromName && <p className="font-hand mt-2 text-right text-2xl leading-[2rem]">{value.fromName}</p>}
    </div>
  );
}
