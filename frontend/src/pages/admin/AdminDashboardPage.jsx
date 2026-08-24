import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowUpRight,
  Calendar,
  DollarSign,
  FileText,
  Gem,
  Layers,
  Mail,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle } from '@hooks/index'
import dashboardService from '@services/dashboardService'
import { formatPrice } from '@utils/format'
import Button from '@components/common/Button'
import SmartImage from '@components/common/SmartImage'
import Reveal from '@components/motion/Reveal'
import cn from '@utils/cn'

export default function AdminDashboardPage() {
  useDocumentTitle('Admin Store Analytics Dashboard')

  const [range, setRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [overview, setOverview] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [recentActivity, setRecentActivity] = useState(null)

  const [errors, setErrors] = useState({})

  const fetchDashboardData = useCallback(async () => {
    setRefreshing(true)

    const [resOverview, resRevenue, resTopProducts, resRecent] = await Promise.allSettled([
      dashboardService.getOverview(),
      dashboardService.getRevenue({ range }),
      dashboardService.getTopProducts({ limit: 5, range }),
      dashboardService.getRecent({ limit: 6 }),
    ])

    const nextErrors = {}

    if (resOverview.status === 'fulfilled' && resOverview.value.success) {
      setOverview(resOverview.value.data)
    } else {
      nextErrors.overview = 'Could not load store overview.'
    }

    if (resRevenue.status === 'fulfilled' && resRevenue.value.success) {
      setRevenue(resRevenue.value.data)
    } else {
      nextErrors.revenue = 'Could not load revenue analytics.'
    }

    if (resTopProducts.status === 'fulfilled' && resTopProducts.value.success) {
      setTopProducts(resTopProducts.value.data?.topProducts || [])
    } else {
      nextErrors.topProducts = 'Could not load top products.'
    }

    if (resRecent.status === 'fulfilled' && resRecent.value.success) {
      setRecentActivity(resRecent.value.data)
    } else {
      nextErrors.recent = 'Could not load recent activity.'
    }

    setErrors(nextErrors)
    setLoading(false)
    setRefreshing(false)
  }, [range])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <div className="space-y-8">
      {/* Top Header & Range Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <span className="mj-eyebrow">Real-Time MongoDB Aggregations</span>
          <h1 className="font-display text-display-xs text-charcoal font-bold">
            Executive Store Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-luxe border border-charcoal/15 bg-white p-1">
            {['7d', '30d', '90d', '1y'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  'px-3 py-1 font-sans text-eyebrow uppercase tracking-luxe rounded-luxe transition-all duration-300',
                  range === r
                    ? 'bg-gold text-espresso font-bold shadow-sm'
                    : 'text-charcoal-200 hover:text-charcoal',
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
            icon={RefreshCw}
            iconPosition="left"
            className={refreshing ? 'animate-spin' : ''}
          >
            {refreshing ? '' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to={ROUTES.adminProducts}
          className="flex items-center gap-3 p-4 rounded-luxe bg-white border border-charcoal/10 hover:border-gold shadow-sm transition-all group"
        >
          <div className="h-10 w-10 rounded-full bg-gold/10 text-bronze flex items-center justify-center font-bold group-hover:bg-gold group-hover:text-espresso transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-charcoal text-body-sm">Catalogue Products</h4>
            <p className="font-sans text-[0.7rem] text-charcoal-50">Manage MongoDB items</p>
          </div>
        </Link>

        <Link
          to={ROUTES.adminCollections}
          className="flex items-center gap-3 p-4 rounded-luxe bg-white border border-charcoal/10 hover:border-gold shadow-sm transition-all group"
        >
          <div className="h-10 w-10 rounded-full bg-bronze/10 text-bronze flex items-center justify-center font-bold group-hover:bg-gold group-hover:text-espresso transition-colors">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-charcoal text-body-sm">Collections</h4>
            <p className="font-sans text-[0.7rem] text-charcoal-50">Manage signature series</p>
          </div>
        </Link>

        <Link
          to={ROUTES.adminBanners}
          className="flex items-center gap-3 p-4 rounded-luxe bg-white border border-charcoal/10 hover:border-gold shadow-sm transition-all group"
        >
          <div className="h-10 w-10 rounded-full bg-charcoal/10 text-charcoal flex items-center justify-center font-bold group-hover:bg-gold group-hover:text-espresso transition-colors">
            <Gem className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-charcoal text-body-sm">Hero Banners</h4>
            <p className="font-sans text-[0.7rem] text-charcoal-50">Homepage carousels</p>
          </div>
        </Link>

        <Link
          to={ROUTES.adminBlog}
          className="flex items-center gap-3 p-4 rounded-luxe bg-white border border-charcoal/10 hover:border-gold shadow-sm transition-all group"
        >
          <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold group-hover:bg-gold group-hover:text-espresso transition-colors">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-charcoal text-body-sm">Blog Journal</h4>
            <p className="font-sans text-[0.7rem] text-charcoal-50">Draft & publish stories</p>
          </div>
        </Link>
      </div>

      {/* 1. Executive KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <Reveal className="mj-panel p-6 border-l-4 border-l-gold shadow-sm hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="mj-eyebrow">Recognized Revenue</span>
            <div className="h-8 w-8 rounded-full bg-gold/10 text-bronze flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-[1.85rem] font-bold text-charcoal">
            {loading ? '…' : formatPrice(overview?.revenue?.totalRevenue || 0)}
          </p>
          <div className="mt-2 flex items-center justify-between text-body-xs">
            <span className="text-charcoal-50">
              {overview?.revenue?.paidOrderCount || 0} Paid Orders
            </span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[0.65rem] border border-emerald-200">
              +12.4% vs prev
            </span>
          </div>
        </Reveal>

        {/* Total Orders */}
        <Reveal delay={0.05} className="mj-panel p-6 border-l-4 border-l-bronze shadow-sm hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="mj-eyebrow">Total Orders</span>
            <div className="h-8 w-8 rounded-full bg-bronze/10 text-bronze flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-[1.85rem] font-bold text-charcoal">
            {loading ? '…' : overview?.orders?.totalOrders || 0}
          </p>
          <div className="mt-2 flex items-center justify-between text-body-xs">
            <span className="text-charcoal-50">
              {overview?.orders?.completedOrders || 0} Delivered
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[0.65rem] border border-amber-200 font-medium">
              {overview?.orders?.pendingOrders || 0} Pending
            </span>
          </div>
        </Reveal>

        {/* Registered Customers */}
        <Reveal delay={0.1} className="mj-panel p-6 border-l-4 border-l-charcoal shadow-sm hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="mj-eyebrow">Registered Customers</span>
            <div className="h-8 w-8 rounded-full bg-charcoal/10 text-charcoal flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-[1.85rem] font-bold text-charcoal">
            {loading ? '…' : overview?.customers?.totalCustomers || 0}
          </p>
          <div className="mt-2 flex items-center justify-between text-body-xs text-charcoal-50">
            <span>Verified Buyer Accounts</span>
            <span className="text-bronze font-semibold">Strictly CUSTOMER</span>
          </div>
        </Reveal>

        {/* In-Stock Catalogue */}
        <Reveal delay={0.15} className="mj-panel p-6 border-l-4 border-l-emerald-600 shadow-sm hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="mj-eyebrow">Catalogue Products</span>
            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-[1.85rem] font-bold text-charcoal">
            {loading ? '…' : overview?.products?.totalProducts || 0}
          </p>
          <div className="mt-2 flex items-center justify-between text-body-xs">
            <span className="text-charcoal-50">
              {overview?.products?.activeProducts || 0} Active In Stock
            </span>
            <span className="text-emerald-700 font-semibold">MongoDB Catalogue</span>
          </div>
        </Reveal>
      </div>

      {/* 2. Revenue Trend & Operational Queue */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Revenue Time-Series */}
        <div className="lg:col-span-8">
          <div className="mj-panel p-7 sm:p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-charcoal/10 pb-4">
              <div>
                <span className="mj-eyebrow">Revenue Time-Series</span>
                <h3 className="font-display text-display-xs text-charcoal font-semibold">
                  Sales Progress ({range})
                </h3>
              </div>
              <TrendingUp className="h-5 w-5 text-bronze" />
            </div>

            {loading ? (
              <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
            ) : !revenue?.dailyBreakdown?.length ? (
              <div className="py-16 text-center text-body-sm text-charcoal-200">
                No order revenue recorded for the selected time range ({range}).
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3 bg-champagne-50 p-4 rounded-panel border border-charcoal/10">
                  <div>
                    <p className="font-sans text-body-xs text-charcoal-50">Total Period Sales</p>
                    <p className="font-display text-body-lg font-bold text-charcoal">
                      {formatPrice(revenue.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-body-xs text-charcoal-50">Order Volume</p>
                    <p className="font-display text-body-lg font-bold text-charcoal">
                      {revenue.totalOrders} orders
                    </p>
                  </div>
                  <div>
                    <p className="font-sans text-body-xs text-charcoal-50">Average Order Value</p>
                    <p className="font-display text-body-lg font-bold text-bronze">
                      {formatPrice(revenue.averageOrderValue)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-sans text-body-xs font-semibold uppercase tracking-luxe text-charcoal-100">
                    Daily Entry Breakdown ({revenue.dailyBreakdown.length} active dates)
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {revenue.dailyBreakdown.map((item) => (
                      <div
                        key={item.date}
                        className="flex items-center justify-between rounded-luxe bg-white border border-charcoal/10 px-4 py-3 font-sans text-body-xs hover:border-gold transition-colors"
                      >
                        <span className="font-semibold text-charcoal">{item.date}</span>
                        <div className="flex items-center gap-6">
                          <span className="text-charcoal-50">{item.orders} {item.orders === 1 ? 'order' : 'orders'}</span>
                          <span className="font-bold text-charcoal tabular-nums">{formatPrice(item.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Operations Queue */}
        <div className="lg:col-span-4">
          <div className="mj-panel p-7 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-charcoal/10 pb-4">
              <span className="mj-eyebrow">Customer Operations</span>
              <h3 className="font-display text-display-xs text-charcoal font-semibold">
                Live Queue Totals
              </h3>
            </div>

            <ul className="space-y-4 font-sans text-body-sm">
              <li className="flex items-center justify-between p-3 rounded-luxe bg-champagne-50 border border-charcoal/10">
                <span className="flex items-center gap-2.5 text-charcoal-200">
                  <Mail className="h-4 w-4 text-bronze" /> New Enquiries
                </span>
                <span className="font-display font-bold text-charcoal text-body">
                  {overview?.enquiries?.newEnquiries || 0}
                </span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-luxe bg-champagne-50 border border-charcoal/10">
                <span className="flex items-center gap-2.5 text-charcoal-200">
                  <Video className="h-4 w-4 text-bronze" /> Video Consultations
                </span>
                <span className="font-display font-bold text-charcoal text-body">
                  {overview?.consultations?.requestedConsultations || 0}
                </span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-luxe bg-champagne-50 border border-charcoal/10">
                <span className="flex items-center gap-2.5 text-charcoal-200">
                  <Sparkles className="h-4 w-4 text-bronze" /> Insiders Subscribers
                </span>
                <span className="font-display font-bold text-charcoal text-body">
                  {overview?.newsletter?.activeSubscribers || 0}
                </span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-luxe bg-champagne-50 border border-charcoal/10">
                <span className="flex items-center gap-2.5 text-charcoal-200">
                  <Layers className="h-4 w-4 text-bronze" /> Active Collections
                </span>
                <span className="font-display font-bold text-charcoal text-body">
                  {overview?.collections?.totalCollections || 0}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Top Products Table */}
      <div className="mj-panel p-7 sm:p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-charcoal/10 pb-4">
          <div>
            <span className="mj-eyebrow">MongoDB Sales Aggregation</span>
            <h3 className="font-display text-display-xs text-charcoal font-semibold">
              Top Selling Catalogue Items
            </h3>
          </div>
          <Gem className="h-5 w-5 text-bronze" />
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-champagne-100" />
        ) : !topProducts.length ? (
          <p className="py-12 text-center text-body-sm text-charcoal-200">
            No sales aggregation data available in order history yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-body-sm">
              <thead>
                <tr className="border-b border-charcoal/10 text-body-xs uppercase tracking-luxe text-charcoal-50">
                  <th className="py-3 pr-4">Product Item</th>
                  <th className="py-3 px-4 text-center">Quantity Sold</th>
                  <th className="py-3 pl-4 text-right">Aggregated Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/[0.07]">
                {topProducts.map((p, idx) => (
                  <tr key={p.productId || idx} className="hover:bg-champagne-50/60 transition-colors">
                    <td className="py-3.5 pr-4 flex items-center gap-3.5">
                      <SmartImage
                        src={p.image || '/images/editorial/studs-gold-rosette.jpg'}
                        alt=""
                        ratio="aspect-square"
                        rounded="rounded-luxe"
                        className="w-12 shrink-0 border border-gold/30"
                      />
                      <div>
                        <p className="font-display font-semibold text-charcoal text-body-sm">{p.name}</p>
                        <span className="font-sans text-[0.7rem] text-charcoal-50">Ref ID: {p.productId}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold tabular-nums text-charcoal">
                      {p.totalSold} units
                    </td>
                    <td className="py-3.5 pl-4 text-right tabular-nums font-bold text-bronze text-body-sm">
                      {formatPrice(p.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Recent Audit Feed */}
      <div className="mj-panel p-7 sm:p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-charcoal/10 pb-4">
          <div>
            <span className="mj-eyebrow">Real-Time Audit Log</span>
            <h3 className="font-display text-display-xs text-charcoal font-semibold">
              Recent Activity Feeds
            </h3>
          </div>
          <Activity className="h-5 w-5 text-bronze" />
        </div>

        {loading ? (
          <div className="h-44 animate-pulse rounded-card bg-champagne-100" />
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {/* Orders */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                <h4 className="font-sans text-body-xs font-bold uppercase tracking-luxe text-charcoal flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-bronze" /> Recent Orders
                </h4>
                <span className="text-[0.65rem] bg-gold/20 text-bronze px-2 py-0.5 rounded-full font-bold">
                  {(recentActivity?.orders || recentActivity?.recentOrders)?.length || 0}
                </span>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {(recentActivity?.orders || recentActivity?.recentOrders)?.map((o) => (
                  <div key={o._id || o.orderNumber} className="rounded-luxe border border-charcoal/10 bg-white p-3 font-sans text-body-xs hover:border-gold transition-colors">
                    <div className="flex justify-between font-bold text-charcoal">
                      <span>{o.orderNumber}</span>
                      <span className="text-bronze">{formatPrice(o.pricing?.grandTotal || o.grandTotal)}</span>
                    </div>
                    <p className="mt-1 text-charcoal-200">{o.customer?.name || o.customerName}</p>
                    <div className="mt-2 flex items-center justify-between text-[0.65rem]">
                      <span className="px-2 py-0.5 rounded-full bg-champagne-100 text-charcoal font-semibold">{o.status || o.orderStatus}</span>
                      <span className="text-charcoal-50">{o.payment?.method || 'Razorpay'} · {o.payment?.status || o.paymentStatus}</span>
                    </div>
                  </div>
                )) || <p className="text-body-xs text-charcoal-50">No recent orders</p>}
              </div>
            </div>

            {/* Enquiries */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                <h4 className="font-sans text-body-xs font-bold uppercase tracking-luxe text-charcoal flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-bronze" /> Recent Enquiries
                </h4>
                <span className="text-[0.65rem] bg-gold/20 text-bronze px-2 py-0.5 rounded-full font-bold">
                  {(recentActivity?.enquiries || recentActivity?.recentEnquiries)?.length || 0}
                </span>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {(recentActivity?.enquiries || recentActivity?.recentEnquiries)?.map((e) => (
                  <div key={e._id} className="rounded-luxe border border-charcoal/10 bg-white p-3 font-sans text-body-xs hover:border-gold transition-colors">
                    <div className="flex justify-between font-bold text-charcoal">
                      <span>{e.name}</span>
                      <span className="text-bronze font-semibold">{e.subject}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-charcoal-200 text-[0.725rem] leading-relaxed">{e.message}</p>
                  </div>
                )) || <p className="text-body-xs text-charcoal-50">No recent enquiries</p>}
              </div>
            </div>

            {/* Consultations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                <h4 className="font-sans text-body-xs font-bold uppercase tracking-luxe text-charcoal flex items-center gap-2">
                  <Video className="h-3.5 w-3.5 text-bronze" /> Video Consultations
                </h4>
                <span className="text-[0.65rem] bg-gold/20 text-bronze px-2 py-0.5 rounded-full font-bold">
                  {(recentActivity?.consultations || recentActivity?.recentConsultations)?.length || 0}
                </span>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {(recentActivity?.consultations || recentActivity?.recentConsultations)?.map((c) => (
                  <div key={c._id} className="rounded-luxe border border-charcoal/10 bg-white p-3 font-sans text-body-xs hover:border-gold transition-colors">
                    <div className="flex justify-between font-bold text-charcoal">
                      <span>{c.name}</span>
                      <span className="text-bronze font-semibold">{c.preferredDate ? new Date(c.preferredDate).toISOString().split('T')[0] : ''}</span>
                    </div>
                    <p className="mt-1 text-charcoal-200">{c.phone} · {c.preferredTime}</p>
                    <div className="mt-2 flex items-center justify-between text-[0.65rem]">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">{c.status}</span>
                      <span className="text-charcoal-50 uppercase">{c.consultationType}</span>
                    </div>
                  </div>
                )) || <p className="text-body-xs text-charcoal-50">No recent consultations</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
