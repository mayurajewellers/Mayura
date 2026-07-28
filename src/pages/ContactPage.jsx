import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Check,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Youtube,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import {
  BUSINESS_DETAILS,
  BUSINESS_HOURS,
  CONTACT,
  OWNER,
  SOCIAL_LINKS,
} from '@constants/site'
import { TOP_FAQS } from '@data/faq'
import { useDocumentTitle } from '@hooks/index'
import PageHero from '@components/layout/PageHero'
import SectionHeading from '@components/common/SectionHeading'
import Accordion from '@components/common/Accordion'
import Button from '@components/common/Button'
import SmartImage from '@components/common/SmartImage'
import Reveal from '@components/motion/Reveal'
import { SelectField, TextArea, TextField } from '@components/common/Field'
import { SpecList } from '@components/common/index.jsx'
import { Stagger, StaggerItem } from '@components/motion/Stagger'

const SOCIAL_ICONS = { instagram: Instagram, facebook: Facebook, youtube: Youtube, whatsapp: MessageCircle }

const ENQUIRY_TYPES = [
  'General enquiry',
  'Bridal commission',
  'Custom design',
  'Repair or resizing',
  'Old gold exchange',
  'Book a viewing',
]

export default function ContactPage() {
  useDocumentTitle('Contact')
  const [sent, setSent] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSent(true)
    event.currentTarget.reset()
    window.setTimeout(() => setSent(false), 8000)
  }

  return (
    <>
      <PageHero
        eyebrow="Visit, call or write"
        title="Come and see it in person"
        lede="A photograph cannot tell you how a haram sits on the collarbone. We are on Thakur Village, six days a week, and the tea is good."
        image="/images/editorial/bridal-gold-set-white.jpg"
        height="md"
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Contact' }]}
      />

      {/* ============================================== details + form */}
      <section className="mj-section bg-ivory">
        <div className="mj-container">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            {/* ---------------------------------------------- details */}
            <div className="lg:col-span-5">
              <Reveal>
                <p className="mj-eyebrow mb-6">The shop</p>
                <h2 className="mj-display text-display-sm">{CONTACT.businessName}</h2>
              </Reveal>

              <Reveal delay={0.08}>
                <address className="mt-9 space-y-7 not-italic">
                  <div className="flex gap-4">
                    <Building2 className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 text-bronze" strokeWidth={1.3} aria-hidden="true" />
                    <div>
                      <p className="mj-eyebrow mb-1.5">Proprietor</p>
                      <p className="font-sans text-body text-charcoal">{OWNER.name}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <MapPin className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 text-bronze" strokeWidth={1.3} aria-hidden="true" />
                    <div>
                      <p className="mj-eyebrow mb-1.5">Address</p>
                      {CONTACT.addressLines.map((line) => (
                        <p key={line} className="font-sans text-body leading-relaxed text-charcoal">
                          {line}
                        </p>
                      ))}
                      <a
                        href={CONTACT.mapDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 font-sans text-eyebrow uppercase tracking-luxe text-bronze transition-colors duration-300 hover:text-charcoal"
                      >
                        <Navigation className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                        <span className="mj-underline">Get directions</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Phone className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 text-bronze" strokeWidth={1.3} aria-hidden="true" />
                    <div>
                      <p className="mj-eyebrow mb-1.5">Telephone</p>
                      <a
                        href={`tel:+${CONTACT.phonePrimaryRaw}`}
                        className="mj-link font-sans text-body text-charcoal"
                      >
                        {CONTACT.phonePrimary}
                      </a>
                      <p className="mt-1 font-sans text-body-xs text-charcoal-50">
                        Also on WhatsApp — the fastest way to reach us
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Mail className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 text-bronze" strokeWidth={1.3} aria-hidden="true" />
                    <div>
                      <p className="mj-eyebrow mb-1.5">Email</p>
                      <a
                        href={`mailto:${CONTACT.email}`}
                        className="mj-link break-all font-sans text-body text-charcoal"
                      >
                        {CONTACT.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Clock className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 text-bronze" strokeWidth={1.3} aria-hidden="true" />
                    <div className="w-full max-w-xs">
                      <p className="mj-eyebrow mb-3">Business hours</p>
                      <dl className="divide-y divide-charcoal/[0.07]">
                        {BUSINESS_HOURS.map((entry) => (
                          <div key={entry.day} className="flex items-baseline justify-between gap-4 py-2">
                            <dt className="font-sans text-body-sm text-charcoal-200">{entry.day}</dt>
                            <dd className="text-right font-sans text-body-sm tabular-nums text-charcoal">
                              {entry.hours}
                              {entry.note && (
                                <span className="block font-sans text-body-xs text-charcoal-50">
                                  {entry.note}
                                </span>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </address>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="primary"
                    href={CONTACT.whatsappUrl}
                    target="_blank"
                    icon={MessageCircle}
                    iconPosition="left"
                  >
                    Chat on WhatsApp
                  </Button>
                  <Button variant="outline" href={`tel:+${CONTACT.phonePrimaryRaw}`} icon={Phone} iconPosition="left">
                    Call the shop
                  </Button>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <ul className="mt-10 flex gap-2.5">
                  {SOCIAL_LINKS.map((social) => {
                    const Icon = SOCIAL_ICONS[social.icon] ?? Instagram
                    return (
                      <li key={social.label}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Mayura Jewellers on ${social.label}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/12 text-charcoal-100 transition-all duration-400 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-espresso"
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </Reveal>
            </div>

            {/* ------------------------------------------------- form */}
            <div className="lg:col-span-7">
              <Reveal delay={0.1}>
                <div className="mj-panel p-8 sm:p-11">
                  <p className="mj-eyebrow mb-5">Write to us</p>
                  <h2 className="mj-display text-display-xs">Tell us what you are looking for</h2>
                  <p className="mt-4 text-body-sm leading-[1.9] text-charcoal-200">
                    The more you tell us — the occasion, the budget, the saree — the more useful our
                    first reply will be. We answer within one working day.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-9 space-y-7">
                    <div className="grid gap-7 sm:grid-cols-2">
                      <TextField label="Full name" name="name" required placeholder="Your name" autoComplete="name" />
                      <TextField
                        label="Mobile number"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+91 00000 00000"
                        autoComplete="tel"
                      />
                    </div>

                    <div className="grid gap-7 sm:grid-cols-2">
                      <TextField
                        label="Email address"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                      <SelectField label="Enquiry type" name="type" options={ENQUIRY_TYPES} required />
                    </div>

                    <TextArea
                      label="Your message"
                      name="message"
                      required
                      rows={5}
                      placeholder="For example: I am looking for a bridal set for a December wedding, around 60 grams, with a matched pair of jhumkas."
                    />

                    <div className="flex flex-col items-start gap-5 border-t border-charcoal/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-xs font-sans text-body-xs leading-relaxed text-charcoal-50">
                        Demonstration form — nothing is transmitted. Please WhatsApp or call for a
                        real enquiry.
                      </p>
                      <Button type="submit" variant="primary" className="shrink-0">
                        {sent ? 'Message noted' : 'Send message'}
                      </Button>
                    </div>

                    {sent && (
                      <p
                        role="status"
                        className="flex items-center gap-2.5 rounded-luxe border border-success/25 bg-success-light px-4 py-3.5 font-sans text-body-sm text-success-dark"
                      >
                        <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                        Thank you. This is a frontend demonstration, so nothing was actually sent —
                        please reach us on {CONTACT.phonePrimary}.
                      </p>
                    )}
                  </form>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ map */}
      <section className="border-y border-charcoal/[0.07] bg-ivory-300">
        <div className="mj-container py-16 lg:py-20">
          <SectionHeading
            eyebrow="Find us"
            title="Two minutes from Thakur Village bus depot"
            lede="Parking is available in the Rangoli Building compound. The nearest station is Kandivali East on the Western Line."
            className="mb-10"
          />

          <Reveal>
            <div className="relative overflow-hidden rounded-panel border border-charcoal/[0.07] bg-champagne-100">
              <iframe
                title="Map showing Mayura Jewellers, Vasant Utsav, Thakur Village, Mumbai"
                src={CONTACT.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[22rem] w-full border-0 lg:h-[30rem]"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <p className="max-w-lg text-body-sm leading-relaxed text-charcoal-200">
                {CONTACT.addressOneLine}
              </p>
              <Button variant="outline" href={CONTACT.mapDirectionsUrl} target="_blank" icon={Navigation} iconPosition="left">
                Open in Google Maps
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================ store gallery */}
      <section className="mj-section-sm bg-ivory">
        <div className="mj-container">
          <SectionHeading
            eyebrow="Inside the shop"
            title="What it looks like when you walk in"
            className="mb-12"
            link={ROUTES.gallery}
            linkLabel="See the gallery"
          />
          <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {[
              { src: '/images/editorial/gold-haram-velvet.jpg', alt: 'A gold haram on the display counter' },
              { src: '/images/editorial/kundan-bangles.jpg', alt: 'Kundan kadas in the showcase' },
              { src: '/images/editorial/trousseau-gold-set.jpg', alt: 'A trousseau suite laid out' },
              { src: '/images/editorial/bridal-polki-necklace.jpg', alt: 'A polki choker in its fitted box' },
            ].map((photo) => (
              <StaggerItem key={photo.src}>
                <SmartImage src={photo.src} alt={photo.alt} ratio="aspect-square" />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============================================ business details */}
      <section className="mj-section-sm bg-ivory">
        <div className="mj-container">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading eyebrow="Business details" title="For your records" size="md" className="mb-8" />
              <Reveal delay={0.1}>
                <SpecList items={BUSINESS_DETAILS} />
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <SectionHeading
                eyebrow="Before you ask"
                title="The five questions we hear most"
                size="md"
                className="mb-6"
                link={ROUTES.faq}
                linkLabel="All FAQs"
              />
              <Reveal delay={0.1}>
                <Accordion items={TOP_FAQS} allowMultiple />
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-8 text-body-sm leading-relaxed text-charcoal-200">
                  Anything else, ask us directly —{' '}
                  <Link to={ROUTES.faq} className="mj-link text-charcoal">
                    read the full FAQ
                  </Link>{' '}
                  or send a WhatsApp to {CONTACT.phonePrimary}.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
