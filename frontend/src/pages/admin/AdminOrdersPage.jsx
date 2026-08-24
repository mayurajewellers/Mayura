import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle } from '@hooks/index'
import orderService from '@services/orderService'
import { formatPrice } from '@utils/format'
import Button from '@components/common/Button'
import SmartImage from '@components/common/SmartImage'
import cn from '@utils/cn'

export default function AdminOrdersPage() {
  useDocumentTitle('Admin Orders Management — Mayura Jewellers')
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Filter & Search states
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [page, setPage] = useState(1)

  const fetchOrders = useCallback(async () => {
    setRefreshing(true)
    setErrorMessage('')

    const params = {
      page,
      limit: 20,
      sort: sortOrder,
    }
    if (search.trim()) params.search = search.trim()
    if (statusFilter) params.status = statusFilter
    if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter
    if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter

    const res = await orderService.getAdminOrders(params)
    if (res.success) {
      setOrders(res.orders || [])
      setPagination(res.pagination || null)
    } else {
      if (res.status === 401) {
        setErrorMessage('Your admin session has expired. Please log in again.')
      } else if (res.status === 403) {
        setErrorMessage('You do not have permission to access this page.')
      } else {
        setErrorMessage(res.message || 'Unable to load customer orders. Please try again.')
      }
    }
    setLoading(false)
    setRefreshing(false)
  }, [search, statusFilter, paymentStatusFilter, paymentMethodFilter, sortOrder, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

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

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <span className="mj-eyebrow">Commerce Operations</span>
          <h1 className="font-display text-display-xs text-charcoal font-bold">
            Customer Orders Management
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={refreshing}
          icon={RefreshCw}
          className={refreshing ? 'animate-spin' : ''}
        >
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-panel border border-rose-200 bg-rose-50 p-4 text-body-xs font-semibold text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            {errorMessage.includes('expired') ? (
              <Button variant="primary" size="xs" onClick={() => navigate(ROUTES.login)}>
                Log In Again
              </Button>
            ) : (
              <Button variant="outline" size="xs" onClick={fetchOrders}>
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Advanced Filter Bar */}
      <div className="rounded-panel bg-white p-5 border border-charcoal/10 shadow-sm space-y-4 font-sans text-body-xs">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-100" />
            <input
              type="text"
              placeholder="Order #, name, email, phone…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-luxe border border-charcoal/15 bg-champagne-50/50 py-2.5 pl-10 pr-4 text-body-xs font-sans text-charcoal placeholder-charcoal-100 focus:border-gold focus:outline-none"
            />
          </div>

          {/* Order Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 text-body-xs font-sans text-charcoal focus:border-gold focus:outline-none"
            >
              <option value="">All Order Statuses</option>
              <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 text-body-xs font-sans text-charcoal focus:border-gold focus:outline-none"
            >
              <option value="">All Payment Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="AUTHORIZED">AUTHORIZED</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          {/* Payment Method & Sort */}
          <div className="flex items-center gap-2">
            <select
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value)
                setPage(1)
              }}
              className="flex-1 rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 text-body-xs font-sans text-charcoal focus:border-gold focus:outline-none"
            >
              <option value="">All Payment Methods</option>
              <option value="RAZORPAY">RAZORPAY</option>
              <option value="COD">COD</option>
              <option value="UPI">UPI</option>
              <option value="CARD">CARD</option>
              <option value="BANK">BANK</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="p-2.5 rounded-luxe border border-charcoal/15 hover:bg-champagne-100 text-charcoal transition-colors shrink-0"
              title={`Sorting ${sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[0.7rem] text-charcoal-50 font-semibold border-t border-charcoal/10 pt-3">
          <span>
            Active Filters:{' '}
            {[search && `Search "${search}"`, statusFilter, paymentStatusFilter, paymentMethodFilter]
              .filter(Boolean)
              .join(' · ') || 'None'}
          </span>
          <span>{pagination?.total || orders.length} orders found</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="mj-panel p-6 shadow-sm">
        {loading ? (
          <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
        ) : !orders.length ? (
          <div className="py-16 text-center text-body-sm text-charcoal-200">
            No customer orders matching the current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-body-sm">
              <thead>
                <tr className="border-b border-charcoal/10 text-body-xs uppercase tracking-luxe text-charcoal-50">
                  <th className="py-3 pr-4">Order Ref</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Order Status</th>
                  <th className="py-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/[0.07]">
                {orders.map((o) => (
                  <tr key={o._id || o.orderNumber} className="hover:bg-champagne-50/60 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="font-mono font-bold text-charcoal text-body-xs">{o.orderNumber}</span>
                      <p className="text-[0.65rem] text-charcoal-50">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-display font-semibold text-charcoal text-body-sm">{o.customer?.name || 'Guest'}</p>
                      <div className="flex flex-col text-[0.68rem] text-charcoal-50 font-mono">
                        <span>{o.customer?.email}</span>
                        <span>{o.customer?.phone}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center font-semibold tabular-nums text-charcoal">
                      {o.items?.length || 0} items
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-bronze tabular-nums">
                      {formatPrice(o.pricing?.grandTotal)}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold border uppercase',
                          getPaymentStatusBadge(o.payment?.status),
                        )}
                      >
                        {o.payment?.method || 'RAZORPAY'} · {o.payment?.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold border uppercase',
                          getOrderStatusBadge(o.status),
                        )}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td className="py-4 pl-4 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => navigate(ROUTES.adminOrderDetail(o._id || o.orderNumber))}
                        icon={Eye}
                      >
                        View Order
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-charcoal/10 pt-4 font-sans text-body-xs">
            <span className="text-charcoal-50">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total orders)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
