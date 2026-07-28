import { Link, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { BRAND, CONTACT } from '@constants/site'
import { EASE_LUXE } from '@constants/motion'
import Logo from '@components/layout/Logo'
import Toaster from '@components/layout/Toaster'
import { SkipLink } from '@components/common/index.jsx'

/**
 * Split-screen shell for sign in, sign up and password reset.
 * Editorial photograph on the left, a single quiet column of form on the right.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-ivory">
      <SkipLink />

      {/* --------------------------------------------------- image column */}
      <aside className="relative hidden w-[46%] shrink-0 overflow-hidden bg-espresso lg:block xl:w-[50%]">
        <motion.img
          src="/images/editorial/bride-gujarati.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: EASE_LUXE }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/45 to-espresso/15" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Logo tone="light" size="md" className="items-start self-start" />

          <div className="max-w-md">
            <p className="mj-eyebrow-light mb-6">Since 2004 · Thakur Village</p>
            <p className="mj-quote text-ivory/85">
              “Every piece we sell is hallmarked, every diamond is certified, and every rate is
              written down before you decide. That is the whole promise.”
            </p>
            <p className="mt-7 font-sans text-eyebrow uppercase tracking-luxe text-gold-200">
              Darshil Bhandari — Founder
            </p>
          </div>

          <a
            href={CONTACT.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 self-start font-sans text-eyebrow uppercase tracking-luxe text-ivory/55 transition-colors duration-300 hover:text-gold"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
            <span className="mj-underline">{CONTACT.whatsappTooltip}</span>
          </a>
        </div>
      </aside>

      {/* ---------------------------------------------------- form column */}
      <main id="main" className="flex flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Link
            to={ROUTES.home}
            className="group inline-flex items-center gap-2.5 font-sans text-eyebrow uppercase tracking-luxe text-charcoal-100 transition-colors duration-300 hover:text-bronze"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-400 group-hover:-translate-x-1"
              strokeWidth={1.4}
              aria-hidden="true"
            />
            Back to {BRAND.shortName}
          </Link>
          <div className="lg:hidden">
            <Logo size="sm" withWordmark={false} />
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        <footer className="px-6 py-8 text-center sm:px-10">
          <p className="font-sans text-body-xs text-charcoal-50">
            Demonstration only — no account is created and nothing is transmitted.
          </p>
        </footer>
      </main>

      <Toaster />
    </div>
  )
}
