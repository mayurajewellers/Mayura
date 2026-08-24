import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Phone, User } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { EASE_LUXE } from '@constants/motion'
import { useDocumentTitle } from '@hooks/index'
import authService from '@services/authService'
import Button from '@components/common/Button'
import { Checkbox, PasswordField, TextField } from '@components/common/Field'
import cn from '@utils/cn'

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
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const score = useMemo(() => strengthOf(password), [password])
  const mismatch = confirm.length > 0 && confirm !== password

  const fromPath =
    location.state?.from?.pathname ||
    searchParams.get('redirect') ||
    ROUTES.profile

  useEffect(() => {
    if (authService.isCustomer()) {
      const target = location.state?.from?.pathname || searchParams.get('redirect') || ROUTES.profile
      navigate(target, { replace: true })
    }
  }, [navigate, location.state, searchParams])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (mismatch) return

    setLoading(true)
    setError('')

    try {
      const res = await authService.register({ name, email, phone, password })
      if (res.ok || res.success) {
        navigate(fromPath, { replace: true })
      } else {
        setError(res.error || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration.')
    } finally {
      setLoading(false)
    }
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
        Create an account to complete your purchase and track orders. Already registered?{' '}
        <Link to={ROUTES.login} state={location.state} className="mj-link text-charcoal">
          Sign in
        </Link>
        .
      </p>

      {location.state?.from && (
        <div className="mt-6 rounded-luxe border border-gold/30 bg-gold/[0.08] p-4 text-body-xs font-medium text-bronze">
          Please create an account to complete your checkout.
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-luxe border border-error/30 bg-error/[0.08] p-4 text-body-xs font-medium text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-7">
        <TextField
          label="Full name"
          name="name"
          required
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={User}
        />

        <TextField
          label="Mobile number"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+91 00000 00000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          icon={Phone}
          hint="We use this only for order updates."
        />

        <TextField
          label="Email address"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        </div>

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Creating account...' : 'Create account & Checkout'}
        </Button>
      </form>
    </motion.div>
  )
}
