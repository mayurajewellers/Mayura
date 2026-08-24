import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Banknote,
  Building2,
  CreditCard,
  Lock,
  Smartphone,
  Store,
  Truck,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { useShop } from '@context/ShopContext'
import { useDocumentTitle } from '@hooks/index'
import authService from '@services/authService'
import orderService from '@services/orderService'
import { estimatedDelivery, formatPrice } from '@utils/format'
import PageHero from '@components/layout/PageHero'
import SmartImage from '@components/common/SmartImage'
import Button from '@components/common/Button'
import Reveal from '@components/motion/Reveal'
import { Checkbox, RadioCard, SelectField, TextArea, TextField } from '@components/common/Field'
import cn from '@utils/cn'

const DELIVERY_OPTIONS = [
  {
    key: 'standard',
    icon: Truck,
    label: 'Insured courier',
    meta: 'Free',
    description: `Signature required, fully insured. Estimated ${estimatedDelivery(6)}.`,
  },
  {
    key: 'hand',
    icon: Store,
    label: 'Hand delivery in Mumbai',
    meta: 'Free',
    description: 'A member of our team delivers personally, by appointment, within MMR.',
  },
  {
    key: 'collect',
    icon: Store,
    label: 'Collect from the store',
    meta: 'Free',
    description: 'Cleaned, boxed and waiting. Bring photo ID and your order confirmation.',
  },
]

const PAYMENT_OPTIONS = [
  { key: 'upi', icon: Smartphone, label: 'UPI', description: 'GPay, PhonePe, Paytm or any UPI app.' },
  { key: 'card', icon: CreditCard, label: 'Credit or debit card', description: 'EMI available on most major banks.' },
  { key: 'bank', icon: Building2, label: 'Bank transfer', description: 'NEFT, RTGS or IMPS to our current account.' },
  { key: 'store', icon: Banknote, label: 'Pay at the store', description: 'Reserve now, settle at the counter. Cash limits apply by law.' },
]

const STATES = [
  'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Delhi',
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Madhya Pradesh', 'Punjab',
]

