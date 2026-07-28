import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '@components/layout/Navbar'
import MobileMenu from '@components/layout/MobileMenu'
import SearchOverlay from '@components/layout/SearchOverlay'
import Footer from '@components/layout/Footer'
import WhatsAppButton from '@components/layout/WhatsAppButton'
import Toaster from '@components/layout/Toaster'
import { SkipLink } from '@components/common/index.jsx'

export default function RootLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  /* Global ⌘K / Ctrl-K opens search. */
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <SkipLink />

      <Navbar onOpenSearch={() => setSearchOpen(true)} onOpenMenu={() => setMenuOpen(true)} />

      {/*
        `overflow-x: clip` (not hidden) contains the horizontal slide-in
        animations without turning <main> into a scroll container — so the
        sticky header and the sticky product/filter rails keep working.
      */}
      <main id="main" style={{ overflowX: 'clip' }}>
        <Outlet />
      </main>

      <Footer />

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <WhatsAppButton />
      <Toaster />
    </div>
  )
}
