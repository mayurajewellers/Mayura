import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Facebook,
  Flame,
  Home,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  ScanLine,
  Search,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { BRAND, CONTACT, OWNER } from '@constants/site'
import {
  DIGITAL_CHANNELS,
  HALLMARK_POINTS,
  LEGACY_INTRO,
  LEGACY_STATS,
  SERVICES,
  SPECIALITIES,
  WHY_MAYURA,
} from '@data/legacy'
import { useDocumentTitle } from '@hooks/index'
import { EASE_LUXE } from '@constants/motion'
import PageHero from '@components/layout/PageHero'
import SectionHeading from '@components/common/SectionHeading'
import ImageReveal from '@components/motion/ImageReveal'
import Reveal from '@components/motion/Reveal'
import Button from '@components/common/Button'
import Flourish from '@components/common/Flourish'
import SmartImage from '@components/common/SmartImage'
import { JEWEL_ICONS } from '@components/common/JewelIcons'
import { Stagger, StaggerItem } from '@components/motion/Stagger'

const SERVICE_ICONS = { scan: ScanLine, flame: Flame, wrench: Wrench, home: Home }
const CHANNEL_ICONS = { instagram: Instagram, whatsapp: MessageCircle, directory: Search }

export default function LegacyPage() {
  useDocumentTitle('Our Legacy')

  return (
    <>
      <PageHero
        eyebrow={LEGACY_INTRO.eyebrow}
        title={LEGACY_INTRO.title}
        lede={LEGACY_INTRO.lede}
        image="/images/editorial/heritage-mother-daughter.jpg"
        height="lg"
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Our Legacy' }]}
      />

      {/* ========================================================= figures */}
      <section className="border-b border-charcoal/[0.07] bg-champagne" aria-label="The house in figures">
        <div className="mj-container py-14 lg:py-16">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
            {LEGACY_STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: index * 0.09, ease: EASE_LUXE }}
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-display-md leading-none text-espresso">
                    {stat.value}
                  </span>
                  <span className="mt-4 block font-sans text-eyebrow uppercase tracking-luxe text-espresso/55">
                    {stat.label}
                  </span>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </section>

      {/* ==================================================== specialities */}
      <section id="specialities" className="mj-scroll-mt mj-section bg-ivory">
        <div className="mj-container">
          <SectionHeading
            eyebrow="Our specialities"
            title="What we are known for"
            lede="A wide and exclusive collection, curated over two decades of listening to what Kandivali actually asks for."
            className="mb-14 lg:mb-18"
          />

          <Stagger className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-14">
            {SPECIALITIES.map((item) => {
              const Icon = JEWEL_ICONS[item.icon] ?? JEWEL_ICONS.plume
              return (
                <StaggerItem key={item.title}>
                  <Link
                    to={ROUTES.collection(item.to)}
                    className="group/spec block border-t border-charcoal/12 pt-8 transition-colors duration-500"
                  >
                    <span className="relative block">
                      <span
                        className="absolute -top-[calc(2rem+1px)] left-0 h-px w-0 bg-gold transition-[width] duration-900 ease-luxe group-hover/spec:w-full"
                        aria-hidden="true"
                      />
                      <Icon className="mb-6 h-7 w-7 text-bronze" />
                      <span className="block font-display text-[1.25rem] leading-snug text-charcoal transition-colors duration-300 group-hover/spec:text-bronze">
                        {item.title}
                      </span>
                      <span className="mt-3.5 block text-body-sm leading-[1.9] text-charcoal-200">
                        {item.copy}
                      </span>
                      <span className="mt-6 inline-flex items-center gap-2 font-sans text-eyebrow uppercase tracking-luxe text-charcoal-100 transition-colors duration-300 group-hover/spec:text-bronze">
                        Explore
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform duration-500 ease-luxe group-hover/spec:translate-x-1"
                          strokeWidth={1.4}
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  </Link>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>
      </section>

      {/* ======================================================== services */}
      <section id="services" className="mj-scroll-mt mj-grain relative bg-espresso">
        <div className="mj-container py-section">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="In store & at home"
                title="More than a shop counter"
                lede="Four things we do for anyone who walks in — customer or not, and in three cases for nothing at all."
                tone="light"
                className="mb-10"
              />
              <Reveal delay={0.15}>
                <div className="overflow-hidden rounded-card">
                  <SmartImage
                    src="/images/editorial/gold-haram-velvet.jpg"
                    alt="Gold jewellery on the counter"
                    ratio="aspect-[4/3]"
                  />
                </div>
              </Reveal>
              <Reveal delay={0.22}>
                <Button
                  variant="gold"
                  className="mt-8"
                  href={CONTACT.whatsappUrl}
                  target="_blank"
                  icon={MessageCircle}
                  iconPosition="left"
                >
                  Book a home visit
                </Button>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <ul className="divide-y divide-ivory/12">
                {SERVICES.map((service, index) => {
                  const Icon = SERVICE_ICONS[service.icon] ?? Wrench
                  return (
                    <Reveal
                      as="li"
                      key={service.title}
                      delay={index * 0.07}
                      className="flex gap-6 py-8 first:pt-0 last:pb-0"
                    >
                      <span
                        className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.07]"
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5 text-gold-200" strokeWidth={1.1} />
                      </span>
                      <span>
                        <span className="block font-display text-[1.375rem] leading-snug text-ivory">
                          {service.title}
                        </span>
                        <span className="mt-3 block text-body leading-[1.9] text-ivory/60">
                          {service.copy}
                        </span>
                      </span>
                    </Reveal>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== hallmarking */}
      <section id="hallmark" className="mj-scroll-mt mj-section bg-ivory">
        <div className="mj-container">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-18">
            <div className="lg:col-span-5">
              <ImageReveal
                src="/images/editorial/studs-gold-rosette.jpg"
                alt="Hallmarked gold studs"
                ratio="aspect-[4/5]"
              />
            </div>

            <div className="lg:col-span-7">
              <Reveal>
                <span className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-success/25 bg-success-light px-4 py-2 font-sans text-eyebrow uppercase tracking-luxe text-success-dark">
                  <BadgeCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  100% BIS Hallmark Certified
                </span>
              </Reveal>

              <SectionHeading
                title="A fully BIS-licensed hallmark store"
                lede="Peace of mind and authenticity in every piece — and three ways to check it yourself rather than take our word for it."
                size="lg"
                className="mb-10"
              />

              <ul className="divide-y divide-charcoal/10">
                {HALLMARK_POINTS.map((point, index) => (
                  <Reveal as="li" key={point.title} delay={index * 0.07} className="flex gap-5 py-6">
                    <ShieldCheck
                      className="mt-1 h-5 w-5 shrink-0 text-bronze"
                      strokeWidth={1.2}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block font-sans text-body font-medium text-charcoal">
                        {point.title}
                      </span>
                      <span className="mt-2 block text-body-sm leading-[1.9] text-charcoal-200">
                        {point.copy}
                      </span>
                    </span>
                  </Reveal>
                ))}
              </ul>

              <Reveal delay={0.24}>
                <Button variant="outline" className="mt-9" to={`${ROUTES.faq}#purity-certification`}>
                  How to verify a hallmark
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== the family */}
      <section className="mj-section bg-ivory-300">
        <div className="mj-container">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-18">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="mj-eyebrow mb-6">A third-generation legacy</p>
                <h2 className="mj-display text-display-md">
                  Growing with a fresh vision, holding on to timeless values
                </h2>
                <p className="mt-7 text-body-lg leading-[1.95] text-charcoal-200">
                  Mayura Jewellers is now run by the third generation of the Bhandari family. With a
                  store size of 1,350 square feet and a dedicated team of seventeen professionals,
                  we are proud to be the largest jewellery showroom in Kandivali.
                </p>
                <p className="mt-6 text-body leading-[1.95] text-charcoal-200">
                  What has not changed across those three generations is the counter itself — the
                  part where somebody sits down, asks a question, and gets a straight answer. Every
                  customer is treated like family, because a great many of them are the children of
                  customers we have known for twenty years.
                </p>
              </Reveal>

              <Flourish className="my-10 ml-0" />

              <Reveal delay={0.15}>
                <blockquote className="mj-quote max-w-2xl">“{OWNER.message}”</blockquote>
                <footer className="mt-7">
                  <p className="font-display text-[1.25rem] text-charcoal">{OWNER.name}</p>
                  <p className="mt-1.5 font-sans text-eyebrow uppercase tracking-luxe text-charcoal-50">
                    {OWNER.role} · Third generation
                  </p>
                </footer>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <ImageReveal
                src="/images/editorial/bride-telugu.jpg"
                alt="A customer wearing a Mayura bridal set"
                ratio="aspect-[4/5]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== why us */}
      <section className="mj-section bg-ivory">
        <div className="mj-container">
          <SectionHeading
            eyebrow="Why choose Mayura"
            title="Every customer is treated like family"
            align="center"
            flourish
            className="mb-16 lg:mb-20"
          />

          <Stagger className="grid gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            {WHY_MAYURA.map((item, index) => (
              <StaggerItem key={item.title}>
                <div className="border-t border-charcoal/12 pt-8">
                  <span className="mb-5 block font-display text-[2rem] leading-none text-gold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-[1.1875rem] leading-snug text-charcoal">
                    {item.title}
                  </h3>
                  <p className="mt-3.5 text-body-sm leading-[1.9] text-charcoal-200">{item.copy}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ======================================================== digital */}
      <section className="mj-section-sm bg-ivory-300 py-section">
        <div className="mj-container">
          <SectionHeading
            eyebrow="Embracing the digital era"
            title="The same Mayura experience, on your screen"
            lede="We bring the shop to you — stay updated on trends, offers and collections any time, anywhere."
            className="mb-14"
          />

          <Stagger className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {DIGITAL_CHANNELS.map((channel) => {
              const Icon = CHANNEL_ICONS[channel.icon] ?? Instagram
              return (
                <StaggerItem key={channel.title}>
                  <div className="mj-card mj-card-hover h-full p-8">
                    <Icon className="mb-6 h-6 w-6 text-bronze" strokeWidth={1.1} aria-hidden="true" />
                    <h3 className="font-display text-[1.1875rem] leading-snug text-charcoal">
                      {channel.title}
                    </h3>
                    <p className="mt-3.5 text-body-sm leading-[1.9] text-charcoal-200">
                      {channel.copy}
                    </p>
                  </div>
                </StaggerItem>
              )
            })}
          </Stagger>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" size="sm" href="https://instagram.com/" target="_blank" icon={Instagram} iconPosition="left">
                Instagram
              </Button>
              <Button variant="outline" size="sm" href="https://facebook.com/" target="_blank" icon={Facebook} iconPosition="left">
                Facebook
              </Button>
              <Button variant="outline" size="sm" href={CONTACT.whatsappUrl} target="_blank" icon={MessageCircle} iconPosition="left">
                WhatsApp
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================================================== visit */}
      <section className="mj-grain relative bg-espresso">
        <div className="mj-container py-section text-center">
          <Reveal>
            <p className="mj-eyebrow-light mb-6">Visit us today</p>
            <h2 className="mj-display mx-auto max-w-2xl text-display-md text-ivory">
              {BRAND.name}
            </h2>
            <address className="mx-auto mt-7 max-w-md not-italic">
              <p className="text-body-lg leading-[1.9] text-ivory/65">
                Thakur Village, Kandivali East, Mumbai
              </p>
              <p className="mt-2 text-body-sm leading-relaxed text-ivory/45">
                {CONTACT.addressOneLine}
              </p>
            </address>

            <div className="mt-11 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Button
                variant="gold"
                href={CONTACT.mapDirectionsUrl}
                target="_blank"
                icon={MapPin}
                iconPosition="left"
              >
                Get directions
              </Button>
              <Button
                variant="outlineLight"
                href={`tel:+${CONTACT.phonePrimaryRaw}`}
                icon={Phone}
                iconPosition="left"
              >
                {CONTACT.phonePrimary}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
