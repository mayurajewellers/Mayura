/**
 * Single source of truth for every piece of business information on the site.
 * Change it here and it updates in the navbar, footer, contact page, schema
 * markup and the WhatsApp handoff.
 */

export const BRAND = {
  name: 'Mayura Jewellers',
  shortName: 'Mayura',
  tagline: 'Fine Gold & Diamond Jewellery',
  established: 2004,
  city: 'Mumbai',
  meaning:
    'Mayura is the Sanskrit word for peacock — a creature that has stood for grace, renewal and quiet splendour in Indian art for three thousand years.',
  positioning:
    'Hallmarked 22K and 18K gold, certified diamonds and bridal heirlooms, made by hand for the families of Thakur Village and beyond.',
}

export const OWNER = {
  name: 'Darshil Bhandari',
  role: 'Founder & Proprietor',
  message:
    'My family has weighed gold across a counter for three generations. What I wanted for Mayura was simpler than a shop — a room where a mother could bring her daughter, ask every question she liked, and leave holding something she would still be proud of in thirty years. Every piece we sell is hallmarked, every diamond is certified, and every rate is written down before you decide. That is the whole promise.',
}

export const CONTACT = {
  businessName: 'Mayura Jewellers',
  legalName: 'Mayura Jewellers',
  addressLines: [
    'Shop No. 12, 13, 14',
    'Rangoli Building, Vasant Utsav',
    'Thakur Village, Kandivali East',
    'Mumbai, Maharashtra 400101',
    'India',
  ],
  addressShort: 'Rangoli Building, Vasant Utsav, Thakur Village, Mumbai 400101',
  addressOneLine:
    'Shop No. 12, 13, 14, Rangoli Building, Vasant Utsav, Thakur Village, Mumbai, MH 400101, India',
  locality: 'Kandivali East',
  region: 'MH',
  postalCode: '400101',
  country: 'India',
  email: 'mayurajewellers2019@gmail.com',
  phonePrimary: '+91 91675 89002',
  phonePrimaryRaw: '919167589002',
  phoneDisplayShort: '+91 91675 89002',
  whatsapp: '919167589002',
  whatsappUrl: 'https://wa.me/919167589002',
  whatsappTooltip: 'Chat with Jewellery Expert',
  currency: 'INR',
  currencySymbol: '₹',
  mapQuery:
    'Rangoli Building, Vasant Utsav, Thakur Village, Kandivali East, Mumbai, Maharashtra 400101',
  mapEmbedUrl:
    'https://www.google.com/maps?q=Vasant+Utsav,+Thakur+Village,+Kandivali+East,+Mumbai,+Maharashtra+400101&output=embed',
  mapDirectionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Vasant+Utsav+Thakur+Village+Kandivali+East+Mumbai+400101',
}

export const BUSINESS_HOURS = [
  { day: 'Monday', hours: '11:00 am — 8:30 pm' },
  { day: 'Tuesday', hours: '11:00 am — 8:30 pm' },
  { day: 'Wednesday', hours: '11:00 am — 8:30 pm' },
  { day: 'Thursday', hours: '11:00 am — 8:30 pm' },
  { day: 'Friday', hours: '11:00 am — 8:30 pm' },
  { day: 'Saturday', hours: '11:00 am — 8:30 pm' },
  { day: 'Sunday', hours: '11:00 am — 6:00 pm', note: 'Appointments preferred' },
]

export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/', handle: '@mayurajewellers', icon: 'instagram' },
  { label: 'Facebook', href: 'https://facebook.com/', handle: 'Mayura Jewellers', icon: 'facebook' },
  { label: 'YouTube', href: 'https://youtube.com/', handle: 'Mayura Jewellers', icon: 'youtube' },
  { label: 'WhatsApp', href: CONTACT.whatsappUrl, handle: '+91 91675 89002', icon: 'whatsapp' },
]

export const BUSINESS_DETAILS = [
  { label: 'Proprietor', value: OWNER.name },
  { label: 'Established', value: '2004' },
  { label: 'Trade', value: 'Retail jewellery — gold, diamond, silver & bridal' },
  { label: 'Hallmarking', value: 'BIS six-digit HUID on all gold jewellery' },
  { label: 'Diamond grading', value: 'IGI / GIA / SGL certified' },
  { label: 'Default currency', value: 'INR (₹)' },
  { label: 'Languages spoken', value: 'English, हिन्दी, ગુજરાતી, मराठी' },
]

/** Signals shown in the trust strip and the Why Choose Us section. */
export const ASSURANCES = [
  {
    icon: 'shield-check',
    title: 'BIS Hallmarked',
    copy: 'Every gold piece carries a six-digit HUID you can verify yourself on the BIS Care app.',
  },
  {
    icon: 'gem',
    title: 'Certified Diamonds',
    copy: 'Independently graded by IGI, GIA or SGL. The certificate travels with the piece.',
  },
  {
    icon: 'repeat',
    title: 'Lifetime Exchange',
    copy: 'Exchange gold jewellery at the prevailing rate, for as long as you own it.',
  },
  {
    icon: 'sparkles',
    title: 'Free Care For Life',
    copy: 'Cleaning, polishing and rhodium re-plating at our counter, always without charge.',
  },
]

export const NEWSLETTER = {
  eyebrow: 'The Mayura Letter',
  heading: 'Notes from the workshop',
  copy: 'New collections, gold rate movements and quiet invitations to private viewings. Sent about once a month — never more.',
}

export const SEO_DEFAULTS = {
  titleTemplate: '%s — Mayura Jewellers',
  defaultTitle: 'Mayura Jewellers — Fine Gold & Diamond Jewellery, Mumbai',
  description:
    'Hallmarked 22K and 18K gold, certified diamonds and bridal heirlooms. Mayura Jewellers, Thakur Village, Kandivali East, Mumbai.',
}
