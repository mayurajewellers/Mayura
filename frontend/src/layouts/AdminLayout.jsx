import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ADMIN_NAVIGATION } from '@constants/adminNavigation'
import AdminHeader from '@components/admin/AdminHeader'
import AdminSidebar from '@components/admin/AdminSidebar'

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Find active page title for header
  let activePageTitle = 'Atelier CMS'
  for (const group of ADMIN_NAVIGATION) {
    const match = group.items.find((item) =>
      item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path),
    )
    if (match) {
      activePageTitle = match.label
      break
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-charcoal flex flex-col lg:flex-row">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          pageTitle={activePageTitle}
        />

        <main className="flex-1 p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
