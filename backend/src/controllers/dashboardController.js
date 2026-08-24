import {
  parseDateFilter,
  getOverviewMetrics,
  getRevenueAnalytics,
  getOrderAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getTopProducts as getTopProductsService,
  getCollectionAnalytics,
  getEnquiryAnalytics,
  getConsultationAnalytics,
  getNewsletterAnalytics,
  getRecentActivity,
} from '../services/dashboard/dashboardService.js'
import Order from '../models/Order.js'
import Enquiry from '../models/Enquiry.js'
import Consultation from '../models/Consultation.js'
import User from '../models/User.js'

/**
 * Admin: High-level Dashboard Overview Summary
 * GET /api/v1/admin/dashboard/overview
 */
export const getOverview = async (req, res, next) => {
  try {
    const overview = await getOverviewMetrics()

    return res.status(200).json({
      success: true,
      message: 'Dashboard overview fetched successfully',
      data: overview,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Revenue Analytics with Time-Series & Date Filters
 * GET /api/v1/admin/dashboard/revenue
 */
export const getRevenue = async (req, res, next) => {
  try {
    const dateFilter = parseDateFilter(req.query)
    const revenueData = await getRevenueAnalytics(dateFilter)

    return res.status(200).json({
      success: true,
      message: 'Revenue analytics fetched successfully',
      data: revenueData,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Order Analytics & Status Breakdowns
 * GET /api/v1/admin/dashboard/orders
 */
export const getOrders = async (req, res, next) => {
  try {
    const dateFilter = parseDateFilter(req.query)
    const orderData = await getOrderAnalytics(dateFilter)

    return res.status(200).json({
      success: true,
      message: 'Order analytics fetched successfully',
      data: orderData,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Customer Analytics (Strictly role: CUSTOMER)
 * GET /api/v1/admin/dashboard/customers
 */
export const getCustomers = async (req, res, next) => {
  try {
    const dateFilter = parseDateFilter(req.query)
    const customerData = await getCustomerAnalytics(dateFilter)

    return res.status(200).json({
      success: true,
      message: 'Customer analytics fetched successfully',
      data: customerData,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Product Analytics & Stock Counts
 * GET /api/v1/admin/dashboard/products
 */
export const getProducts = async (req, res, next) => {
  try {
    const productData = await getProductAnalytics()

    return res.status(200).json({
      success: true,
      message: 'Product analytics fetched successfully',
      data: productData,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Top Selling Products
 * GET /api/v1/admin/dashboard/products/top
 */
export const getTopProducts = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query
    const topProductsData = await getTopProductsService(limit, page)

    return res.status(200).json({
      success: true,
      message: 'Top selling products fetched successfully',
      data: topProductsData,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Collection Analytics
 * GET /api/v1/admin/dashboard/collections
 */
export const getCollections = async (req, res, next) => {
  try {
    const collectionData = await getCollectionAnalytics()

    return res.status(200).json({
      success: true,
      message: 'Collection analytics fetched successfully',
      data: collectionData,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Enquiry Analytics
 * GET /api/v1/admin/dashboard/enquiries
 */
export const getEnquiries = async (req, res, next) => {
  try {
    const dateFilter = parseDateFilter(req.query)
    const enquiryData = await getEnquiryAnalytics(dateFilter)

    return res.status(200).json({
      success: true,
      message: 'Enquiry analytics fetched successfully',
      data: enquiryData,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Consultation Analytics
 * GET /api/v1/admin/dashboard/consultations
 */
export const getConsultations = async (req, res, next) => {
  try {
    const consultationData = await getConsultationAnalytics()

    return res.status(200).json({
      success: true,
      message: 'Consultation analytics fetched successfully',
      data: consultationData,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Newsletter Subscriber Analytics
 * GET /api/v1/admin/dashboard/newsletter
 */
export const getNewsletter = async (req, res, next) => {
  try {
    const dateFilter = parseDateFilter(req.query)
    const newsletterData = await getNewsletterAnalytics(dateFilter)

    return res.status(200).json({
      success: true,
      message: 'Newsletter subscriber analytics fetched successfully',
      data: newsletterData,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Combined Recent Activity Overview
 * GET /api/v1/admin/dashboard/recent
 */
export const getRecent = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query
    const recentActivity = await getRecentActivity(limit)

    return res.status(200).json({
      success: true,
      message: 'Recent operational activity fetched successfully',
      data: recentActivity,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Recent Orders Compact View
 * GET /api/v1/admin/dashboard/recent-orders
 */
export const getRecentOrders = async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10))

    const recentOrders = await Order.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('orderNumber customer pricing.grandTotal status payment.status createdAt')
      .lean()

    const formattedOrders = recentOrders.map((o) => ({
      orderNumber: o.orderNumber,
      customerName: o.customer?.name || '',
      customerEmail: o.customer?.email || '',
      grandTotal: o.pricing?.grandTotal || 0,
      orderStatus: o.status,
      paymentStatus: o.payment?.status,
      createdAt: o.createdAt,
    }))

    return res.status(200).json({
      success: true,
      message: 'Recent orders fetched successfully',
      data: { recentOrders: formattedOrders },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Recent Enquiries Compact View
 * GET /api/v1/admin/dashboard/recent-enquiries
 */
export const getRecentEnquiries = async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10))

    const recentEnquiries = await Enquiry.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email subject status source createdAt')
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Recent enquiries fetched successfully',
      data: { recentEnquiries },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Recent Consultations Compact View
 * GET /api/v1/admin/dashboard/recent-consultations
 */
export const getRecentConsultations = async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10))

    const recentConsultations = await Consultation.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email phone preferredDate preferredTime consultationType status createdAt')
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Recent consultations fetched successfully',
      data: { recentConsultations },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Recent Customers Compact View
 * GET /api/v1/admin/dashboard/recent-customers
 */
export const getRecentCustomers = async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10))

    const recentCustomers = await User.find({ role: 'CUSTOMER', isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email phone createdAt')
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Recent customers fetched successfully',
      data: { recentCustomers },
    })
  } catch (error) {
    next(error)
  }
}

export default {
  getOverview,
  getRevenue,
  getOrders,
  getCustomers,
  getProducts,
  getTopProducts,
  getCollections,
  getEnquiries,
  getConsultations,
  getNewsletter,
  getRecent,
  getRecentOrders,
  getRecentEnquiries,
  getRecentConsultations,
  getRecentCustomers,
}
