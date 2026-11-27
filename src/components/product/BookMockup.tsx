import { BookCover } from "../BookCover";
import { CATEGORIES } from "@/lib/content/taxonomy";
import type { CategoryKey } from "@/lib/content/types";

/** Mockup del libro físico de tapa dura, en perspectiva, con lomo y cantos de papel. */
export function BookMockup({ title, category, image }: { title: string; category: string; image?: string | null }) {
  const c = CATEGORIES[category as CategoryKey] ?? CATEGORIES.personales;
  return (
    <div className="mx-auto w-[62%] [perspective:1400px]">
      <div className="relative [transform:rotateY(-24deg)_rotateX(4deg)] [transform-style:preserve-3d]">
        <BookCover title={title} category={category} image={image} size="lg" />
        {/* lomo */}
        <div
          className="cloth absolute top-0 left-0 h-full w-[9%] origin-left [transform:rotateY(90deg)]"
          style={{ backgroundColor: c.cloth, filter: "brightness(.8)" }}
        />
        {/* cantos de papel */}
        <div
          className="absolute top-[1%] right-0 h-[98%] w-[8%] origin-right [transform:rotateY(-90deg)]"
          style={{ background: "repeating-linear-gradient(90deg,#f6efe3 0 2px,#e4d8c6 2px 3px)" }}
        />
      </div>
      <div className="mx-auto mt-2 h-4 w-[90%] rounded-[50%] bg-ink/25 blur-md" />
    </div>
  );
}
