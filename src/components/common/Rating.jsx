import { Star } from 'lucide-react'
import cn from '@utils/cn'

const SIZES = { xs: 'h-3 w-3', sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' }

/** Five-star display with half-star support, rendered as an image role. */
export default function Rating({
  value = 0,
  count,
  size = 'sm',
  showValue = false,
  className,
  tone = 'dark',
}) {
  const dimension = SIZES[size] ?? SIZES.sm

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="img"
      aria-label={`Rated ${value} out of 5${count ? ` from ${count} reviews` : ''}`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.min(Math.max(value - star + 1, 0), 1)
          return (
            <span key={star} className={cn('relative block', dimension)}>
              <Star
                className={cn(
                  'absolute inset-0',
                  dimension,
                  tone === 'light' ? 'text-ivory/25' : 'text-charcoal/18',
                )}
                strokeWidth={1.2}
              />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className={cn(dimension, 'fill-gold text-gold')} strokeWidth={1.2} />
                </span>
              )}
            </span>
          )
        })}
      </span>

      {(showValue || count != null) && (
        <span
          className={cn(
            'font-sans text-body-xs tabular-nums',
            tone === 'light' ? 'text-ivory/55' : 'text-charcoal-100',
          )}
        >
          {showValue && Number(value).toFixed(1)}
          {showValue && count != null && ' · '}
          {count != null && `${count} review${count === 1 ? '' : 's'}`}
        </span>
      )}
    </div>
  )
}
