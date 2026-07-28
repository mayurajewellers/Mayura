import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { CATEGORY_NAV, SERVICE_LINKS } from '@data/navigation'
import { EASE_LUXE } from '@constants/motion'
import { JEWEL_ICONS } from '@components/common/JewelIcons'
import Drawer from '@components/common/Drawer'
import Button from '@components/common/Button'
import cn from '@utils/cn'

/** Full-height mobile navigation mirroring the desktop category rail. */
export default function MobileMenu({ open, onClose }) {
  const [expanded, setExpanded] = useState(null)

  const toggle = (label) => setExpanded((current) => (current === label ? null : label))

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      title="Menu"
      width="max-w-sm"
      footer={
        <div className="space-y-3">
          <Button variant="primary" fullWidth to={ROUTES.login} onClick={onClose}>
            Sign in
          </Button>
          <Button
            variant="outline"
            fullWidth
            href={CONTACT.whatsappUrl}
            target="_blank"
            icon={MessageCircle}
            iconPosition="left"
            onClick={onClose}
          >
            Chat with an expert
          </Button>
        </div>
      }
    >
      <nav aria-label="Mobile">
        <ul className="divide-y divide-charcoal/10">
          {CATEGORY_NAV.map((item) => {
            const Icon = JEWEL_ICONS[item.icon] ?? JEWEL_ICONS.plume
            const isOpen = expanded === item.label
            const groups = item.mega?.columns ?? []

            return (
              <li key={item.label}>
                {groups.length ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggle(item.label)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-3.5 py-4 text-left"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-bronze" />
                      <span className="flex-1 font-display text-[1.1875rem] text-charcoal">
                        {item.label}
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 text-charcoal-100 transition-transform duration-400',
                          isOpen && 'rotate-180',
                        )}
                        strokeWidth={1.4}
                        aria-hidden="true"
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: EASE_LUXE }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-6 pb-6 pl-8">
                            {groups.map((column) => (
                              <div key={column.title}>
                                <p className="mj-eyebrow mb-3">{column.title}</p>
                                <ul className="space-y-0.5">
                                  {column.links.map((link) => (
                                    <li key={link.label}>
                                      <Link
                                        to={link.to}
                                        onClick={onClose}
                                        className="flex items-baseline justify-between gap-3 py-2 font-sans text-body-sm text-charcoal-200 transition-colors duration-300 hover:text-bronze"
                                      >
                                        {link.label}
                                        {link.meta && (
                                          <span className="font-sans text-[0.625rem] uppercase tracking-wide2 text-charcoal-50">
                                            {link.meta}
                                          </span>
                                        )}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                            <Link
                              to={item.to}
                              onClick={onClose}
                              className="mj-link inline-block font-sans text-eyebrow uppercase tracking-luxe text-bronze"
                            >
                              View all {item.label.toLowerCase()}
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className="flex items-center gap-3.5 py-4 font-display text-[1.1875rem] text-charcoal transition-colors duration-300 hover:text-bronze"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-bronze" />
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ------------------------------------------------------- services */}
      <div className="mt-9 border-t border-charcoal/10 pt-8">
        <p className="mj-eyebrow mb-4">In store & at home</p>
        <ul className="flex flex-wrap gap-2">
          {SERVICE_LINKS.map((service) => (
            <li key={service.label}>
              <Link
                to={service.to}
                onClick={onClose}
                className="inline-block rounded-full border border-charcoal/12 px-3.5 py-2 font-sans text-[0.6875rem] uppercase tracking-wide2 text-charcoal-200 transition-colors duration-300 hover:border-gold hover:text-bronze"
              >
                {service.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* -------------------------------------------------------- contact */}
      <div className="mt-9 space-y-4 border-t border-charcoal/10 pt-8">
        <p className="mj-eyebrow">Visit or call</p>
        <address className="not-italic">
          <p className="text-body-sm leading-relaxed text-charcoal-200">
            {CONTACT.addressLines.slice(0, 3).join(', ')}
          </p>
          <a
            href={`tel:+${CONTACT.phonePrimaryRaw}`}
            className="mt-3 flex items-center gap-2.5 font-sans text-body-sm text-charcoal transition-colors duration-300 hover:text-bronze"
          >
            <Phone className="h-3.5 w-3.5 text-bronze" strokeWidth={1.4} aria-hidden="true" />
            {CONTACT.phonePrimary}
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="mt-2 flex items-center gap-2.5 break-all font-sans text-body-sm text-charcoal transition-colors duration-300 hover:text-bronze"
          >
            <Mail className="h-3.5 w-3.5 text-bronze" strokeWidth={1.4} aria-hidden="true" />
            {CONTACT.email}
          </a>
        </address>
      </div>
    </Drawer>
  )
}
