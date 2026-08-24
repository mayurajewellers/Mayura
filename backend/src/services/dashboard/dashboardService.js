import User from '../../models/User.js'
import Product from '../../models/Product.js'
import Collection from '../../models/Collection.js'
import Order from '../../models/Order.js'
import Enquiry from '../../models/Enquiry.js'
import Consultation from '../../models/Consultation.js'
import NewsletterSubscriber from '../../models/NewsletterSubscriber.js'

/**
 * Match query for recognized revenue orders
 * Recognized: payment.status === 'PAID' OR (status in CONFIRMED/PROCESSING/SHIPPED/DELIVERED AND payment.status !== FAILED)
 */
const REVENUE_ORDER_MATCH = {
  isActive: true,
  $or: [
    { 'payment.status': 'PAID' },
    {
      status: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
      'payment.status': { $ne: 'FAILED' },
    },
  ],
}

/**
 * Parse date filter query into MongoDB date match criteria
 */
export const parseDateFilter = (query) => {
  const { range, from, to } = query

  if (from || to) {
    const dateCriteria = {}
    if (from) {
      const startDate = new Date(from)
      if (!isNaN(startDate.getTime())) dateCriteria.$gte = startDate
    }
    if (to) {
      const endDate = new Date(to)
      if (!isNaN(endDate.getTime())) dateCriteria.$lte = endDate
    }
    if (Object.keys(dateCriteria).length > 0) {
      return { createdAt: dateCriteria }
    }
  }

  if (range) {
    const now = new Date()
    let days = 30
    const normRange = range.toLowerCase().trim()

    if (normRange === '7d') days = 7
    else if (normRange === '30d') days = 30
    else if (normRange === '90d') days = 90
    else if (normRange === '1y' || normRange === '365d') days = 365

    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return { createdAt: { $gte: startDate } }
  }

  return {}
}

/**
 * Overview Summary metrics across all components
 */
export const getOverviewMetrics = async () => {
  const [
    totalCustomers,
    totalOrders,
    completedOrders,
    pendingOrders,
    totalProducts,
    activeProducts,
    totalCollections,
    newEnquiries,
    requestedConsultations,
    activeSubscribers,
    revenueAggregation,
  ] = await Promise.all([
    User.countDocuments({ role: 'CUSTOMER', isActive: true }),
    Order.countDocuments({ isActive: true }),
    Order.countDocuments({ status: 'DELIVERED', isActive: true }),
    Order.countDocuments({ status: 'PENDING_PAYMENT', isActive: true }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, inStock: true }),
    Collection.countDocuments({ isActive: true }),
    Enquiry.countDocuments({ status: 'NEW', isActive: true }),
    Consultation.countDocuments({ status: 'REQUESTED', isActive: true }),
    NewsletterSubscriber.countDocuments({ status: 'SUBSCRIBED', isActive: true }),
    Order.aggregate([
      { $match: REVENUE_ORDER_MATCH },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.grandTotal' }, paidOrderCount: { $sum: 1 } } },
    ]),
  ])

  const totalRevenue = revenueAggregation[0]?.totalRevenue || 0
  const paidOrderCount = revenueAggregation[0]?.paidOrderCount || 0
  const averageOrderValue = paidOrderCount > 0 ? Math.round(totalRevenue / paidOrderCount) : 0

  return {
    revenue: {
      totalRevenue,
      paidOrderCount,
      averageOrderValue,
      currency: 'INR',
    },
    orders: {
      totalOrders,
      completedOrders,
      pendingOrders,
    },
    customers: {
      totalCustomers,
    },
    products: {
      totalProducts,
      activeProducts,
    },
    collections: {
      totalCollections,
    },
    enquiries: {
      newEnquiries,
    },
    consultations: {
      requestedConsultations,
    },
    newsletter: {
      activeSubscribers,
    },
  }
}

/**
 * Revenue Analytics with time-series breakdown
 */
export const getRevenueAnalytics = async (dateFilter = {}) => {
  const matchCriteria = {
    ...REVENUE_ORDER_MATCH,
    ...dateFilter,
  }

  const [summary, dailyBreakdown] = await Promise.all([
    Order.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.grandTotal' },
          totalOrders: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.grandTotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ])

  const totalRevenue = summary[0]?.totalRevenue || 0
  const totalOrders = summary[0]?.totalOrders || 0
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    currency: 'INR',
    dailyBreakdown: dailyBreakdown.map((item) => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders,
    })),
  }
}

/**
 * Order Status and Payment Breakdown Analytics
 */
