import { Gem, Repeat, ShieldCheck, Sparkles } from 'lucide-react'
import { ASSURANCES } from '@constants/site'
import { Stagger, StaggerItem } from '@components/motion/Stagger'

const ICONS = { 'shield-check': ShieldCheck, gem: Gem, repeat: Repeat, sparkles: Sparkles }

/** Four assurances directly beneath the hero, on the champagne ground. */
export default function TrustStrip() {
  return (
    <section className="mj-grain relative bg-champagne" aria-label="Our assurances">
      <div className="mj-container py-14 lg:py-16">
        <Stagger className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {ASSURANCES.map((item) => {
            const Icon = ICONS[item.icon] ?? ShieldCheck
            return (
              <StaggerItem key={item.title} className="flex gap-4">
                <Icon
                  className="mt-0.5 h-6 w-6 shrink-0 text-espresso/70"
                  strokeWidth={1}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-display text-[1.0625rem] leading-snug text-espresso">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-body-xs leading-[1.85] text-espresso/60">{item.copy}</p>
                </div>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
