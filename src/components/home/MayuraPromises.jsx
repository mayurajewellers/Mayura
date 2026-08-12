import { BadgeCheck, FlaskConical, Gem, HeartHandshake, Repeat, Scale, Truck } from 'lucide-react'
import { MAYURA_PROMISES } from '@data/homepage'
import SectionHeading from '@components/common/SectionHeading'
import { StoryCard } from '@components/cards/index.jsx'

const ICONS = {
  'badge-check': BadgeCheck,
  gem: Gem,
  scale: Scale,
  repeat: Repeat,
  flask: FlaskConical,
  truck: Truck,
  'heart-handshake': HeartHandshake,
}

/**
 * 7 Mayura Promises — on the deep royal ground with gold accents.
 * Promises 1–2 are the client's approved statements verbatim; 3–7 restate
 * commitments already published on this site and are marked in the data
 * layer for client confirmation.
 */
export default function MayuraPromises() {
  return (
    <section className="mj-grain mj-section-dark relative" aria-labelledby="mayura-promises">
      <div className="mj-container py-section">
        <SectionHeading
          id="mayura-promises"
          eyebrow="Our word, in writing"
          title="7 Mayura Promises"
          lede="The commitments every purchase carries — printed here so you can hold us to them."
          align="center"
          tone="light"
          flourish
          className="mb-16 lg:mb-20"
        />

        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-14">
          {MAYURA_PROMISES.map((promise, index) => (
            <StoryCard
              key={promise.n}
              icon={ICONS[promise.icon] ?? BadgeCheck}
              meta={`Promise ${promise.n}`}
              title={promise.title}
              copy={promise.copy}
              index={index}
              tone="light"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
