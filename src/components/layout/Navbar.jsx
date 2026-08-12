import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ChevronDown, Heart, ImagePlus, Menu, Mic, Search, ShoppingBag, Store, User } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CATEGORY_NAV, SERVICE_LINKS } from '@data/navigation'
import { useShop } from '@context/ShopContext'
import { useEscapeKey, useOnClickOutside, useScrollPosition } from '@hooks/index'
import { JEWEL_ICONS } from '@components/common/JewelIcons'
import IconButton from '@components/common/IconButton'
import Logo from './Logo'
import MegaMenu from './MegaMenu'
import cn from '@utils/cn'

/**
 * Two-row storefront header.
 *
 *   Row 1  logo · search · utility icons
 *   Row 2  category rail of thin-line jewellery icons, each with a mega menu
 *   Row 3  service strip — always visible, on the Mayura royal blue ground
 *
 * Dropdown behaviour is CLICK-DRIVEN (not hover): clicking a category with a
 * menu toggles it, clicking again (or outside, or pressing Escape) closes it,
 * and opening a menu never navigates. Hover only provides visual feedback.
 */
export default function Navbar({ onOpenSearch, onOpenMenu }) {
  /* Hysteresis: compact after 130px, expand again only under 16px. The gap
     (114px) is wider than the header's own height change (~86px on desktop),
     so scroll-anchoring nudges can never flip the state back — this is what
     keeps the header perfectly still when the user stops mid-transition. */
  const { scrolled } = useScrollPosition({ enter: 130, exit: 16 })
  const { cartCount, wishlistCount } = useShop()
  const location = useLocation()
  const navigate = useNavigate()
  const headerRef = useRef(null)

  const [openMenu, setOpenMenu] = useState(null)
  const [query, setQuery] = useState('')
  const [listening, setListening] = useState(false)
  const recognition = useRef(null)

  /* Voice search runs entirely in the browser via the Web Speech API. If the
     engine is unavailable the control is simply not rendered — no dead button. */
  const [voiceSupported, setVoiceSupported] = useState(false)
  useEffect(() => {
    const Engine = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Engine) return undefined

    const instance = new Engine()
    instance.lang = 'en-IN'
    instance.interimResults = false
    instance.maxAlternatives = 1
    instance.onresult = (event) => {
      const said = event.results?.[0]?.[0]?.transcript ?? ''
      if (said) {
        setQuery(said)
        navigate(`${ROUTES.search}?q=${encodeURIComponent(said.trim())}`)
      }
    }
    instance.onend = () => setListening(false)
    instance.onerror = () => setListening(false)

    recognition.current = instance
    setVoiceSupported(true)
    return () => instance.abort?.()
  }, [navigate])

  const toggleVoice = () => {
    if (!recognition.current) return
    if (listening) {
      recognition.current.stop()
      setListening(false)
    } else {
      try {
        recognition.current.start()
        setListening(true)
      } catch {
        setListening(false)
      }
    }
  }

  const closeMenu = useCallback(() => setOpenMenu(null), [])

  const toggleMenu = useCallback((label) => {
    setOpenMenu((current) => (current === label ? null : label))
  }, [])

  /* Close on route change, Escape and any click outside the header. */
  useEffect(() => closeMenu(), [location.pathname, closeMenu])
  useEscapeKey(closeMenu, openMenu !== null)
  useOnClickOutside(headerRef, closeMenu, openMenu !== null)

  const submitSearch = (event) => {
    event.preventDefault()
    const term = query.trim()
    if (!term) return
    navigate(`${ROUTES.search}?q=${encodeURIComponent(term)}`)
    setQuery('')
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-header border-b border-charcoal/[0.09] bg-ivory-50 shadow-nav"
    >
      {/* ==================================================== utility row */}
      <div className="mj-container-wide">
        <div
          className={cn(
            'flex items-center gap-4 transition-all duration-400 ease-luxe sm:gap-6 lg:gap-10',
            scrolled ? 'py-2.5 lg:py-3' : 'py-3.5 lg:py-5',
          )}
        >
          {/* --------------------------------------------- burger + logo */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open menu"
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-luxe text-charcoal transition-colors duration-300 hover:bg-charcoal/[0.06] lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.35} />
            </button>

            <Logo size={scrolled ? 'sm' : 'md'} />
          </div>

          {/* -------------------------------------------------- search */}
          <form
            onSubmit={submitSearch}
            role="search"
            className="hidden min-w-0 flex-1 md:block"
          >
            <label htmlFor="header-search" className="sr-only">
              Search the collection
            </label>
            <div
              className={cn(
                'group/search mx-auto flex max-w-2xl items-center gap-3 rounded-full border border-charcoal/15 bg-white px-5 transition-all duration-400 ease-luxe',
                'focus-within:border-gold focus-within:shadow-card hover:border-charcoal/30',
                scrolled ? 'h-11' : 'h-12',
              )}
            >
              <Search className="h-4 w-4 shrink-0 text-charcoal-100" strokeWidth={1.4} aria-hidden="true" />
              <input
                id="header-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for gold necklace"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-body-sm text-charcoal placeholder:text-charcoal-50 focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Browse trending searches and popular categories"
                className="shrink-0 rounded-full p-1.5 text-charcoal-100 transition-colors duration-300 hover:bg-charcoal/[0.06] hover:text-bronze"
              >
                <ImagePlus className="h-4 w-4" strokeWidth={1.4} />
              </button>

              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-pressed={listening}
                  aria-label={listening ? 'Stop voice search' : 'Search by voice'}
                  className={cn(
                    'shrink-0 rounded-full p-1.5 transition-colors duration-300',
                    listening
                      ? 'bg-gold/15 text-bronze'
                      : 'text-charcoal-100 hover:bg-charcoal/[0.06] hover:text-bronze',
                  )}
                >
                  <Mic className={cn('h-4 w-4', listening && 'animate-pulse')} strokeWidth={1.4} />
                </button>
              )}
            </div>
          </form>

          {/* -------------------------------------------------- utility */}
          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            <IconButton
              icon={Search}
              label="Search"
              onClick={onOpenSearch}
              className="md:hidden"
            />
            <IconButton
              icon={Store}
              label="Visit our store"
              to={ROUTES.contact}
              className="hidden sm:inline-flex"
            />
            <IconButton icon={Heart} label="Wishlist" count={wishlistCount} to={ROUTES.wishlist} />
            <IconButton icon={User} label="Sign in" to={ROUTES.login} />
            <IconButton icon={ShoppingBag} label="Shopping bag" count={cartCount} to={ROUTES.cart} />
          </div>
        </div>
      </div>

      {/* =================================================== category rail */}
      <nav
        aria-label="Product categories"
        className="border-t border-charcoal/[0.07] bg-ivory-50"
      >
        <div className="mj-container-wide">
          <ul className="mj-hide-scrollbar-x flex items-stretch justify-start gap-0.5 xl:justify-center">
            {CATEGORY_NAV.map((item) => {
              const Icon = JEWEL_ICONS[item.icon] ?? JEWEL_ICONS.plume
              const isOpen = openMenu === item.label
              const active = location.pathname === item.to
              const hasMega = Boolean(item.mega)

              const itemClasses = cn(
                'group/cat relative flex items-center gap-2.5 whitespace-nowrap px-3 font-sans text-label transition-colors duration-300 lg:px-4',
                scrolled ? 'py-3' : 'py-3.5',
                isOpen || active ? 'text-bronze' : 'text-charcoal-200 hover:text-charcoal',
              )

              const inner = (
                <>
                  <Icon
                    className={cn(
                      'h-[1.35rem] w-[1.35rem] shrink-0 transition-colors duration-300',
                      isOpen || active ? 'text-bronze' : 'text-charcoal-100 group-hover/cat:text-bronze',
                    )}
                  />
                  <span>{item.label}</span>
                  {hasMega && (
                    <ChevronDown
                      className={cn(
                        'h-3 w-3 shrink-0 text-charcoal-50 transition-transform duration-400 ease-luxe',
                        isOpen && 'rotate-180 text-bronze',
                      )}
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      'absolute inset-x-3 bottom-0 h-[2px] origin-center bg-gold transition-transform duration-400 ease-luxe lg:inset-x-4',
                      isOpen || active ? 'scale-x-100' : 'scale-x-0 group-hover/cat:scale-x-100',
                    )}
                    aria-hidden="true"
                  />
                </>
              )

              return (
                <li key={item.label} className="shrink-0">
                  {hasMega ? (
                    /* Click toggles the menu — it never navigates, so a
                       customer can open a dropdown without losing their page. */
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.label)}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      className={itemClasses}
                    >
                      {inner}
                    </button>
                  ) : (
                    <Link to={item.to} onClick={closeMenu} className={itemClasses}>
                      {inner}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* ================================================== service strip
          Always visible — on the royal blue ground with gold accents so the
          free in-store services are impossible to miss. Compresses on scroll
          on large screens, scrolls horizontally on small ones. */}
      <div
        className={cn(
          'overflow-hidden border-t border-gold/25 bg-espresso transition-all duration-500 ease-luxe',
          scrolled ? 'lg:max-h-0 lg:border-t-0 lg:opacity-0' : 'lg:max-h-12 lg:opacity-100',
        )}
        aria-hidden={scrolled ? 'true' : undefined}
      >
        <div className="mj-container-wide">
          <ul className="mj-hide-scrollbar-x flex items-center justify-start gap-x-7 py-2.5 lg:justify-center lg:gap-x-9">
            {SERVICE_LINKS.map((service) => (
              <li key={service.label} className="shrink-0">
                <Link
                  to={service.to}
                  tabIndex={scrolled ? -1 : 0}
                  className="group/svc flex items-center gap-2 font-sans text-eyebrow-sm uppercase tracking-luxe text-ivory/90 transition-colors duration-300 hover:text-gold-200"
                >
                  <span
                    className="h-1 w-1 rotate-45 bg-gold/80 transition-colors duration-300 group-hover/svc:bg-gold"
                    aria-hidden="true"
                  />
                  {service.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ======================================================= dropdowns */}
      <AnimatePresence>
        {openMenu && (
          <MegaMenu
            mega={CATEGORY_NAV.find((item) => item.label === openMenu)?.mega}
            onNavigate={closeMenu}
          />
        )}
      </AnimatePresence>
    </header>
  )
}
