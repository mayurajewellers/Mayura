import { BadgeCheck, FileCheck2, HandCoins, HeartHandshake, Scale, Wrench } from 'lucide-react'
import SectionHeading from '@components/common/SectionHeading'
import { StoryCard } from '@components/cards/index.jsx'

const REASONS = [
  {
    icon: Scale,
    meta: '01',
    title: 'The calculation is written down',
    copy: 'Net weight, rate, making charge and GST, on paper, before you decide. If you ask a jeweller for this and they hesitate, you have learned something useful.',
  },
  {
    icon: BadgeCheck,
    meta: '02',
    title: 'Verify the hallmark yourself',
    copy: 'Every piece carries a six-digit HUID. We will hand you your phone and wait while you check it on the BIS Care app. Nobody should take purity on trust.',
  },
  {
    icon: FileCheck2,
    meta: '03',
    title: 'Certificates travel with the piece',
    copy: 'GIA or IGI reports for solitaires, lot certification for melee, and a free insurance valuation whenever you want one.',
  },
  {
    icon: HandCoins,
    meta: '04',
    title: 'Lifetime exchange, plainly stated',
    copy: 'Gold back at the prevailing rate, for as long as you own it. We tell you what is deducted before you buy, not after.',
  },
  {
    icon: Wrench,
    meta: '05',
    title: 'Free care, forever',
    copy: 'Cleaning, polishing, rhodium re-plating and one free resize. No appointment, no charge, whether you bought it last week or in 2004.',
  },
  {
    icon: HeartHandshake,
    meta: '06',
    title: 'We will talk you down',
    copy: 'If the lighter set suits her better, we will say so, even when it costs us the margin. We would rather have the family than the sale.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="mj-section bg-ivory-300" aria-labelledby="why-choose-us">
      <div className="mj-container">
        <SectionHeading
          id="why-choose-us"
          eyebrow="Why customers stay"
          title="Six promises, kept in public"
          lede="None of these is remarkable. All of them are, apparently, unusual — which tells you something about the trade."
          align="center"
          flourish
          className="mb-16 lg:mb-20"
        />

        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-14">
          {REASONS.map((reason, index) => (
            <StoryCard key={reason.title} {...reason} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
