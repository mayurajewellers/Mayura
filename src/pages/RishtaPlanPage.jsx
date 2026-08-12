import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarHeart, Gift, HandCoins, Info, MessageCircle, Phone } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { RISHTA, RISHTA_EXAMPLES, RISHTA_TERMS, calculateRishta } from '@data/rishta'
import { useDocumentTitle } from '@hooks/index'
import { formatPrice } from '@utils/format'
import PageHero from '@components/layout/PageHero'
import SectionHeading from '@components/common/SectionHeading'
import Button from '@components/common/Button'
import Reveal from '@components/motion/Reveal'
import cn from '@utils/cn'

/* ------------------------------------------------------------------------
   The interactive 11 + 1 calculator — a self-contained, reusable component.
   ---------------------------------------------------------------------- */
export function RishtaCalculator({ className }) {
  const [monthly, setMonthly] = useState(10000)
  const [inputValue, setInputValue] = useState('10000')
  const [error, setError] = useState(null)

  const result = useMemo(() => calculateRishta(monthly), [monthly])
  const bonusShare = result.value > 0 ? (result.bonus / result.value) * 100 : 0

  const applyAmount = (value) => {
    const n = Math.round(Number(value) || 0)
    if (n < RISHTA.minMonthly) {
      setError(`Minimum monthly amount is ${formatPrice(RISHTA.minMonthly)}.`)
    } else if (n > RISHTA.maxMonthly) {
      setError(`Maximum monthly amount is ${formatPrice(RISHTA.maxMonthly)}.`)
    } else {
      setError(null)
    }
    setMonthly(Math.min(Math.max(n, 0), RISHTA.maxMonthly))
  }

  return (
    <div className={cn('mj-panel overflow-hidden', className)}>
      <div className="grid lg:grid-cols-2">
        {/* ------------------------------------------------------ inputs */}
        <div className="p-8 sm:p-10">
          <p className="mj-eyebrow mb-3">11 + 1 calculator</p>
          <h3 className="font-display text-display-xs text-charcoal">
            Choose your monthly amount
          </h3>

          <label htmlFor="rishta-amount" className="mj-field-label mt-8">
            Monthly instalment (INR)
          </label>
          <div className="flex items-center gap-2 border-b border-charcoal/20 pb-2 transition-colors focus-within:border-gold">
            <span className="font-display text-[1.5rem] text-charcoal-100">₹</span>
            <input
              id="rishta-amount"
              type="number"
              inputMode="numeric"
              min={RISHTA.minMonthly}
              max={RISHTA.maxMonthly}
              step={500}
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value)
                applyAmount(event.target.value)
              }}
              aria-describedby={error ? 'rishta-error' : undefined}
              className="w-full border-0 bg-transparent p-0 font-display text-[1.75rem] tabular-nums text-charcoal focus:outline-none focus:ring-0"
            />
          </div>
          {error && (
            <p id="rishta-error" role="alert" className="mj-field-error">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {RISHTA.presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setInputValue(String(preset))
                  applyAmount(preset)
                }}
                aria-pressed={monthly === preset}
                className={cn(
                  'rounded-full border px-4 py-2 font-sans text-body-xs tabular-nums transition-all duration-300',
                  monthly === preset
                    ? 'border-royal bg-royal text-ivory'
                    : 'border-charcoal/15 text-charcoal-200 hover:border-charcoal/40',
                )}
              >
                {formatPrice(preset)}
              </button>
            ))}
          </div>

          <div className="mt-9 space-y-4 border-t border-charcoal/10 pt-7">
            <div className="flex items-baseline justify-between gap-6">
              <p className="font-sans text-body-sm text-charcoal-200">
                You pay for {RISHTA.months} months
              </p>
              <p className="font-display text-[1.25rem] tabular-nums text-charcoal">
                {formatPrice(result.collected)}
              </p>
            </div>
            <div className="flex items-baseline justify-between gap-6">
              <p className="font-sans text-body-sm text-charcoal-200">Mayura adds a bonus</p>
              <p className="font-display text-[1.25rem] tabular-nums text-bronze">
                + {formatPrice(result.bonus)}
              </p>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-t-2 border-gold/50 pt-4">
              <p className="font-sans text-eyebrow uppercase tracking-luxe text-charcoal">
                Buy jewellery worth
              </p>
              <p className="font-display text-display-xs tabular-nums text-royal">
                {formatPrice(result.value)}
              </p>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------- visual side */}
        <div className="mj-grain relative flex flex-col items-center justify-center bg-espresso p-10 text-center">
          <div
            className="relative flex h-52 w-52 items-center justify-center rounded-full sm:h-60 sm:w-60"
            style={{
              background: `conic-gradient(#D4AF37 0% ${bonusShare}%, rgba(247,244,236,0.16) ${bonusShare}% 100%)`,
            }}
            role="img"
            aria-label={`You pay ${formatPrice(result.collected)}; Mayura adds a bonus of ${formatPrice(result.bonus)} — ${Math.round(bonusShare)} percent of the final value.`}
          >
            <div className="flex h-[10.5rem] w-[10.5rem] flex-col items-center justify-center rounded-full bg-espresso sm:h-[12.5rem] sm:w-[12.5rem]">
              <p className="mj-eyebrow-light">You pay</p>
              <p className="mt-1.5 font-display text-[1.5rem] tabular-nums text-ivory sm:text-[1.75rem]">
                {formatPrice(result.collected)}
              </p>
              <p className="mt-2 font-sans text-body-xs text-gold-200">
                + {formatPrice(result.bonus)} bonus
              </p>
            </div>
          </div>

          <p className="mt-8 max-w-xs text-body-sm leading-[1.85] text-ivory/60">
            Eleven instalments from you, the twelfth from us. The full value is redeemable against
            any gold, diamond or platinum jewellery in store.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------
   The page
   ---------------------------------------------------------------------- */
