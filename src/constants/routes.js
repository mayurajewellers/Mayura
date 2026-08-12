/** Every route in one place so links never drift out of sync with the router. */

export const ROUTES = {
  home: '/',
  collections: '/collections',
  collection: (slug = ':slug') => `/collections/${slug}`,
  product: (slug = ':slug') => `/product/${slug}`,
  about: '/about',
  legacy: '/legacy',
  contact: '/contact',
  search: '/search',
  wishlist: '/wishlist',
  cart: '/cart',
  checkout: '/checkout',
  orderConfirmed: '/order-confirmed',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  faq: '/faq',
  blog: '/blog',
  blogPost: (slug = ':slug') => `/blog/${slug}`,
  testimonials: '/testimonials',
  reviews: '/reviews',
  gallery: '/gallery',
  videoConsultation: '/video-consultation',
  rishtaPlan: '/rishta-plan',
  terms: '/terms-and-conditions',
  privacy: '/privacy-policy',
  shipping: '/shipping-policy',
  returns: '/return-policy',
}

export const STORAGE_KEYS = {
  cart: 'mayura.cart.v1',
  wishlist: 'mayura.wishlist.v1',
  recentlyViewed: 'mayura.recentlyViewed.v1',
  recentSearches: 'mayura.recentSearches.v1',
  /* Frontend-only demo persistence — swap for real services when a backend exists. */
  auth: 'mayura.auth.v1',
  insider: 'mayura.insider.v1',
  consultations: 'mayura.consultations.v1',
  notificationPrompt: 'mayura.notificationPrompt.v1',
  authPrompt: 'mayura.hasSeenAuthPrompt.v1',
}
