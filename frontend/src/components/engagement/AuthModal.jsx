import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { authService } from '@/services/authService'
import { useShop } from '@context/ShopContext'
import Modal from '@components/common/Modal'
import Button from '@components/common/Button'
import { PasswordField, TextField } from '@components/common/Field'
import cn from '@utils/cn'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Sign-in / register modal.
 *
 * Frontend-only demo authentication via authService (see the security notes
 * there). The modal never blocks browsing: it is dismissible by close
 * button, Escape and backdrop, and appears at most once per browser.
 */
export default function AuthModal({ open, onClose }) {
  const { pushToast } = useShop()
  const [mode, setMode] = useState('signin') // 'signin' | 'register'
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (key) => (event) => {
    setValues((v) => ({ ...v, [key]: event.target.value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
    setFormError(null)
  }

  const validate = () => {
    const next = {}
    if (mode === 'register' && values.name.trim().length < 2) next.name = 'Please tell us your name.'
    if (!EMAIL_RE.test(values.email.trim())) next.email = 'Please enter a valid email address.'
    if (values.password.length < 6) next.password = 'At least 6 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    if (busy || !validate()) return
    setBusy(true)
    const result =
      mode === 'register'
        ? await authService.register(values)
        : await authService.signIn(values)
    setBusy(false)

    if (!result.ok) {
      setFormError(result.error)
      return
    }
    pushToast({
      title: mode === 'register' ? 'Account created' : 'Welcome back',
      message: `Signed in as ${result.user.name || result.user.email}`,
      tone: 'success',
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} label="Sign in or create an account" size="max-w-md">
      <div className="p-8 sm:p-9">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-gold/10 text-bronze">
          <Sparkles className="h-5 w-5" strokeWidth={1.3} aria-hidden="true" />
        </span>

        <h2 className="mj-display mt-5 text-display-xs text-charcoal">
          {mode === 'signin' ? 'Welcome back to Mayura' : 'Create your Mayura account'}
        </h2>
        <p className="mt-2.5 text-body-sm leading-relaxed text-charcoal-200">
          Save your wishlist, track enquiries and hear about private viewings first.
        </p>

        {/* ------------------------------------------------------- tabs */}
        <div role="tablist" aria-label="Sign in or register" className="mt-7 flex rounded-luxe border border-charcoal/12 p-1">
          {[
            { key: 'signin', label: 'Sign in' },
            { key: 'register', label: 'Create account' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={mode === tab.key}
              onClick={() => {
                setMode(tab.key)
                setErrors({})
                setFormError(null)
              }}
              className={cn(
                'flex-1 rounded-[0.1875rem] px-4 py-2.5 font-sans text-label uppercase tracking-wider2 transition-all duration-300',
                mode === tab.key
                  ? 'bg-espresso text-ivory shadow-card'
                  : 'text-charcoal-100 hover:text-charcoal',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ------------------------------------------------------- form */}
        <form onSubmit={submit} noValidate className="mt-7 space-y-5">
          {mode === 'register' && (
            <TextField
              label="Your name"
              variant="box"
              autoComplete="name"
              value={values.name}
              onChange={set('name')}
              error={errors.name}
              required
            />
          )}
          <TextField
            label="Email"
            type="email"
            variant="box"
            autoComplete="email"
            value={values.email}
            onChange={set('email')}
            error={errors.email}
            required
          />
          <PasswordField
            label="Password"
            variant="box"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            value={values.password}
            onChange={set('password')}
            error={errors.password}
            required
          />

          {formError && (
            <p role="alert" className="mj-field-error">
              {formError}
            </p>
          )}

          <Button type="submit" variant="primary" fullWidth disabled={busy}>
            {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="mt-5 text-center font-sans text-body-xs text-charcoal-100">
          {mode === 'signin' ? (
            <>
              Forgot your password?{' '}
              <Link to={ROUTES.forgotPassword} onClick={onClose} className="mj-link text-bronze">
                Reset it here
              </Link>
            </>
          ) : (
            <>
              Prefer a full page?{' '}
              <Link to={ROUTES.signup} onClick={onClose} className="mj-link text-bronze">
                Register here
              </Link>
            </>
          )}
        </p>

        <p className="mt-5 border-t border-charcoal/10 pt-4 font-sans text-[0.6875rem] leading-relaxed text-charcoal-50">
          Accounts are a preview feature stored on this device only — online accounts arrive with
          our upcoming services. Browsing and enquiries never require signing in.
        </p>
      </div>
    </Modal>
  )
}
