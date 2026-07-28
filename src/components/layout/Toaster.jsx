import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, X } from 'lucide-react'
import { useShop } from '@context/ShopContext'
import { EASE_LUXE } from '@constants/motion'
import cn from '@utils/cn'

const TONES = {
  success: { icon: Check, ring: 'border-success/30', dot: 'bg-success' },
  error: { icon: AlertCircle, ring: 'border-error/30', dot: 'bg-error' },
  default: { icon: Check, ring: 'border-charcoal/12', dot: 'bg-gold' },
}

/** Bottom-left toast stack. Announced politely so it never interrupts. */
export default function Toaster() {
  const { toasts, dismissToast } = useShop()

  return (
    <div
      className="pointer-events-none fixed bottom-5 left-5 z-toast flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2.5 sm:bottom-7 sm:left-7"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const tone = TONES[toast.tone] ?? TONES.default
          const Icon = tone.icon
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: EASE_LUXE }}
              className={cn(
                'pointer-events-auto flex items-start gap-3.5 rounded-card border bg-ivory px-4 py-3.5 shadow-lift',
                tone.ring,
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  tone.dot,
                )}
                aria-hidden="true"
              >
                <Icon className="h-3 w-3 text-ivory" strokeWidth={2.4} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-sans text-body-sm font-medium text-charcoal">
                  {toast.title}
                </span>
                {toast.message && (
                  <span className="mt-0.5 block truncate font-sans text-body-xs text-charcoal-100">
                    {toast.message}
                  </span>
                )}
              </span>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss"
                className="-mr-1 shrink-0 rounded p-1 text-charcoal-50 transition-colors duration-300 hover:text-charcoal"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
