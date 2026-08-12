import { motion } from 'framer-motion'
import { EASE_SILK, VIEWPORT } from '@constants/motion'
import cn from '@utils/cn'

/**
 * Word-by-word headline reveal. Each word sits in its own overflow-hidden
 * frame and rises into it, which reads as typesetting rather than animation.
 */
export default function RevealHeading({
  text,
  as = 'h2',
  id,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.055,
  once = true,
}) {
  const Component = motion[as] ?? motion.h2
  const words = String(text).split(' ')

  return (
    <Component
      id={id}
      className={cn('flex flex-wrap', className)}
      initial="hidden"
      whileInView="show"
      viewport={{ ...VIEWPORT, once }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden pb-[0.06em] pr-[0.24em] align-bottom"
          aria-hidden="true"
        >
          <motion.span
            className={cn('inline-block', wordClassName)}
            variants={{
              hidden: { y: '108%', opacity: 0 },
              show: { y: '0%', opacity: 1, transition: { duration: 0.9, ease: EASE_SILK } },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Component>
  )
}