const STEPS = [
  {
    icon: HandCoins,
    title: 'Pay monthly for 11 months',
    copy: 'Choose any fixed amount at enrolment and pay it monthly at the store or by bank transfer.',
  },
  {
    icon: Gift,
    title: 'Mayura adds the 12th',
    copy: 'On maturity we add one full instalment as a bonus on top of everything you have paid.',
  },
  {
    icon: CalendarHeart,
    title: 'Redeem in the 12th month',
    copy: 'Put the full value towards any gold, diamond or platinum jewellery in the showroom.',
  },
]

export default function RishtaPlanPage() {
  useDocumentTitle('Rishta Plan — 11+1 Jewellery Savings')

  return (
    <>
      <PageHero
        eyebrow="Mayura jewellery savings"
        title="The Rishta Plan"
        lede="Pay eleven monthly instalments; Mayura adds the twelfth. A quiet, disciplined way to plan a wedding purchase — or simply the next beautiful thing."
        image="/images/editorial/heirloom-generations.jpg"
        height="md"
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Rishta Plan' }]}
      />

      {/* ------------------------------------------------------ how it works */}
      <section className="bg-ivory" aria-labelledby="rishta-how">
        <div className="mj-container py-section-sm">
          <SectionHeading
            id="rishta-how"
            eyebrow="How it works"
            title="Eleven from you, one from us"
            align="center"
            flourish
            className="mb-14"
          />

          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08} className="text-center">
                <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/45 bg-ivory-50 text-royal">
                  <step.icon className="h-6 w-6" strokeWidth={1.1} aria-hidden="true" />
                </span>
                <h3 className="font-display text-[1.1875rem] text-charcoal">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-body-sm leading-[1.85] text-charcoal-200">
                  {step.copy}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- calculator */}
      <section className="border-y border-charcoal/[0.07] bg-ivory-300" aria-labelledby="rishta-calculator">
        <div className="mj-container py-section-sm">
          <SectionHeading
            id="rishta-calculator"
            eyebrow="Plan it precisely"
            title="The 11 + 1 calculator"
            align="center"
            className="mb-12"
          />
          <Reveal>
            <RishtaCalculator />
          </Reveal>

          {/* ------------------------------------------------ examples table */}
          <Reveal delay={0.1}>
            <div className="mx-auto mt-14 max-w-3xl overflow-x-auto">
              <table className="w-full text-left">
                <caption className="mj-eyebrow mb-5 text-center">Popular plans</caption>
                <thead>
                  <tr className="border-b border-charcoal/12">
                    {['Monthly instalment', 'Paid in 11 months', 'Mayura bonus', 'Jewellery value'].map((heading) => (
                      <th key={heading} scope="col" className="pb-3 pr-4 font-sans text-eyebrow uppercase tracking-luxe text-charcoal-50">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RISHTA_EXAMPLES.map((row) => (
                    <tr key={row.monthly} className="border-b border-charcoal/[0.07]">
                      <td className="py-3.5 pr-4 font-sans text-body-sm tabular-nums text-charcoal">{formatPrice(row.monthly)}</td>
                      <td className="py-3.5 pr-4 font-sans text-body-sm tabular-nums text-charcoal-200">{formatPrice(row.collected)}</td>
                      <td className="py-3.5 pr-4 font-sans text-body-sm tabular-nums text-bronze">+ {formatPrice(row.bonus)}</td>
                      <td className="py-3.5 font-sans text-body-sm font-medium tabular-nums text-royal">{formatPrice(row.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- terms */}
      <section className="bg-ivory" aria-labelledby="rishta-terms">
        <div className="mj-container-narrow py-section-sm">
          <SectionHeading id="rishta-terms" eyebrow="The fine print" title="Terms & conditions" size="md" className="mb-9" />
          <ul className="space-y-4">
            {RISHTA_TERMS.map((term) => (
              <li key={term} className="flex gap-3.5 text-body-sm leading-[1.85] text-charcoal-200">
                <span className="mt-[0.55rem] h-1 w-1 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
                {term}
              </li>
            ))}
          </ul>

          <p className="mt-8 flex gap-3 rounded-card border border-charcoal/10 bg-ivory-100 p-5 text-body-xs leading-[1.8] text-charcoal-100">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-bronze" strokeWidth={1.4} aria-hidden="true" />
            Enrolment happens in person at the showroom, where the complete scheme terms are
            provided in writing. The figures above are illustrative of the 11+1 structure.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" href={`tel:+${CONTACT.phonePrimaryRaw}`} icon={Phone} iconPosition="left">
              Call to enrol
            </Button>
            <Button
              variant="outline"
              href={`${CONTACT.whatsappUrl}?text=${encodeURIComponent('Hello Mayura Jewellers, I would like to know more about the Rishta Plan (11+1).')}`}
              target="_blank"
              icon={MessageCircle}
              iconPosition="left"
            >
              Ask on WhatsApp
            </Button>
          </div>

          <p className="mt-8 font-sans text-body-xs text-charcoal-50">
            Planning a wedding purchase?{' '}
            <Link to={ROUTES.collection('bridal-collection')} className="mj-link text-bronze">
              Explore the bridal collection
            </Link>{' '}
            while you save.
          </p>
        </div>
      </section>
    </>
  )
}
