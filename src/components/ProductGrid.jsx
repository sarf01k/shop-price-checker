import { PackageSearch, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard, { ProductCardSkeleton } from "@/components/ProductCard";

// 3 cols on phones, 4 on tablets (768px+), 5 on laptops and larger (1280px+)
const gridCls =
  "grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4 xl:grid-cols-5 xl:gap-5";

function Notice({ icon: Icon, title, children }) {
  return (
    <div
      className="flex flex-col items-center gap-3 py-16 text-center"
      role="status"
    >
      <Icon className="size-10 text-muted-foreground" aria-hidden="true" />
      <p className="font-display text-3xl uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}

/** Grid with skeleton / error / empty states. */
export default function ProductGrid({
  products,
  status,
  error,
  onRetry,
  query,
  onClear,
}) {
  if (status === "loading") {
    return (
      <div className={gridCls} aria-busy="true" aria-label="Loading items">
        {Array.from({ length: 15 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <Notice icon={WifiOff} title="Couldn't load items">
        <p className="max-w-sm text-sm text-muted-foreground" role="alert">
          {error}
        </p>
        <Button variant="ink" onClick={onRetry}>
          <RefreshCw /> Retry
        </Button>
      </Notice>
    );
  }

  if (products.length === 0) {
    return query ? (
      <Notice icon={PackageSearch} title={`No items match “${query}”`}>
        <p className="text-sm text-muted-foreground">
          Try a different name or size.
        </p>
        <Button variant="outline" onClick={onClear}>
          Clear search
        </Button>
      </Notice>
    ) : (
      <Notice icon={PackageSearch} title="No items yet">
        <p className="text-sm text-muted-foreground">
          The owner hasn't added any items.
        </p>
      </Notice>
    );
  }

  return (
    <div className={gridCls}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
