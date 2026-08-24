import fs from 'fs'
import path from 'path'

import {
  BRAND,
  OWNER,
  CONTACT,
  BUSINESS_HOURS,
  SOCIAL_LINKS,
  BUSINESS_DETAILS,
  ASSURANCES,
  NEWSLETTER,
  SEO_DEFAULTS,
} from '../../frontend/src/constants/site.js'

import {
  LEGACY_INTRO,
  SPECIALITIES,
  SERVICES,
  HALLMARK_POINTS,
  LEGACY_STATS,
  DIGITAL_CHANNELS,
  WHY_MAYURA,
} from '../../frontend/src/data/legacy.js'

// 1. Site Settings JSON
const settings = [
  {
    key: 'main',
    brand: BRAND,
    owner: OWNER,
    contact: CONTACT,
    businessHours: BUSINESS_HOURS,
    socialLinks: SOCIAL_LINKS,
    businessDetails: BUSINESS_DETAILS,
    assurances: ASSURANCES,
    newsletter: NEWSLETTER,
    defaultSeo: SEO_DEFAULTS,
  },
]

fs.writeFileSync(
  path.join(process.cwd(), 'src/seed/settingsSeedData.json'),
  JSON.stringify(settings, null, 2),
)
console.log('Successfully generated settingsSeedData.json')

// 2. Page Content JSON (About & Legacy)
const pages = [
  {
    legacyId: 'page-001',
    slug: 'about',
    title: 'Notes from the Workshop',
    eyebrow: 'Our Story',
    subtitle: BRAND.tagline,
    lede: BRAND.positioning,
    sections: [
      { heading: 'Our Meaning', content: BRAND.meaning },
      { heading: 'Owner Message', owner: OWNER },
      { heading: 'Why Choose Us', items: WHY_MAYURA },
    ],
    isActive: true,
    seo: {
      metaTitle: 'Our Story — Mayura Jewellers',
      metaDescription: BRAND.positioning,
      keywords: ['about', 'mayura', 'story'],
    },
  },
  {
    legacyId: 'page-002',
    slug: 'legacy',
    title: LEGACY_INTRO.title,
    eyebrow: LEGACY_INTRO.eyebrow,
    subtitle: 'A legacy of trust & brilliance since 2004',
    lede: LEGACY_INTRO.lede,
    sections: [
      { heading: 'Specialities', items: SPECIALITIES },
      { heading: 'Services', items: SERVICES },
      { heading: 'Hallmarking Assurance', items: HALLMARK_POINTS },
      { heading: 'Showroom Statistics', stats: LEGACY_STATS },
      { heading: 'Digital Channels', items: DIGITAL_CHANNELS },
    ],
    isActive: true,
    seo: {
      metaTitle: 'Our Legacy — Mayura Jewellers',
      metaDescription: LEGACY_INTRO.lede,
      keywords: ['legacy', 'kandivali', 'heritage'],
    },
  },
]

fs.writeFileSync(
  path.join(process.cwd(), 'src/seed/pageSeedData.json'),
  JSON.stringify(pages, null, 2),
)
console.log('Successfully generated pageSeedData.json')

// 3. Navigation JSON
const navigation = [
  {
    legacyId: 'nav-001',
    label: 'Gold',
    icon: 'gold',
    to: '/collections/gold-jewellery',
    section: 'category',
    displayOrder: 1,
    isActive: true,
  },
  {
    legacyId: 'nav-002',
    label: 'Diamond',
    icon: 'diamond',
    to: '/collections/diamond-jewellery',
    section: 'category',
    displayOrder: 2,
    isActive: true,
  },
  {
    legacyId: 'nav-003',
    label: 'Earrings',
    icon: 'earrings',
    to: '/collections/earrings',
    section: 'category',
    displayOrder: 3,
    isActive: true,
  },
  {
    legacyId: 'nav-004',
    label: 'Rings',
    icon: 'ring',
    to: '/collections/rings',
    section: 'category',
    displayOrder: 4,
    isActive: true,
  },
  {
    legacyId: 'nav-005',
    label: 'Necklaces',
    icon: 'necklace',
    to: '/collections/necklaces',
    section: 'category',
    displayOrder: 5,
    isActive: true,
  },
  {
    legacyId: 'nav-006',
    label: 'Free Gold Testing',
    icon: 'scan',
    to: '/legacy#services',
    section: 'service',
    displayOrder: 1,
    isActive: true,
  },
  {
    legacyId: 'nav-007',
    label: 'Free Gold Melting',
    icon: 'flame',
    to: '/legacy#services',
    section: 'service',
    displayOrder: 2,
    isActive: true,
  },
  {
    legacyId: 'nav-008',
    label: 'Home Visit Service',
    icon: 'home',
    to: '/legacy#services',
    section: 'service',
    displayOrder: 3,
    isActive: true,
  },
]

