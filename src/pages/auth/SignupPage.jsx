import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Phone, User } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { EASE_LUXE } from '@constants/motion'
import { useDocumentTitle } from '@hooks/index'
import Button from '@components/common/Button'
import { Checkbox, PasswordField, TextField } from '@components/common/Field'
import cn from '@utils/cn'

/** Rough password strength meter — four bars, no library. */
function strengthOf(value) {
  let score = 0
  if (value.length >= 8) score += 1
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  return score
}

const LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
const COLOURS = ['bg-charcoal/12', 'bg-error', 'bg-gold-300', 'bg-gold', 'bg-success']

export default function SignupPage() {
  useDocumentTitle('Create account')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(() => strengthOf(password), [password])
  const mismatch = confirm.length > 0 && confirm !== password

  const handleSubmit = (event) => {
    event.preventDefault()
    if (mismatch) return
    setSubmitted(true)
    window.setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_LUXE }}
    >
      <p className="mj-eyebrow mb-5">Join Mayura</p>
      <h1 className="mj-display text-display-sm">Create an account</h1>
      <p className="mt-5 text-body-sm leading-[1.9] text-charcoal-200">
        Save pieces across visits, keep your sizes on file, and hear first about new bridal work.
        Already registered?{' '}
        <Link to={ROUTES.login} className="mj-link text-charcoal">
          Sign in
        </Link>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-7">
        <TextField
          label="Full name"
          name="name"
          required
          autoComplete="name"
          placeholder="Your name"
          icon={User}
        />

        <TextField
          label="Mobile number"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+91 00000 00000"
          icon={Phone}
          hint="We use this only for order updates — never for marketing unless you ask."
        />

        <TextField
          label="Email address"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          icon={Mail}
        />

        <div>
          <PasswordField
            label="Password"
            name="password"
            required
            autoComplete="new-password"
            placeholder="At least eight characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {password && (
            <div className="mt-4">
              <div className="flex gap-1.5" aria-hidden="true">
                {[1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors duration-500',
                      bar <= score ? COLOURS[score] : 'bg-charcoal/10',
                    )}
                  />
                ))}
              </div>
              <p className="mt-2 font-sans text-body-xs text-charcoal-50" role="status">
                Password strength: {LABELS[score]}
              </p>
            </div>
          )}
        </div>

        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={mismatch ? 'Passwords do not match' : undefined}
        />

        <div className="space-y-3.5 border-t border-charcoal/10 pt-7">
          <Checkbox
            required
            name="terms"
            label={
              <>
                I accept the{' '}
                <Link to={ROUTES.terms} className="mj-link text-charcoal">
                  Terms &amp; Conditions
                </Link>{' '}
                and{' '}
                <Link to={ROUTES.privacy} className="mj-link text-charcoal">
                  Privacy Policy
                </Link>
              </>
            }
          />
          <Checkbox
            name="marketing"
            label="Send me the Mayura Letter"
            description="About one email a month. Unsubscribe any time."
          />
        </div>

        <Button type="submit" variant="primary" fullWidth>
          {submitted ? 'Demonstration only' : 'Create account'}
        </Button>

        {submitted && (
          <p
            role="status"
            className="rounded-luxe border border-gold/25 bg-gold/[0.06] px-4 py-3.5 text-center font-sans text-body-xs leading-relaxed text-bronze"
          >
            No account was created. This website has no backend and nothing you typed left your
            browser.
          </p>
        )}
      </form>
    </motion.div>
  )
}
