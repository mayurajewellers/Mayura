import { motion } from 'framer-motion'
import { EASE_LUXE, VIEWPORT } from '@constants/motion'

const OFFSETS = {
  up: { y: 26, x: 0 },
  down: { y: -26, x: 0 },
  left: { x: 34, y: 0 },
  right: { x: -34, y: 0 },
  none: { x: 0, y: 0 },
}

/**
 * The workhorse scroll animation. Fades and drifts a block into place once,
 * on the shared luxury easing curve.
 */
export default function Reveal({
  children,
  as = 'div',
  direction = 'up',
  delay = 0,
  duration = 0.75,
  distance,
  className,
  viewport = VIEWPORT,
  ...rest
}) {
  const Component = motion[as] ?? motion.div
  const offset = OFFSETS[direction] ?? OFFSETS.up
  const from = distance
    ? { x: Math.sign(offset.x) * distance, y: Math.sign(offset.y) * distance }
    : offset

  return (
    <Component
      className={className}
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={viewport}
      transition={{ duration, delay, ease: EASE_LUXE }}
      {...rest}
    >
      {children}
    </Component>
  )
}
