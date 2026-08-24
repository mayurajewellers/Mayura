import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { drawerTransition } from '@constants/motion'
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from '@hooks/index'
import cn from '@utils/cn'

/** Side sheet used for mobile navigation, filters and the search overlay. */
export default function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  children,
  footer,
  className,
  width = 'max-w-md',
  label,
}) {
  const panelRef = useRef(null)
  useLockBodyScroll(open)
  useEscapeKey(onClose, open)
  useFocusTrap(panelRef, open)

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-drawer" role="dialog" aria-modal="true" aria-label={label ?? title}>
          <motion.div
            className="absolute inset-0 bg-espresso/45 backdrop-blur-[3px]"
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
              'absolute inset-y-0 flex w-full flex-col bg-ivory shadow-lift',
              side === 'right' ? 'right-0' : 'left-0',
              width,
              className,
            )}
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={drawerTransition}
          >
            <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-5 sm:px-8">
              {title ? (
                <h2 className="font-display text-display-xs">{title}</h2>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 rounded-luxe p-2 text-charcoal-100 transition-colors duration-300 hover:bg-charcoal/[0.06] hover:text-charcoal"
              >
                <X className="h-5 w-5" strokeWidth={1.3} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8">
              {children}
            </div>

            {footer && (
              <div className="border-t border-charcoal/10 bg-ivory-50 px-6 py-5 sm:px-8">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
