import { motion } from 'framer-motion'
import { EASE_LUXE, EASE_SILK } from '@constants/motion'
import { Breadcrumbs } from '@components/common/index.jsx'
import Flourish from '@components/common/Flourish'
import cn from '@utils/cn'

/**
 * Shared interior page header.
 *
 *  variant="image"   full-bleed photograph with a scrim — collections, about
 *  variant="plain"   ivory band with generous space — legal, cart, search
 */
export default function PageHero({
  eyebrow,
  title,
  lede,
  image,
  breadcrumbs,
  variant = image ? 'image' : 'plain',
  align = 'left',
  height = 'md',
  children,
  className,
}) {
  const light = variant === 'image'
  const centred = align === 'center'

  const heights = {
    sm: 'min-h-[38vh] lg:min-h-[42vh]',
    md: 'min-h-[52vh] lg:min-h-[58vh]',
    lg: 'min-h-[66vh] lg:min-h-[76vh]',
  }

  if (!light) {
    return (
      <section
        className={cn('border-b border-charcoal/[0.07] bg-ivory-300', className)}
        aria-labelledby="page-title"
      >
        <div className="mj-container pb-14 pt-14 lg:pb-20 lg:pt-20">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-9" />}
          <div className={cn('max-w-3xl', centred && 'mx-auto text-center')}>
            {eyebrow && <p className="mj-eyebrow mb-5">{eyebrow}</p>}
            <h1 id="page-title" className="mj-display text-display-lg">
              {title}
            </h1>
            {centred && <Flourish className="my-8" />}
            {lede && (
              <p
                className={cn(
                  'mt-7 max-w-2xl text-body-lg leading-[1.9] text-charcoal-200',
                  centred && 'mx-auto',
                )}
              >
                {lede}
              </p>
            )}
            {children}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn('relative flex items-end overflow-hidden bg-espresso', heights[height], className)}
      aria-labelledby="page-title"
    >
      <motion.img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.2, ease: EASE_SILK }}
      />
      <div className="absolute inset-0 bg-scrim-hero" aria-hidden="true" />
      <div
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-espresso/85 to-transparent"
        aria-hidden="true"
      />

      <div className="relative w-full pb-14 pt-36 lg:pb-20 lg:pt-44">
        <div className="mj-container">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} tone="light" className="mb-8" />}

          <div className={cn('max-w-3xl', centred && 'mx-auto text-center')}>
            {eyebrow && (
              <motion.p
                className="mj-eyebrow-light mb-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: EASE_LUXE }}
              >
                {eyebrow}
              </motion.p>
            )}

            <h1 id="page-title" className="mj-display text-display-lg text-ivory">
              <span className="block overflow-hidden pb-[0.05em]">
                <motion.span
                  className="block"
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ delay: 0.28, duration: 1, ease: EASE_SILK }}
                >
                  {title}
                </motion.span>
              </span>
            </h1>

            {lede && (
              <motion.p
                className={cn('mt-7 max-w-2xl text-body-lg leading-[1.9] text-ivory/70', centred && 'mx-auto')}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: EASE_LUXE }}
              >
                {lede}
              </motion.p>
            )}

            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
