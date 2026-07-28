import { motion } from 'framer-motion'
import { Check, MessageCircle, Phone } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { useDocumentTitle } from '@hooks/index'
import { estimatedDelivery } from '@utils/format'
import { EASE_LUXE } from '@constants/motion'
import Button from '@components/common/Button'
import Flourish from '@components/common/Flourish'
import { SpecList } from '@components/common/index.jsx'
import Reveal from '@components/motion/Reveal'

export default function OrderConfirmedPage() {
  useDocumentTitle('Order received')

  const reference = `MJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`

  return (
    <section className="mj-section bg-ivory">
      <div className="mj-container-narrow">
        <div className="flex flex-col items-center text-center">
          <motion.span
            className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/35 bg-gold/[0.08]"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE_LUXE }}
            aria-hidden="true"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: EASE_LUXE }}
            >
              <Check className="h-8 w-8 text-bronze" strokeWidth={1.2} />
            </motion.span>
          </motion.span>

          <Reveal delay={0.15} className="mt-9">
            <p className="mj-eyebrow mb-5">Thank you</p>
            <h1 className="mj-display text-display-md">Your selection is noted</h1>
          </Reveal>

          <Flourish className="my-9" />

          <Reveal delay={0.25}>
            <p className="max-w-xl text-body-lg leading-[1.9] text-charcoal-200">
              This website does not process payments, so nothing has been charged. What happens next
              is a phone call: we confirm the day’s gold rate, the exact weight of each piece, and
              the delivery date — and only then does any money move.
            </p>
          </Reveal>

          <Reveal delay={0.32} className="mt-12 w-full">
            <div className="mj-panel p-8 text-left sm:p-10">
              <p className="mj-eyebrow mb-6">Reference</p>
              <SpecList
                items={[
                  { label: 'Order reference', value: reference },
                  { label: 'Placed', value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { label: 'Estimated delivery', value: estimatedDelivery(6) },
                  { label: 'Status', value: 'Awaiting rate confirmation' },
                ]}
              />
              <p className="mt-7 border-t border-charcoal/10 pt-6 font-sans text-body-xs leading-relaxed text-charcoal-50">
                This reference is generated in your browser for demonstration purposes and is not
                stored anywhere. Please quote your name when you call.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button
                variant="primary"
                href={CONTACT.whatsappUrl}
                target="_blank"
                icon={MessageCircle}
                iconPosition="left"
              >
                Confirm on WhatsApp
              </Button>
              <Button
                variant="outline"
                href={`tel:+${CONTACT.phonePrimaryRaw}`}
                icon={Phone}
                iconPosition="left"
              >
                {CONTACT.phonePrimary}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.48}>
            <p className="mt-12 font-sans text-body-sm text-charcoal-100">
              <Button variant="ghost" to={ROUTES.collection('all')}>
                Continue browsing the collection
              </Button>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
