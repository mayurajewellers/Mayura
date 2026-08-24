import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import cn from '@utils/cn'

const TONES = {
  dark: 'text-charcoal hover:bg-charcoal/[0.06] active:bg-charcoal/[0.1]',
  light: 'text-ivory hover:bg-ivory/12 active:bg-ivory/20',
  gold: 'text-bronze hover:bg-gold/12 active:bg-gold/20',
}

const SIZES = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
}

/** Square icon-only control with a count badge. Always needs a label. */
const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, count, tone = 'dark', size = 'md', to, className, badgeClassName, ...rest },
  ref,
) {
  const classes = cn(
    'relative inline-flex items-center justify-center rounded-luxe transition-all duration-300 ease-luxe',
    TONES[tone] ?? TONES.dark,
    SIZES[size] ?? SIZES.md,
    className,
  )

  const inner = (
    <>
      <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.35} aria-hidden="true" />
      {count > 0 && (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 flex h-[1.05rem] min-w-[1.05rem] items-center justify-center rounded-full bg-gold px-1 font-sans text-[0.5625rem] font-semibold leading-none text-espresso',
            badgeClassName,
          )}
          aria-hidden="true"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
      <span className="sr-only">
        {label}
        {count > 0 ? ` (${count})` : ''}
      </span>
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-label={label} {...rest}>
        {inner}
      </Link>
    )
  }

  return (
    <button ref={ref} type="button" className={classes} aria-label={label} {...rest}>
      {inner}
    </button>
  )
})

export default IconButton
