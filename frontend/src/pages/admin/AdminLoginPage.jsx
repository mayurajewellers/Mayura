import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Gem, ShieldCheck } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle } from '@hooks/index'
import authService from '@services/authService'
import Button from '@components/common/Button'
import { PasswordField, TextField } from '@components/common/Field'

export default function AdminLoginPage() {
  useDocumentTitle('Admin Portal Sign In')
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fromLocation = location.state?.from?.pathname || ROUTES.admin

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await authService.adminSignIn({ email, password })

    if (res.ok && res.user?.role === 'ADMIN') {
      navigate(fromLocation, { replace: true })
    } else {
      setError(res.error || 'Invalid admin credentials. Access denied.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#121921] flex items-center justify-center p-4 font-sans text-ivory">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 rounded-full border-2 border-gold bg-gold/10 flex items-center justify-center text-gold shadow-gold-sm">
            <Gem className="h-8 w-8" />
          </div>
          <h1 className="font-display text-display-xs font-bold text-ivory tracking-wider">
            MAYURA JEWELLERS
          </h1>
          <p className="font-sans text-eyebrow uppercase tracking-luxe text-gold font-semibold flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Executive Atelier CMS
          </p>
        </div>

        <div className="rounded-panel border border-gold/30 bg-[#1a232e] p-8 shadow-2xl space-y-6">
          <div className="border-b border-ivory/10 pb-4 text-center">
            <h2 className="font-display text-body-lg font-semibold text-ivory">Admin Sign In</h2>
            <p className="font-sans text-body-xs text-ivory/60 mt-1">
              Authorized store administration only.
            </p>
          </div>

          {error && (
            <div className="rounded-luxe border border-rose-500/30 bg-rose-500/10 p-4 text-center text-body-xs font-medium text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block font-sans text-body-xs font-semibold uppercase tracking-luxe text-gold">
                Admin Email
              </label>
              <input
                type="email"
                required
                placeholder="admin@mayurajewellers.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-luxe border border-ivory/20 bg-ivory/5 py-3 px-4 text-ivory placeholder-ivory/30 font-sans text-body-xs focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-body-xs font-semibold uppercase tracking-luxe text-gold">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-luxe border border-ivory/20 bg-ivory/5 py-3 px-4 text-ivory placeholder-ivory/30 font-sans text-body-xs focus:border-gold focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full justify-center py-3 bg-gold text-espresso font-bold hover:bg-gold-light"
            >
              {loading ? 'Authenticating…' : 'Sign in to Admin Dashboard'}
            </Button>
          </form>

          <div className="pt-4 border-t border-ivory/10 text-center">
            <Link
              to={ROUTES.home}
              className="font-sans text-body-xs text-ivory/60 hover:text-gold transition-colors"
            >
              ← Return to Mayura Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
