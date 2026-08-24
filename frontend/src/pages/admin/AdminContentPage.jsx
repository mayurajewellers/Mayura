import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  FileText,
  Gem,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle } from '@hooks/index'
import cn from '@utils/cn'

export default function AdminContentPage() {
  useDocumentTitle('Admin Content CMS Central Hub')
  const location = useLocation()

  const tabs = [
    { label: 'Overview', path: ROUTES.adminContent, exact: true, icon: Globe },
    { label: 'Homepage CMS', path: ROUTES.adminContentHomepage, icon: Sparkles },
    { label: 'Hero Banners', path: ROUTES.adminContentBanners, icon: Gem },
    { label: 'Testimonials', path: ROUTES.adminContentTestimonials, icon: Star },
    { label: 'Media Gallery', path: ROUTES.adminContentGallery, icon: ImageIcon },
    { label: 'FAQs', path: ROUTES.adminContentFaqs, icon: HelpCircle },
    { label: 'Blog Journal', path: ROUTES.adminContentBlog, icon: FileText },
    { label: 'Store Policies', path: ROUTES.adminContentPolicies, icon: ShieldCheck },
  ]

  const isOverview = location.pathname === ROUTES.adminContent

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-charcoal/10 pb-4">
        <span className="mj-eyebrow">Storefront Content Management System</span>
        <h1 className="font-display text-display-xs text-charcoal font-bold">
          Mayura Content CMS Central
        </h1>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-charcoal/10 pb-2 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon
          const isActive = t.exact
            ? location.pathname === t.path
            : location.pathname.startsWith(t.path)

          return (
            <Link
              key={t.path}
              to={t.path}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-luxe font-sans text-body-xs transition-all duration-300 whitespace-nowrap',
                isActive
                  ? 'bg-gold text-espresso font-bold shadow-sm'
                  : 'text-charcoal-200 hover:bg-white hover:text-charcoal border border-transparent hover:border-charcoal/10',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Content Area */}
      {isOverview ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tabs.slice(1).map((t) => {
            const Icon = t.icon
            return (
              <Link
                key={t.path}
                to={t.path}
                className="mj-panel p-6 shadow-sm hover:shadow-card hover:border-gold transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-full bg-gold/10 text-bronze flex items-center justify-center group-hover:bg-gold group-hover:text-espresso transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-semibold text-charcoal text-body">{t.label}</h3>
                  <p className="font-sans text-body-xs text-charcoal-50">
                    Manage real-time MongoDB backend content for {t.label.toLowerCase()}.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-charcoal/10 font-sans text-body-xs font-semibold text-bronze flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open {t.label} CMS</span> →
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  )
}
