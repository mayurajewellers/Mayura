import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { CONTACT } from '@constants/site'
import { EASE_LUXE } from '@constants/motion'

/**
 * Floating WhatsApp handoff. Always visible, bottom right, with a slow gold
 * pulse ring and a tooltip that also opens itself once after a few seconds
 * so first-time visitors notice it without it being intrusive.
 */
export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false)
  const [hinted, setHinted] = useState(false)

  useEffect(() => {
    const show = window.setTimeout(() => setHinted(true), 4200)
    const hide = window.setTimeout(() => setHinted(false), 9500)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [])

  const open = hovered || hinted

  return (
    <div className="fixed bottom-5 right-5 z-float flex items-center gap-3 sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, x: 12, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.96 }}
            transition={{ duration: 0.4, ease: EASE_LUXE }}
            className="hidden select-none whitespace-nowrap rounded-luxe border border-charcoal/[0.07] bg-ivory px-4 py-2.5 font-sans text-eyebrow uppercase tracking-luxe text-charcoal shadow-lift sm:block"
            role="tooltip"
            id="whatsapp-tooltip"
          >
            {CONTACT.whatsappTooltip}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.a
        href={CONTACT.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${CONTACT.whatsappTooltip} on WhatsApp`}
        aria-describedby={open ? 'whatsapp-tooltip' : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, duration: 0.6, ease: EASE_LUXE }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="group/wa relative flex h-14 w-14 items-center justify-center rounded-full bg-espresso text-ivory shadow-lift transition-colors duration-500 ease-luxe hover:bg-gold hover:text-espresso sm:h-[3.75rem] sm:w-[3.75rem]"
      >
        <span
          className="pointer-events-none absolute inset-0 animate-pulse-ring rounded-full border border-gold/70"
          aria-hidden="true"
        />
        <MessageCircle
          className="relative h-6 w-6 transition-transform duration-500 ease-luxe group-hover/wa:scale-110"
          strokeWidth={1.4}
          aria-hidden="true"
        />
      </motion.a>
    </div>
  )
}
