import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Phone, Search } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { ALL_FAQS as STATIC_ALL_FAQS, FAQ_CATEGORIES as STATIC_CATEGORIES } from '@data/faq'
import { useDocumentTitle } from '@hooks/index'
import faqService from '@services/faqService'
import PageHero from '@components/layout/PageHero'
import Accordion from '@components/common/Accordion'
import Button from '@components/common/Button'
import Reveal from '@components/motion/Reveal'
import cn from '@utils/cn'

export default function FaqPage() {
  useDocumentTitle('Frequently Asked Questions')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState('all')
  const [categories, setCategories] = useState(() => STATIC_CATEGORIES)
  const [allFaqs, setAllFaqs] = useState(() => STATIC_ALL_FAQS)

  useEffect(() => {
    let isSubscribed = true
    faqService
      .getFaqs()
      .then((res) => {
        if (!isSubscribed) return
        if (res.success && res.faqs && res.faqs.length > 0) {
          setAllFaqs(res.faqs)
          if (res.categories && res.categories.length > 0) {
            setCategories(res.categories)
          }
        }
      })
      .catch(() => {})

    return () => {
      isSubscribed = false
    }
  }, [])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return allFaqs.filter(
      (item) => (item.q || '').toLowerCase().includes(q) || (item.a || '').toLowerCase().includes(q),
    )
  }, [query, allFaqs])

  const visibleCategories =
    active === 'all' ? categories : categories.filter((c) => c.id === active)

  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Frequently asked questions"
        lede="Purity, delivery, payment, sizing, care and customisation — answered properly rather than briefly. If something is missing, ask us and we will add it."
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'FAQ' }]}
      >
        <div className="mt-10 max-w-xl">
          <label htmlFor="faq-search" className="sr-only">
            Search the FAQ
          </label>
          <div className="flex items-center gap-4 border-b border-charcoal/20 pb-3.5 transition-colors duration-400 focus-within:border-gold">
            <Search className="h-4 w-4 shrink-0 text-bronze" strokeWidth={1.4} aria-hidden="true" />
            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search — hallmark, delivery, resize, exchange…"
              className="w-full border-0 bg-transparent p-0 font-sans text-body text-charcoal placeholder:text-charcoal-50/70 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </PageHero>

      <section className="mj-section bg-ivory">
        <div className="mj-container">
          {matches ? (
            /* ------------------------------------------ search results */
            <div className="mx-auto max-w-3xl">
              <p className="mj-eyebrow mb-8">
                {matches.length} {matches.length === 1 ? 'answer' : 'answers'} for “{query}”
              </p>
              {matches.length ? (
                <Accordion items={matches} allowMultiple defaultOpen={[0]} />
              ) : (
                <div className="py-16 text-center">
                  <p className="font-display text-display-xs">Nothing matched that</p>
                  <p className="mx-auto mt-4 max-w-md text-body-sm leading-[1.9] text-charcoal-200">
                    Ask us directly — we answer WhatsApp messages within a couple of hours during
                    shop hours.
                  </p>
                  <Button
                    variant="primary"
                    className="mt-8"
                    href={CONTACT.whatsappUrl}
                    target="_blank"
                    icon={MessageCircle}
                    iconPosition="left"
                  >
                    Ask on WhatsApp
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
              {/* ----------------------------------------- category nav */}
              <aside className="lg:col-span-3">
                <nav aria-label="FAQ categories" className="lg:sticky lg:top-32">
                  <p className="mj-eyebrow mb-6 border-b border-charcoal/10 pb-4">Topics</p>
                  <ul className="space-y-1">
                    {[{ id: 'all', title: 'All questions' }, ...categories].map((category) => (
                      <li key={category.id}>
                        <button
                          type="button"
                          onClick={() => setActive(category.id)}
                          aria-current={active === category.id}
                          className={cn(
                            'block w-full rounded-luxe px-3 py-2.5 text-left font-sans text-body-sm transition-all duration-300',
                            active === category.id
                              ? 'bg-champagne-50 text-bronze'
                              : 'text-charcoal-200 hover:bg-champagne-50/60 hover:text-charcoal',
                          )}
                        >
                          {category.title}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10 rounded-card border border-charcoal/[0.08] bg-champagne-50 p-6">
                    <p className="font-display text-[1.0625rem] leading-snug text-charcoal">
                      Still unsure?
                    </p>
                    <p className="mt-3 text-body-xs leading-[1.85] text-charcoal-200">
                      There is no question we mind being asked twice.
                    </p>
                    <div className="mt-5 space-y-2.5">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        href={CONTACT.whatsappUrl}
                        target="_blank"
                        icon={MessageCircle}
                        iconPosition="left"
                      >
                        WhatsApp
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        href={`tel:+${CONTACT.phonePrimaryRaw}`}
                        icon={Phone}
                        iconPosition="left"
                      >
                        Call the shop
                      </Button>
                    </div>
                  </div>
                </nav>
              </aside>

              {/* ------------------------------------------- accordions */}
              <div className="lg:col-span-9">
                <div className="space-y-16">
                  {visibleCategories.map((category) => (
                    <Reveal key={category.id} as="section" id={category.id} className="mj-scroll-mt">
                      <header className="mb-6 border-b border-charcoal/12 pb-6">
                        <h2 className="mj-display text-display-sm">{category.title}</h2>
                        <p className="mt-3 text-body-sm leading-relaxed text-charcoal-200">
                          {category.blurb}
                        </p>
                      </header>
                      <Accordion items={category.items} allowMultiple />
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------- closing */}
      <section className="mj-grain relative bg-espresso">
        <div className="mj-container py-20 text-center lg:py-26">
          <Reveal>
            <p className="mj-eyebrow-light mb-6">Anything else</p>
            <h2 className="mj-display mx-auto max-w-2xl text-display-md text-ivory">
              We would rather explain it twice than have you guess once
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-body leading-[1.9] text-ivory/60">
              Message us on WhatsApp, call the shop, or simply walk in. Nobody here works on
              commission, so nobody has any reason to hurry you.
            </p>
            <div className="mt-11 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Button
                variant="gold"
                href={CONTACT.whatsappUrl}
                target="_blank"
                icon={MessageCircle}
                iconPosition="left"
              >
                Chat with an expert
              </Button>
              <Button variant="outlineLight" to={ROUTES.contact}>
                Visit the shop
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
