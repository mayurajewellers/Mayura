import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { EASE_LUXE } from '@constants/motion'
import RevealHeading from '@components/motion/RevealHeading'
import Reveal from '@components/motion/Reveal'
import Flourish from '@components/common/Flourish'

const STATS = [
  { value: '11', label: 'Hands in the workshop' },
  { value: '14', label: 'Weeks for a bridal suite' },
  { value: '916', label: 'Hallmarked, every gram' },
  { value: '2004', label: 'On this corner since' },
]

/**
 * The dark editorial break in the middle of the page — full-bleed photograph
 * with a slow parallax, a large serif statement, and four quiet figures.
 */
export default function CraftsmanshipBanner() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-8%', '8%'])

  return (
    <section
      ref={ref}
      className="mj-grain-light relative overflow-hidden bg-espresso"
      aria-labelledby="craftsmanship-heading"
    >
      <motion.div className="absolute inset-0 -top-[8%] -bottom-[8%]" style={{ y }}>
        <img
          src="/images/editorial/kundan-bangles.jpg"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover opacity-[0.34]"
        />
      </motion.div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/85 to-espresso/45"
        aria-hidden="true"
      />

      <div className="relative mj-container py-section">
        <div className="max-w-3xl">
          <Reveal>
            <p className="mj-eyebrow-light mb-7">Our craftsmanship</p>
          </Reveal>

          <RevealHeading
            as="h2"
            id="craftsmanship-heading"
            text="Nothing here is finished by a machine alone."
            className="mj-display text-display-lg text-ivory"
          />

          <Reveal delay={0.2}>
            <p className="mt-9 max-w-xl text-body-lg leading-[1.9] text-ivory/65">
              A haram begins as a drawn wire and ends eleven days later under a burnisher. In
              between there is casting, filing, stone-setting and a great deal of quiet
              disagreement about whether a border is straight. We would not have it any other way —
              it is the reason a Mayura piece still looks like itself in thirty years.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <Link
              to={`${ROUTES.about}#craftsmanship`}
              className="group/craft mt-11 inline-flex items-center gap-3 font-sans text-label uppercase tracking-wider2 text-gold-200 transition-colors duration-300 hover:text-gold"
            >
              <span className="mj-underline">Inside the workshop</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-500 ease-luxe group-hover/craft:translate-x-1"
                strokeWidth={1.4}
                aria-hidden="true"
              />
            </Link>
          </Reveal>
        </div>

        <Flourish className="my-16 ml-0 lg:my-20" tone="light" />

        <dl className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: EASE_LUXE }}
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-display-md leading-none text-gold-200">
                  {stat.value}
                </span>
                <span className="mt-4 block font-sans text-eyebrow uppercase tracking-luxe text-ivory/45">
                  {stat.label}
                </span>
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  )
}
