import Button from './Button'
import Flourish from './Flourish'
import cn from '@utils/cn'

/**
 * Luxury empty state — a quiet, well-set page rather than a shrug emoji.
 * Used by the wishlist, cart, search and filtered collection views.
 */
export default function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  copy,
  primaryAction,
  secondaryAction,
  className,
  children,
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-20 text-center sm:py-28', className)}>
      {Icon && (
        <span
          className="mb-9 flex h-20 w-20 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.05]"
          aria-hidden="true"
        >
          <Icon className="h-7 w-7 text-bronze" strokeWidth={1} />
        </span>
      )}

      {eyebrow && <p className="mj-eyebrow mb-5">{eyebrow}</p>}

      <h2 className="mj-display max-w-lg text-display-sm">{title}</h2>

      <Flourish className="my-7" />

      {copy && (
        <p className="max-w-md text-body leading-[1.9] text-charcoal-200">{copy}</p>
      )}

      {children}

      {(primaryAction || secondaryAction) && (
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          {primaryAction && (
            <Button variant="primary" to={primaryAction.to} onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" to={secondaryAction.to} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
