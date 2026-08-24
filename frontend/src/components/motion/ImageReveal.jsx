import { motion } from 'framer-motion'
import { EASE_SILK, VIEWPORT } from '@constants/motion'
import cn from '@utils/cn'

/**
 * A photograph that wipes open from the bottom while settling back from a
 * slight over-scale.
 *
 * The scroll observer deliberately sits on the OUTER container rather than on
 * the clipped element — a node carrying `clip-path: inset(0 0 100%)` reports
 * no intersection area in Chrome, so an observer attached to it never fires
 * and the image would stay hidden forever. Variants then cascade the wipe and
 * the scale down to the children.
 */
export default function ImageReveal({
  src,
  alt,
  className,
  imgClassName,
  ratio = 'aspect-editorial',
  delay = 0,
  loading = 'lazy',
  sizes,
  children,
}) {
  return (
    <motion.div
      className={cn('relative overflow-hidden rounded-card bg-champagne-100', ratio, className)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      <motion.div
        className="absolute inset-0"
        variants={{
          hidden: { clipPath: 'inset(0% 0% 100% 0%)' },
          show: {
            clipPath: 'inset(0% 0% 0% 0%)',
            transition: { duration: 1.15, delay, ease: EASE_SILK },
          },
        }}
      >
        <motion.img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          sizes={sizes}
          className={cn('h-full w-full object-cover', imgClassName)}
          variants={{
            hidden: { scale: 1.14 },
            show: { scale: 1, transition: { duration: 1.5, delay, ease: EASE_SILK } },
          }}
        />
      </motion.div>
      {children}
    </motion.div>
  )
}
