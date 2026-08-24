import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, MessageCircle, Phone } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { useDocumentTitle } from '@hooks/index'
import orderService from '@services/orderService'
import { estimatedDelivery, formatPrice } from '@utils/format'
import { EASE_LUXE } from '@constants/motion'
import Button from '@components/common/Button'
import Flourish from '@components/common/Flourish'
import { SpecList } from '@components/common/index.jsx'
import Reveal from '@components/motion/Reveal'

export default function OrderConfirmedPage() {
  useDocumentTitle('Order received')
  const location = useLocation()
  const stateOrder = location.state?.order || null
  const orderId = location.state?.orderId || stateOrder?._id || stateOrder?.id

  const [order, setOrder] = useState(stateOrder)

  useEffect(() => {
    if (!order && orderId) {
      let isSubscribed = true
      orderService.getOrderById(orderId).then((res) => {
        if (!isSubscribed) return
        if (res.success && res.order) {
          setOrder(res.order)
        }
      })
      return () => {
        isSubscribed = false
      }
    }
  }, [order, orderId])

  const reference = order?.orderNumber || `MJ-${new Date().getFullYear()}-8821`
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const grandTotalStr = order?.pricing?.grandTotal ? formatPrice(order.pricing.grandTotal) : null
  const orderStatus = order?.status || 'PENDING'

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
              Your order has been saved securely to our system. We will contact you to confirm the day’s gold rate, exact weights, and delivery details.
            </p>
          </Reveal>

          <Reveal delay={0.32} className="mt-12 w-full">
            <div className="mj-panel p-8 text-left sm:p-10">
              <p className="mj-eyebrow mb-6">Reference</p>
              <SpecList
                items={[
                  { label: 'Order reference', value: reference },
                  { label: 'Placed', value: orderDate },
                  { label: 'Estimated delivery', value: estimatedDelivery(6) },
                  { label: 'Status', value: orderStatus },
                  ...(grandTotalStr ? [{ label: 'Total Amount', value: grandTotalStr }] : []),
                ]}
              />
              <p className="mt-7 border-t border-charcoal/10 pt-6 font-sans text-body-xs leading-relaxed text-charcoal-50">
                Your order is confirmed. Quote reference number <strong>{reference}</strong> when contacting customer service.
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
              <Button variant="ghost" to={ROUTES.collections}>
                Continue browsing the collection
              </Button>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
