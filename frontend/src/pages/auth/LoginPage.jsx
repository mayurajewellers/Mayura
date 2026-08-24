import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { ROUTES } from '@constants/routes'
import { EASE_LUXE } from '@constants/motion'
import { useDocumentTitle } from '@hooks/index'
import authService from '@services/authService'
import Button from '@components/common/Button'
import { Checkbox, PasswordField, TextField } from '@components/common/Field'

export default function LoginPage() {
  useDocumentTitle('Sign in')
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Return destination logic
  const fromPath =
    location.state?.from?.pathname ||
    searchParams.get('redirect') ||
    ROUTES.profile

  useEffect(() => {
    if (authService.isAdmin()) {
      navigate(ROUTES.admin, { replace: true })
    } else if (authService.isCustomer()) {
      const target = location.state?.from?.pathname || searchParams.get('redirect') || ROUTES.profile
      navigate(target, { replace: true })
    }
  }, [navigate, location.state, searchParams])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setError('')

    try {
      const res = await authService.signIn({ email, password })
      if (res.ok || res.success) {
        if (res.user?.role === 'ADMIN' || authService.isAdmin()) {
          navigate(ROUTES.admin, { replace: true })
        } else {
          navigate(fromPath, { replace: true })
        }
      } else {
        setError(res.error || 'Sign in failed. Please check your credentials.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred during sign in.')
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
      <p className="mj-eyebrow mb-5">Welcome back</p>
      <h1 className="mj-display text-display-sm">Sign in</h1>
      <p className="mt-5 text-body-sm leading-[1.9] text-charcoal-200">
        Sign in to proceed to checkout and complete your order. New here?{' '}
        <Link to={ROUTES.signup} state={location.state} className="mj-link text-charcoal">
          Create an account
        </Link>
        .
      </p>

      {location.state?.from && (
        <div className="mt-6 rounded-luxe border border-gold/30 bg-gold/[0.08] p-4 text-body-xs font-medium text-bronze">
          Please sign in or create an account to proceed to checkout.
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-luxe border border-error/30 bg-error/[0.08] p-4 text-body-xs font-medium text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-7">
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
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Checkbox label="Remember me on this device" name="remember" />
            <Link
              to={ROUTES.forgotPassword}
              className="mj-link font-sans text-body-xs text-charcoal-100"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in & Continue'}
        </Button>
      </form>

      <p className="mt-10 text-center font-sans text-body-xs leading-relaxed text-charcoal-50">
        By signing in you accept our{' '}
        <Link to={ROUTES.terms} className="mj-link text-charcoal-100">
          Terms
        </Link>{' '}
        and{' '}
        <Link to={ROUTES.privacy} className="mj-link text-charcoal-100">
          Privacy Policy
        </Link>
        .
      </p>
    </motion.div>
  )
}
