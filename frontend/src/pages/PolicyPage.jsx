import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, MessageCircle } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { POLICIES } from '@data/policies'
import { useDocumentTitle } from '@hooks/index'
import policyService from '@services/policyService'
import { formatDate } from '@utils/format'
import PageHero from '@components/layout/PageHero'
import Button from '@components/common/Button'
import Reveal from '@components/motion/Reveal'
import cn from '@utils/cn'

const RELATED = [
  { key: 'terms', label: 'Terms & Conditions', to: ROUTES.terms },
  { key: 'privacy', label: 'Privacy Policy', to: ROUTES.privacy },
  { key: 'shipping', label: 'Shipping Policy', to: ROUTES.shipping },
  { key: 'returns', label: 'Return Policy', to: ROUTES.returns },
]

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/** Turns a bare bis.gov.in mention into a real link, leaving the rest as-is. */
function Clause({ text }) {
  const parts = String(text).split(/(www\.bis\.gov\.in)/g)
  return (
    <>
      {parts.map((part, index) =>
        part === 'www.bis.gov.in' ? (
          <a
            key={index}
            href="https://www.bis.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="mj-link text-charcoal"
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  )
}

/** Shared renderer for all legal pages. */
export default function PolicyPage({ policyKey }) {
  const staticFallback = POLICIES[policyKey]
  const [policy, setPolicy] = useState(() => staticFallback)
  const [active, setActive] = useState(null)

  useEffect(() => {
    let isSubscribed = true
    const slugMap = {
      terms: 'terms-and-conditions',
      privacy: 'privacy-policy',
      shipping: 'shipping-policy',
      returns: 'return-policy',
    }
    const slug = slugMap[policyKey] || policyKey

    policyService
      .getPolicyBySlug(slug)
      .then((res) => {
        if (!isSubscribed) return
        if (res.success && res.policy) {
          setPolicy(res.policy)
        }
      })
      .catch(() => {})

    return () => {
      isSubscribed = false
    }
  }, [policyKey])

  useDocumentTitle(policy?.title ?? 'Policy')

  if (!policy) return null

  const sections = Array.isArray(policy.sections) ? policy.sections : []

  return (
    <>
      <PageHero
        eyebrow={policy.kicker}
        title={policy.title}
        lede={policy.intro}
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: policy.title }]}
      >
        <p className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-charcoal/12 px-4 py-2 font-sans text-body-xs text-charcoal-100">
          <FileText className="h-3.5 w-3.5 text-bronze" strokeWidth={1.4} aria-hidden="true" />
          Last updated {formatDate(policy.updated)}
        </p>
      </PageHero>

      <section className="mj-section bg-ivory">
        <div className="mj-container">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            {/* ------------------------------------------------ contents */}
            <aside className="lg:col-span-3">
              <nav aria-label="On this page" className="lg:sticky lg:top-32">
                <p className="mj-eyebrow mb-6 border-b border-charcoal/10 pb-4">On this page</p>
                <ul className="space-y-0.5">
                  {sections.map((section) => {
                    const id = slugify(section.heading)
                    return (
                      <li key={section.heading}>
                        <a
                          href={`#${id}`}
                          onClick={() => setActive(id)}
                          className={cn(
                            'block rounded-luxe px-3 py-2 font-sans text-body-xs leading-relaxed transition-colors duration-300',
                            active === id
                              ? 'bg-champagne-50 text-bronze'
                              : 'text-charcoal-100 hover:bg-champagne-50/60 hover:text-charcoal',
                          )}
                        >
                          {section.heading}
                        </a>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-10 border-t border-charcoal/10 pt-8">
                  <p className="mj-eyebrow mb-4">Other policies</p>
                  <ul className="space-y-2">
                    {RELATED.filter((item) => item.key !== policyKey).map((item) => (
                      <li key={item.key}>
                        <Link
                          to={item.to}
                          className="mj-link font-sans text-body-sm text-charcoal-200"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            </aside>

            {/* -------------------------------------------------- content */}
            <div className="lg:col-span-9">
              <div className="max-w-3xl space-y-14">
                {sections.map((section) => (
                  <Reveal
                    key={section.heading}
                    as="section"
                    id={slugify(section.heading)}
                    className="mj-scroll-mt"
                    distance={16}
                  >
                    <h2 className="font-display text-[1.375rem] leading-snug text-charcoal">
                      {section.heading}
                    </h2>

                    {policy.variant === 'clauses' && section.heading !== 'Contact us about this policy' ? (
                      <ul className="mt-5 space-y-4">
                        {Array.isArray(section.paragraphs) &&
                          section.paragraphs.map((clause, index) => (
                            <li key={index} className="flex gap-4">
                              <span
                                className="mt-[0.72rem] h-1 w-1 shrink-0 rotate-45 bg-gold"
                                aria-hidden="true"
                              />
                              <span className="text-body leading-[1.95] text-charcoal-200">
                                <Clause text={clause} />
                              </span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="mt-5 space-y-4">
                        {Array.isArray(section.paragraphs) &&
                          section.paragraphs.map((paragraph, index) => (
                            <p key={index} className="text-body leading-[1.95] text-charcoal-200">
                              <Clause text={paragraph} />
                            </p>
                          ))}
                      </div>
                    )}
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.1}>
                <div className="mt-16 rounded-panel border border-charcoal/[0.08] bg-champagne-50 p-8 sm:p-10">
                  <p className="mj-eyebrow mb-5">A note on this document</p>
                  <p className="max-w-2xl text-body-sm leading-[1.95] text-charcoal-200">
                    {policy.variant === 'clauses'
                      ? 'These are the showroom’s own terms of trade, reproduced as displayed at our counter. They apply to every transaction. If a clause affects a purchase you are considering, ask us to walk you through it before you commit.'
                      : 'This policy is written for a jewellery retailer operating in India and is provided for information. It is not legal advice. Statutory references, GST rates and thresholds change — please have your advocate review this text and confirm the current position before you rely on it.'}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      href={CONTACT.whatsappUrl}
                      target="_blank"
                      icon={MessageCircle}
                      iconPosition="left"
                    >
                      Ask us about this
                    </Button>
                    <Button variant="ghost" size="sm" to={ROUTES.faq}>
                      Read the FAQ
                    </Button>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
