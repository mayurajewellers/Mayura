import { X } from 'lucide-react'
import { TYPES } from '@data/categories'
import { METAL_OPTIONS, OCCASION_OPTIONS, PRICE_BOUNDS, PURITY_OPTIONS } from '@data/products'
import { countActiveFilters } from '@utils/catalogue'
import { formatPriceCompact } from '@utils/format'
import { Checkbox } from '@components/common/Field'
import cn from '@utils/cn'

/** A single group of checkboxes with a quiet rule above it. */
function Group({ title, children }) {
  return (
    <fieldset className="border-t border-charcoal/10 py-7 first:border-t-0 first:pt-0">
      <legend className="mj-eyebrow mb-5">{title}</legend>
      <div className="space-y-3">{children}</div>
    </fieldset>
  )
}

/**
 * Luxury filter rail. Pure client-side; every change is applied immediately
 * so the grid never needs an "apply" button.
 */
export default function FilterPanel({ filters, onChange, onReset, className }) {
  const active = countActiveFilters(filters)

  const toggle = (key, value) => {
    const current = filters[key] ?? []
    onChange({
      ...filters,
      [key]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    })
  }

  const priceSteps = [50000, 100000, 200000, 350000, PRICE_BOUNDS.max]

  return (
    <div className={cn('', className)}>
      <div className="mb-7 flex items-center justify-between border-b border-charcoal/10 pb-5">
        <h2 className="font-display text-[1.25rem]">
          Refine
          {active > 0 && <span className="ml-2 font-sans text-body-xs text-bronze">({active})</span>}
        </h2>
        {active > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 font-sans text-[0.6875rem] uppercase tracking-wide2 text-charcoal-100 transition-colors duration-300 hover:text-error"
          >
            <X className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      <Group title="Piece">
        {TYPES.map((type) => (
          <Checkbox
            key={type.slug}
            label={type.name}
            checked={filters.types?.includes(type.slug) ?? false}
            onChange={() => toggle('types', type.slug)}
          />
        ))}
      </Group>

      <Group title="Metal">
        {METAL_OPTIONS.map((metal) => (
          <Checkbox
            key={metal.key}
            label={metal.label}
            checked={filters.metals?.includes(metal.key) ?? false}
            onChange={() => toggle('metals', metal.key)}
          />
        ))}
      </Group>

      <Group title="Purity">
        {PURITY_OPTIONS.map((purity) => (
          <Checkbox
            key={purity.key}
            label={purity.label}
            checked={filters.purities?.includes(purity.key) ?? false}
            onChange={() => toggle('purities', purity.key)}
          />
        ))}
      </Group>

      <Group title="Price">
        <div className="space-y-2.5">
          {priceSteps.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() =>
                onChange({ ...filters, priceMax: filters.priceMax === step ? null : step })
              }
              aria-pressed={filters.priceMax === step}
              className={cn(
                'block w-full rounded-luxe border px-4 py-2.5 text-left font-sans text-body-sm transition-all duration-300',
                filters.priceMax === step
                  ? 'border-gold bg-gold/[0.08] text-bronze'
                  : 'border-charcoal/12 text-charcoal-200 hover:border-charcoal/30',
              )}
            >
              Under {formatPriceCompact(step)}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Occasion">
        {OCCASION_OPTIONS.map((occasion) => (
          <Checkbox
            key={occasion}
            label={occasion}
            checked={filters.occasions?.includes(occasion) ?? false}
            onChange={() => toggle('occasions', occasion)}
          />
        ))}
      </Group>
    </div>
  )
}
