import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Chrome, Facebook, Mail, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'
import { ROUTES } from '@constants/routes'
import { EASE_LUXE } from '@constants/motion'
import { useDocumentTitle } from '@hooks/index'
import Button from '@components/common/Button'
import { Checkbox, PasswordField, TextField } from '@components/common/Field'

const SOCIALS = [
  { label: 'Google', icon: Chrome },
  { label: 'Facebook', icon: Facebook },
  { label: 'Mobile OTP', icon: Smartphone },
]

export default function LoginPage() {
  useDocumentTitle('Sign in')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    window.setTimeout(() => setSubmitted(false), 4000)
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
        Sign in to see your saved pieces and order history. New here?{' '}
        <Link to={ROUTES.signup} className="mj-link text-charcoal">
          Create an account
        </Link>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-7">
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
            autoComplete="current-password"
            placeholder="••••••••"
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

        <Button type="submit" variant="primary" fullWidth>
          {submitted ? 'Demonstration only' : 'Sign in'}
        </Button>

        {submitted && (
          <p
            role="status"
            className="rounded-luxe border border-gold/25 bg-gold/[0.06] px-4 py-3.5 text-center font-sans text-body-xs leading-relaxed text-bronze"
          >
            This site has no backend, so no account was signed in. Nothing you typed was transmitted
            anywhere.
          </p>
        )}
      </form>

      {/* ------------------------------------------------------ social UI */}
      <div className="mt-10">
        <div className="flex items-center gap-4">
          <span className="mj-rule flex-1" aria-hidden="true" />
          <span className="font-sans text-eyebrow uppercase tracking-luxe text-charcoal-50">
            Or continue with
          </span>
          <span className="mj-rule flex-1" aria-hidden="true" />
        </div>

        <div className="mt-7 grid grid-cols-3 gap-3">
          {SOCIALS.map((social) => (
            <button
              key={social.label}
              type="button"
              className="group/soc flex flex-col items-center gap-2.5 rounded-card border border-charcoal/12 py-5 transition-all duration-400 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:bg-gold/[0.05]"
            >
              <social.icon
                className="h-5 w-5 text-charcoal-100 transition-colors duration-300 group-hover/soc:text-bronze"
                strokeWidth={1.3}
                aria-hidden="true"
              />
              <span className="font-sans text-[0.625rem] uppercase tracking-wide2 text-charcoal-100">
                {social.label}
              </span>
            </button>
          ))}
        </div>
      </div>

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
