import cn from '@utils/cn'

/** The small gold diamond-on-a-rule divider used between editorial blocks. */
export default function Flourish({ className, tone = 'dark' }) {
  return (
    <span
      className={cn(
        'relative mx-auto block h-px w-24',
        tone === 'light' ? 'bg-gold/60' : 'bg-gold/50',
        'after:absolute after:left-1/2 after:top-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:bg-gold after:content-[""]',
        className,
      )}
      aria-hidden="true"
    />
  )
}