export const getOrderAnalytics = async (dateFilter = {}) => {
  const matchCriteria = { isActive: true, ...dateFilter }

  const [statusAggregation, paymentStatusAggregation, paymentMethodAggregation, totals] = await Promise.all([
    Order.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$payment.status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$payment.method', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalValue: { $sum: '$pricing.grandTotal' },
        },
      },
    ]),
  ])

  const statusMap = {
    PENDING_PAYMENT: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  }
  statusAggregation.forEach((item) => {
    if (item._id) statusMap[item._id] = item.count
  })

  const paymentStatusMap = {
    PENDING: 0,
    AUTHORIZED: 0,
    PAID: 0,
    FAILED: 0,
    REFUNDED: 0,
  }
  paymentStatusAggregation.forEach((item) => {
    if (item._id) paymentStatusMap[item._id] = item.count
  })

  const paymentMethodMap = {}
  paymentMethodAggregation.forEach((item) => {
    if (item._id) paymentMethodMap[item._id] = item.count
  })

  const totalOrders = totals[0]?.totalOrders || 0
  const totalValue = totals[0]?.totalValue || 0
  const averageOrderValue = totalOrders > 0 ? Math.round(totalValue / totalOrders) : 0

  return {
    totalOrders,
    totalValue,
    averageOrderValue,
    byStatus: statusMap,
    byPaymentStatus: paymentStatusMap,
    byPaymentMethod: paymentMethodMap,
  }
}

/**
 * Customer Metrics (Strictly role: 'CUSTOMER')
 */
export const getCustomerAnalytics = async (dateFilter = {}) => {
  const baseQuery = { role: 'CUSTOMER' }
  const periodQuery = { ...baseQuery, ...dateFilter }

  const [totalCustomers, activeCustomers, verifiedCustomers, newCustomersInPeriod, growthBreakdown] =
    await Promise.all([
      User.countDocuments(baseQuery),
      User.countDocuments({ ...baseQuery, isActive: true }),
      User.countDocuments({ ...baseQuery, isEmailVerified: true }),
      User.countDocuments(periodQuery),
      User.aggregate([
        { $match: periodQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            newCustomers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

  return {
    totalCustomers,
    activeCustomers,
    verifiedCustomers,
    newCustomersInPeriod,
    registrationTrends: growthBreakdown.map((item) => ({
      date: item._id,
      newCustomers: item.newCustomers,
    })),
  }
}

/**
 * Product Metrics & Stock status
 */
export const getProductAnalytics = async () => {
  const [totalProducts, activeProducts, inactiveProducts, featuredProducts, outOfStockProducts, lowStockProducts, inStockProducts] =
    await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: false }),
      Product.countDocuments({ isActive: true, isFeatured: true }),
      Product.countDocuments({ isActive: true, inventoryQuantity: 0 }),
      Product.countDocuments({ isActive: true, inventoryQuantity: { $gt: 0, $lte: 5 } }),
      Product.countDocuments({ isActive: true, inventoryQuantity: { $gt: 5 } }),
    ])

  return {
    totalProducts,
    activeProducts,
    inactiveProducts,
    featuredProducts,
    inStockProducts,
    lowStockProducts,
    outOfStockProducts,
  }
}

/**
 * Top Selling Products based on recognized orders
 */
export const getTopProducts = async (limit = 10, page = 1) => {
  const numLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
  const numPage = Math.max(1, parseInt(page, 10) || 1)
  const skip = (numPage - 1) * numLimit

  const pipeline = [
    { $match: REVENUE_ORDER_MATCH },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        name: { $first: '$items.name' },
        sku: { $first: '$items.sku' },
        legacyId: { $first: '$items.legacyId' },
        image: { $first: '$items.image' },
        unitPrice: { $first: '$items.unitPrice' },
        quantitySold: { $sum: '$items.quantity' },
        revenueGenerated: { $sum: '$items.lineTotal' },
      },
    },
    { $sort: { quantitySold: -1, revenueGenerated: -1 } },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: numLimit }],
      },
    },
  ]

  const result = await Order.aggregate(pipeline)

  const topProducts = result[0]?.data || []
  const total = result[0]?.metadata[0]?.total || 0
  const totalPages = Math.ceil(total / numLimit) || 1

  return {
    topProducts: topProducts.map((p) => ({
      productId: p._id,
      name: p.name,
      sku: p.sku,
      legacyId: p.legacyId,
      image: p.image,
      unitPrice: p.unitPrice,
      quantitySold: p.quantitySold,
      revenueGenerated: p.revenueGenerated,
    })),
    pagination: {
      page: numPage,
      limit: numLimit,
      total,
      totalPages,
    },
  }
}

