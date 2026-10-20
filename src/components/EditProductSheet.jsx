import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ProductForm from "@/components/ProductForm";

const DESKTOP = "(min-width: 768px)"; // matches the md: breakpoint used for the table/rows switch

function useIsDesktop() {
  const [matches, setMatches] = useState(
    () => window.matchMedia(DESKTOP).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const onChange = (e) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return matches;
}

// BACKEND: none here. This component is UI only; saving happens inside ProductForm via productsApi.update.
/** Edit button + sheet. The form only mounts while the sheet is open, so it always starts from the saved values. */
export default function EditProductSheet({ product, onSaved }) {
  const [open, setOpen] = useState(false);
  const desktop = useIsDesktop();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`Edit ${product.name}`}>
          <Pencil /> Edit
        </Button>
      </SheetTrigger>
      <SheetContent
        side={desktop ? "right" : "bottom"}
        className={
          desktop
            ? "w-full overflow-y-auto sm:max-w-md"
            : "max-h-[92dvh] overflow-y-auto rounded-t-2xl"
        }
      >
        <SheetHeader>
          <SheetTitle>Edit item</SheetTitle>
          <SheetDescription className="truncate">
            {product.name}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <ProductForm
            product={product}
            onUpdated={onSaved}
            onDone={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
