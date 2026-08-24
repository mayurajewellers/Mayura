import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  MapPin,
  Package,
  Printer,
  Save,
  ShieldCheck,
  Truck,
  UserCheck,
  UserX,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle } from '@hooks/index'
import orderService from '@services/orderService'
import { formatPrice } from '@utils/format'
import Button from '@components/common/Button'
import SmartImage from '@components/common/SmartImage'
import cn from '@utils/cn'

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  // Status Modal State
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [modalOrderStatus, setModalOrderStatus] = useState('')
  const [modalPaymentStatus, setModalPaymentStatus] = useState('')

  // Fulfillment & Notes State
  const [courierName, setCourierName] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useDocumentTitle(order ? `Order ${order.orderNumber} — Mayura Admin` : 'Admin Order Detail')

  const fetchOrderDetail = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')

    const res = await orderService.getAdminOrderById(id)
    if (res.success && res.order) {
      setOrder(res.order)
      setModalOrderStatus(res.order.status || 'PENDING_PAYMENT')
      setModalPaymentStatus(res.order.payment?.status || 'PENDING')
      setCourierName(res.order.delivery?.courierName || '')
      setTrackingNumber(res.order.delivery?.trackingNumber || '')
      setAdminNotes(res.order.adminNotes || '')
    } else {
      if (res.status === 401) {
        setError('Your admin session has expired. Please log in again.')
      } else if (res.status === 403) {
        setError('You do not have permission to access this page.')
      } else if (res.status === 404) {
        setError(`Order ${id} could not be found in the database.`)
      } else {
        setError(res.message || 'Order details could not be retrieved.')
      }
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchOrderDetail()
  }, [fetchOrderDetail])

  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    if (!order) return
    setActionLoading(true)
    setFeedback('')

    const res = await orderService.updateAdminOrder(order._id, {
      status: modalOrderStatus,
      paymentStatus: modalPaymentStatus,
    })

    if (res.success && res.order) {
      setOrder(res.order)
      setShowStatusModal(false)
      setFeedback('Order status updated successfully.')
    } else {
      setFeedback(res.message || 'Failed to update order status.')
    }
    setActionLoading(false)
  }

  const handleSaveFulfillment = async (e) => {
    e.preventDefault()
    if (!order) return
    setActionLoading(true)
    setFeedback('')

    const res = await orderService.updateAdminOrder(order._id, {
      courierName,
      trackingNumber,
    })

    if (res.success && res.order) {
      setOrder(res.order)
      setFeedback('Fulfillment details saved successfully.')
    } else {
      setFeedback(res.message || 'Failed to save fulfillment info.')
    }
    setActionLoading(false)
  }

  const handleSaveNotes = async (e) => {
    e.preventDefault()
    if (!order) return
    setActionLoading(true)
    setFeedback('')

    const res = await orderService.updateAdminOrder(order._id, {
      adminNotes,
    })

    if (res.success && res.order) {
      setOrder(res.order)
      setFeedback('Internal admin notes saved successfully.')
    } else {
      setFeedback(res.message || 'Failed to save admin notes.')
    }
    setActionLoading(false)
  }

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300'
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-800 border-blue-300'
      case 'PROCESSING':
      case 'CONFIRMED':
        return 'bg-amber-50 text-amber-900 border-amber-300'
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-800 border-rose-300'
      default:
        return 'bg-champagne-100 text-charcoal-200 border-charcoal/20'
    }
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'AUTHORIZED':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'FAILED':
      case 'REFUNDED':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-panel bg-champagne-100" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 animate-pulse rounded-panel bg-champagne-100" />
          <div className="h-96 animate-pulse rounded-panel bg-champagne-100" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mj-panel p-8 text-center space-y-4">
        <h2 className="font-display text-body-lg font-bold text-rose-700">Order Not Found</h2>
        <p className="font-sans text-body-xs text-charcoal-200">{error || 'The requested order could not be retrieved.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.adminOrders)} icon={ArrowLeft}>
          Back to Orders List
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Feedback Notification */}
      {feedback && (
        <div className="rounded-luxe border border-emerald-500/30 bg-emerald-500/10 p-4 font-sans text-body-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback('')} className="text-emerald-900 font-bold text-xs">✕</button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="mj-panel p-6 sm:p-8 space-y-4 border border-gold/40 shadow-sm bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate(ROUTES.adminOrders)}
              className="inline-flex items-center gap-1.5 text-body-xs text-bronze hover:text-bronze-dark font-semibold transition-colors mb-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
            </button>
            <h1 className="font-display text-display-xs font-bold text-charcoal flex items-center gap-3">
              Order #{order.orderNumber}
            </h1>
            <p className="text-body-xs text-charcoal-50 flex items-center gap-1.5 font-sans">
              <Calendar className="h-3.5 w-3.5 text-bronze" /> Created:{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Badges & Main Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-body-xs font-bold border uppercase',
                getPaymentStatusBadge(order.payment?.status),
              )}
            >
              {order.payment?.status || 'PENDING'}
            </span>

            <span
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-body-xs font-bold border uppercase',
                getOrderStatusBadge(order.status),
              )}
            >
              {order.status || 'PENDING_PAYMENT'}
            </span>

            <div className="flex items-center gap-2 pl-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowStatusModal(true)}
              >
                Update Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                icon={Printer}
              >
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Operations 2-Column Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* ================================================= LEFT COLUMN (Items, Financials, Timeline) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. ORDER ITEMS */}
          <div className="mj-panel p-6 sm:p-8 space-y-6 shadow-sm bg-white">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <h2 className="font-display text-body-md font-bold text-charcoal flex items-center gap-2">
                <Package className="h-5 w-5 text-bronze" /> Order Items ({order.items?.length || 0})
              </h2>
              <span className="text-[0.7rem] text-charcoal-50 font-semibold uppercase">
                Historical Snapshot
              </span>
            </div>

            <div className="divide-y divide-charcoal/10">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 font-sans text-body-xs">
                  <div className="flex items-center gap-4 min-w-0">
                    <SmartImage
                      src={item.image || '/images/editorial/studs-gold-rosette.jpg'}
                      alt={item.name}
                      ratio="aspect-square"
                      rounded="rounded-luxe"
                      className="w-16 h-16 shrink-0 border border-gold/30 object-cover"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="font-display font-semibold text-charcoal text-body-sm truncate">
                        {item.name}
                      </h4>
                      <p className="font-mono text-[0.68rem] text-charcoal-50">
                        SKU: {item.sku || 'N/A'} {item.legacyId ? `· Legacy ID: ${item.legacyId}` : ''}
                      </p>
                      {item.selectedOptions && (
                        <p className="text-[0.65rem] text-bronze font-semibold">
                          {[
                            item.selectedOptions.size && `Size: ${item.selectedOptions.size}`,
                            item.selectedOptions.variant?.purity && `Purity: ${item.selectedOptions.variant.purity}`,
                            item.selectedOptions.variant?.shade && `Shade: ${item.selectedOptions.variant.shade}`,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-charcoal/10">
                    <div className="text-left sm:text-right font-mono text-[0.75rem] text-charcoal-200">
                      <span>{item.quantity} × {formatPrice(item.unitPrice)}</span>
                    </div>
                    <span className="font-bold text-bronze text-body-sm tabular-nums">
                      {formatPrice(item.lineTotal || item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. PAYMENT & FINANCIAL SUMMARY */}
          <div className="mj-panel p-6 sm:p-8 space-y-6 shadow-sm bg-white">
            <div className="border-b border-charcoal/10 pb-3">
              <h2 className="font-display text-body-md font-bold text-charcoal flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-bronze" /> Payment & Financial Summary
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 font-sans text-body-xs">
              {/* Financial Breakdown Table */}
              <div className="space-y-2.5 bg-champagne-50/60 p-4 rounded-luxe border border-charcoal/10">
                <div className="flex justify-between text-charcoal-200">
                  <span>Items Subtotal</span>
                  <span className="tabular-nums font-semibold">{formatPrice(order.pricing?.subtotal)}</span>
                </div>
                {order.pricing?.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({order.pricing?.couponCode || 'Promo'})</span>
                    <span className="tabular-nums font-semibold">-{formatPrice(order.pricing.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal-200">
                  <span>Insured Shipping</span>
                  <span className="tabular-nums font-semibold">{order.pricing?.shipping === 0 ? 'FREE' : formatPrice(order.pricing?.shipping)}</span>
                </div>
                <div className="flex justify-between text-charcoal-200">
                  <span>GST / Taxes</span>
                  <span className="tabular-nums font-semibold">{order.pricing?.tax === 0 ? 'Included' : formatPrice(order.pricing?.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-charcoal text-body-sm border-t border-charcoal/15 pt-2">
                  <span>Grand Total ({order.pricing?.currency || 'INR'})</span>
                  <span className="text-bronze tabular-nums">{formatPrice(order.pricing?.grandTotal)}</span>
                </div>
              </div>

              {/* Payment Gateway Metadata */}
              <div className="space-y-3 p-4 rounded-luxe bg-ivory border border-charcoal/15">
                <div>
                  <span className="uppercase text-[0.65rem] font-bold text-charcoal-50 tracking-luxe">Payment Method</span>
                  <p className="font-bold text-charcoal text-body-sm uppercase">
                    {order.payment?.method || 'RAZORPAY'}
                  </p>
                </div>
                <div>
                  <span className="uppercase text-[0.65rem] font-bold text-charcoal-50 tracking-luxe">Payment Status</span>
                  <p className="font-semibold text-emerald-700">
                    {order.payment?.status || 'PENDING'}
                  </p>
                </div>
                {order.payment?.razorpayOrderId && (
                  <div>
                    <span className="uppercase text-[0.65rem] font-bold text-charcoal-50 tracking-luxe">Razorpay Order ID</span>
                    <p className="font-mono text-[0.7rem] text-charcoal truncate">
                      {order.payment.razorpayOrderId}
                    </p>
                  </div>
                )}
                {order.payment?.razorpayPaymentId && (
                  <div>
                    <span className="uppercase text-[0.65rem] font-bold text-charcoal-50 tracking-luxe">Razorpay Payment ID</span>
                    <p className="font-mono text-[0.7rem] text-charcoal truncate">
                      {order.payment.razorpayPaymentId}
                    </p>
                  </div>
                )}
                {order.payment?.paidAt && (
                  <div>
                    <span className="uppercase text-[0.65rem] font-bold text-charcoal-50 tracking-luxe">Paid At</span>
                    <p className="font-mono text-[0.7rem] text-charcoal">
                      {new Date(order.payment.paidAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. ORDER TIMELINE */}
          <div className="mj-panel p-6 sm:p-8 space-y-6 shadow-sm bg-white">
            <div className="border-b border-charcoal/10 pb-3">
              <h2 className="font-display text-body-md font-bold text-charcoal flex items-center gap-2">
                <Clock className="h-5 w-5 text-bronze" /> Order Progress Timeline
              </h2>
            </div>

            <div className="relative pl-6 space-y-6 border-l-2 border-gold/40 font-sans text-body-xs">
              {/* Order Created */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-bronze border-2 border-white" />
                <p className="font-bold text-charcoal">Order Placed</p>
                <p className="text-[0.7rem] text-charcoal-50">
                  {new Date(order.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              {/* Payment Received */}
              {order.payment?.paidAt && (
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-600 border-2 border-white" />
                  <p className="font-bold text-charcoal">Payment Authorized & Verified</p>
                  <p className="text-[0.7rem] text-charcoal-50">
                    {new Date(order.payment.paidAt).toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              {/* Status Milestone */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-gold border-2 border-white" />
                <p className="font-bold text-charcoal">Current Status: {order.status}</p>
                <p className="text-[0.7rem] text-charcoal-50">
                  Last Updated: {new Date(order.updatedAt).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= RIGHT COLUMN (Customer, Shipping, Tracking, Notes) */}
        <div className="space-y-8">
          {/* 1. CUSTOMER DETAILS */}
          <div className="mj-panel p-6 space-y-4 shadow-sm bg-white border border-charcoal/10">
            <div className="border-b border-charcoal/10 pb-3 flex items-center justify-between">
              <h3 className="font-display text-body-sm font-bold text-charcoal flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-bronze" /> Customer Details
              </h3>
              <span className="inline-flex items-center gap-1 text-[0.6rem] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {order.userId ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                {order.userId ? 'Registered Customer' : 'Guest Customer'}
              </span>
            </div>

            <div className="space-y-3 font-sans text-body-xs">
              <div>
                <span className="uppercase text-[0.65rem] font-bold text-charcoal-50 tracking-luxe">Full Name</span>
                <p className="font-bold text-charcoal text-body-sm">{order.customer?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="uppercase text-[0.65rem] font-bold text-charcoal-50 tracking-luxe">Email Address</span>
                <p className="font-mono text-[0.75rem] text-charcoal">{order.customer?.email || 'N/A'}</p>
              </div>
              <div>
                <span className="uppercase text-[0.65rem] font-bold text-charcoal-50 tracking-luxe">Phone Helpline</span>
                <p className="font-mono text-[0.75rem] text-charcoal">{order.customer?.phone || 'N/A'}</p>
              </div>
              {order.userId && (
                <div>
                  <span className="uppercase text-[0.65rem] font-bold text-charcoal-50 tracking-luxe">Account User ID</span>
                  <p className="font-mono text-[0.68rem] text-charcoal-200 truncate">{String(order.userId)}</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. SHIPPING ADDRESS */}
          <div className="mj-panel p-6 space-y-4 shadow-sm bg-white border border-charcoal/10">
            <div className="border-b border-charcoal/10 pb-3">
              <h3 className="font-display text-body-sm font-bold text-charcoal flex items-center gap-2">
                <MapPin className="h-4 w-4 text-bronze" /> Shipping Delivery Address
              </h3>
            </div>

            <div className="font-sans text-body-xs space-y-1.5 text-charcoal-200">
              <p className="font-bold text-charcoal text-body-sm">{order.shippingAddress?.name || order.customer?.name}</p>
              <p>{order.shippingAddress?.line1}</p>
              {order.shippingAddress?.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p>{order.shippingAddress?.country || 'India'}</p>
              <p className="font-mono text-[0.72rem] text-charcoal pt-1">Phone: {order.shippingAddress?.phone || order.customer?.phone}</p>
              {order.shippingAddress?.notes && (
                <p className="text-[0.68rem] italic text-bronze pt-2 border-t border-charcoal/10">
                  Delivery instructions: {order.shippingAddress.notes}
                </p>
              )}
            </div>
          </div>

          {/* 3. FULFILLMENT & TRACKING */}
          <form onSubmit={handleSaveFulfillment} className="mj-panel p-6 space-y-4 shadow-sm bg-white border border-charcoal/10">
            <div className="border-b border-charcoal/10 pb-3">
              <h3 className="font-display text-body-sm font-bold text-charcoal flex items-center gap-2">
                <Truck className="h-4 w-4 text-bronze" /> Fulfillment & Tracking
              </h3>
            </div>

            <div className="space-y-3 font-sans text-body-xs">
              <div>
                <label className="block mb-1 font-semibold uppercase text-[0.65rem] text-charcoal">Courier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Delhivery / Blue Dart"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full rounded-luxe border border-charcoal/20 bg-champagne-50/50 p-2.5 text-body-xs text-charcoal focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase text-[0.65rem] text-charcoal">Tracking Reference #</label>
                <input
                  type="text"
                  placeholder="e.g. 128940182941"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-luxe border border-charcoal/20 bg-champagne-50/50 p-2.5 text-body-xs text-charcoal focus:border-gold focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button type="submit" variant="primary" size="xs" disabled={actionLoading} icon={Save}>
                  {actionLoading ? 'Saving…' : 'Save Courier Info'}
                </Button>

                {trackingNumber && (
                  <a
                    href={`https://www.google.com/search?q=track+courier+${encodeURIComponent(trackingNumber)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[0.68rem] text-bronze hover:underline font-semibold"
                  >
                    Track Shipment <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </form>

          {/* 4. INTERNAL ADMIN NOTES */}
          <form onSubmit={handleSaveNotes} className="mj-panel p-6 space-y-4 shadow-sm bg-white border border-charcoal/10">
            <div className="border-b border-charcoal/10 pb-3">
              <h3 className="font-display text-body-sm font-bold text-charcoal flex items-center gap-2">
                <FileText className="h-4 w-4 text-bronze" /> Internal Admin Notes
              </h3>
              <p className="text-[0.65rem] text-charcoal-50">Private notes for internal operations staff. Never shown to customer.</p>
            </div>

            <div className="space-y-3 font-sans text-body-xs">
              <textarea
                rows={4}
                placeholder="Enter internal operational notes, custom verification logs, or special instructions…"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full rounded-luxe border border-charcoal/20 bg-champagne-50/50 p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
              />

              <Button type="submit" variant="primary" size="xs" disabled={actionLoading} icon={Save}>
                {actionLoading ? 'Saving…' : 'Save Notes'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs">
          <form onSubmit={handleUpdateStatus} className="w-full max-w-md rounded-panel bg-white p-6 shadow-2xl space-y-5 font-sans text-body-xs">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <div>
                <span className="mj-eyebrow">Order Lifecycle State</span>
                <h3 className="font-display text-body-lg font-bold text-charcoal">Update Status</h3>
              </div>
              <button type="button" onClick={() => setShowStatusModal(false)} className="rounded-luxe p-1 text-charcoal-100 hover:bg-champagne-100">✕</button>
            </div>

            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem] text-charcoal">Order Status</label>
              <select
                value={modalOrderStatus}
                onChange={(e) => setModalOrderStatus(e.target.value)}
                className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
              >
                <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem] text-charcoal">Payment Status</label>
              <select
                value={modalPaymentStatus}
                onChange={(e) => setModalPaymentStatus(e.target.value)}
                className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
              >
                <option value="PENDING">PENDING</option>
                <option value="AUTHORIZED">AUTHORIZED</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-charcoal/10">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowStatusModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" disabled={actionLoading}>
                {actionLoading ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
