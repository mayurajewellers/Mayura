import { Link } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import ImageReveal from '@components/motion/ImageReveal'
import Reveal from '@components/motion/Reveal'
import RevealHeading from '@components/motion/RevealHeading'

/** A quiet, trust-building close to the home page — where to actually find us. */
export default function VisitStore() {
  return (
    <section className="mj-grain relative bg-champagne" aria-labelledby="visit-store">
      <div className="mj-container py-section">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <ImageReveal
            src="/images/editorial/heritage-mother-daughter.jpg"
            alt="A mother and daughter at the counter"
            ratio="aspect-[4/3]"
            className="lg:order-2"
          />

          <div className="lg:order-1">
            <Reveal>
              <p className="mb-6 font-sans text-eyebrow uppercase tracking-luxe text-espresso/55">
                Come and see it
              </p>
            </Reveal>

            <RevealHeading
              as="h2"
              id="visit-store"
              text="Jewellery is a thing you should hold first."
              className="mj-display text-display-md text-espresso"
            />

            <Reveal delay={0.15}>
              <p className="mt-7 max-w-lg text-body leading-[1.9] text-espresso/70">
                A photograph cannot tell you how a haram sits on the collarbone or how a 22K bangle
                sounds against another. Come in, ask for tea, and take as long as you need. Nobody
                will hurry you.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <address className="mt-10 space-y-5 not-italic">
                <a
                  href={CONTACT.mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4 text-body-sm leading-relaxed text-espresso/75 transition-colors duration-300 hover:text-espresso"
                >
                  <MapPin className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 text-espresso/50" strokeWidth={1.3} aria-hidden="true" />
                  <span>
                    <span className="block font-sans font-medium text-espresso">
                      Mayura Jewellers
                    </span>
                    {CONTACT.addressLines.slice(0, 4).map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                    <span className="mj-underline mt-2 inline-block font-sans text-eyebrow uppercase tracking-luxe text-espresso/60">
                      Get directions
                    </span>
                  </span>
                </a>

                <div className="flex gap-4 text-body-sm text-espresso/75">
                  <Clock className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 text-espresso/50" strokeWidth={1.3} aria-hidden="true" />
                  <span>
                    <span className="block">Monday to Saturday · 11:00 am — 8:30 pm</span>
                    <span className="block">Sunday · 11:00 am — 6:00 pm</span>
                  </span>
                </div>

                <a
                  href={`tel:+${CONTACT.phonePrimaryRaw}`}
                  className="flex gap-4 text-body-sm text-espresso/75 transition-colors duration-300 hover:text-espresso"
                >
                  <Phone className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 text-espresso/50" strokeWidth={1.3} aria-hidden="true" />
                  {CONTACT.phonePrimary}
                </a>
              </address>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <a
                  href={CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/wa mj-btn-primary"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  <span className="relative z-10">Book a viewing</span>
                </a>
                <Link to={ROUTES.contact} className="group/c mj-btn-outline">
                  <span className="relative z-10">Contact & FAQs</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-500 ease-luxe group-hover/c:translate-x-1"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
