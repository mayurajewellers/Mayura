import {
  Award,
  Flame,
  Gem,
  Hammer,
  HeartHandshake,
  PencilRuler,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { BRAND, OWNER } from '@constants/site'
import { useDocumentTitle } from '@hooks/index'
import PageHero from '@components/layout/PageHero'
import SectionHeading from '@components/common/SectionHeading'
import ImageReveal from '@components/motion/ImageReveal'
import Reveal from '@components/motion/Reveal'
import RevealHeading from '@components/motion/RevealHeading'
import Flourish from '@components/common/Flourish'
import Button from '@components/common/Button'
import SmartImage from '@components/common/SmartImage'
import { StoryCard } from '@components/cards/index.jsx'
import { Stagger, StaggerItem } from '@components/motion/Stagger'

const TIMELINE = [
  {
    year: '2004',
    title: 'A single counter in Thakur Village',
    copy: 'Mayura Jewellers opens in Kandivali East — one showcase, one goldsmith, and a family that had already spent two generations weighing gold across a counter.',
  },
  {
    year: '2011',
    title: 'The bridal atelier',
    copy: 'Our first full trousseau commission — eleven pieces for a Kandivali wedding. It took fourteen weeks and taught us to make a silver sample before cutting any gold.',
  },
  {
    year: '2016',
    title: 'Italian imports and certified gemstones',
    copy: 'Lightweight Italian chain work joins the cases, alongside certified natural gemstones — and free gold testing becomes a standing offer to anyone who walks in.',
  },
  {
    year: '2021',
    title: 'BIS hallmarking becomes mandatory',
    copy: 'We had been hallmarking voluntarily for years, so the June 2021 rules changed nothing about how we worked — only about how much explaining we had to do.',
  },
  {
    year: '2024',
    title: 'Temple work comes in-house',
    copy: 'Two nakashi artisans from Kumbakonam join the bench, and Vanaja stops being something we bought in and starts being something we make.',
  },
  {
    year: '2026',
    title: 'The third generation',
    copy: '1,350 square feet, seventeen people, and the largest jewellery showroom in Kandivali — now run by the third generation of the Bhandari family.',
  },
]

const PROCESS = [
  { icon: PencilRuler, meta: 'Step one', title: 'The conversation', copy: 'Photographs, fabric, the grandmother whose necklace is being reworked. Nothing is drawn until we know what the piece has to live up to.' },
  { icon: ScanLine, meta: 'Step two', title: 'CAD and sample', copy: 'A render, then a silver sample for anything above thirty grams. She wears it, walks in it, sits down in it. Changes here are free.' },
  { icon: Flame, meta: 'Step three', title: 'Casting and drawing', copy: 'Wire drawn to gauge, components cast or raised by hand. Nakashi work is hammered from a sheet over pitch, never poured into a mould.' },
  { icon: Gem, meta: 'Step four', title: 'Setting', copy: 'Three setters, each specialising — pavé, closed kundan, and claw work. A single bridal choker can take one of them nine days.' },
  { icon: Hammer, meta: 'Step five', title: 'Finishing', copy: 'Filing, sanding through six grades, then the burnisher. This is the stage nobody photographs and the one that decides everything.' },
  { icon: Award, meta: 'Step six', title: 'Assay and hallmark', copy: 'To a BIS-recognised centre for testing and HUID marking, then back to us for a final polish and the certificate pack.' },
]

const VALUES = [
  { icon: Sparkles, meta: 'Value', title: 'Say the number out loud', copy: 'Rate, net weight, making charge, GST. Written down, handed over, before anyone commits to anything.' },
  { icon: HeartHandshake, meta: 'Value', title: 'The family over the sale', copy: 'We will recommend the lighter set if it suits her better. We would rather have the mother, the daughter and the cousin than one large invoice.' },
  { icon: Gem, meta: 'Value', title: 'Nothing sold on trust alone', copy: 'Hallmarks you can verify, certificates you can read, and an XRF machine we will run in front of you at any time.' },
]

export default function AboutPage() {
  useDocumentTitle('Our Story')

  return (
    <>
      <PageHero
        eyebrow="Since 2004 · Thakur Village, Mumbai"
        title="A room where you can ask anything"
        lede={BRAND.positioning}
        image="/images/editorial/heritage-mother-daughter.jpg"
        height="lg"
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Our Story' }]}
      />

      {/* ==================================================== brand story */}
      <section className="mj-section bg-ivory">
        <div className="mj-container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="mj-eyebrow mb-6">The name</p>
                <h2 className="mj-display text-display-md">Mayura</h2>
                <p className="mt-4 font-serif text-[1.375rem] italic text-bronze">
                  mayūra — the peacock
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={0.12}>
                <p className="text-body-lg leading-[1.95] text-charcoal-200">{BRAND.meaning}</p>
                <p className="mt-6 text-body leading-[1.95] text-charcoal-200">
                  It felt like the right word for a jewellery house. The peacock appears on temple
                  walls in Tamil Nadu, on Mughal enamel in Jaipur, and on a bangle a grandmother in
                  Kandivali has worn since 1974 — the same motif, understood the same way, across
                  every part of the country we serve. You will find it worked into our kadas, our
                  clasps, and the mark above our door.
                </p>
                <p className="mt-6 text-body leading-[1.95] text-charcoal-200">
                  Mayura opened in 2004, in three shop units in the Rangoli Building. What the
                  family brought with it was two generations of weighing gold across a counter, and
                  a fairly strong opinion about how that ought to be done. Twenty-two years later
                  the third generation runs it — 1,350 square feet, seventeen people, and the same
                  opinion.
                </p>
              </Reveal>
            </div>
          </div>

          <Flourish className="my-18 lg:my-24" />

          {/* ------------------------------------------- mission & vision */}
          <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="border-t border-charcoal/12 pt-8">
                <p className="mj-eyebrow mb-5">Our mission</p>
                <h3 className="font-display text-[1.5rem] leading-snug">
                  To make buying gold feel like arithmetic, not a negotiation.
                </h3>
                <p className="mt-5 text-body leading-[1.9] text-charcoal-200">
                  Every number that makes up a price is knowable. We write all of them down, hand
                  them over, and let the customer decide without anybody standing over them.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="border-t border-charcoal/12 pt-8">
                <p className="mj-eyebrow mb-5">Our vision</p>
                <h3 className="font-display text-[1.5rem] leading-snug">
                  To be the shop a family uses for three generations.
                </h3>
                <p className="mt-5 text-body leading-[1.9] text-charcoal-200">
                  Not the largest jeweller in Mumbai. The one a mother brings her daughter to,
                  because she was brought here herself, and because nothing about it has needed to
                  change.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================================================= craftsmanship */}
      <section id="craftsmanship" className="mj-scroll-mt mj-grain relative bg-espresso">
        <div className="mj-container py-section">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="mj-eyebrow-light mb-6">Craftsmanship</p>
              </Reveal>
              <RevealHeading
                as="h2"
                text="Six stages, eleven pairs of hands"
                className="mj-display text-display-md text-ivory"
              />
              <Reveal delay={0.15}>
                <p className="mt-7 text-body leading-[1.95] text-ivory/60">
                  Nothing leaves this workshop having been touched by only one person. A bridal
                  haram passes through the goldsmith, two setters, the polisher and the assay office
                  before anyone puts it in a box — and then it comes back for a final burnish.
                </p>
              </Reveal>
              <Reveal delay={0.22}>
                <div className="mt-10 overflow-hidden rounded-card">
                  <SmartImage
                    src="/images/editorial/kundan-bangles.jpg"
                    alt="Kundan kadas on the workshop bench"
                    ratio="aspect-[4/3]"
                  />
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-x-10 gap-y-11 sm:grid-cols-2">
                {PROCESS.map((step, index) => (
                  <StoryCard key={step.title} {...step} index={index} tone="light" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================= heritage */}
      <section id="workshop" className="mj-scroll-mt mj-section bg-ivory">
        <div className="mj-container">
          <SectionHeading
            eyebrow="Heritage"
            title="Seven years, told briefly"
            align="center"
            flourish
            className="mb-16 lg:mb-20"
          />

          <ol className="relative mx-auto max-w-3xl">
            <span
              className="absolute bottom-4 left-[5.5rem] top-4 hidden w-px bg-charcoal/12 sm:block"
              aria-hidden="true"
            />
            {TIMELINE.map((entry, index) => (
              <Reveal
                key={entry.year}
                as="li"
                delay={index * 0.06}
                className="relative flex flex-col gap-4 pb-12 last:pb-0 sm:flex-row sm:gap-10"
              >
                <span className="shrink-0 font-display text-[1.5rem] tabular-nums text-bronze sm:w-16 sm:text-right">
                  {entry.year}
                </span>
                <span
                  className="absolute left-[5.25rem] top-2.5 hidden h-2 w-2 rotate-45 bg-gold sm:block"
                  aria-hidden="true"
                />
                <span className="sm:pl-10">
                  <span className="block font-display text-[1.25rem] leading-snug text-charcoal">
                    {entry.title}
                  </span>
                  <span className="mt-3 block text-body-sm leading-[1.9] text-charcoal-200">
                    {entry.copy}
                  </span>
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ================================================= owner message */}
      <section className="mj-section bg-ivory-300">
        <div className="mj-container">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-18">
            <div className="lg:col-span-5">
              <ImageReveal
                src="/images/editorial/gold-haram-velvet.jpg"
                alt="A gold haram displayed on the counter"
                ratio="aspect-[4/5]"
              />
            </div>

            <div className="lg:col-span-7">
              <Reveal>
                <p className="mj-eyebrow mb-7">From the founder</p>
                <blockquote className="mj-quote">“{OWNER.message}”</blockquote>
                <footer className="mt-9 border-t border-charcoal/12 pt-7">
                  <p className="font-display text-[1.25rem] text-charcoal">{OWNER.name}</p>
                  <p className="mt-1.5 font-sans text-eyebrow uppercase tracking-luxe text-charcoal-50">
                    {OWNER.role}
                  </p>
                </footer>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== values */}
      <section className="mj-section bg-ivory">
        <div className="mj-container">
          <SectionHeading
            eyebrow="What we hold to"
            title="Three things we will not trade away"
            align="center"
            className="mb-16 lg:mb-20"
          />
          <div className="grid gap-x-12 gap-y-12 md:grid-cols-3">
            {VALUES.map((value, index) => (
              <StoryCard key={value.title} {...value} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== store photos */}
      <section className="mj-section-sm bg-ivory pb-section">
        <div className="mj-container">
          <SectionHeading
            eyebrow="The store"
            title="Rangoli Building, Vasant Utsav"
            lede="Three units, one long counter, and enough seating that nobody has to decide standing up."
            className="mb-12 lg:mb-16"
            link={ROUTES.gallery}
            linkLabel="Full gallery"
          />

          <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {[
              { src: '/images/editorial/trousseau-gold-set.jpg', alt: 'A gold suite laid out on the counter' },
              { src: '/images/editorial/layered-haram-trunk.jpg', alt: 'Layered harams with fitted trunks' },
              { src: '/images/editorial/bridal-gold-set-white.jpg', alt: 'A bridal gold set on white silk' },
              { src: '/images/editorial/studs-gold-rosette.jpg', alt: 'Gold rosette studs' },
            ].map((photo) => (
              <StaggerItem key={photo.src}>
                <SmartImage src={photo.src} alt={photo.alt} ratio="aspect-[4/5]" />
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.2} className="mt-14 flex flex-col items-center gap-4 text-center">
            <p className="max-w-xl text-body leading-[1.9] text-charcoal-200">
              Come and see it. Ask for tea. Take as long as you need — nobody will hurry you, and
              nobody works on commission.
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button variant="primary" to={ROUTES.contact}>
                Find us & book a viewing
              </Button>
              <Button variant="outline" to={ROUTES.collections}>
                Browse the collections
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
