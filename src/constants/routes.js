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
  gallery: '/gallery',
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
}
