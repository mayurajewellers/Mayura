import { Route, Routes } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import { ShopProvider } from '@context/ShopContext'
import ScrollToTop from '@components/layout/ScrollToTop'

import RootLayout from '@layouts/RootLayout'
import AuthLayout from '@layouts/AuthLayout'
import AdminLayout from '@layouts/AdminLayout'

import HomePage from '@pages/HomePage'
import CollectionsPage from '@pages/CollectionsPage'
import CollectionPage from '@pages/CollectionPage'
import ProductPage from '@pages/ProductPage'
import AboutPage from '@pages/AboutPage'
import LegacyPage from '@pages/LegacyPage'
import ContactPage from '@pages/ContactPage'
import SearchPage from '@pages/SearchPage'
import WishlistPage from '@pages/WishlistPage'
import CartPage from '@pages/CartPage'
import CheckoutPage from '@pages/CheckoutPage'
import OrderConfirmedPage from '@pages/OrderConfirmedPage'
import FaqPage from '@pages/FaqPage'
import BlogPage from '@pages/BlogPage'
import BlogPostPage from '@pages/BlogPostPage'
import TestimonialsPage from '@pages/TestimonialsPage'
import GalleryPage from '@pages/GalleryPage'
import VideoConsultationPage from '@pages/VideoConsultationPage'
import RishtaPlanPage from '@pages/RishtaPlanPage'
import PolicyPage from '@pages/PolicyPage'
import NotFoundPage from '@pages/NotFoundPage'

import ProfilePage from '@pages/ProfilePage'

import LoginPage from '@pages/auth/LoginPage'
import SignupPage from '@pages/auth/SignupPage'
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage'

import AdminLoginPage from '@pages/admin/AdminLoginPage'
import AdminDashboardPage from '@pages/admin/AdminDashboardPage'
import AdminProductsPage from '@pages/admin/AdminProductsPage'
import AdminCollectionsPage from '@pages/admin/AdminCollectionsPage'
import AdminInventoryPage from '@pages/admin/AdminInventoryPage'
import AdminBannersPage from '@pages/admin/AdminBannersPage'
import AdminMediaPage from '@pages/admin/AdminMediaPage'
import AdminBlogPage from '@pages/admin/AdminBlogPage'
import AdminOrdersPage from '@pages/admin/AdminOrdersPage'
import AdminOrderDetailPage from '@pages/admin/AdminOrderDetailPage'
import AdminEnquiriesPage from '@pages/admin/AdminEnquiriesPage'
import AdminConsultationsPage from '@pages/admin/AdminConsultationsPage'
import AdminNewsletterPage from '@pages/admin/AdminNewsletterPage'
import AdminSettingsPage from '@pages/admin/AdminSettingsPage'
import AdminContentPage from '@pages/admin/AdminContentPage'

import AdminHomepageCMSPage from '@pages/admin/content/AdminHomepageCMSPage'
import AdminTestimonialsCMSPage from '@pages/admin/content/AdminTestimonialsCMSPage'
import AdminGalleryCMSPage from '@pages/admin/content/AdminGalleryCMSPage'
import AdminFaqCMSPage from '@pages/admin/content/AdminFaqCMSPage'
import AdminPoliciesCMSPage from '@pages/admin/content/AdminPoliciesCMSPage'

import RequireCustomerAuth from '@components/auth/RequireCustomerAuth'
import RequireAdminAuth from '@components/auth/RequireAdminAuth'

export default function App() {
  return (
    <ShopProvider>
      <ScrollToTop />
      <Routes>
        {/* --------------------------------------------------- storefront */}
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path={ROUTES.collections} element={<CollectionsPage />} />
          <Route path="/collections/:slug" element={<CollectionPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path={ROUTES.about} element={<AboutPage />} />
          <Route path={ROUTES.legacy} element={<LegacyPage />} />
          <Route path={ROUTES.contact} element={<ContactPage />} />
          <Route path={ROUTES.search} element={<SearchPage />} />
          <Route path={ROUTES.wishlist} element={<WishlistPage />} />
          <Route path={ROUTES.cart} element={<CartPage />} />
          <Route
            path={ROUTES.checkout}
            element={
              <RequireCustomerAuth>
                <CheckoutPage />
              </RequireCustomerAuth>
            }
          />
          <Route path={ROUTES.orderConfirmed} element={<OrderConfirmedPage />} />
          <Route
            path={ROUTES.profile}
            element={
              <RequireCustomerAuth requireCart={false}>
                <ProfilePage />
              </RequireCustomerAuth>
            }
          />
          <Route path={ROUTES.faq} element={<FaqPage />} />
          <Route path={ROUTES.blog} element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path={ROUTES.testimonials} element={<TestimonialsPage />} />
          <Route path={ROUTES.reviews} element={<TestimonialsPage />} />
          <Route path={ROUTES.gallery} element={<GalleryPage />} />
          <Route path={ROUTES.videoConsultation} element={<VideoConsultationPage />} />
          <Route path={ROUTES.rishtaPlan} element={<RishtaPlanPage />} />

          {/* ------------------------------------------------------ legal */}
          <Route path={ROUTES.terms} element={<PolicyPage policyKey="terms" />} />
          <Route path={ROUTES.privacy} element={<PolicyPage policyKey="privacy" />} />
          <Route path={ROUTES.shipping} element={<PolicyPage policyKey="shipping" />} />
          <Route path={ROUTES.returns} element={<PolicyPage policyKey="returns" />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ---------------------------------------------------- admin login */}
        <Route path={ROUTES.adminLogin} element={<AdminLoginPage />} />

        {/* ---------------------------------------------------- admin portal shell */}
        <Route
          element={
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          }
        >
          <Route path={ROUTES.admin} element={<AdminDashboardPage />} />
          <Route path={ROUTES.adminProducts} element={<AdminProductsPage />} />
          <Route path={ROUTES.adminCollections} element={<AdminCollectionsPage />} />
          <Route path={ROUTES.adminInventory} element={<AdminInventoryPage />} />

          {/* Content CMS Central & Sub-Routes */}
          <Route path={ROUTES.adminContent} element={<AdminContentPage />}>
            <Route path="homepage" element={<AdminHomepageCMSPage />} />
            <Route path="banners" element={<AdminBannersPage />} />
            <Route path="testimonials" element={<AdminTestimonialsCMSPage />} />
            <Route path="gallery" element={<AdminGalleryCMSPage />} />
            <Route path="faqs" element={<AdminFaqCMSPage />} />
            <Route path="blog" element={<AdminBlogPage />} />
            <Route path="policies" element={<AdminPoliciesCMSPage />} />
          </Route>

          {/* Commerce */}
          <Route path={ROUTES.adminOrders} element={<AdminOrdersPage />} />
          <Route path={ROUTES.adminOrderDetail()} element={<AdminOrderDetailPage />} />

          {/* Customer Operations */}
          <Route path={ROUTES.adminEnquiries} element={<AdminEnquiriesPage />} />
          <Route path={ROUTES.adminConsultations} element={<AdminConsultationsPage />} />
          <Route path={ROUTES.adminNewsletter} element={<AdminNewsletterPage />} />

          {/* Media & Settings */}
          <Route path={ROUTES.adminMedia} element={<AdminMediaPage />} />
          <Route path={ROUTES.adminSettings} element={<AdminSettingsPage />} />
        </Route>

        {/* ---------------------------------------------------- customer auth flow */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.signup} element={<SignupPage />} />
          <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        </Route>
      </Routes>
    </ShopProvider>
  )
}
