import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { SORT_OPTIONS } from '@utils/catalogue'
import { EASE_LUXE } from '@constants/motion'
import { useEscapeKey, useOnClickOutside } from '@hooks/index'
import cn from '@utils/cn'

export default function SortDropdown({ value, onChange, className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useOnClickOutside(ref, () => setOpen(false), open)
  useEscapeKey(() => setOpen(false), open)

  const current = SORT_OPTIONS.find((option) => option.key === value) ?? SORT_OPTIONS[0]

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-2.5 whitespace-nowrap border-b border-charcoal/15 py-2.5 font-sans text-label uppercase tracking-wider2 text-charcoal transition-colors duration-300 hover:border-gold"
      >
        <span className="text-charcoal-50">Sort</span>
        {current.label}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-400', open && 'rotate-180')}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: EASE_LUXE }}
            className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-card border border-charcoal/[0.08] bg-ivory py-2 shadow-lift"
          >
            {SORT_OPTIONS.map((option) => (
              <li key={option.key} role="option" aria-selected={option.key === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.key)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-5 py-2.5 text-left font-sans text-body-sm transition-colors duration-300',
                    option.key === value
                      ? 'text-bronze'
                      : 'text-charcoal-200 hover:bg-champagne-50 hover:text-charcoal',
                  )}
                >
                  {option.label}
                  {option.key === value && (
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
