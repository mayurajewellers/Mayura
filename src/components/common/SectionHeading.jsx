import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import RevealHeading from '@components/motion/RevealHeading'
import Reveal from '@components/motion/Reveal'
import cn from '@utils/cn'

/**
 * The editorial section header used throughout the site: a small tracked
 * eyebrow, a large serif title that reveals word by word, an optional lede,
 * and an optional quiet link on the right.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'left',
  link,
  linkLabel = 'View all',
  tone = 'dark',
  size = 'lg',
  className,
  flourish = false,
  as = 'h2',
}) {
  const centred = align === 'center'
  const light = tone === 'light'

  const titleSize = {
    xl: 'text-display-lg',
    lg: 'text-display-md',
    md: 'text-display-sm',
  }[size] ?? 'text-display-md'

  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        centred ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-2xl', centred && 'flex flex-col items-center')}>
        {eyebrow && (
          <Reveal direction="up" duration={0.6}>
            <p className={cn('mb-5', light ? 'mj-eyebrow-light' : 'mj-eyebrow')}>{eyebrow}</p>
          </Reveal>
        )}

        <RevealHeading
          as={as}
          text={title}
          className={cn(
            titleSize,
            'mj-display',
            centred && 'justify-center',
            light ? 'text-ivory' : 'text-charcoal',
          )}
        />

        {flourish && (
          <Reveal direction="none" delay={0.25} className="mt-7">
            <span className="mj-flourish block" aria-hidden="true" />
          </Reveal>
        )}

        {lede && (
          <Reveal direction="up" delay={0.15}>
            <p
              className={cn(
                'mt-6 max-w-xl text-body leading-[1.9]',
                centred && 'mx-auto',
                light ? 'text-ivory/65' : 'text-charcoal-200',
              )}
            >
              {lede}
            </p>
          </Reveal>
        )}
      </div>

      {link && (
        <Reveal direction="up" delay={0.2} className={cn(centred && 'mt-2')}>
          <Link
            to={link}
            className={cn(
              'group inline-flex shrink-0 items-center gap-2.5 pb-1 font-sans text-label uppercase tracking-wider2 transition-colors duration-300',
              light ? 'text-ivory/75 hover:text-gold' : 'text-charcoal-200 hover:text-bronze',
            )}
          >
            <span className="mj-underline">{linkLabel}</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-500 ease-luxe group-hover:translate-x-1"
              strokeWidth={1.4}
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      )}
    </div>
  )
}
