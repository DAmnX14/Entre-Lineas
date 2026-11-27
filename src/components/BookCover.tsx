import { CATEGORIES } from "@/lib/content/taxonomy";
import type { CategoryKey } from "@/lib/content/types";
import { BRAND } from "@/lib/brand";

type Props = {
  title: string;
  category: CategoryKey | string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** Tapa entelada generada: cada vínculo tiene su color de tela. */
export function BookCover({ title, category, image, size = "md", className = "" }: Props) {
  const c = CATEGORIES[category as CategoryKey] ?? CATEGORIES.personales;
  const t = { sm: "text-[0.95rem]", md: "text-[1.25rem] sm:text-[1.4rem]", lg: "text-[1.7rem] sm:text-[2.2rem]" }[size];
  return (
    <div
      className={`relative aspect-[17/24] w-full overflow-hidden rounded-[3px_6px_6px_3px] shadow-[0_1px_0_rgba(0,0,0,.08),0_18px_30px_-18px_rgba(58,42,31,.55)] ${className}`}
      style={{ backgroundColor: c.cloth, color: c.ink }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="cloth absolute inset-0 flex flex-col items-center px-[11%] pt-[22%] pb-[9%] text-center">
          <div className="absolute inset-[6%] rounded-[2px] border opacity-40" style={{ borderColor: c.ink }} />
          <p className={`serif ${t} relative leading-[1.08]`}>{title}</p>
          <svg viewBox="0 0 60 12" className="relative mt-[9%] w-[22%] opacity-70" aria-hidden>
            <path d="M2 6c8-6 14 6 22 0s14 6 22 0 8-3 12-2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <p className="relative mt-auto text-[0.55rem] font-semibold tracking-[0.08em] opacity-75 sm:text-[0.62rem]">{BRAND.name}</p>
        </div>
      )}
    </div>
  );
}
