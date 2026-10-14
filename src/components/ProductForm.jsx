import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus, Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { productsApi } from '@/services'

const UNITS = ['g', 'kg', 'ml', 'l', 'pieces']

const nonNegative = (v) => v.trim() === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0)

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Keep it under 80 characters'),
  price: z
    .string()
    .refine(nonNegative, 'Enter a price of 0 or more')
    .refine((v) => v.trim() !== '', 'Price is required'),
  size: z.string().refine(nonNegative, 'Enter a size of 0 or more'),
  unit: z.string().refine((v) => v === '' || UNITS.includes(v), 'Pick a unit'),
})

const defaults = { name: '', price: '', size: '', unit: '' }

export default function ProductForm({ onCreated }) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: defaults })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const fileRef = useRef(null)
  const { isSubmitting } = form.formState

  useEffect(() => {
    if (!file) return setPreview('')
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function clearImage() {
    setFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function onSubmit(values) {
    try {
      const image_url = file ? await productsApi.uploadImage(file) : ''
      const row = await productsApi.create({
        name: values.name,
        price: Number(values.price),
        size: values.size.trim() === '' ? null : Number(values.size),
        unit: values.unit || null,
        image_url,
      })
      onCreated(row)
      toast.success(`Added “${row.name}”`)
      form.reset(defaults)
      clearImage()
    } catch (e) {
      toast.error(e.message || 'Could not add item')
    }
  }

  const text = (name, label, placeholder, className, type, extra) => (
    <FormField
      name={name}
      label={label}
      className={className}
      render={({ field }) => <Input type={type} placeholder={placeholder} {...extra} {...field} />}
    />
  )

  return (
    <Card>
      <CardHeader><CardTitle>Add item</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
            {text('name', 'Name', 'e.g. Jasmine Rice')}
            <FormField
              name="price"
              label="Price"
              render={({ field }) => (
                <Input type="number" min="0" step="0.10" inputMode="decimal" placeholder="0.00" {...field} />
              )}
            />
            {text('size', 'Size', 'e.g. 5', undefined, 'number', { min: '0', step: '0.10', inputMode: 'decimal' })}
            <FormField
              name="unit"
              label="Unit"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={field.id} aria-invalid={field['aria-invalid']} className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="image" className="text-sm font-bold">Image</label>
              <div className="flex items-center gap-4">
                <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-dashed border-input bg-muted">
                  {preview ? <img src={preview} alt="Selected preview" className="size-full object-cover" /> : <ImagePlus className="text-muted-foreground" aria-hidden="true" />}
                </div>
                <Input
                  id="image"
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="h-auto min-h-11 py-2"
                />
                {file && (
                  <Button type="button" variant="ghost" size="icon" onClick={clearImage} aria-label="Remove image">
                    <X />
                  </Button>
                )}
              </div>
            </div>

            <Button type="submit" variant="ink" size="lg" disabled={isSubmitting} className="sm:col-span-2">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Plus />} {isSubmitting ? 'Saving…' : 'Add item'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
