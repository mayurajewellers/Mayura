import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ROUTES } from '@constants/routes'
import { EASE_LUXE } from '@constants/motion'
import { useDocumentTitle } from '@hooks/index'
import Button from '@components/common/Button'
import Flourish from '@components/common/Flourish'
import SmartImage from '@components/common/SmartImage'

const SUGGESTIONS = [
  { label: 'Bridal Collection', to: ROUTES.collection('bridal-collection') },
  { label: 'Diamond Jewellery', to: ROUTES.collection('diamond-jewellery') },
  { label: 'Daily Wear', to: ROUTES.collection('daily-wear') },
  { label: 'Our Story', to: ROUTES.about },
  { label: 'Contact', to: ROUTES.contact },
]

export default function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <section className="mj-section bg-ivory">
      <div className="mj-container">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <motion.p
              className="mj-eyebrow mb-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_LUXE }}
            >
              Error 404
            </motion.p>

            <motion.h1
              className="mj-display text-display-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.9, ease: EASE_LUXE }}
            >
              This page has been
              <span className="block font-serif italic text-bronze">put away safely</span>
            </motion.h1>

            <Flourish className="my-9 ml-0" />

            <motion.p
              className="max-w-md text-body leading-[1.9] text-charcoal-200"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.8, ease: EASE_LUXE }}
            >
              Whatever you were looking for is not at this address. It may have moved, or it may
              never have existed — either way, the collection is a click away and we are on WhatsApp
              if you would rather just ask.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.8, ease: EASE_LUXE }}
            >
              <Button variant="primary" to={ROUTES.home}>
                Back to the home page
              </Button>
              <Button variant="outline" to={ROUTES.collection('all')}>
                Browse the collection
              </Button>
            </motion.div>

            <motion.div
              className="mt-12 border-t border-charcoal/10 pt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.36, duration: 0.9 }}
            >
              <p className="mj-eyebrow mb-5">Popular destinations</p>
              <ul className="flex flex-wrap gap-x-6 gap-y-3">
                {SUGGESTIONS.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="mj-link font-sans text-body-sm text-charcoal-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE_LUXE }}
          >
            <SmartImage
              src="/images/editorial/macro-pendant-water.jpg"
              alt="A gold pendant photographed on water"
              ratio="aspect-[4/5]"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
