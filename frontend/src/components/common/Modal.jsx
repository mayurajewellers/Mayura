import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { EASE_LUXE } from '@constants/motion'
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from '@hooks/index'
import cn from '@utils/cn'

/** Centred dialog — used for quick view and the size guide. */
export default function Modal({ open, onClose, children, className, label = 'Dialog', size = 'max-w-4xl' }) {
  const panelRef = useRef(null)
  useLockBodyScroll(open)
  useEscapeKey(onClose, open)
  useFocusTrap(panelRef, open)

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-modal flex items-end justify-center p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <motion.div
            className="absolute inset-0 bg-espresso/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            className={cn(
              'relative max-h-[92vh] w-full overflow-y-auto overscroll-contain bg-ivory shadow-lift',
              'rounded-t-panel sm:rounded-panel',
              size,
              className,
            )}
            initial={{ opacity: 0, y: 40, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.99 }}
            transition={{ duration: 0.45, ease: EASE_LUXE }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 rounded-full bg-ivory/85 p-2.5 text-charcoal-100 backdrop-blur transition-colors duration-300 hover:bg-charcoal hover:text-ivory"
            >
              <X className="h-4 w-4" strokeWidth={1.4} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
