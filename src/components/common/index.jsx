import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import cn from '@utils/cn'

export { default as Button } from './Button'
export { default as IconButton } from './IconButton'
export { default as SectionHeading } from './SectionHeading'
export { default as SmartImage } from './SmartImage'
export { default as Accordion } from './Accordion'
export { default as Rating } from './Rating'
export { default as Drawer } from './Drawer'
export { default as Modal } from './Modal'
export { default as Pagination } from './Pagination'
export { default as EmptyState } from './EmptyState'
export { default as QuantityStepper } from './QuantityStepper'
export { default as Flourish } from './Flourish'
export { TextField, PasswordField, TextArea, SelectField, Checkbox, RadioCard } from './Field'

/* -------------------------------------------------------------------------
   Badge
   ---------------------------------------------------------------------- */
const BADGE_TONES = {
  gold: 'mj-badge-gold',
  dark: 'mj-badge-dark',
  light: 'mj-badge-light',
  success: 'mj-badge-success',
}

export function Badge({ children, tone = 'gold', icon: Icon, className }) {
  return (
    <span className={cn(BADGE_TONES[tone] ?? BADGE_TONES.gold, className)}>
      {Icon && <Icon className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />}
      {children}
    </span>
  )
}

/* -------------------------------------------------------------------------
   Breadcrumbs
   ---------------------------------------------------------------------- */
export function Breadcrumbs({ items = [], className, tone = 'dark' }) {
  const light = tone === 'light'
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className={cn('h-3 w-3', light ? 'text-ivory/35' : 'text-charcoal/30')}
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
              )}
              {last || !item.to ? (
                <span
                  aria-current={last ? 'page' : undefined}
                  className={cn(
                    'font-sans text-eyebrow uppercase tracking-luxe',
                    light ? 'text-ivory/70' : 'text-charcoal-100',
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className={cn(
                    'font-sans text-eyebrow uppercase tracking-luxe transition-colors duration-300',
                    light ? 'text-ivory/45 hover:text-gold' : 'text-charcoal-50 hover:text-bronze',
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* -------------------------------------------------------------------------
   Spec list — label/value rows used on product and contact pages
   ---------------------------------------------------------------------- */
export function SpecList({ items = [], className, tone = 'dark', columns = 1 }) {
  const light = tone === 'light'
  return (
    <dl
      className={cn(
        'divide-y',
        light ? 'divide-ivory/12' : 'divide-charcoal/10',
        columns === 2 && 'sm:grid sm:grid-cols-2 sm:gap-x-10 sm:divide-y-0',
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'flex items-baseline justify-between gap-6 py-3.5',
            columns === 2 && 'sm:border-b sm:border-charcoal/10',
          )}
        >
          <dt
            className={cn(
              'font-sans text-eyebrow uppercase tracking-luxe',
              light ? 'text-ivory/45' : 'text-charcoal-50',
            )}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              'text-right font-sans text-body-sm',
              light ? 'text-ivory/85' : 'text-charcoal',
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* -------------------------------------------------------------------------
   Skip link
   ---------------------------------------------------------------------- */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-luxe bg-espresso px-5 py-3 font-sans text-label uppercase tracking-wider2 text-ivory shadow-lift"
    >
      Skip to content
    </a>
  )
}
