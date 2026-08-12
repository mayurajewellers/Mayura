import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Check, CheckCircle2, Minus, Plus, Search, ShieldCheck, Video } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { PRODUCTS } from '@data/products'
import { searchProducts } from '@utils/catalogue'
import { consultationService, CONSULTATION_SLOTS } from '@/services/consultationService'
import { useShop } from '@context/ShopContext'
import { useDocumentTitle } from '@hooks/index'
import { formatPrice } from '@utils/format'
import PageHero from '@components/layout/PageHero'
import SmartImage from '@components/common/SmartImage'
import Button from '@components/common/Button'
import EmptyState from '@components/common/EmptyState'
import { TextField, TextArea } from '@components/common/Field'
import Reveal from '@components/motion/Reveal'
import cn from '@utils/cn'

/**
 * Video Call Consultation — a four-step frontend flow:
 *
 *   Designs → Your details → Schedule → Confirmation
 *
 * NO backend exists yet: the request is validated locally and recorded on
 * this device via consultationService, and the confirmation says exactly
 * that. The store confirms the actual slot over phone/WhatsApp.
 */

const STEPS = ['Designs', 'Your details', 'Schedule', 'Confirmation']

function Stepper({ current }) {
  return (
    <ol className="mx-auto flex max-w-2xl items-center" aria-label="Consultation steps">
      {STEPS.map((label, index) => {
        const stateClass =
          index < current
            ? 'border-gold bg-gold text-espresso'
            : index === current
              ? 'border-royal bg-royal text-ivory'
              : 'border-charcoal/20 bg-transparent text-charcoal-100'
        return (
          <li key={label} className={cn('flex items-center', index > 0 && 'flex-1')}>
            {index > 0 && (
              <span
                className={cn('mx-2 h-px flex-1 sm:mx-3', index <= current ? 'bg-gold' : 'bg-charcoal/15')}
                aria-hidden="true"
              />
            )}
            <span className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border font-sans text-body-xs tabular-nums transition-all duration-400',
                  stateClass,
                )}
                aria-hidden="true"
              >
                {index < current ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : index + 1}
              </span>
              <span
                className={cn(
                  'whitespace-nowrap font-sans text-[0.625rem] uppercase tracking-wide2 sm:text-eyebrow-sm',
                  index === current ? 'text-royal' : 'text-charcoal-50',
                )}
                aria-current={index === current ? 'step' : undefined}
              >
                {label}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function ItemRow({ product, selected, onToggle }) {
  return (
    <li className="flex items-center gap-4 rounded-card border border-charcoal/[0.08] bg-white/60 p-3.5">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-luxe bg-champagne-100">
        <SmartImage src={product.images[0]} alt="" ratio="aspect-square" rounded="rounded-luxe" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[0.9975rem] text-charcoal">{product.name}</p>
        <p className="mt-0.5 font-sans text-body-xs text-charcoal-50">
          {product.metal} · {formatPrice(product.price)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(product)}
        aria-pressed={selected}
        aria-label={selected ? `Remove ${product.name}` : `Add ${product.name}`}
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
          selected
            ? 'border-royal bg-royal text-ivory hover:bg-error hover:border-error'
            : 'border-charcoal/20 text-charcoal-100 hover:border-royal hover:text-royal',
        )}
      >
        {selected ? <Minus className="h-4 w-4" strokeWidth={1.6} /> : <Plus className="h-4 w-4" strokeWidth={1.6} />}
      </button>
    </li>
  )
}

export default function VideoConsultationPage() {
  useDocumentTitle('Video Call Consultation')
  const { cartLines, wishlistProducts } = useShop()

  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(() => {
    /* Cart items make the natural starting selection — capped at the limit. */
    const seed = cartLines.map((line) => line.product)
    const unique = [...new Map(seed.map((p) => [p.id, p])).values()]
    return unique.slice(0, consultationService.maxItems)
  })
  const [query, setQuery] = useState('')
  const [details, setDetails] = useState({ name: '', phone: '', email: '', note: '' })
  const [date, setDate] = useState(null)
  const [slot, setSlot] = useState(null)
  const [errors, setErrors] = useState({})
  const [record, setRecord] = useState(null)
  const [busy, setBusy] = useState(false)

  const dates = useMemo(() => consultationService.availableDates(), [])

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    return searchProducts(query).slice(0, 6)
  }, [query])

  const suggestions = useMemo(() => {
    const pool = [...wishlistProducts, ...PRODUCTS.filter((p) => p.badge === 'Bestseller')]
    const unique = [...new Map(pool.map((p) => [p.id, p])).values()]
    return unique.filter((p) => !selected.some((s) => s.id === p.id)).slice(0, 4)
  }, [wishlistProducts, selected])

  const toggle = (product) => {
    setErrors((e) => ({ ...e, items: undefined }))
    setSelected((current) => {
      if (current.some((p) => p.id === product.id)) return current.filter((p) => p.id !== product.id)
      if (current.length >= consultationService.maxItems) {
        setErrors((e) => ({ ...e, items: `Up to ${consultationService.maxItems} designs per consultation.` }))
        return current
      }
      return [...current, product]
    })
  }

  const next = () => {
    if (step === 0 && selected.length === 0) {
      setErrors({ items: 'Choose at least one design to look at together.' })
      return
    }
    if (step === 1) {
      const stepErrors = {}
      if (!details.name.trim() || details.name.trim().length < 2) stepErrors.name = 'Please tell us your name.'
      if (!/^[6-9]\d{9}$/.test(details.phone.replace(/\D/g, '').slice(-10))) {
        stepErrors.phone = 'Please enter a valid 10-digit Indian mobile number.'
      }
      if (details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(details.email.trim())) {
        stepErrors.email = 'That does not look like a valid email.'
      }
      if (Object.keys(stepErrors).length) {
        setErrors(stepErrors)
        return
      }
    }
    setErrors({})
    setStep((s) => Math.min(s + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async () => {
    if (busy) return
    const request = {
      items: selected.map((p) => ({ id: p.id, sku: p.sku, name: p.name, price: p.price })),
      name: details.name,
      phone: details.phone,
      email: details.email || null,
      note: details.note || null,
      date: date ? date.toISOString().slice(0, 10) : null,
      slot,
    }
    const validation = consultationService.validate({ ...request, items: selected })
    if (Object.keys(validation).length) {
      setErrors(validation)
      return
    }
    setBusy(true)
    const result = await consultationService.submit(request)
    setBusy(false)
    if (result.ok) {
      setRecord(result.record)
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <PageHero
        eyebrow="From our counter to your sofa"
        title="Video Call Consultation"
        lede={`Choose up to ${consultationService.maxItems} designs and a jewellery expert will show you each one live — every angle, on a real hand, against real light — before you decide anything.`}
        image="/images/editorial/everyday-sisters.jpg"
        height="md"
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Video Consultation' }]}
      />

      <section className="bg-ivory py-14 lg:py-20">
        <div className="mj-container-narrow">
          <Stepper current={step} />

          {/* ============================================= step 1 — designs */}
          {step === 0 && (
            <Reveal className="mt-12">
              <h2 className="font-display text-display-xs text-charcoal">
                Designs for your consultation{' '}
                <span className="font-sans text-body text-charcoal-50">
                  ({selected.length}/{consultationService.maxItems})
                </span>
              </h2>

              {selected.length > 0 ? (
                <ul className="mt-6 space-y-3">
                  {selected.map((product) => (
                    <ItemRow key={product.id} product={product} selected onToggle={toggle} />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  className="mt-6"
                  icon={Video}
                  eyebrow="Nothing selected yet"
                  title="Add a few designs below"
                  copy="Search the collection, or start from your bag and wishlist — anything you pick will be on the tray when the call begins."
                />
              )}
              {errors.items && (
                <p role="alert" className="mj-field-error mt-4">
                  {errors.items}
                </p>
              )}

              {/* ------------------------------------------------- search */}
              <div className="mt-10">
                <label htmlFor="vc-search" className="mj-field-label">
                  Add more designs
                </label>
                <div className="flex items-center gap-3 rounded-full border border-charcoal/15 bg-white px-5 py-3 transition-colors focus-within:border-gold">
                  <Search className="h-4 w-4 shrink-0 text-charcoal-100" strokeWidth={1.4} aria-hidden="true" />
                  <input
                    id="vc-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by name, type or stone — e.g. jhumka"
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-body-sm text-charcoal placeholder:text-charcoal-50 focus:outline-none focus:ring-0"
                  />
                </div>

                {query.trim() && (
                  <ul className="mt-4 space-y-3" aria-label="Search results">
                    {searchResults.length ? (
                      searchResults.map((product) => (
                        <ItemRow
                          key={product.id}
                          product={product}
                          selected={selected.some((p) => p.id === product.id)}
                          onToggle={toggle}
                        />
                      ))
                    ) : (
                      <li className="rounded-card border border-charcoal/[0.08] bg-white/60 p-5 text-body-sm text-charcoal-100">
                        Nothing matches “{query}”. Try a broader word — “ring”, “haram”, “diamond”.
                      </li>
                    )}
                  </ul>
                )}

                {!query.trim() && suggestions.length > 0 && (
                  <>
                    <p className="mj-eyebrow mb-4 mt-8">From your wishlist & bestsellers</p>
                    <ul className="space-y-3">
                      {suggestions.map((product) => (
                        <ItemRow
                          key={product.id}
                          product={product}
                          selected={selected.some((p) => p.id === product.id)}
                          onToggle={toggle}
                        />
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="mt-10 flex justify-end">
                <Button variant="primary" onClick={next}>
                  Continue to details
                </Button>
              </div>
            </Reveal>
          )}

          {/* ============================================ step 2 — details */}
          {step === 1 && (
            <Reveal className="mt-12">
              <h2 className="font-display text-display-xs text-charcoal">How do we reach you?</h2>
              <form
                className="mt-8 space-y-6"
                onSubmit={(event) => {
                  event.preventDefault()
                  next()
                }}
                noValidate
              >
                <TextField
                  label="Your name"
                  variant="box"
                  autoComplete="name"
                  required
                  value={details.name}
                  onChange={(event) => setDetails((d) => ({ ...d, name: event.target.value }))}
                  error={errors.name}
                />
                <TextField
                  label="Mobile number"
                  variant="box"
                  type="tel"
                  autoComplete="tel"
                  required
                  hint="We confirm the slot on this number, by call or WhatsApp."
                  value={details.phone}
                  onChange={(event) => setDetails((d) => ({ ...d, phone: event.target.value }))}
                  error={errors.phone}
                />
                <TextField
                  label="Email (optional)"
                  variant="box"
                  type="email"
                  autoComplete="email"
                  value={details.email}
                  onChange={(event) => setDetails((d) => ({ ...d, email: event.target.value }))}
                  error={errors.email}
                />
                <TextArea
                  label="Anything we should prepare? (optional)"
                  variant="box"
                  rows={3}
                  placeholder="Occasion, budget range, sizes, pieces to compare…"
                  value={details.note}
                  onChange={(event) => setDetails((d) => ({ ...d, note: event.target.value }))}
                />

                <div className="flex items-center justify-between gap-4 pt-2">
                  <Button variant="ghost" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <Button type="submit" variant="primary">
                    Continue to schedule
                  </Button>
                </div>
              </form>
            </Reveal>
          )}

          {/* =========================================== step 3 — schedule */}
          {step === 2 && (
            <Reveal className="mt-12">
              <h2 className="font-display text-display-xs text-charcoal">Pick a date and time</h2>

              <p className="mj-field-label mt-8">Date</p>
              <div className="mj-hide-scrollbar-x -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
                {dates.map((d) => {
                  const key = d.toISOString().slice(0, 10)
                  const active = date && date.toISOString().slice(0, 10) === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setDate(d)
                        setErrors((e) => ({ ...e, date: undefined }))
                      }}
                      aria-pressed={active}
                      className={cn(
                        'flex w-16 shrink-0 flex-col items-center rounded-luxe border px-2 py-3 transition-all duration-300',
                        active
                          ? 'border-royal bg-royal text-ivory'
                          : 'border-charcoal/15 text-charcoal-200 hover:border-charcoal/40',
                      )}
                    >
                      <span className="font-sans text-[0.625rem] uppercase tracking-wide2 opacity-70">
                        {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </span>
                      <span className="mt-1 font-display text-[1.25rem] tabular-nums">{d.getDate()}</span>
                      <span className="font-sans text-[0.625rem] uppercase tracking-wide2 opacity-70">
                        {d.toLocaleDateString('en-IN', { month: 'short' })}
                      </span>
                    </button>
                  )
                })}
              </div>
              {errors.date && (
                <p role="alert" className="mj-field-error mt-2">
                  {errors.date}
                </p>
              )}

              <p className="mj-field-label mt-8">Time slot (IST)</p>
              <div className="flex flex-wrap gap-2">
                {CONSULTATION_SLOTS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setSlot(option)
                      setErrors((e) => ({ ...e, slot: undefined }))
                    }}
                    aria-pressed={slot === option}
                    className={cn(
                      'rounded-full border px-4 py-2.5 font-sans text-body-sm tabular-nums transition-all duration-300',
                      slot === option
                        ? 'border-royal bg-royal text-ivory'
                        : 'border-charcoal/15 text-charcoal-200 hover:border-charcoal/40',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.slot && (
                <p role="alert" className="mj-field-error mt-2">
                  {errors.slot}
                </p>
              )}

              {/* ------------------------------------------------ summary */}
              <div className="mt-10 rounded-card border border-charcoal/[0.09] bg-white/60 p-6">
                <p className="mj-eyebrow mb-4">Your request</p>
                <p className="text-body-sm leading-[1.9] text-charcoal-200">
                  {selected.length} design{selected.length === 1 ? '' : 's'} ·{' '}
                  {details.name || 'Name pending'} · {details.phone || 'Number pending'}
                  {date && slot
                    ? ` · ${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}, ${slot}`
                    : ''}
                </p>
              </div>

              <div className="mt-10 flex items-center justify-between gap-4">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="gold" onClick={submit} disabled={busy} icon={CalendarDays} iconPosition="left">
                  {busy ? 'Submitting…' : 'Submit request'}
                </Button>
              </div>
            </Reveal>
          )}

          {/* ======================================= step 4 — confirmation */}
          {step === 3 && record && (
            <Reveal className="mt-14 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-success" strokeWidth={1} aria-hidden="true" />
              <h2 className="mj-display mt-6 text-display-sm text-charcoal">
                Your consultation request has been submitted
              </h2>
              <p className="mx-auto mt-4 max-w-md text-body leading-[1.9] text-charcoal-200">
                Reference <span className="font-medium tabular-nums text-charcoal">{record.id}</span>. Our team
                will call or WhatsApp <span className="text-charcoal">{record.phone}</span> to confirm{' '}
                {new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at{' '}
                {record.slot} and share the video link.
              </p>

              <p className="mx-auto mt-6 max-w-md rounded-card border border-charcoal/10 bg-ivory-100 p-4 font-sans text-body-xs leading-[1.8] text-charcoal-100">
                Online booking is being set up, so this request is saved on your device and the
                slot is confirmed personally by the store — nothing is booked automatically yet.
                In a hurry? Call {CONTACT.phonePrimary} and we will fix the call right away.
              </p>

              <ul className="mx-auto mt-8 max-w-sm space-y-3 text-left">
                {record.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 text-body-sm text-charcoal-200">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-bronze" strokeWidth={1.3} aria-hidden="true" />
                    {item.name}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Button variant="primary" to={ROUTES.collection('all')}>
                  Keep browsing
                </Button>
                <Button
                  variant="outline"
                  href={`${CONTACT.whatsappUrl}?text=${encodeURIComponent(`Hello Mayura Jewellers, I just requested a video consultation (${record.id}).`)}`}
                  target="_blank"
                >
                  WhatsApp the store
                </Button>
              </div>
            </Reveal>
          )}

          {/* ------------------------------------------------ reassurance */}
          {step < 3 && (
            <p className="mt-14 border-t border-charcoal/10 pt-6 text-center font-sans text-body-xs leading-[1.8] text-charcoal-50">
              No obligation, no payment on the call. You will see each piece on camera against a
              scale card, and the written price calculation follows on WhatsApp.{' '}
              <Link to={ROUTES.faq} className="mj-link text-bronze">
                Questions?
              </Link>
            </p>
          )}
        </div>
      </section>
    </>
  )
}
