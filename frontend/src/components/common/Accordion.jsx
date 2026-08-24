import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { EASE_LUXE } from '@constants/motion'
import cn from '@utils/cn'

/**
 * Accessible accordion. Single-open by default; pass allowMultiple for the
 * FAQ page where readers open several at once.
 */
export default function Accordion({
  items = [],
  allowMultiple = false,
  defaultOpen = [],
  className,
  itemClassName,
  tone = 'dark',
}) {
  const [open, setOpen] = useState(new Set(defaultOpen))
  const baseId = useId()

  const toggle = (index) => {
    setOpen((current) => {
      const next = new Set(allowMultiple ? current : [])
      if (current.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const light = tone === 'light'

  return (
    <div className={cn('divide-y', light ? 'divide-ivory/12' : 'divide-charcoal/10', className)}>
      {items.map((item, index) => {
        const isOpen = open.has(index)
        const panelId = `${baseId}-panel-${index}`
        const buttonId = `${baseId}-button-${index}`

        return (
          <div key={item.q ?? item.title ?? index} className={itemClassName}>
            <h3>
              <button
                id={buttonId}
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={cn(
                  'group flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-300',
                  light ? 'text-ivory hover:text-gold-200' : 'text-charcoal hover:text-bronze',
                )}
              >
                <span
                  className={cn(
                    'font-display text-[1.0625rem] leading-[1.5] transition-transform duration-500 ease-luxe md:text-[1.1875rem]',
                    isOpen && 'translate-x-0',
                  )}
                >
                  {item.q ?? item.title}
                </span>
                <span
                  className={cn(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ease-luxe',
                    isOpen
                      ? 'rotate-180 border-gold bg-gold/12 text-bronze'
                      : light
                        ? 'border-ivory/25 text-ivory/70 group-hover:border-gold group-hover:text-gold'
                        : 'border-charcoal/18 text-charcoal-100 group-hover:border-gold group-hover:text-bronze',
                  )}
                  aria-hidden="true"
                >
                  {isOpen ? (
                    <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  ) : (
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  )}
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_LUXE }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      'max-w-3xl pb-7 pr-10 text-body leading-[1.9]',
                      light ? 'text-ivory/65' : 'text-charcoal-200',
                    )}
                  >
                    {item.a ?? item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
