import { Minus, Plus } from 'lucide-react'
import cn from '@utils/cn'

export default function QuantityStepper({ value, onChange, min = 1, max = 10, className, label = 'Quantity' }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-luxe border border-charcoal/15',
        className,
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-10 w-10 items-center justify-center rounded-l-luxe text-charcoal-100 transition-colors duration-300 hover:bg-charcoal/[0.05] hover:text-charcoal disabled:pointer-events-none disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
      <span
        className="w-10 select-none text-center font-sans text-body-sm tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="flex h-10 w-10 items-center justify-center rounded-r-luxe text-charcoal-100 transition-colors duration-300 hover:bg-charcoal/[0.05] hover:text-charcoal disabled:pointer-events-none disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </div>
  )
}
