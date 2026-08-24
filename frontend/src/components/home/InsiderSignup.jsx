import { useState } from 'react'
import { CheckCircle2, Gift } from 'lucide-react'
import { INSIDERS } from '@data/homepage'
import { newsletterService } from '@/services/newsletterService'
import Reveal from '@components/motion/Reveal'
import cn from '@utils/cn'

const SEGMENTS = [
  { key: 'her', label: 'Shopping for her' },
  { key: 'him', label: 'Shopping for him' },
  { key: 'myself', label: 'For myself' },
]

/**
 * Join Mayura Jewellers Insiders — email capture on the royal blue ground.
 *
 * Frontend-only for now: validation happens locally and the signup is stored
 * on the device via newsletterService. The success copy says exactly that —
 * no fake "we've emailed you" claims. Swap the service body for a real API
 * when the backend arrives.
 */
export default function InsiderSignup() {
  const [email, setEmail] = useState('')
  const [segment, setSegment] = useState(null)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(null) // { alreadySubscribed }
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    setError(null)
    setBusy(true)
    const result = await newsletterService.subscribe({ email, segment })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setDone(result)
  }

  return (
    <section className="mj-grain relative overflow-hidden bg-espresso" aria-labelledby="insiders-heading">
      {/* quiet radial glow behind the headline */}
      <span
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-royal-500/25 blur-3xl"
        aria-hidden="true"
      />

      <div className="mj-container relative py-20 lg:py-26">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-royal-800/60 text-gold">
            <Gift className="h-6 w-6" strokeWidth={1.2} aria-hidden="true" />
          </span>

          <p className="mj-eyebrow-light mb-4">{INSIDERS.eyebrow}</p>
          <h2 id="insiders-heading" className="mj-display text-display-md text-ivory">
            {INSIDERS.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-body leading-[1.9] text-ivory/65">
            {INSIDERS.copy}
          </p>

          {done ? (
            <div
              role="status"
              className="mx-auto mt-10 max-w-md rounded-card border border-gold/35 bg-royal-800/50 px-8 py-7"
            >
              <CheckCircle2 className="mx-auto h-7 w-7 text-gold" strokeWidth={1.3} aria-hidden="true" />
              <p className="mt-4 font-display text-[1.1875rem] text-ivory">
                {done.alreadySubscribed ? 'You are already on the list.' : 'Welcome to the Insiders.'}
              </p>
              <p className="mt-2.5 text-body-xs leading-relaxed text-ivory/55">{INSIDERS.disclaimer}</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mx-auto mt-10 max-w-xl">
              <div
                className={cn(
                  'flex overflow-hidden rounded-full border bg-ivory-50 shadow-lift transition-colors duration-300',
                  error ? 'border-error' : 'border-transparent focus-within:border-gold',
                )}
              >
                <label htmlFor="insider-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="insider-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="Enter your email"
                  aria-invalid={error ? 'true' : undefined}
                  aria-describedby={error ? 'insider-error' : 'insider-hint'}
                  className="min-w-0 flex-1 bg-transparent px-6 py-4 font-sans text-body text-charcoal placeholder:text-charcoal-50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="mj-btn shrink-0 bg-gold px-8 text-espresso transition-colors duration-300 hover:bg-gold-600 hover:text-ivory disabled:opacity-60"
                >
                  {busy ? 'Saving…' : 'Join'}
                </button>
              </div>

              {error && (
                <p id="insider-error" role="alert" className="mt-3 font-sans text-body-xs text-gold-200">
                  {error}
                </p>
              )}

              {/* optional segment — helps the store send fewer, better letters */}
              <fieldset className="mt-7">
                <legend className="sr-only">What are you usually shopping for? (optional)</legend>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {SEGMENTS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSegment((current) => (current === option.key ? null : option.key))}
                      aria-pressed={segment === option.key}
                      className={cn(
                        'rounded-full border px-4 py-2 font-sans text-eyebrow-sm uppercase tracking-luxe transition-all duration-300',
                        segment === option.key
                          ? 'border-gold bg-gold/15 text-gold-100'
                          : 'border-ivory/25 text-ivory/60 hover:border-ivory/50 hover:text-ivory',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <p id="insider-hint" className="mt-6 font-sans text-[0.6875rem] leading-relaxed text-ivory/35">
                {INSIDERS.disclaimer} Unsubscribe whenever you like.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
