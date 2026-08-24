import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { EASE_LUXE } from '@constants/motion'
import SmartImage from '@components/common/SmartImage'
import cn from '@utils/cn'

/**
 * Full-width luxury dropdown. Columns of quiet links on the left, one
 * editorial feature panel on the right.
 */
export default function MegaMenu({ mega, onNavigate }) {
  if (!mega) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE_LUXE }}
      className="absolute inset-x-0 top-full border-t border-charcoal/[0.07] bg-ivory shadow-lift"
    >
      <div className="mj-container-wide">
        <div
          className={cn(
            'grid gap-x-14 gap-y-10 py-12 lg:py-14',
            mega.feature ? 'lg:grid-cols-[1fr_1fr_22rem]' : 'lg:grid-cols-3',
            mega.columns.length === 1 && mega.feature && 'lg:grid-cols-[1fr_24rem]',
          )}
        >
          {mega.columns.map((column) => (
            <div key={column.title}>
              <p className="mj-eyebrow mb-6 border-b border-charcoal/10 pb-4">{column.title}</p>
              <ul
                className={cn(
                  'space-y-1',
                  column.links.length > 7 && 'columns-2 gap-x-8 space-y-0 [&>li]:mb-1',
                )}
              >
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      onClick={onNavigate}
                      className="group/link flex items-baseline justify-between gap-4 rounded-luxe py-2 transition-colors duration-300"
                    >
                      <span className="font-display text-[1.0625rem] leading-snug text-charcoal transition-colors duration-300 group-hover/link:text-bronze">
                        {link.label}
                      </span>
                      {link.meta && (
                        <span className="shrink-0 font-sans text-[0.6875rem] uppercase tracking-wide2 text-charcoal-50">
                          {link.meta}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {mega.feature && (
            <Link
              to={mega.feature.to}
              onClick={onNavigate}
              className="group/feature relative block overflow-hidden rounded-card bg-champagne-100"
            >
              <SmartImage
                src={mega.feature.image}
                alt={mega.feature.title}
                ratio="aspect-[4/3] lg:aspect-[3/4]"
                rounded="rounded-card"
                imgClassName="transition-transform duration-1200 ease-luxe group-hover/feature:scale-[1.06]"
              />
              <span className="pointer-events-none absolute inset-0 bg-scrim-card" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 block p-6">
                <span className="mj-eyebrow-light mb-2.5 block">{mega.feature.eyebrow}</span>
                <span className="mj-display block text-display-xs text-ivory">
                  {mega.feature.title}
                </span>
                <span className="mt-2 block text-body-sm leading-relaxed text-ivory/70">
                  {mega.feature.copy}
                </span>
                <span className="mt-5 flex items-center gap-2 font-sans text-eyebrow uppercase tracking-luxe text-gold-200">
                  {mega.feature.cta}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-500 ease-luxe group-hover/feature:translate-x-1"
                    strokeWidth={1.4}
                    aria-hidden="true"
                  />
                </span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
