import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, formatSize } from '@/lib/format'

const FALLBACK_IMG = `${import.meta.env.BASE_URL}placeholder-box.png`

export function ProductImage({ src, name, className = '' }) {
  return (
    <div className={`grid place-items-center overflow-hidden bg-primary ${className}`}>
      <img
        src={src || FALLBACK_IMG}
        alt={name}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null // avoid a loop if the fallback is missing too
          e.currentTarget.src = FALLBACK_IMG
        }}
        className="size-full object-cover"
      />
    </div>
  )
}

export default function ProductCard({ product }) {
  const { name, size, unit, price, image_url } = product
  const specs = [formatSize(size, unit)].filter(Boolean)

  return (
    <Card className="gap-0 rounded-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(43,27,14,0.12)]">
      <ProductImage src={image_url} name={name} className="aspect-4/3" />

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="text-[1.65rem] leading-[1.05]">{name}</h3>

        {specs.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {specs.map((s, i) => (
              <li key={i}><Badge>{s}</Badge></li>
            ))}
          </ul>
        )}

        <div className="mt-auto w-full whitespace-nowrap rounded-full bg-primary px-3 pb-0.5 pt-1 text-center font-display text-xl leading-none tracking-wide text-primary-foreground sm:w-auto sm:self-end sm:px-4 sm:text-[1.65rem]">
          {formatPrice(price)}
        </div>
      </div>
    </Card>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden" aria-hidden="true">
      <Skeleton className="aspect-4/3 rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-1.5"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-12 rounded-full" /></div>
        <Skeleton className="h-8 w-28 self-end rounded-full" />
      </div>
    </Card>
  )
}
