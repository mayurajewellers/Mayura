import { useState } from 'react'
import { IndianRupee, ListTree } from 'lucide-react'
import { formatCarat, formatPrice, formatWeight, titleCase } from '@utils/format'
import { SpecList } from '@components/common/index.jsx'
import cn from '@utils/cn'

/**
 * The two sections every jewellery PDP must expose before "Add to bag":
 *
 *   1. Product Details — full specification of the piece
 *   2. Price Breakup   — how the price is composed
 *
 * Price honesty: this catalogue carries a single indicative price per piece,
 * not live component pricing. `product.priceBreakup` (see data/products.js)
 * is the integration point for real values; until it is supplied, the
 * breakup table shows the components jewellery pricing is made of, states
 * plainly that they are confirmed on the day's rate at billing, and shows
 * only the total from real data. Nothing is fabricated.
 */

const TABS = [
  { key: 'details', label: 'Product Details', icon: ListTree },
  { key: 'breakup', label: 'Price Breakup', icon: IndianRupee },
]

export default function ProductInfoTabs({ product, className }) {
  const [tab, setTab] = useState('details')

  const totalCarat = product.stones?.reduce((sum, s) => sum + (s.carat ?? 0), 0) ?? 0

  const detailItems = [
    { label: 'Jewellery type', value: titleCase(product.type) },
    { label: 'Metal', value: product.metal },
    { label: 'Purity', value: product.purity },
    { label: 'Gross weight', value: formatWeight(product.grossWeight) },
    { label: 'Net gold weight', value: formatWeight(product.netWeight) },
    ...(totalCarat > 0 ? [{ label: 'Total stone weight', value: formatCarat(totalCarat) }] : []),
    ...(product.size?.default ? [{ label: product.size.label, value: product.size.default }] : []),
    { label: 'Certification', value: product.certification },
    { label: 'Product code', value: product.sku },
  ]

  const bk = product.priceBreakup
  const breakupRows = [
    { label: 'Gold value', value: bk?.goldValue != null ? formatPrice(bk.goldValue) : 'At the day’s gold rate' },
    ...(product.stones?.length
      ? [{ label: 'Stone / diamond value', value: bk?.stoneValue != null ? formatPrice(bk.stoneValue) : 'Per the stone certificate' }]
      : []),
    { label: 'Making charges', value: bk?.makingCharges != null ? formatPrice(bk.makingCharges) : product.makingCharges },
    { label: 'GST', value: bk?.gst != null ? formatPrice(bk.gst) : 'Included in the total' },
    ...(bk?.otherCharges != null ? [{ label: 'Other charges', value: formatPrice(bk.otherCharges) }] : []),
  ]

  return (
    <div className={cn('rounded-card border border-charcoal/[0.09] bg-white/50', className)}>
      {/* -------------------------------------------------------- tab bar */}
      <div role="tablist" aria-label="Product information" className="flex border-b border-charcoal/[0.09]">
        {TABS.map(({ key, label, icon: Icon }) => {
          const selected = tab === key
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`pdp-tab-${key}`}
              aria-selected={selected}
              aria-controls={`pdp-panel-${key}`}
              onClick={() => setTab(key)}
              className={cn(
                'relative flex flex-1 items-center justify-center gap-2.5 px-4 py-4 font-sans text-label uppercase tracking-wider2 transition-colors duration-300',
                selected ? 'text-royal' : 'text-charcoal-100 hover:text-charcoal',
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
              {label}
              <span
                className={cn(
                  'absolute inset-x-6 bottom-0 h-[2px] bg-gold transition-transform duration-400 ease-luxe',
                  selected ? 'scale-x-100' : 'scale-x-0',
                )}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>

      {/* --------------------------------------------------------- panels */}
      <div
        role="tabpanel"
        id="pdp-panel-details"
        aria-labelledby="pdp-tab-details"
        hidden={tab !== 'details'}
        className="px-6 pb-6 sm:px-7"
      >
        <SpecList items={detailItems} />
        {product.stones?.length > 0 && (
          <div className="mt-5 border-t border-charcoal/10 pt-5">
            <p className="mj-eyebrow mb-3">Stone details</p>
            {product.stones.map((stone) => (
              <p key={stone.type} className="py-1 text-body-sm text-charcoal-200">
                <span className="font-medium text-charcoal">{stone.type}</span>
                {stone.count ? ` · ${stone.count} stones` : ''}
                {stone.carat ? ` · ${formatCarat(stone.carat)}` : ''}
                {stone.clarity ? ` · ${stone.clarity}` : ''}
                {stone.colour ? ` · ${stone.colour}` : ''}
                {stone.quality ? ` · ${stone.quality}` : ''}
              </p>
            ))}
          </div>
        )}
      </div>

      <div
        role="tabpanel"
        id="pdp-panel-breakup"
        aria-labelledby="pdp-tab-breakup"
        hidden={tab !== 'breakup'}
        className="px-6 pb-6 sm:px-7"
      >
        <SpecList items={breakupRows} />
        <div className="mt-5 flex items-baseline justify-between gap-6 border-t-2 border-gold/50 pt-5">
          <p className="font-sans text-eyebrow uppercase tracking-luxe text-charcoal">Total price</p>
          <p className="font-display text-[1.375rem] tabular-nums text-royal">
            {formatPrice(product.price)}
          </p>
        </div>
        <p className="mt-4 text-body-xs leading-[1.8] text-charcoal-100">
          Gold is billed at the published rate on the day of purchase, so the component values are
          confirmed on your invoice at billing. The total shown includes GST. Ask the counter for
          the full written calculation before you decide — it is always given.
        </p>
      </div>
    </div>
  )
}
