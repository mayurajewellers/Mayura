import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { BRAND, CONTACT, NEWSLETTER, SOCIAL_LINKS } from '@constants/site'
import { FOOTER_COLUMNS } from '@data/navigation'
import Reveal from '@components/motion/Reveal'
import Flourish from '@components/common/Flourish'
import cn from '@utils/cn'

const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  whatsapp: MessageCircle,
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (event) => {
    event.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
    window.setTimeout(() => setSubscribed(false), 5000)
  }

  return (
    <footer className="relative mj-grain overflow-hidden bg-espresso text-ivory">
      {/* ================================================== newsletter band */}
      <section className="border-b border-ivory/10" aria-labelledby="newsletter-heading">
        <div className="mj-container py-20 lg:py-26">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
            <Reveal>
              <p className="mj-eyebrow-light mb-5">{NEWSLETTER.eyebrow}</p>
              <h2 id="newsletter-heading" className="mj-display text-display-md text-ivory">
                {NEWSLETTER.heading}
              </h2>
              <p className="mt-5 max-w-md text-body leading-[1.9] text-ivory/60">
                {NEWSLETTER.copy}
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <form onSubmit={handleSubscribe} className="lg:pl-8">
                <label htmlFor="footer-email" className="mj-field-label text-ivory/50">
                  Email address
                </label>
                <div className="flex items-end gap-4 border-b border-ivory/25 transition-colors duration-400 focus-within:border-gold">
                  <input
                    id="footer-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mj-field-line-light flex-1 border-0"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to the Mayura Letter"
                    className="group/sub mb-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-all duration-400 ease-luxe hover:border-gold hover:bg-gold hover:text-espresso"
                  >
                    {subscribed ? (
                      <Check className="h-4 w-4" strokeWidth={1.6} />
                    ) : (
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-400 group-hover/sub:translate-x-0.5"
                        strokeWidth={1.4}
                      />
                    )}
                  </button>
                </div>
                <p className="mt-4 font-sans text-body-xs text-ivory/40" role="status">
                  {subscribed
                    ? 'Thank you — you are on the list. (Demonstration only; nothing was sent.)'
                    : 'No more than one letter a month. Unsubscribe whenever you like.'}
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ======================================================= main body */}
      <div className="mj-container py-20 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* ------------------------------------------------ brand block */}
          <div className="lg:col-span-4 lg:pr-12">
            <img
              src="/images/brand/mayura-logo-transparent.png"
              alt={BRAND.name}
              className="h-14 w-auto object-contain object-left"
            />
            <p className="mt-7 max-w-sm text-body-sm leading-[1.95] text-ivory/55">
              {BRAND.meaning}
            </p>

            <address className="mt-9 not-italic">
              <a
                href={CONTACT.mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/addr flex gap-3.5 text-body-sm leading-relaxed text-ivory/60 transition-colors duration-300 hover:text-ivory"
              >
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={1.3} aria-hidden="true" />
                <span>
                  {CONTACT.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </a>

              <a
                href={`tel:+${CONTACT.phonePrimaryRaw}`}
                className="mt-5 flex items-center gap-3.5 text-body-sm text-ivory/60 transition-colors duration-300 hover:text-ivory"
              >
                <Phone className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.3} aria-hidden="true" />
                {CONTACT.phonePrimary}
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="mt-3 flex items-center gap-3.5 break-all text-body-sm text-ivory/60 transition-colors duration-300 hover:text-ivory"
              >
                <Mail className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.3} aria-hidden="true" />
                {CONTACT.email}
              </a>
            </address>

            <ul className="mt-9 flex gap-2.5">
              {SOCIAL_LINKS.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon] ?? Instagram
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${BRAND.name} on ${social.label}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/18 text-ivory/65 transition-all duration-400 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:bg-gold hover:text-espresso"
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* ------------------------------------------------ link columns */}
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.title} aria-labelledby={`footer-${column.title}`}>
                <p
                  id={`footer-${column.title}`}
                  className="mj-eyebrow-light mb-6 border-b border-ivory/12 pb-4"
                >
                  {column.title}
                </p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-body-sm text-ivory/55 transition-colors duration-300 hover:text-gold-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <Flourish className="my-14" tone="light" />

        {/* --------------------------------------------------- fine print */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-body-xs text-ivory/40">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved. Proprietor: Darshil
            Bhandari.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: 'Terms', to: ROUTES.terms },
              { label: 'Privacy', to: ROUTES.privacy },
              { label: 'Shipping', to: ROUTES.shipping },
              { label: 'Returns', to: ROUTES.returns },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="font-sans text-body-xs text-ivory/40 transition-colors duration-300 hover:text-gold-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className={cn('mt-8 max-w-3xl font-sans text-[0.6875rem] leading-relaxed text-ivory/25')}>
          This website is a frontend showcase. It has no server, no payment processing and no user
          accounts — the sign-in, bag and checkout screens are demonstrations. To place an order,
          call or WhatsApp {CONTACT.phonePrimary}, or visit us at Thakur Village.
        </p>
      </div>
    </footer>
  )
}
