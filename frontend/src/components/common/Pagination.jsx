import { ChevronLeft, ChevronRight } from 'lucide-react'
import cn from '@utils/cn'

/** Compact numeric pagination with ellipses. */
export default function Pagination({ page, totalPages, onChange, className }) {
  if (totalPages <= 1) return null

  const pages = []
  const push = (value) => pages.push(value)

  push(1)
  if (page > 3) push('…')
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i += 1) push(i)
  if (page < totalPages - 2) push('…')
  if (totalPages > 1) push(totalPages)

  const cell =
    'flex h-10 min-w-10 items-center justify-center rounded-luxe px-3 font-sans text-body-sm tabular-nums transition-all duration-300 ease-luxe'

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={cn(
          cell,
          'text-charcoal-100 hover:bg-charcoal/[0.06] hover:text-charcoal disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.4} />
      </button>

      {pages.map((value, index) =>
        value === '…' ? (
          <span
            key={`gap-${index}`}
            className={cn(cell, 'pointer-events-none text-charcoal-50')}
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-current={value === page ? 'page' : undefined}
            className={cn(
              cell,
              value === page
                ? 'bg-charcoal text-ivory'
                : 'text-charcoal-100 hover:bg-charcoal/[0.06] hover:text-charcoal',
            )}
          >
            {value}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className={cn(
          cell,
          'text-charcoal-100 hover:bg-charcoal/[0.06] hover:text-charcoal disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.4} />
      </button>
    </nav>
  )
}
