import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/** Inline price edit. onSave(price) must return a promise. Parent keys this on product.price to reset it. */
export default function PriceEditor({ product, onSave }) {
  const [value, setValue] = useState(product.price == null ? '' : String(product.price))
  const [busy, setBusy] = useState(false)

  const num = Number(value)
  const valid = value !== '' && !Number.isNaN(num) && num >= 0
  const dirty = valid && num !== (product.price ?? null)

  async function submit(e) {
    e.preventDefault()
    if (!dirty) return
    setBusy(true)
    try {
      await onSave(num)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <Input
        type="number"
        min="0"
        step="0.10"
        inputMode="decimal"
        aria-label={`New price for ${product.name}`}
        aria-invalid={!valid}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-24 rounded-full px-3 text-sm"
      />
      <Button type="submit" variant="ink" size="sm" disabled={!dirty || busy} aria-label={`Save price for ${product.name}`}>
        {busy ? <Loader2 className="animate-spin" /> : <Check />} Save
      </Button>
    </form>
  )
}
