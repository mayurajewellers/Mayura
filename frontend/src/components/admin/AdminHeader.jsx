import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, LogOut, Menu, ShieldCheck, X } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import authService from '@services/authService'

export default function AdminHeader({ mobileOpen, setMobileOpen, pageTitle = 'Atelier CMS' }) {
  const navigate = useNavigate()
  const currentUser = authService.currentUser()

  const handleLogout = () => {
    authService.signOut()
    navigate(ROUTES.adminLogin)
  }

  return (
    <header className="bg-white border-b border-charcoal/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-luxe border border-charcoal/15 text-charcoal hover:bg-champagne-100 transition-colors"
          aria-label="Toggle Navigation Drawer"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div>
          <h2 className="font-display text-display-xs text-charcoal font-bold">
            {pageTitle}
          </h2>
        </div>

        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans text-[0.7rem] font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Live Showroom Connected
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to={ROUTES.home}
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-luxe bg-ivory border border-charcoal/15 text-charcoal-200 hover:border-gold hover:text-charcoal font-sans text-body-xs font-medium transition-all"
        >
          <span>Storefront</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-bronze" />
        </Link>

        {/* Profile Info & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-charcoal/10">
          <div className="h-9 w-9 rounded-full bg-gold/20 border border-gold flex items-center justify-center font-bold text-gold text-body-xs">
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="font-display text-body-xs font-semibold text-charcoal truncate max-w-[120px]">
              {currentUser?.name || 'Mayura Admin'}
            </p>
            <span className="inline-flex items-center gap-1 text-[0.65rem] text-bronze font-sans font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3" /> ADMIN
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out of Admin Portal"
            className="p-2 rounded-luxe text-charcoal-50 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
