import { FlaskConical, Gem, Repeat, Scale, ShieldCheck, Undo2, Video } from 'lucide-react'
import { ADVANTAGES } from '@data/homepage'
import SectionHeading from '@components/common/SectionHeading'
import { Stagger, StaggerItem } from '@components/motion/Stagger'

const ICONS = {
  'shield-check': ShieldCheck,
  gem: Gem,
  repeat: Repeat,
  scale: Scale,
  undo: Undo2,
  video: Video,
  flask: FlaskConical,
}

/**
 * The Mayura Advantage — the customer-benefits band beneath the category
 * windows. Every line here repeats a commitment already published on the
 * policies, FAQ or services pages; nothing is claimed only in marketing.
 */
export default function TrustStrip() {
  return (
    <section className="mj-grain relative border-y border-royal/10 bg-champagne-100" aria-labelledby="mayura-advantage">
      <div className="mj-container py-14 lg:py-18">
        <SectionHeading
          id="mayura-advantage"
          eyebrow="Why buy from us"
          title="The Mayura Advantage"
          align="center"
          size="md"
          className="mb-12"
        />

        <Stagger
          className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 xl:grid-cols-6"
          stagger={0.07}
        >
          {ADVANTAGES.map((item) => {
            const Icon = ICONS[item.icon] ?? ShieldCheck
            return (
              <StaggerItem key={item.title} className="flex flex-col items-center text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-ivory-50 text-royal">
                  <Icon className="h-5 w-5" strokeWidth={1.1} aria-hidden="true" />
                </span>
                <h3 className="font-display text-[1rem] leading-snug text-royal-800">
                  {item.title}
                </h3>
                <p className="mt-2 text-body-xs leading-[1.8] text-charcoal-200">{item.copy}</p>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
