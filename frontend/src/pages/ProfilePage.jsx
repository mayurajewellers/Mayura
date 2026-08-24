import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Edit3,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  Search,
  AlertCircle,
  Phone,
  Mail,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { EASE_LUXE } from '@constants/motion'
import { useDocumentTitle, useAuth } from '@hooks/index'
import { useShop } from '@context/ShopContext'
import orderService from '@services/orderService'
import Button from '@components/common/Button'
import { TextField } from '@components/common/Field'
import cn from '@utils/cn'

export default function ProfilePage() {
  useDocumentTitle('My Profile & Orders')
  const navigate = useNavigate()
  const { user, logout, updateProfile } = useAuth()
  const { wishlistCount } = useShop()

  const [activeTab, setActiveTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')

  // Profile Edit State
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })

  // Addresses State
  const [addresses, setAddresses] = useState(user?.addresses || [])
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressIdx, setEditingAddressIdx] = useState(null)
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  })

  // Sync user state when user updates
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setAddresses(user.addresses || [])
    }
  }, [user])

  // Fetch orders from orderService
  useEffect(() => {
    let isMounted = true
    async function loadOrders() {
      setLoadingOrders(true)
      try {
        const res = await orderService.getMyOrders()
        if (isMounted && res.success) {
          setOrders(res.orders || [])
        }
      } catch {
        /* fallback empty array */
      } finally {
        if (isMounted) setLoadingOrders(false)
      }
    }
    loadOrders()
    return () => {
      isMounted = false
    }
  }, [])

  // Handle Logout
  const handleLogout = () => {
    logout()
    navigate(ROUTES.home)
  }

  // Handle Profile Update Submit
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg({ type: '', text: '' })

    try {
      const res = await updateProfile({ name: name.trim(), phone: phone.trim() })
      if (res.success) {
        setProfileMsg({ type: 'success', text: 'Your profile details have been updated successfully!' })
      } else {
        setProfileMsg({ type: 'error', text: res.error || 'Failed to update profile details.' })
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'An error occurred while saving changes.' })
    } finally {
      setSavingProfile(false)
    }
  }

  // Address Modal handlers
  const openNewAddressModal = () => {
    setEditingAddressIdx(null)
    setAddressForm({
      name: user?.name || '',
      phone: user?.phone || '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isDefault: addresses.length === 0,
    })
    setShowAddressModal(true)
  }

  const openEditAddressModal = (idx) => {
    setEditingAddressIdx(idx)
    setAddressForm({ ...addresses[idx] })
    setShowAddressModal(true)
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    let updated = [...addresses]

    if (addressForm.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }))
    }

    if (editingAddressIdx !== null) {
      updated[editingAddressIdx] = addressForm
    } else {
      updated.push(addressForm)
    }

    setAddresses(updated)
    await updateProfile({ addresses: updated })
    setShowAddressModal(false)
  }

  const handleDeleteAddress = async (idx) => {
    const updated = addresses.filter((_, i) => i !== idx)
    setAddresses(updated)
    await updateProfile({ addresses: updated })
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === 'ALL' || (o.status && o.status.toUpperCase() === orderStatusFilter)
    const matchesSearch =
      !orderSearch ||
      o.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.items?.some((it) => it.name?.toLowerCase().includes(orderSearch.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  // Get User Initials
  const getInitials = (n) => {
    if (!n) return 'M'
    const parts = n.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return n[0].toUpperCase()
  }

  // Status Pill Color Helper
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
      case 'SHIPPED':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/30'
      case 'PROCESSING':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/30'
      case 'CONFIRMED':
        return 'bg-gold/15 text-bronze border-gold/30'
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-700 border-red-500/30'
      default:
        return 'bg-charcoal/10 text-charcoal-200 border-charcoal/20'
    }
  }

  return (
    <div className="bg-ivory-50 min-h-screen py-8 lg:py-14">
      <div className="mj-container">
        {/* ==================================================== HERO BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_LUXE }}
          className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-r from-espresso via-charcoal to-espresso p-6 lg:p-10 text-ivory shadow-xl"
        >
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {/* User Avatar Circle */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-bronze/40 font-display text-2xl font-bold tracking-wider text-gold-200 shadow-md">
                {getInitials(user?.name)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-2xl font-bold text-ivory lg:text-3xl">
                    {user?.name || 'Valued Customer'}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/15 px-3 py-0.5 font-sans text-eyebrow-sm font-semibold uppercase tracking-wide text-gold-200">
                    <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                    Verified
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 font-sans text-body-xs text-ivory/80">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gold-200" />
                    {user?.email}
                  </span>
                  {user?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gold-200" />
                      {user?.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-5 py-2.5 font-sans text-body-xs font-medium uppercase tracking-wide text-ivory transition-all duration-300 hover:border-gold hover:bg-gold/20 hover:text-gold-200"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>

        {/* ==================================================== MAIN LAYOUT GRID */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* SIDEBAR TABS */}
          <div className="lg:col-span-3">
            <div className="sticky top-28 space-y-1.5 rounded-xl border border-charcoal/10 bg-white p-3 shadow-sm">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'orders', label: 'My Orders', icon: Package, badge: orders.length },
                { id: 'addresses', label: 'Saved Addresses', icon: MapPin, badge: addresses.length },
                { id: 'personal', label: 'Personal Details', icon: Edit3 },
                { id: 'wishlist', label: 'Wishlist Quick Access', icon: Heart, badge: wishlistCount },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg px-4 py-3.5 font-sans text-body-sm font-medium transition-all duration-300',
                      isActive
                        ? 'bg-charcoal text-ivory shadow-sm'
                        : 'text-charcoal-200 hover:bg-charcoal/5 hover:text-charcoal',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-4.5 w-4.5', isActive ? 'text-gold-200' : 'text-charcoal-100')} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-semibold',
                          isActive ? 'bg-gold/25 text-gold-200' : 'bg-charcoal/10 text-charcoal-200',
                        )}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* TAB CONTENT AREA */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div
                  key="tab-overview"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  {/* Quick Metrics Cards */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm transition-all hover:border-gold/50">
                      <div className="flex items-center justify-between">
                        <span className="mj-eyebrow">Total Orders</span>
                        <div className="rounded-full bg-gold/15 p-2 text-bronze">
                          <Package className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-3 font-display text-3xl font-bold text-charcoal">{orders.length}</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="mt-3 inline-flex items-center gap-1 font-sans text-body-xs font-medium text-bronze hover:underline"
                      >
                        View all orders <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm transition-all hover:border-gold/50">
                      <div className="flex items-center justify-between">
                        <span className="mj-eyebrow">Saved Addresses</span>
                        <div className="rounded-full bg-gold/15 p-2 text-bronze">
                          <MapPin className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-3 font-display text-3xl font-bold text-charcoal">{addresses.length}</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('addresses')}
                        className="mt-3 inline-flex items-center gap-1 font-sans text-body-xs font-medium text-bronze hover:underline"
                      >
                        Manage addresses <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm transition-all hover:border-gold/50">
                      <div className="flex items-center justify-between">
                        <span className="mj-eyebrow">Wishlist Items</span>
                        <div className="rounded-full bg-gold/15 p-2 text-bronze">
                          <Heart className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-3 font-display text-3xl font-bold text-charcoal">{wishlistCount}</p>
                      <Link
                        to={ROUTES.wishlist}
                        className="mt-3 inline-flex items-center gap-1 font-sans text-body-xs font-medium text-bronze hover:underline"
                      >
                        View wishlist <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Recent Order Preview */}
                  <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
                      <h2 className="font-display text-lg font-bold text-charcoal">Recent Order</h2>
                      {orders.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('orders')}
                          className="mj-link font-sans text-body-xs text-bronze"
                        >
                          View All Orders
                        </button>
                      )}
                    </div>

                    {loadingOrders ? (
                      <div className="py-12 text-center text-charcoal-100">Loading recent order details...</div>
                    ) : orders.length === 0 ? (
                      <div className="py-12 text-center">
                        <ShoppingBag className="mx-auto h-12 w-12 text-charcoal-50" strokeWidth={1} />
                        <p className="mt-3 font-display text-body-lg font-semibold text-charcoal">
                          No orders placed yet
                        </p>
                        <p className="mt-1 font-sans text-body-xs text-charcoal-200">
                          Explore our handcrafted jewellery collections and place your first order.
                        </p>
                        <Button variant="primary" to={ROUTES.collections} className="mt-6">
                          Explore Collections
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-ivory-50 p-4">
                          <div>
                            <span className="font-mono text-body-xs font-bold text-charcoal">
                              Order #{orders[0].orderNumber}
                            </span>
                            <p className="font-sans text-body-xs text-charcoal-200">Placed on {orders[0].date}</p>
                          </div>
                          <span
                            className={cn(
                              'rounded-full border px-3 py-1 font-sans text-eyebrow-sm uppercase font-semibold',
                              getStatusBadgeClass(orders[0].status),
                            )}
                          >
                            {orders[0].status}
                          </span>
                        </div>

                        <div className="divide-y divide-charcoal/10">
                          {orders[0].items?.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-center gap-4 py-3">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-14 w-14 rounded-lg object-cover border border-charcoal/10"
                                />
                              ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-charcoal/5 text-charcoal-100">
                                  <Package className="h-6 w-6" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-display text-body-sm font-semibold text-charcoal">{item.name}</p>
                                <p className="font-sans text-body-xs text-charcoal-200">
                                  Qty: {item.quantity} × ₹{item.unitPrice?.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ORDERS HISTORY */}
              {activeTab === 'orders' && (
                <motion.div
                  key="tab-orders"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold text-charcoal">My Orders</h2>
                      <p className="font-sans text-body-xs text-charcoal-200">
                        View and track all your jewellery purchases
                      </p>
                    </div>

                    {/* Order Search */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-100" />
                      <input
                        type="text"
                        placeholder="Search order number..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full rounded-full border border-charcoal/15 bg-white pl-10 pr-4 py-2 font-sans text-body-xs text-charcoal placeholder:text-charcoal-50 focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Order Status Filters */}
                  <div className="flex flex-wrap gap-2 border-b border-charcoal/10 pb-4">
                    {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setOrderStatusFilter(st)}
                        className={cn(
                          'rounded-full px-3.5 py-1.5 font-sans text-eyebrow uppercase transition-all duration-300',
                          orderStatusFilter === st
                            ? 'bg-charcoal text-ivory shadow-sm'
                            : 'bg-white border border-charcoal/10 text-charcoal-200 hover:border-gold hover:text-bronze',
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Orders List */}
                  {loadingOrders ? (
                    <div className="rounded-xl border border-charcoal/10 bg-white p-12 text-center text-charcoal-200">
                      Loading orders...
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="rounded-xl border border-charcoal/10 bg-white p-12 text-center">
                      <Package className="mx-auto h-12 w-12 text-charcoal-50" strokeWidth={1} />
                      <p className="mt-3 font-display text-body-lg font-semibold text-charcoal">No orders found</p>
                      <p className="mt-1 font-sans text-body-xs text-charcoal-200">
                        {orderSearch || orderStatusFilter !== 'ALL'
                          ? 'Try adjusting your search or status filter.'
                          : 'You haven’t placed any orders yet.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredOrders.map((ord) => (
                        <div
                          key={ord.id || ord.orderNumber}
                          className="overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                        >
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 bg-ivory-50 p-5">
                            <div>
                              <span className="font-mono text-body-sm font-bold text-charcoal">
                                Order #{ord.orderNumber}
                              </span>
                              <p className="font-sans text-body-xs text-charcoal-200">Placed on {ord.date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'rounded-full border px-3 py-1 font-sans text-eyebrow-sm font-semibold uppercase',
                                  getStatusBadgeClass(ord.status),
                                )}
                              >
                                {ord.status}
                              </span>
                              <span className="font-display text-body-md font-bold text-charcoal">
                                ₹{ord.pricing?.grandTotal?.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="p-5 divide-y divide-charcoal/10">
                            {ord.items?.map((item, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
                                <div className="flex items-center gap-4">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-16 w-16 rounded-lg object-cover border border-charcoal/10"
                                    />
                                  ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-charcoal/5 text-charcoal-100">
                                      <Package className="h-6 w-6" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-display text-body-sm font-semibold text-charcoal">
                                      {item.name}
                                    </p>
                                    <p className="font-sans text-body-xs text-charcoal-200">
                                      Qty: {item.quantity} · Price: ₹{item.unitPrice?.toLocaleString('en-IN')}
                                    </p>
                                    {item.selectedOptions?.size && (
                                      <span className="font-sans text-body-xs text-charcoal-100">
                                        Size: {item.selectedOptions.size}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-sans text-body-sm font-bold text-charcoal">
                                    ₹{(item.lineTotal || item.quantity * item.unitPrice)?.toLocaleString('en-IN')}
                                  </p>
                                  {item.slug && (
                                    <Link
                                      to={`/product/${item.slug}`}
                                      className="mj-link font-sans text-body-xs text-bronze inline-flex items-center gap-1 mt-1"
                                    >
                                      View Product <ExternalLink className="h-3 w-3" />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer & Tracking */}
                          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-charcoal/10 bg-ivory-50/50 px-5 py-4 font-sans text-body-xs text-charcoal-200">
                            <div>
                              <span>Payment: </span>
                              <strong className="text-charcoal uppercase">{ord.payment?.method || 'COD'}</strong> (
                              {ord.payment?.status || 'PENDING'})
                            </div>
                            {ord.delivery?.trackingNumber && (
                              <div className="flex items-center gap-2 text-bronze">
                                <Truck className="h-4 w-4" />
                                <span>
                                  Tracking ({ord.delivery.courierName || 'Courier'}):{' '}
                                  <strong className="font-mono">{ord.delivery.trackingNumber}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: SAVED ADDRESSES */}
              {activeTab === 'addresses' && (
                <motion.div
                  key="tab-addresses"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold text-charcoal">Saved Delivery Addresses</h2>
                      <p className="font-sans text-body-xs text-charcoal-200">
                        Manage your shipping destinations for fast checkout
                      </p>
                    </div>
                    <Button variant="primary" onClick={openNewAddressModal} icon={Plus} iconPosition="left">
                      Add Address
                    </Button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="rounded-xl border border-charcoal/10 bg-white p-12 text-center">
                      <MapPin className="mx-auto h-12 w-12 text-charcoal-50" strokeWidth={1} />
                      <p className="mt-3 font-display text-body-lg font-semibold text-charcoal">
                        No addresses saved
                      </p>
                      <p className="mt-1 font-sans text-body-xs text-charcoal-200">
                        Add a delivery address to speed up future checkouts.
                      </p>
                      <Button variant="outline" onClick={openNewAddressModal} className="mt-6">
                        Add New Address
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {addresses.map((addr, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'relative rounded-xl border bg-white p-5 shadow-sm transition-all duration-300',
                            addr.isDefault ? 'border-gold bg-gold/[0.04]' : 'border-charcoal/10 hover:border-gold/40',
                          )}
                        >
                          {addr.isDefault && (
                            <span className="absolute right-4 top-4 rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 font-sans text-eyebrow-sm font-bold uppercase text-bronze">
                              Default Address
                            </span>
                          )}
                          <p className="font-display text-body-md font-bold text-charcoal">{addr.name}</p>
                          <p className="mt-2 font-sans text-body-xs leading-relaxed text-charcoal-200">
                            {addr.line1}
                            {addr.line2 ? `, ${addr.line2}` : ''}
                            <br />
                            {addr.city}, {addr.state} — {addr.pincode}
                            <br />
                            {addr.country || 'India'}
                          </p>
                          <p className="mt-3 font-sans text-body-xs font-medium text-charcoal">Phone: {addr.phone}</p>

                          <div className="mt-5 flex items-center justify-end gap-3 border-t border-charcoal/10 pt-3">
                            <button
                              type="button"
                              onClick={() => openEditAddressModal(idx)}
                              className="font-sans text-body-xs font-medium text-bronze hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(idx)}
                              className="font-sans text-body-xs font-medium text-error hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 4: PERSONAL DETAILS */}
              {activeTab === 'personal' && (
                <motion.div
                  key="tab-personal"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm lg:p-8"
                >
                  <h2 className="font-display text-xl font-bold text-charcoal">Personal Information</h2>
                  <p className="mt-1 font-sans text-body-xs text-charcoal-200">
                    Update your account details and contact information
                  </p>

                  {profileMsg.text && (
                    <div
                      className={cn(
                        'mt-6 rounded-lg p-4 font-sans text-body-xs font-medium border',
                        profileMsg.type === 'success'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800'
                          : 'border-red-500/30 bg-red-500/10 text-red-800',
                      )}
                    >
                      {profileMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="mt-8 max-w-xl space-y-6">
                    <TextField
                      label="Full Name"
                      name="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                    <div>
                      <TextField label="Email Address" name="email" value={user?.email || ''} disabled readOnly />
                      <p className="mt-1 font-sans text-eyebrow text-charcoal-100">
                        Email address is tied to your account login.
                      </p>
                    </div>

                    <TextField
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />

                    <div className="pt-4">
                      <Button type="submit" variant="primary" disabled={savingProfile}>
                        {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 5: WISHLIST QUICK ACCESS */}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="tab-wishlist"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm lg:p-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold text-charcoal">My Saved Wishlist</h2>
                      <p className="font-sans text-body-xs text-charcoal-200">
                        Quick access to items you’ve saved for later
                      </p>
                    </div>
                    <Link to={ROUTES.wishlist}>
                      <Button variant="outline">Open Wishlist Page</Button>
                    </Link>
                  </div>

                  <div className="mt-8 rounded-lg bg-ivory-50 p-8 text-center border border-charcoal/10">
                    <Heart className="mx-auto h-12 w-12 text-gold-300" strokeWidth={1} />
                    <p className="mt-3 font-display text-body-lg font-semibold text-charcoal">
                      You have {wishlistCount} saved item{wishlistCount === 1 ? '' : 's'}
                    </p>
                    <p className="mt-1 font-sans text-body-xs text-charcoal-200">
                      View your complete wishlist to move items into your shopping bag.
                    </p>
                    <Button variant="primary" to={ROUTES.wishlist} className="mt-6">
                      Go to Wishlist
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ==================================================== ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl lg:p-8"
          >
            <h3 className="font-display text-xl font-bold text-charcoal">
              {editingAddressIdx !== null ? 'Edit Address' : 'Add New Address'}
            </h3>
            <form onSubmit={handleSaveAddress} className="mt-6 space-y-4">
              <TextField
                label="Recipient Name"
                required
                value={addressForm.name}
                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
              />
              <TextField
                label="Phone Number"
                required
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
              />
              <TextField
                label="Address Line 1"
                required
                value={addressForm.line1}
                onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
              />
              <TextField
                label="Address Line 2 (Optional)"
                value={addressForm.line2}
                onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="City"
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
                <TextField
                  label="State"
                  required
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Pincode"
                  required
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                />
                <TextField
                  label="Country"
                  required
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-charcoal/20 text-gold focus:ring-gold"
                />
                <label htmlFor="isDefault" className="font-sans text-body-xs text-charcoal">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddressModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Address
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