/**
 * Collection analytics - product count per collection slug
 */
export const getCollectionAnalytics = async () => {
  const [totalCollections, activeCollections, productCounts] = await Promise.all([
    Collection.countDocuments({}),
    Collection.countDocuments({ isActive: true }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$collection', productCount: { $sum: 1 } } },
      { $sort: { productCount: -1 } },
    ]),
  ])

  return {
    totalCollections,
    activeCollections,
    productsPerCollection: productCounts.map((item) => ({
      collectionSlug: item._id || 'uncategorized',
      productCount: item.productCount,
    })),
  }
}

/**
 * Enquiry Analytics
 */
export const getEnquiryAnalytics = async (dateFilter = {}) => {
  const matchCriteria = { isActive: true, ...dateFilter }

  const [totalEnquiries, statusBreakdown, sourceBreakdown] = await Promise.all([
    Enquiry.countDocuments(matchCriteria),
    Enquiry.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Enquiry.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
  ])

  const byStatus = { NEW: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 }
  statusBreakdown.forEach((item) => {
    if (item._id) byStatus[item._id] = item.count
  })

  const bySource = {}
  sourceBreakdown.forEach((item) => {
    if (item._id) bySource[item._id] = item.count
  })

  return {
    totalEnquiries,
    byStatus,
    bySource,
  }
}

/**
 * Consultation Analytics
 */
export const getConsultationAnalytics = async () => {
  const [totalConsultations, statusBreakdown, typeBreakdown] = await Promise.all([
    Consultation.countDocuments({ isActive: true }),
    Consultation.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Consultation.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$consultationType', count: { $sum: 1 } } },
    ]),
  ])

  const byStatus = { REQUESTED: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 }
  statusBreakdown.forEach((item) => {
    if (item._id) byStatus[item._id] = item.count
  })

  const byType = {}
  typeBreakdown.forEach((item) => {
    if (item._id) byType[item._id] = item.count
  })

  return {
    totalConsultations,
    byStatus,
    byType,
  }
}

/**
 * Newsletter Subscriber Analytics
 */
export const getNewsletterAnalytics = async (dateFilter = {}) => {
  const matchCriteria = { isActive: true, ...dateFilter }

  const [totalSubscribers, statusBreakdown, sourceBreakdown] = await Promise.all([
    NewsletterSubscriber.countDocuments({ isActive: true }),
    NewsletterSubscriber.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    NewsletterSubscriber.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
  ])

  const byStatus = { SUBSCRIBED: 0, UNSUBSCRIBED: 0 }
  statusBreakdown.forEach((item) => {
    if (item._id) byStatus[item._id] = item.count
  })

  const bySource = {}
  sourceBreakdown.forEach((item) => {
    if (item._id) bySource[item._id] = item.count
  })

  return {
    totalSubscribers,
    byStatus,
    bySource,
  }
}

/**
 * Combined Recent Operational Activity
 */
export const getRecentActivity = async (limit = 10) => {
  const numLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))

  const [recentOrders, recentEnquiries, recentConsultations, recentCustomers] = await Promise.all([
    Order.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(numLimit)
      .select('orderNumber customer pricing.grandTotal status payment.status createdAt')
      .lean(),
    Enquiry.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(numLimit)
      .select('name email subject status source createdAt')
      .lean(),
    Consultation.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(numLimit)
      .select('name email phone preferredDate preferredTime consultationType status createdAt')
      .lean(),
    User.find({ role: 'CUSTOMER', isActive: true })
      .sort({ createdAt: -1 })
      .limit(numLimit)
      .select('name email phone createdAt')
      .lean(),
  ])

  return {
    orders: recentOrders.map((o) => ({
      orderNumber: o.orderNumber,
      customerName: o.customer.name,
      customerEmail: o.customer.email,
      grandTotal: o.pricing.grandTotal,
      orderStatus: o.status,
      paymentStatus: o.payment?.status,
      createdAt: o.createdAt,
    })),
    enquiries: recentEnquiries,
    consultations: recentConsultations,
    customers: recentCustomers,
  }
}

export default {
  parseDateFilter,
  getOverviewMetrics,
  getRevenueAnalytics,
  getOrderAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getTopProducts,
  getCollectionAnalytics,
  getEnquiryAnalytics,
  getConsultationAnalytics,
  getNewsletterAnalytics,
  getRecentActivity,
}
