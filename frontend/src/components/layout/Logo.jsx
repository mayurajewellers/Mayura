import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import { BRAND } from '@constants/site'
import cn from '@utils/cn'

/**
 * Brand lock-up. The supplied mark is a gold gradient on transparency, so a
 * single asset sits correctly on both the ivory and espresso grounds.
 * `withWordmark` adds a small tracked line beneath it for the footer and the
 * auth screens, where the mark stands alone.
 */
export default function Logo({ tone = 'dark', className, size = 'md', withWordmark = false }) {
  const heights = {
    xs: 'h-8',
    sm: 'h-10 sm:h-11',
    md: 'h-12 sm:h-14',
    lg: 'h-16 sm:h-20',
  }

  return (
    <Link
      to={ROUTES.home}
      className={cn('group/logo inline-flex flex-col items-center gap-1.5', className)}
      aria-label={`${BRAND.name} — home`}
    >
      <img
        src="/images/brand/mayura-logo-transparent.png"
        alt=""
        aria-hidden="true"
        className={cn(
          'w-auto object-contain transition-transform duration-700 ease-luxe group-hover/logo:scale-[1.03]',
          heights[size] ?? heights.md,
        )}
      />
      {withWordmark && (
        <span
          className={cn(
            'font-sans text-[0.5rem] uppercase leading-none tracking-[0.42em] transition-colors duration-500',
            tone === 'light' ? 'text-ivory/55' : 'text-charcoal-100',
          )}
        >
          Fine Jewellery · Mumbai
        </span>
      )}
      <span className="sr-only">{BRAND.name}</span>
    </Link>
  )
}
