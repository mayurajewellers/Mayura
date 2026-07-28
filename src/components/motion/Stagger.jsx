import { motion } from 'framer-motion'
import { EASE_LUXE, VIEWPORT } from '@constants/motion'

/**
 * Stagger + StaggerItem. Wrap a list in <Stagger> and each <StaggerItem>
 * arrives in sequence rather than all at once.
 */
export function Stagger({
  children,
  as = 'div',
  className,
  stagger = 0.09,
  delay = 0,
  viewport = VIEWPORT,
  ...rest
}) {
  const Component = motion[as] ?? motion.div
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...rest}
    >
      {children}
    </Component>
  )
}

export function StaggerItem({ children, as = 'div', className, distance = 24, ...rest }) {
  const Component = motion[as] ?? motion.div
  return (
    <Component
      className={className}
      variants={{
        hidden: { opacity: 0, y: distance },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_LUXE } },
      }}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default Stagger
