import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Mail } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { EASE_LUXE } from '@constants/motion'
import { useDocumentTitle } from '@hooks/index'
import authService from '@services/authService'
import Button from '@components/common/Button'
import { PasswordField, TextField } from '@components/common/Field'
import cn from '@utils/cn'

const STEPS = ['Email', 'Verify', 'Reset', 'Done']

export default function ForgotPasswordPage() {
  useDocumentTitle('Reset password')
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [seconds, setSeconds] = useState(0)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const inputs = useRef([])

  useEffect(() => {
    if (seconds <= 0) return undefined
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [seconds])

  const sendOtp = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      await authService.forgotPassword({ email })
      setStep(1)
      setSeconds(45)
      window.setTimeout(() => inputs.current[0]?.focus(), 350)
    } catch (err) {
      setErrorMsg(err.message || 'Could not send reset request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) inputs.current[index + 1]?.focus()
  }

  const onOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleReset = async (event) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await authService.resetPassword({ token: otp.join(''), password: newPassword })
      if (res.success) {
        setStep(3)
      } else {
        setErrorMsg(res.message || 'Password reset failed.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not reset password.')
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
      {/* --------------------------------------------------------- stepper */}
      <ol className="mb-10 flex items-center gap-2" aria-label="Progress">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-1 flex-1 rounded-full transition-colors duration-700',
                index <= step ? 'bg-gold' : 'bg-charcoal/10',
              )}
              aria-hidden="true"
            />
            <span className="sr-only">
              {label}
              {index === step ? ' (current step)' : ''}
            </span>
          </li>
        ))}
      </ol>

      {errorMsg && (
        <div className="mb-6 rounded-luxe border border-red-200 bg-red-50 p-3.5 text-center font-sans text-body-xs text-red-700">
          {errorMsg}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ================================================= step 1: email */}
        {step === 0 && (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.4, ease: EASE_LUXE }}
          >
            <p className="mj-eyebrow mb-5">Step one</p>
            <h1 className="mj-display text-display-sm">Reset your password</h1>
            <p className="mt-5 text-body-sm leading-[1.9] text-charcoal-200">
              Enter the email address on your account and we will send a reset code to it.
            </p>

            <form onSubmit={sendOtp} className="mt-10 space-y-7">
              <TextField
                label="Email address"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                icon={Mail}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? 'Sending code...' : 'Send code'}
              </Button>
            </form>
          </motion.div>
        )}

        {/* ================================================== step 2: otp */}
        {step === 1 && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.4, ease: EASE_LUXE }}
          >
            <p className="mj-eyebrow mb-5">Step two</p>
            <h1 className="mj-display text-display-sm">Enter the code</h1>
            <p className="mt-5 text-body-sm leading-[1.9] text-charcoal-200">
              Enter the six-digit code sent to{' '}
              <span className="text-charcoal">{email || 'your email'}</span>.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                setStep(2)
              }}
              className="mt-10"
            >
              <fieldset>
                <legend className="mj-field-label">Verification code</legend>
                <div className="flex gap-2.5">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(node) => {
                        inputs.current[index] = node
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => onOtpChange(index, event.target.value)}
                      onKeyDown={(event) => onOtpKeyDown(index, event)}
                      aria-label={`Digit ${index + 1} of 6`}
                      className="h-14 w-full rounded-luxe border border-charcoal/15 bg-ivory-50 text-center font-display text-[1.375rem] text-charcoal transition-all duration-300 focus:border-gold focus:bg-white focus:outline-none focus:ring-0"
                    />
                  ))}
                </div>
              </fieldset>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSeconds(45)}
                  disabled={seconds > 0}
                  className="font-sans text-body-xs text-charcoal-100 transition-colors duration-300 hover:text-bronze disabled:pointer-events-none disabled:opacity-45"
                >
                  {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="inline-flex items-center gap-1.5 font-sans text-body-xs text-charcoal-100 transition-colors duration-300 hover:text-bronze"
                >
                  <ArrowLeft className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
                  Change email
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="mt-8"
                disabled={otp.join('').length < 6}
              >
                Verify code
              </Button>
            </form>
          </motion.div>
        )}

        {/* ================================================ step 3: reset */}
        {step === 2 && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.4, ease: EASE_LUXE }}
          >
            <p className="mj-eyebrow mb-5">Step three</p>
            <h1 className="mj-display text-display-sm">Choose a new password</h1>
            <p className="mt-5 text-body-sm leading-[1.9] text-charcoal-200">
              At least eight characters, with a mix of letters, numbers and one symbol.
            </p>

            <form onSubmit={handleReset} className="mt-10 space-y-7">
              <PasswordField
                label="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
              />
              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
              />
              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? 'Updating password...' : 'Reset password'}
              </Button>
            </form>
          </motion.div>
        )}

        {/* ================================================= step 4: done */}
        {step === 3 && (
          <motion.div
            key="done"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.4, ease: EASE_LUXE }}
            className="text-center"
          >
            <span
              className="mx-auto mb-9 flex h-18 w-18 items-center justify-center rounded-full border border-gold/35 bg-gold/[0.08]"
              aria-hidden="true"
            >
              <Check className="h-7 w-7 text-bronze" strokeWidth={1.2} />
            </span>

            <h1 className="mj-display text-display-sm">All set</h1>
            <p className="mx-auto mt-5 max-w-sm text-body-sm leading-[1.9] text-charcoal-200">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>

            <div className="mt-10 space-y-3">
              <Button variant="primary" fullWidth to={ROUTES.login}>
                Back to sign in
              </Button>
              <Button variant="ghost" fullWidth to={ROUTES.home}>
                Return to the home page
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 3 && (
        <p className="mt-10 text-center font-sans text-body-xs text-charcoal-50">
          Remembered it?{' '}
          <Link to={ROUTES.login} className="mj-link text-charcoal-100">
            Sign in instead
          </Link>
        </p>
      )}
    </motion.div>
  )
}
