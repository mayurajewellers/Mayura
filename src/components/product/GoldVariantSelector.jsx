import cn from '@utils/cn'

/**
 * Gold purity & shade selector.
 *
 * Reads `product.goldOptions` — see the data model note in data/products.js.
 * When a product is made in exactly one specification (goldOptions == null),
 * the selector renders that specification as a single fixed chip rather than
 * inventing variants that do not exist.
 */

const SHADES = {
  yellow: { label: 'Yellow Gold', swatch: 'linear-gradient(135deg,#F4D97C 0%,#D4AF37 55%,#B4922A 100%)' },
  rose: { label: 'Rose Gold', swatch: 'linear-gradient(135deg,#F6CDB9 0%,#E3A98C 55%,#C98B6F 100%)' },
  white: { label: 'White Gold', swatch: 'linear-gradient(135deg,#F4F5F6 0%,#D9DCDF 55%,#B9BEC4 100%)' },
}

/** Derive the single fixed spec for products without variant data. */
export function deriveGoldSpec(product) {
  const purityMatch = /(\d{2})K/.exec(product.purity ?? '')
  const purity = purityMatch ? `${purityMatch[1]}KT` : null
  const shade = product.metalKey?.includes('rose')
    ? 'rose'
    : product.metalKey?.includes('white')
      ? 'white'
      : product.metalKey?.includes('yellow')
        ? 'yellow'
        : null
  return { purity, shade }
}

function Chip({ selected, onClick, children, disabled = false }) {
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      {...(onClick ? { type: 'button', onClick, 'aria-pressed': selected, disabled } : {})}
      className={cn(
        'inline-flex min-w-[5.5rem] flex-col items-center gap-1.5 rounded-luxe border px-4 py-3 font-sans text-body-xs transition-all duration-300',
        selected
          ? 'border-royal bg-royal/[0.05] text-royal shadow-hairline'
          : 'border-charcoal/15 text-charcoal-200',
        onClick && !selected && 'hover:border-charcoal/45',
        !onClick && 'cursor-default',
      )}
    >
      {children}
    </Tag>
  )
}

export default function GoldVariantSelector({ product, value, onChange, className }) {
  /* Only meaningful for gold pieces. */
  if (!/gold/i.test(product.metal ?? '')) return null

  const options = product.goldOptions
  const fixed = deriveGoldSpec(product)

  const purities = options?.purities ?? (fixed.purity ? [fixed.purity] : [])
  const shades = options?.shades ?? (fixed.shade ? [fixed.shade] : [])
  if (!purities.length && !shades.length) return null

  const selectedPurity = value?.purity ?? options?.defaultPurity ?? purities[0]
  const selectedShade = value?.shade ?? options?.defaultShade ?? shades[0]

  const interactive = Boolean(options)
  const set = (patch) => onChange?.({ purity: selectedPurity, shade: selectedShade, ...patch })

  return (
    <div className={className}>
      {purities.length > 0 && (
        <fieldset className="mt-8">
          <legend className="mj-field-label mb-3">
            Gold purity
            <span className="ml-2 normal-case tracking-normal text-charcoal-50">
              {selectedPurity}
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {purities.map((purity) => (
              <Chip
                key={purity}
                selected={purity === selectedPurity}
                onClick={interactive ? () => set({ purity }) : undefined}
              >
                <span className="font-medium tabular-nums">{purity}</span>
              </Chip>
            ))}
          </div>
        </fieldset>
      )}

      {shades.length > 0 && (
        <fieldset className="mt-6">
          <legend className="mj-field-label mb-3">
            Gold shade
            <span className="ml-2 normal-case tracking-normal text-charcoal-50">
              {SHADES[selectedShade]?.label}
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {shades.map((shade) => (
              <Chip
                key={shade}
                selected={shade === selectedShade}
                onClick={interactive ? () => set({ shade }) : undefined}
              >
                <span
                  className="h-5 w-5 rounded-full shadow-hairline"
                  style={{ background: SHADES[shade]?.swatch }}
                  aria-hidden="true"
                />
                <span>{SHADES[shade]?.label ?? shade}</span>
              </Chip>
            ))}
          </div>
        </fieldset>
      )}

      {!interactive && (
        <p className="mt-3 font-sans text-body-xs text-charcoal-50">
          This design is crafted in the specification shown. Ask us about other purities and shades
          — most designs can be made to order.
        </p>
      )}
    </div>
  )
}
