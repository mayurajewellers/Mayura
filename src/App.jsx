import { Route, Routes } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import { ShopProvider } from '@context/ShopContext'
import ScrollToTop from '@components/layout/ScrollToTop'

import RootLayout from '@layouts/RootLayout'
import AuthLayout from '@layouts/AuthLayout'

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

import LoginPage from '@pages/auth/LoginPage'
import SignupPage from '@pages/auth/SignupPage'
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage'

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
          <Route path={ROUTES.checkout} element={<CheckoutPage />} />
          <Route path={ROUTES.orderConfirmed} element={<OrderConfirmedPage />} />
          <Route path={ROUTES.faq} element={<FaqPage />} />
          <Route path={ROUTES.blog} element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path={ROUTES.testimonials} element={<TestimonialsPage />} />
          {/* /reviews is the customer-facing alias for the same page. */}
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

        {/* ---------------------------------------------------- auth flow */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.signup} element={<SignupPage />} />
          <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
        </Route>
      </Routes>
    </ShopProvider>
  )
}
