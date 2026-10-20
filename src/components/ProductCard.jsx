import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatSize } from "@/lib/format";

const FALLBACK_IMG = `${import.meta.env.BASE_URL}placeholder-box.png`;

// `fit` lets callers switch to "contain" if tall bottles get their tops cropped.
export function ProductImage({ src, name, className = "", fit = "cover" }) {
  return (
    <div
      className={`grid place-items-center overflow-hidden bg-primary ${className}`}
    >
      <img
        src={src || FALLBACK_IMG}
        alt={name}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null; // avoid a loop if the fallback is missing too
          e.currentTarget.src = FALLBACK_IMG;
        }}
        className={`size-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
      />
    </div>
  );
}

/*
  Sizing is driven by the CARD's own width (container queries), not the viewport,
  so text stays right even where the grid changes column count.
    default      < 9rem  (~144px)  phone, 3 columns: image + price band + 2-line name + plain size
    @min-[9rem]  >= 144px          tablet-ish: slightly bigger text and padding
    @min-[13rem] >= 208px          laptop and up: original look (size chip, large name)
*/
export default function ProductCard({ product }) {
  const { name, size, unit, price, image_url } = product;
  const specs = [formatSize(size, unit)].filter(Boolean);

  return (
    <Card className="@container min-w-0 gap-0 overflow-hidden rounded-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(43,27,14,0.12)]">
      {/* 1. Picture: biggest thing on the card, edge to edge */}
      <ProductImage src={image_url} name={name} className="aspect-square" />

      {/* 2. Price: sits on the card background, big ink text directly under the picture */}
      <div className="w-full whitespace-nowrap px-1.5 pb-0 pt-1.5 text-accent font-display text-[1.25rem] leading-none tracking-wide @min-[9rem]:px-2.5 @min-[9rem]:pt-2 @min-[9rem]:text-[1.5rem] @min-[13rem]:px-4 @min-[13rem]:pt-3 @min-[13rem]:text-[2rem]">
        {formatPrice(price)}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-1.5 @min-[9rem]:gap-1.5 @min-[9rem]:p-2.5 @min-[13rem]:gap-2.5 @min-[13rem]:p-4">
        {/* 3. Name: clamped to 2 lines, full text on hover/long-press via title */}
        <h3
          title={name}
          className="line-clamp-2 wrap-break-word text-[0.95rem] leading-[1.05] @min-[9rem]:text-xl @min-[13rem]:text-[1.65rem]"
        >
          {name}
        </h3>

        {/* 4. Size: plain text on narrow cards, chips once there's room */}
        {specs.length > 0 && (
          <>
            <p className="mt-auto text-[11px] leading-tight text-muted-foreground @min-[13rem]:hidden">
              {specs.join(" · ")}
            </p>
            <ul className="mt-auto hidden flex-wrap gap-1.5 @min-[13rem]:flex">
              {specs.map((s, i) => (
                <li key={i}>
                  <Badge>{s}</Badge>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card
      className="@container min-w-0 gap-0 overflow-hidden"
      aria-hidden="true"
    >
      <Skeleton className="aspect-square rounded-none" />
      <Skeleton className="mx-auto mt-1.5 h-5 w-2/3 @min-[9rem]:mt-2 @min-[13rem]:mt-3 @min-[13rem]:h-7" />
      <div className="flex flex-col gap-1.5 p-1.5 @min-[9rem]:p-2.5 @min-[13rem]:gap-3 @min-[13rem]:p-4">
        <Skeleton className="h-3 w-full @min-[13rem]:h-6" />
        <Skeleton className="h-3 w-3/4 @min-[13rem]:h-6" />
        <Skeleton className="h-3 w-1/2 @min-[13rem]:h-5 @min-[13rem]:w-16 @min-[13rem]:rounded-full" />
      </div>
    </Card>
  );
}
