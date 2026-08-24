import { Link, useLocation } from 'react-router-dom'
import { Gem, ShieldCheck, X } from 'lucide-react'
import { ADMIN_NAVIGATION } from '@constants/adminNavigation'
import { ROUTES } from '@constants/routes'
import authService from '@services/authService'
import cn from '@utils/cn'

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation()
  const currentUser = authService.currentUser()

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-charcoal/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#121921] text-ivory border-r border-gold/20 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shrink-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Brand Header */}
          <div className="p-6 border-b border-ivory/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border border-gold bg-gold/10 flex items-center justify-center text-gold shadow-sm">
                <Gem className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-body-lg font-bold tracking-wider text-ivory">
                  MAYURA JEWELLERS
                </h1>
                <p className="font-sans text-[0.65rem] uppercase tracking-luxe text-gold font-semibold">
                  Atelier CMS Portal
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-ivory/60 hover:text-ivory p-1 rounded-luxe hover:bg-ivory/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-6 font-sans text-body-xs overflow-y-auto min-h-0">
            {ADMIN_NAVIGATION.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1.5">
                <div className="px-3 py-1 text-[0.65rem] uppercase tracking-luxe text-ivory/40 font-semibold">
                  {group.title}
                </div>

                {group.items.map((item) => {
                  const Icon = item.icon
                  const isExact = item.exact || item.path === ROUTES.admin || item.path === ROUTES.adminContent
                  const isActive = isExact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path)

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-luxe font-medium transition-all duration-300',
                        isActive
                          ? 'bg-gold text-espresso font-bold shadow-gold-sm'
                          : 'text-ivory/75 hover:bg-ivory/10 hover:text-ivory',
                      )}
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-espresso' : 'text-gold/80')} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Account Status */}
        <div className="p-4 border-t border-ivory/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gold/20 border border-gold flex items-center justify-center font-bold text-gold text-body-xs">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'A'}
            </div>
            <div className="truncate max-w-[130px]">
              <p className="font-display text-body-xs font-semibold text-ivory truncate">
                {currentUser?.name || 'Mayura Admin'}
              </p>
              <span className="text-[0.65rem] text-gold font-sans font-semibold uppercase">
                {currentUser?.email || 'admin@mayura.com'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
