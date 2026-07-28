/**
 * Shared Framer Motion variants.
 * Everything sits in the 300–900ms band on a single luxury easing curve so
 * the whole site moves with one hand.
 */

export const EASE_LUXE = [0.22, 1, 0.36, 1]
export const EASE_SILK = [0.16, 1, 0.3, 1]

export const VIEWPORT = { once: true, amount: 0.22, margin: '0px 0px -80px 0px' }
export const VIEWPORT_EARLY = { once: true, amount: 0.05, margin: '0px 0px -40px 0px' }

export const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE_LUXE } },
}

export const fadeUpSm = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_LUXE } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.965 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE_LUXE } },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -34 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE_LUXE } },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 34 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE_LUXE } },
}

/** Image reveal — the frame wipes open and the photograph settles back to 1:1. */
export const imageReveal = {
  hidden: { clipPath: 'inset(0 0 100% 0)', scale: 1.12 },
  show: {
    clipPath: 'inset(0 0 0% 0)',
    scale: 1,
    transition: { duration: 1.15, ease: EASE_SILK },
  },
}

export const staggerParent = (stagger = 0.1, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

/** Word-by-word headline reveal, used on hero and section titles. */
export const wordReveal = {
  hidden: { opacity: 0, y: '0.55em' },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_SILK } },
}

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_LUXE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.3, ease: 'easeIn' } },
}

export const drawerTransition = { type: 'tween', duration: 0.45, ease: EASE_LUXE }
