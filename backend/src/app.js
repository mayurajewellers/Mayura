import express from 'express'
import morgan from 'morgan'
import configureCors from './config/cors.js'
import config from './config/env.js'
import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import adminAuthRoutes from './routes/adminAuthRoutes.js'
import productRoutes from './routes/productRoutes.js'
import adminProductRoutes from './routes/adminProductRoutes.js'
import adminInventoryRoutes from './routes/adminInventoryRoutes.js'
import collectionRoutes from './routes/collectionRoutes.js'
import adminCollectionRoutes from './routes/adminCollectionRoutes.js'
import homepageRoutes from './routes/homepageRoutes.js'
import adminHomepageRoutes from './routes/adminHomepageRoutes.js'
import bannerRoutes from './routes/bannerRoutes.js'
import adminBannerRoutes from './routes/adminBannerRoutes.js'
import adminMediaRoutes from './routes/adminMediaRoutes.js'
import blogRoutes from './routes/blogRoutes.js'
import adminBlogRoutes from './routes/adminBlogRoutes.js'
import testimonialRoutes from './routes/testimonialRoutes.js'
import adminTestimonialRoutes from './routes/adminTestimonialRoutes.js'
import galleryRoutes from './routes/galleryRoutes.js'
import adminGalleryRoutes from './routes/adminGalleryRoutes.js'
import faqRoutes from './routes/faqRoutes.js'
import adminFAQRoutes from './routes/adminFAQRoutes.js'
import policyRoutes from './routes/policyRoutes.js'
import adminPolicyRoutes from './routes/adminPolicyRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import adminSettingsRoutes from './routes/adminSettingsRoutes.js'
import pageRoutes from './routes/pageRoutes.js'
import adminPageRoutes from './routes/adminPageRoutes.js'
import navigationRoutes from './routes/navigationRoutes.js'
import adminNavigationRoutes from './routes/adminNavigationRoutes.js'
import enquiryRoutes from './routes/enquiryRoutes.js'
import adminEnquiryRoutes from './routes/adminEnquiryRoutes.js'
import consultationRoutes from './routes/consultationRoutes.js'
import adminConsultationRoutes from './routes/adminConsultationRoutes.js'
import newsletterRoutes from './routes/newsletterRoutes.js'
import adminNewsletterRoutes from './routes/adminNewsletterRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminOrderRoutes from './routes/adminOrderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import adminDashboardRoutes from './routes/adminDashboardRoutes.js'
import notFoundHandler from './middleware/notFound.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()

// Middleware
app.use(configureCors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// API Routes (Versioning: /api/v1)
app.use('/api/v1/health', healthRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/admin/auth', adminAuthRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/admin/products', adminProductRoutes)
app.use('/api/v1/admin/inventory', adminInventoryRoutes)
app.use('/api/v1/collections', collectionRoutes)
app.use('/api/v1/admin/collections', adminCollectionRoutes)
app.use('/api/v1/homepage', homepageRoutes)
app.use('/api/v1/admin/homepage', adminHomepageRoutes)
app.use('/api/v1/banners', bannerRoutes)
app.use('/api/v1/admin/banners', adminBannerRoutes)
app.use('/api/v1/admin/media', adminMediaRoutes)
app.use('/api/v1/blog', blogRoutes)
app.use('/api/v1/admin/blog', adminBlogRoutes)
app.use('/api/v1/testimonials', testimonialRoutes)
app.use('/api/v1/admin/testimonials', adminTestimonialRoutes)
app.use('/api/v1/gallery', galleryRoutes)
app.use('/api/v1/admin/gallery', adminGalleryRoutes)
app.use('/api/v1/faqs', faqRoutes)
app.use('/api/v1/admin/faqs', adminFAQRoutes)
app.use('/api/v1/policies', policyRoutes)
app.use('/api/v1/admin/policies', adminPolicyRoutes)
app.use('/api/v1/settings', settingsRoutes)
app.use('/api/v1/admin/settings', adminSettingsRoutes)
app.use('/api/v1/pages', pageRoutes)
app.use('/api/v1/admin/pages', adminPageRoutes)
app.use('/api/v1/navigation', navigationRoutes)
app.use('/api/v1/admin/navigation', adminNavigationRoutes)
app.use('/api/v1/enquiries', enquiryRoutes)
app.use('/api/v1/admin/enquiries', adminEnquiryRoutes)
app.use('/api/v1/consultations', consultationRoutes)
app.use('/api/v1/admin/consultations', adminConsultationRoutes)
app.use('/api/v1/insiders', newsletterRoutes)
app.use('/api/v1/admin/insiders', adminNewsletterRoutes)
app.use('/api/v1/admin/newsletter', adminNewsletterRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/admin/orders', adminOrderRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/admin/dashboard', adminDashboardRoutes)

// 404 & Error Handling
app.use(notFoundHandler)
app.use(errorHandler)

export default app
