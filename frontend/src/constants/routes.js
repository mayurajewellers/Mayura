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
  profile: '/profile',
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

  // Admin Portal Routes
  admin: '/admin',
  adminLogin: '/admin/login',

  // Catalogue
  adminProducts: '/admin/products',
  adminCollections: '/admin/collections',
  adminInventory: '/admin/inventory',

  // Content CMS Sub-routes
  adminContent: '/admin/content',
  adminContentHomepage: '/admin/content/homepage',
  adminContentBanners: '/admin/content/banners',
  adminContentTestimonials: '/admin/content/testimonials',
  adminContentGallery: '/admin/content/gallery',
  adminContentFaqs: '/admin/content/faqs',
  adminContentBlog: '/admin/content/blog',
  adminContentPolicies: '/admin/content/policies',

  // Legacy aliases
  adminBanners: '/admin/content/banners',
  adminBlog: '/admin/content/blog',

  // Commerce & Orders
  adminOrders: '/admin/orders',
  adminOrderDetail: (id = ':id') => `/admin/orders/${id}`,

  // Customer Operations
  adminEnquiries: '/admin/enquiries',
  adminConsultations: '/admin/consultations',
  adminNewsletter: '/admin/newsletter',

  // Media
  adminMedia: '/admin/media',

  // System
  adminSettings: '/admin/settings',
}

export const STORAGE_KEYS = {
  cart: 'mayura.cart.v1',
  wishlist: 'mayura.wishlist.v1',
  recentlyViewed: 'mayura.recentlyViewed.v1',
  recentSearches: 'mayura.recentSearches.v1',
  auth: 'mayura.auth.v1',
  insider: 'mayura.insider.v1',
  consultations: 'mayura.consultations.v1',
  notificationPrompt: 'mayura.notificationPrompt.v1',
  authPrompt: 'mayura.hasSeenAuthPrompt.v1',
}
