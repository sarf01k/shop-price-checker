import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ImagePlus, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// BACKEND [Supabase]: every network call in this file goes through productsApi
// (uploadImage, create, update, deleteImage). Search for "BACKEND" to find each one.
import { productsApi } from "@/services";

const UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "pieces",
  "pack",
  "box",
  "bag",
  "bottle",
  "can",
  "jar",
  "tube",
];
const NO_UNIT = "none"; // Radix Select items can't have an empty value

const nonNegative = (v) =>
  v.trim() === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0);

// Adding requires a price. Editing allows it to be blank (items shown as "NO PRICE").
const makeSchema = (priceRequired) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(80, "Keep it under 80 characters"),
    price: z
      .string()
      .refine(nonNegative, "Enter a price of 0 or more")
      .refine((v) => !priceRequired || v.trim() !== "", "Price is required"),
    size: z.string().refine(nonNegative, "Enter a size of 0 or more"),
    unit: z
      .string()
      .refine((v) => v === "" || UNITS.includes(v), "Pick a unit"),
  });

const addSchema = makeSchema(true);
const editSchema = makeSchema(false);

const blank = { name: "", price: "", size: "", unit: "" };

const fromProduct = (p) => ({
  name: p.name ?? "",
  price: p.price == null ? "" : String(p.price),
  size: p.size == null ? "" : String(p.size),
  unit: p.unit ?? "",
});

/**
 * Add mode (default):  <ProductForm onCreated={row => ...} />
 * Edit mode:           <ProductForm product={p} onUpdated={row => ...} onDone={close} />
 */
export default function ProductForm({ product, onCreated, onUpdated, onDone }) {
  const editing = Boolean(product);
  const form = useForm({
    resolver: zodResolver(editing ? editSchema : addSchema),
    defaultValues: editing ? fromProduct(product) : blank,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [removedImage, setRemovedImage] = useState(false); // edit mode: user removed the existing picture
  const fileRef = useRef(null);
  const { isSubmitting, isDirty } = form.formState;

  useEffect(() => {
    if (!file) return setPreview("");
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // What the thumbnail shows: a newly picked file, else the saved image (unless removed).
  const shownImage =
    preview || (editing && !removedImage ? product.image_url : "");
  const changed = isDirty || Boolean(file) || removedImage;

  function clearImage() {
    if (file) {
      setFile(null); // drop the new pick; the saved image (if any) comes back
      if (fileRef.current) fileRef.current.value = "";
    } else {
      setRemovedImage(true); // remove the saved image
    }
  }

  async function onSubmit(values) {
    try {
      let image_url = editing ? (product.image_url ?? "") : "";
      // BACKEND [Supabase Storage]: uploads the file to the `product-images` bucket and returns its public URL.
      // Only runs when a new file was picked; otherwise the existing URL is kept (or cleared if removed).
      if (file) image_url = await productsApi.uploadImage(file);
      else if (removedImage) image_url = "";

      const payload = {
        name: values.name,
        price: values.price.trim() === "" ? null : Number(values.price),
        size: values.size.trim() === "" ? null : Number(values.size),
        unit: values.unit || null,
        image_url,
      };

      if (editing) {
        // BACKEND [Supabase DB]: UPDATE on `products` where id = product.id (all editable fields).
        // Returns the saved row, which the parent swaps into its list.
        const row = await productsApi.update(product.id, payload);
        onUpdated?.(row);
        toast.success(`Saved “${row.name}”`);
        // Best effort: clean the replaced/removed picture out of storage.
        // BACKEND [Supabase Storage]: removes the old file from `product-images`. Needs a delete policy for the owner;
        // if the policy is missing it fails silently and the old file just stays in the bucket.
        if (product.image_url && image_url !== product.image_url)
          productsApi.deleteImage(product.image_url);
        onDone?.();
      } else {
        // BACKEND [Supabase DB]: INSERT into `products`. Returns the new row (with its generated id).
        const row = await productsApi.create(payload);
        onCreated?.(row);
        toast.success(`Added “${row.name}”`);
        form.reset(blank);
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch (e) {
      toast.error(
        e.message ||
          (editing ? "Could not save changes" : "Could not add item"),
      );
    }
  }

  const text = (name, label, placeholder, className, type, extra) => (
    <FormField
      name={name}
      label={label}
      className={className}
      render={({ field }) => (
        <Input type={type} placeholder={placeholder} {...extra} {...field} />
      )}
    />
  );

  const wide = editing ? "col-span-2" : "sm:col-span-2";

  const formEl = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className={
          editing ? "grid grid-cols-2 gap-4" : "grid gap-4 sm:grid-cols-2"
        }
      >
        {text(
          "name",
          "Name",
          "e.g. Jasmine Rice",
          editing ? "col-span-2" : undefined,
        )}
        <FormField
          name="price"
          label="Price"
          className={editing ? "col-span-2" : undefined}
          render={({ field }) => (
            <Input
              type="number"
              min="0"
              step="0.10"
              inputMode="decimal"
              placeholder="0.00"
              {...field}
            />
          )}
        />
        {text("size", "Size", "e.g. 5", undefined, "number", {
          min: "0",
          step: "0.10",
          inputMode: "decimal",
        })}
        <FormField
          name="unit"
          label="Unit"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => field.onChange(v === NO_UNIT ? "" : v)}
            >
              <SelectTrigger
                id={field.id}
                aria-invalid={field["aria-invalid"]}
                className="w-full"
              >
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_UNIT}>None</SelectItem>
                {UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <div className={`grid gap-2 ${wide}`}>
          <label htmlFor="image" className="text-sm font-bold">
            Image
          </label>
          <div className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-dashed border-input bg-muted">
              {shownImage ? (
                <img
                  src={shownImage}
                  alt={file ? "Selected preview" : "Current image"}
                  className="size-full object-cover"
                />
              ) : (
                <ImagePlus
                  className="text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            <Input
              id="image"
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="h-auto min-h-11 min-w-0 flex-1 py-2"
            />
            {shownImage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearImage}
                aria-label={file ? "Discard new image" : "Remove image"}
              >
                <X />
              </Button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="col-span-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onDone}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="ink"
              size="lg"
              disabled={isSubmitting || !changed}
              className="flex-1"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Check />}{" "}
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        ) : (
          <Button
            type="submit"
            variant="ink"
            size="lg"
            disabled={isSubmitting}
            className="sm:col-span-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus />}{" "}
            {isSubmitting ? "Saving…" : "Add item"}
          </Button>
        )}
      </form>
    </Form>
  );

  if (editing) return formEl;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add item</CardTitle>
      </CardHeader>
      <CardContent>{formEl}</CardContent>
    </Card>
  );
}