export default function CheckoutPage() {
  useDocumentTitle('Checkout')
  const navigate = useNavigate()
  const { cartLines, cartSubtotal, clearCart } = useShop()
  const currentUser = authService.currentUser()

  const [delivery, setDelivery] = useState('standard')
  const [payment, setPayment] = useState('upi')
  const [placing, setPlacing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState({
    firstName: currentUser?.name?.split(' ')[0] || '',
    lastName: currentUser?.name?.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phone: '',
    line1: '',
    line2: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '',
    country: 'India',
    notes: '',
  })

  const shipping = 0
  const total = cartSubtotal + shipping

  if (!cartLines.length) return <Navigate to={ROUTES.cart} replace />

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    setPlacing(true)
    setErrorMsg('')

    try {
      const customerName = `${formData.firstName} ${formData.lastName}`.trim() || currentUser?.name || 'Customer'
      const customerEmail = formData.email.trim() || currentUser?.email || 'customer@example.com'
      const customerPhone = formData.phone.trim() || '+919876543210'

      const orderPayload = {
        items: cartLines.map((line) => ({
          productId: line.product._id || line.product.id || line.productId,
          quantity: line.quantity,
          selectedSize: line.size || '',
          selectedPurity: line.purity || line.product.purity || '22K',
        })),
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        shippingAddress: {
          name: customerName,
          line1: formData.line1 || 'Main Street',
          line2: formData.line2 || '',
          city: formData.city || 'Mumbai',
          state: formData.state || 'Maharashtra',
          pincode: formData.pincode || '400101',
          country: formData.country || 'India',
          phone: customerPhone,
        },
        paymentMethod: payment === 'store' ? 'COD' : 'ONLINE',
        notes: formData.notes || '',
      }

      const res = await orderService.createOrder(orderPayload)

      if (res.success && res.order) {
        clearCart()
        navigate(ROUTES.orderConfirmed, {
          state: {
            order: res.order,
            orderId: res.order._id || res.order.id || res.order.orderNumber,
          },
          replace: true,
        })
      } else {
        setErrorMsg(res.message || 'Could not place order. Please try again.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while placing your order.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Almost there"
        lede="Please enter your details to complete your order."
        breadcrumbs={[
          { label: 'Home', to: ROUTES.home },
          { label: 'Bag', to: ROUTES.cart },
          { label: 'Checkout' },
        ]}
      />

      <section className="mj-section bg-ivory">
        <div className="mj-container">
          {errorMsg && (
            <div className="mb-8 rounded-luxe border border-red-200 bg-red-50 p-4 text-center font-sans text-body-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={placeOrder} className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            {/* --------------------------------------------------- forms */}
            <div className="space-y-14 lg:col-span-7 xl:col-span-8">
              {/* -------------------------------------------- contact */}
              <Reveal>
                <fieldset>
                  <legend className="mb-1 font-sans text-eyebrow uppercase tracking-luxe text-bronze">
                    Step one
                  </legend>
                  <h2 className="mj-display mb-8 text-display-xs">Contact details</h2>

                  <div className="grid gap-7 sm:grid-cols-2">
                    <TextField
                      label="First name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      autoComplete="given-name"
                      placeholder="Darshil"
                    />
                    <TextField
                      label="Last name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      autoComplete="family-name"
                      placeholder="Bhandari"
                    />
                    <TextField
                      label="Email address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                    <TextField
                      label="Mobile number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                      placeholder="+91 00000 00000"
                    />
                  </div>
                </fieldset>
              </Reveal>

              {/* ------------------------------------------- address */}
              <Reveal>
                <fieldset>
                  <legend className="mb-1 font-sans text-eyebrow uppercase tracking-luxe text-bronze">
                    Step two
                  </legend>
                  <h2 className="mj-display mb-8 text-display-xs">Delivery address</h2>

                  <div className="grid gap-7 sm:grid-cols-2">
                    <TextField
                      label="Flat, house or building"
                      name="line1"
                      value={formData.line1}
                      onChange={handleChange}
                      required
                      autoComplete="address-line1"
                      className="sm:col-span-2"
                      placeholder="Shop No. 12, Rangoli Building"
                    />
                    <TextField
                      label="Area, street or landmark"
                      name="line2"
                      value={formData.line2}
                      onChange={handleChange}
                      autoComplete="address-line2"
                      className="sm:col-span-2"
                      placeholder="Vasant Utsav, Thakur Village"
                    />
                    <TextField
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      autoComplete="address-level2"
                      placeholder="Mumbai"
                    />
                    <SelectField
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      options={STATES}
                      required
                    />
                    <TextField
                      label="PIN code"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="400101"
                    />
                    <TextField label="Country" name="country" value={formData.country} readOnly />
                    <TextArea
                      label="Delivery notes (optional)"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="sm:col-span-2"
                      placeholder="Gate code, best time to deliver, or anything the courier should know."
                    />
                  </div>

                  <div className="mt-7 space-y-3.5">
                    <Checkbox label="Billing address is the same as delivery address" defaultChecked />
                    <Checkbox label="This is a gift — please omit the invoice from the parcel" />
                  </div>
                </fieldset>
              </Reveal>

              {/* ------------------------------------------ delivery */}
              <Reveal>
                <fieldset>
                  <legend className="mb-1 font-sans text-eyebrow uppercase tracking-luxe text-bronze">
                    Step three
                  </legend>
                  <h2 className="mj-display mb-8 text-display-xs">Delivery method</h2>

                  <div className="space-y-3">
                    {DELIVERY_OPTIONS.map((option) => (
                      <RadioCard
                        key={option.key}
                        name="delivery"
                        value={option.key}
                        label={option.label}
                        meta={option.meta}
                        description={option.description}
                        checked={delivery === option.key}
                        onChange={() => setDelivery(option.key)}
                      />
                    ))}
                  </div>
                </fieldset>
              </Reveal>

              {/* ------------------------------------------- payment */}
              <Reveal>
                <fieldset>
                  <legend className="mb-1 font-sans text-eyebrow uppercase tracking-luxe text-bronze">
                    Step four
                  </legend>
                  <h2 className="mj-display mb-4 text-display-xs">Payment method</h2>
                  <p className="mb-8 max-w-xl text-body-sm leading-[1.9] text-charcoal-200">
                    Selecting a method here records your order preference. All orders are processed securely.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {PAYMENT_OPTIONS.map((option) => (
                      <RadioCard
                        key={option.key}
                        name="payment"
                        value={option.key}
                        label={option.label}
                        description={option.description}
                        checked={payment === option.key}
                        onChange={() => setPayment(option.key)}
                      />
                    ))}
                  </div>

                  <p className="mt-6 flex items-start gap-2.5 rounded-luxe border border-charcoal/[0.08] bg-champagne-50 px-4 py-3.5 font-sans text-body-xs leading-relaxed text-charcoal-200">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bronze" strokeWidth={1.5} aria-hidden="true" />
                    Under Section 269ST of the Income Tax Act we cannot accept ₹2,00,000 or more in
                    cash in a single transaction. Larger amounts go through banking channels.
                  </p>
                </fieldset>
              </Reveal>
            </div>

            {/* ------------------------------------------------- summary */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-32">
                <div className="mj-panel p-7 sm:p-8">
                  <h2 className="font-display text-display-xs">Your order</h2>

                  <ul className="mt-7 space-y-5 border-b border-charcoal/10 pb-7">
                    {cartLines.map((line) => (
                      <li key={line.key} className="flex gap-4">
                        <SmartImage
                          src={line.product.images?.[0] || '/images/editorial/studs-gold-rosette.jpg'}
                          alt=""
                          ratio="aspect-square"
                          rounded="rounded-luxe"
                          className="w-16 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-body-sm text-charcoal">
                            {line.product.name}
                          </p>
                          <p className="mt-1 font-sans text-body-xs text-charcoal-50">
                            {line.size && `${line.size} · `}Qty {line.quantity}
                          </p>
                        </div>
                        <p className="shrink-0 font-sans text-body-sm tabular-nums text-charcoal">
                          {formatPrice(line.lineTotal)}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-7 space-y-3.5">
                    <div className="flex justify-between gap-4">
                      <dt className="font-sans text-body-sm text-charcoal-200">Subtotal</dt>
                      <dd className="font-sans text-body-sm tabular-nums text-charcoal">
                        {formatPrice(cartSubtotal)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-sans text-body-sm text-charcoal-200">Delivery</dt>
                      <dd className="font-sans text-body-sm text-success-dark">Free</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-charcoal/10 pt-5">
                      <dt className="font-display text-[1.125rem] text-charcoal">Total</dt>
                      <dd className="font-display text-[1.375rem] tabular-nums text-charcoal">
                        {formatPrice(total)}
                      </dd>
                    </div>
                  </dl>

                  <Button
                    type="submit"
                    variant="gold"
                    fullWidth
                    className="mt-8"
                    disabled={placing}
                  >
                    {placing ? 'Placing order…' : 'Place order'}
                  </Button>

                  <p className="mt-4 text-center font-sans text-body-xs leading-relaxed text-charcoal-50">
                    By placing this order you accept our{' '}
                    <Link to={ROUTES.terms} className="mj-link text-charcoal-100">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link to={ROUTES.privacy} className="mj-link text-charcoal-100">
                      Privacy Policy
                    </Link>
                    .
                  </p>

                  <p
                    className={cn(
                      'mt-6 rounded-luxe border border-gold/25 bg-gold/[0.06] px-4 py-3.5 text-center font-sans text-body-xs leading-relaxed text-bronze',
                    )}
                  >
                    Reach us on {CONTACT.phonePrimary} to discuss customisations or bulk orders.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}
