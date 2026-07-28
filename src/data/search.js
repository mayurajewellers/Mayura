import { ROUTES } from '@constants/routes'

export const TRENDING_SEARCHES = [
  'Bridal haram',
  'Solitaire ring',
  'Jhumka',
  'Mangalsutra',
  'Diamond studs',
  'Gents kada',
  'Temple jewellery',
  'Light chains',
]

export const POPULAR_CATEGORIES = [
  { label: 'Bridal Collection', to: ROUTES.collection('bridal-collection'), image: '/images/editorial/bridal-polki-necklace.jpg' },
  { label: 'Diamond Jewellery', to: ROUTES.collection('diamond-jewellery'), image: '/images/products/ring-white-gold-halo.jpg' },
  { label: 'Gold Jewellery', to: ROUTES.collection('gold-jewellery'), image: '/images/editorial/trousseau-gold-set.jpg' },
  { label: 'Daily Wear', to: ROUTES.collection('daily-wear'), image: '/images/styled/chain-gold-teal.jpg' },
  { label: 'Men', to: ROUTES.collection('men-collection'), image: '/images/products/ring-gents-square-diamond.jpg' },
  { label: 'Kids', to: ROUTES.collection('kids-collection'), image: '/images/editorial/charms-evil-eye.jpg' },
]
