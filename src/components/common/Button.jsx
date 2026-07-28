import { forwardRef, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import cn from '@utils/cn'

const VARIANTS = {
  primary: 'mj-btn-primary mj-btn-sheen',
  gold: 'mj-btn-gold mj-btn-sheen',
  outline: 'mj-btn-outline',
  outlineLight: 'mj-btn-outline-light',
  ghost: 'mj-btn-ghost',
  ghostLight: 'mj-btn-ghost-light',
}

const SIZES = {
  sm: 'mj-btn-sm',
  md: '',
  lg: 'mj-btn-lg',
}

/**
 * The single button in the system. Renders as <button>, <Link> or <a>
 * depending on the props, carries the gold sheen on solid variants, and
 * paints a soft ripple from the click point.
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    to,
    href,
    type = 'button',
    className,
    icon: Icon,
    iconPosition = 'right',
    fullWidth = false,
    ripple = true,
    onClick,
    ...rest
  },
  ref,
) {
  const [ripples, setRipples] = useState([])

  const handleClick = useCallback(
    (event) => {
      if (ripple) {
        const rect = event.currentTarget.getBoundingClientRect()
        const id = Date.now()
        setRipples((current) => [
          ...current,
          { id, x: event.clientX - rect.left, y: event.clientY - rect.top },
        ])
        window.setTimeout(
          () => setRipples((current) => current.filter((r) => r.id !== id)),
          650,
        )
      }
      onClick?.(event)
    },
    [onClick, ripple],
  )

  const classes = cn(
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size],
    fullWidth && 'w-full',
    className,
  )

  const inner = (
    <>
      {Icon && iconPosition === 'left' && (
        <Icon className="h-[1.05em] w-[1.05em] shrink-0" strokeWidth={1.5} aria-hidden="true" />
      )}
      <span className="relative z-10">{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon
          className="h-[1.05em] w-[1.05em] shrink-0 transition-transform duration-400 ease-luxe group-hover/btn:translate-x-0.5"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      )}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute h-2 w-2 animate-[pulse-ring_0.65s_ease-out_forwards] rounded-full bg-current opacity-25"
          style={{ left: r.x, top: r.y, transform: 'translate(-50%,-50%) scale(1)' }}
        />
      ))}
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={cn('group/btn', classes)} onClick={handleClick} {...rest}>
        {inner}
      </Link>
    )
  }

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        className={cn('group/btn', classes)}
        onClick={handleClick}
        rel={rest.target === '_blank' ? 'noopener noreferrer' : undefined}
        {...rest}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      ref={ref}
      type={type}
      className={cn('group/btn', classes)}
      onClick={handleClick}
      {...rest}
    >
      {inner}
    </button>
  )
})

export default Button