fs.writeFileSync(
  path.join(process.cwd(), 'src/seed/navigationSeedData.json'),
  JSON.stringify(navigation, null, 2),
)
console.log('Successfully generated navigationSeedData.json')

// 4. Policy JSON
const CONTACT_BLOCK = {
  heading: 'Contact us about this policy',
  paragraphs: [
    `Mayura Jewellers, ${CONTACT.addressOneLine}`,
    `Proprietor: ${OWNER.name}`,
    `Email: ${CONTACT.email} · Telephone / WhatsApp: ${CONTACT.phonePrimary}`,
    'We respond to written queries within three working days.',
  ],
}

const policies = [
  {
    legacyId: 'pol-001',
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    kicker: 'Legal',
    updated: new Date('2026-07-01').toISOString(),
    intro:
      'By entering into a transaction with Mayura Jewellers you are deemed to have read and accepted the terms and conditions below.',
    variant: 'clauses',
    sections: [
      {
        heading: 'Purity & Identification',
        paragraphs: [
          'We manufacture Gold Ornaments of 22kt, 18kt, 14kt Purity, and our Ornaments bear the identification mark of our company.',
        ],
      },
      {
        heading: 'Refund & Exchange',
        paragraphs: [
          'Once sold, refund will not be made under any circumstances. The customer however can exchange ornaments sold within 1 week provided it is unused. In such case original Invoice must be produced for the exchange.',
          'However, the value of making charges and any other incidental charges incurred in respect of any ornament manufactured as per customer’s order cannot be adjusted in case of exchange.',
        ],
      },
      CONTACT_BLOCK,
    ],
    displayOrder: 1,
    isActive: true,
    seo: {
      metaTitle: 'Terms & Conditions — Mayura Jewellers',
      metaDescription: 'Terms & Conditions of Mayura Jewellers',
      keywords: ['terms', 'legal', 'mayura'],
    },
  },
  {
    legacyId: 'pol-002',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    kicker: 'Legal',
    updated: new Date('2026-07-01').toISOString(),
    intro:
      'This policy explains what personal information Mayura Jewellers collects, why we collect it, how long we keep it and what you can ask us to do with it.',
    variant: 'sections',
    sections: [
      {
        heading: '1. What this website collects',
        paragraphs: [
          'This website is a showcase. Wishlist and cart contents stay in your browser local storage.',
        ],
      },
      CONTACT_BLOCK,
    ],
    displayOrder: 2,
    isActive: true,
    seo: {
      metaTitle: 'Privacy Policy — Mayura Jewellers',
      metaDescription: 'Privacy Policy of Mayura Jewellers',
      keywords: ['privacy', 'legal', 'mayura'],
    },
  },
  {
    legacyId: 'pol-003',
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    kicker: 'Support',
    updated: new Date('2026-07-01').toISOString(),
    intro:
      'How your order is packed, insured, despatched and delivered — and what to do if something goes wrong on the way.',
    variant: 'sections',
    sections: [
      {
        heading: '1. Where we deliver',
        paragraphs: ['We deliver to all serviceable pin codes across India.'],
      },
      CONTACT_BLOCK,
    ],
    displayOrder: 3,
    isActive: true,
    seo: {
      metaTitle: 'Shipping Policy — Mayura Jewellers',
      metaDescription: 'Shipping Policy of Mayura Jewellers',
      keywords: ['shipping', 'delivery', 'mayura'],
    },
  },
  {
    legacyId: 'pol-004',
    slug: 'return-policy',
    title: 'Return, Exchange & Buyback Policy',
    kicker: 'Support',
    updated: new Date('2026-07-01').toISOString(),
    intro:
      'What you can return, what you can exchange, what we will buy back, and exactly what is deducted in each case.',
    variant: 'sections',
    sections: [
      {
        heading: '1. Fifteen-day return',
        paragraphs: [
          'Ready-stock articles may be returned within fifteen days of delivery for a full refund.',
        ],
      },
      CONTACT_BLOCK,
    ],
    displayOrder: 4,
    isActive: true,
    seo: {
      metaTitle: 'Return Policy — Mayura Jewellers',
      metaDescription: 'Return, Exchange & Buyback Policy of Mayura Jewellers',
      keywords: ['returns', 'exchange', 'buyback', 'mayura'],
    },
  },
]

fs.writeFileSync(
  path.join(process.cwd(), 'src/seed/policySeedData.json'),
  JSON.stringify(policies, null, 2),
)
console.log('Successfully generated policySeedData.json')
