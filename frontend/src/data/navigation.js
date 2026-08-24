import { ROUTES } from '@constants/routes'
import { DEPARTMENTS } from './categories'
import { COLLECTIONS } from './collections'

/**
 * The primary category rail — the row of thin-line jewellery icons beneath
 * the search bar. Each entry may carry a mega menu, which is rendered by
 * <MegaMenu /> on hover and on keyboard focus.
 */

const collectionLinks = COLLECTIONS.map((c) => ({
  label: c.name,
  meta: c.kicker,
  to: ROUTES.collection(c.slug),
}))

export const CATEGORY_NAV = [
  {
    /* The brand/home item — clicking it always returns to the homepage.
       It deliberately carries no dropdown so the click is never intercepted.
       (Renamed from "All Jewellery" at the client's request; the complete
       catalogue remains reachable from every department menu below.) */
    label: 'Mayura',
    icon: 'plume',
    to: ROUTES.home,
    home: true,
  },
  {
    label: 'Gold',
    icon: 'gold',
    to: ROUTES.collection('gold-jewellery'),
    mega: {
      columns: [
        {
          title: 'Gold jewellery',
          links: [
            { label: 'All Gold', meta: '22K & 18K', to: ROUTES.collection('gold-jewellery') },
            { label: 'Necklaces & Harams', to: ROUTES.collection('necklaces') },
            { label: 'Bangles & Bracelets', to: ROUTES.collection('bangles') },
            { label: 'Chains', to: ROUTES.collection('chains') },
            { label: 'Earrings', to: ROUTES.collection('earrings') },
            { label: 'Mangalsutra', to: ROUTES.collection('mangalsutra') },
          ],
        },
        {
          title: 'More in gold',
          links: [
            { label: 'Rings', to: ROUTES.collection('rings') },
            { label: 'Pendants', to: ROUTES.collection('pendants') },
            { label: 'Gold Coins & Bars', to: ROUTES.collection('gold-coins') },
            { label: 'Rishta Plan', meta: '11 + 1 savings', to: ROUTES.rishtaPlan },
          ],
        },
      ],
      feature: {
        eyebrow: 'Best exchange value',
        title: 'Kanaka',
        copy: 'Plain 22K in the shapes that have not changed in fifty years.',
        image: '/images/editorial/gold-haram-velvet.jpg',
        to: ROUTES.collection('kanaka'),
        cta: 'See Kanaka',
      },
    },
  },
  {
    label: 'Diamond',
    icon: 'diamond',
    to: ROUTES.collection('diamond-jewellery'),
    mega: {
      columns: [
        {
          title: 'Diamond jewellery',
          links: [
            { label: 'All Diamond', meta: 'IGI & GIA', to: ROUTES.collection('diamond-jewellery') },
            { label: 'Solitaire Rings', to: ROUTES.collection('solaire') },
            { label: 'Everyday Diamond', to: ROUTES.collection('nilaya') },
            { label: 'Pendants', to: ROUTES.collection('pendants') },
            { label: 'Earrings', to: ROUTES.collection('earrings') },
            { label: 'Bracelets', to: ROUTES.collection('bangles') },
          ],
        },
        {
          title: 'Buying guidance',
          links: [
            { label: 'Which grades matter', to: ROUTES.blogPost('diamond-grades-that-matter') },
            { label: 'How to read a hallmark', to: ROUTES.blogPost('how-to-read-a-hallmark') },
            { label: 'Certification & purity', to: `${ROUTES.faq}#purity-certification` },
            { label: 'Care & cleaning', to: `${ROUTES.faq}#care-warranty` },
          ],
        },
      ],
      feature: {
        eyebrow: 'Certified',
        title: 'Solaire',
        copy: 'Solitaires built around a single certified stone, chosen slowly.',
        image: '/images/products/ring-white-gold-halo.jpg',
        to: ROUTES.collection('solaire'),
        cta: 'See Solaire',
      },
    },
  },
  {
    label: 'Earrings',
    icon: 'earrings',
    to: ROUTES.collection('earrings'),
    mega: {
      columns: [
        {
          title: 'By style',
          links: [
            { label: 'All Earrings', to: ROUTES.collection('earrings') },
            { label: 'Jhumkas', to: `${ROUTES.search}?q=jhumka` },
            { label: 'Studs', to: `${ROUTES.search}?q=studs` },
            { label: 'Hoops', to: `${ROUTES.search}?q=hoop` },
            { label: 'Ear Cuffs', to: `${ROUTES.search}?q=ear cuff` },
            { label: 'Threaders', to: `${ROUTES.search}?q=threader` },
          ],
        },
        {
          title: 'By metal',
          links: [
            { label: '22K Yellow Gold', to: ROUTES.collection('kanaka') },
            { label: '18K Diamond', to: ROUTES.collection('nilaya') },
            { label: 'Rose Gold', to: ROUTES.collection('chandrika') },
            { label: 'Temple & Antique', to: ROUTES.collection('vanaja') },
          ],
        },
      ],
      feature: {
        eyebrow: 'Most repeated',
        title: 'Temple Jhumkas',
        copy: 'A properly domed jhumka, spun rather than pressed.',
        image: '/images/styled/earrings-jhumka-teal.jpg',
        to: ROUTES.product('vanaja-temple-jhumkas'),
        cta: 'View the piece',
      },
    },
  },
  {
    label: 'Rings',
    icon: 'ring',
    to: ROUTES.collection('rings'),
    mega: {
      columns: [
        {
          title: 'By occasion',
          links: [
            { label: 'All Rings', to: ROUTES.collection('rings') },
            { label: 'Engagement', to: ROUTES.collection('solaire') },
            { label: 'Wedding Bands', to: ROUTES.collection('kanaka') },
            { label: 'Everyday', to: ROUTES.collection('nilaya') },
            { label: 'Cocktail', to: `${ROUTES.search}?q=cocktail` },
            { label: "Men's Rings", to: ROUTES.collection('men-collection') },
          ],
        },
        {
          title: 'Help me choose',
          links: [
            { label: 'Ring size guide', to: `${ROUTES.faq}#sizing` },
            { label: 'Diamond grades', to: ROUTES.blogPost('diamond-grades-that-matter') },
            { label: 'Book a viewing', to: ROUTES.contact },
          ],
        },
      ],
      feature: {
        eyebrow: 'Bestseller',
        title: 'Halo Solitaire',
        copy: 'A 0.72ct GIA-certified centre in a cushion halo.',
        image: '/images/products/ring-split-shank-halo.jpg',
        to: ROUTES.product('solaire-halo-solitaire-ring'),
        cta: 'View the piece',
      },
    },
  },
  {
    label: 'Necklaces',
    icon: 'necklace',
    to: ROUTES.collection('necklaces'),
    mega: {
      columns: [
        {
          title: 'By style',
          links: [
            { label: 'All Necklaces', to: ROUTES.collection('necklaces') },
            { label: 'Harams', to: `${ROUTES.search}?q=haram` },
            { label: 'Chokers', to: `${ROUTES.search}?q=choker` },
            { label: 'Mangalsutra', to: ROUTES.collection('mangalsutra') },
            { label: 'Pendants', to: ROUTES.collection('pendants') },
            { label: 'Chains', to: ROUTES.collection('chains') },
          ],
        },
        {
          title: 'Collections',
          links: collectionLinks.slice(0, 4),
        },
      ],
      feature: {
        eyebrow: 'Temple work',
        title: 'Vanaja',
        copy: 'Nakashi repoussé raised from a single sheet, never cast.',
        image: '/images/editorial/bridal-antique-haram.jpg',
        to: ROUTES.collection('vanaja'),
        cta: 'See Vanaja',
      },
    },
  },
  {
    label: 'Daily Wear',
    icon: 'chain',
    to: ROUTES.collection('daily-wear'),
    mega: {
      columns: [
        {
          title: 'Light & unbreakable',
          links: [
            { label: 'All Daily Wear', meta: 'Under 12g', to: ROUTES.collection('daily-wear') },
            { label: 'Fine Chains', to: ROUTES.collection('chains') },
            { label: 'Everyday Diamond', to: ROUTES.collection('nilaya') },
            { label: 'Modern Minimal', to: ROUTES.collection('chandrika') },
            { label: 'Stacking Bands', to: `${ROUTES.search}?q=stack` },
          ],
        },
        {
          title: 'Good to know',
          links: [
            { label: 'What survives daily wear', to: ROUTES.blogPost('daily-wear-that-survives') },
            { label: 'Care instructions', to: `${ROUTES.faq}#care-warranty` },
            { label: 'Free cleaning, for life', to: `${ROUTES.faq}#care-warranty` },
          ],
        },
      ],
      feature: {
        eyebrow: 'Under six grams',
        title: 'Chandrika',
        copy: 'Ear cuffs, threaders and thin chains for a lighter life.',
        image: '/images/products/earrings-rose-gold-threader.jpg',
        to: ROUTES.collection('chandrika'),
        cta: 'See Chandrika',
      },
    },
  },
  {
    label: 'Bridal',
    icon: 'wedding',
    to: ROUTES.collection('bridal-collection'),
    mega: {
      columns: [
        {
          title: 'The trousseau',
          links: [
            { label: 'All Bridal', meta: 'Trousseau & ceremony', to: ROUTES.collection('bridal-collection') },
            { label: 'Anantara', meta: 'Bridal heirloom', to: ROUTES.collection('anantara') },
            { label: 'Vanaja', meta: 'Temple & antique', to: ROUTES.collection('vanaja') },
            { label: 'Bridal Harams', to: `${ROUTES.search}?q=haram` },
            { label: 'Polki & Kundan', to: `${ROUTES.search}?q=polki` },
            { label: 'Mangalsutra', to: ROUTES.collection('mangalsutra') },
          ],
        },
        {
          title: 'Planning a wedding',
          links: [
            { label: 'A four-month plan', to: ROUTES.blogPost('choosing-a-bridal-set') },
            { label: 'Caring for polki', to: ROUTES.blogPost('caring-for-polki-and-kundan') },
            { label: 'Book a bridal consultation', to: ROUTES.contact },
          ],
        },
      ],
      feature: {
        eyebrow: 'The bridal atelier',
        title: 'Four months, three fittings',
        copy: 'Silver sample before any gold is cut. Weights agreed in writing.',
        image: '/images/editorial/bride-gujarati.jpg',
        to: ROUTES.collection('anantara'),
        cta: 'Start a commission',
      },
    },
  },
  {
    label: 'Men',
    icon: 'bangle',
    to: ROUTES.collection('men-collection'),
    mega: {
      columns: [
        {
          title: 'For him',
          links: [
            { label: 'All Men', meta: 'Rings, bands & chains', to: ROUTES.collection('men-collection') },
            { label: 'Rings', to: ROUTES.collection('rings') },
            { label: 'Chains', to: ROUTES.collection('chains') },
            { label: 'Kadas & Bracelets', to: ROUTES.collection('bangles') },
            { label: 'Wedding Bands', to: ROUTES.collection('kanaka') },
          ],
        },
        {
          title: 'Also for',
          links: [
            { label: 'Kids', meta: 'First jewels', to: ROUTES.collection('kids-collection') },
            { label: 'Gifting', to: `${ROUTES.search}?q=gifting` },
          ],
        },
      ],
      feature: {
        eyebrow: 'Cut for a wider hand',
        title: 'Vikram',
        copy: 'Broader shanks, heavier links and brushed finishes.',
        image: '/images/editorial/men-signet-ring.jpg',
        to: ROUTES.collection('men-collection'),
        cta: 'Shop men',
      },
    },
  },
  {
    label: 'More',
    icon: 'more',
    to: ROUTES.about,
    mega: {
      columns: [
        {
          title: 'The house',
          links: [
            { label: 'Our Legacy', meta: 'Since 2004', to: ROUTES.legacy },
            { label: 'Our Story', to: ROUTES.about },
            { label: 'Customer Reviews', to: ROUTES.reviews },
            { label: 'Gallery', to: ROUTES.gallery },
            { label: 'Rishta Plan', meta: '11 + 1 savings', to: ROUTES.rishtaPlan },
            { label: 'Video Consultation', to: ROUTES.videoConsultation },
            { label: 'Contact & Store', to: ROUTES.contact },
          ],
        },
        {
          title: 'Guidance & support',
          links: [
            { label: 'The Journal', to: ROUTES.blog },
            { label: 'Frequently Asked', to: ROUTES.faq },
            { label: 'Shipping Policy', to: ROUTES.shipping },
            { label: 'Return Policy', to: ROUTES.returns },
            { label: 'Terms & Conditions', to: ROUTES.terms },
            { label: 'Privacy Policy', to: ROUTES.privacy },
          ],
        },
      ],
      feature: {
        eyebrow: 'Since 2004',
        title: 'Three generations',
        copy: 'The largest jewellery showroom in Kandivali, run by the Bhandari family.',
        image: '/images/editorial/heritage-mother-daughter.jpg',
        to: ROUTES.legacy,
        cta: 'Read our legacy',
      },
    },
  },
]

/** In-store services, shown as a slim strip beneath the category rail. */
export const SERVICE_LINKS = [
  { label: 'Free Gold Testing', to: `${ROUTES.legacy}#services` },
  { label: 'Free Gold Melting', to: `${ROUTES.legacy}#services` },
  { label: 'Home Visit Service', to: `${ROUTES.legacy}#services` },
  { label: 'Video Consultation', to: ROUTES.videoConsultation },
  { label: 'Rishta Plan 11+1', to: ROUTES.rishtaPlan },
  { label: 'BIS Hallmark Certified', to: `${ROUTES.faq}#purity-certification` },
]

export const FOOTER_COLUMNS = [
  {
    title: 'Collections',
    links: COLLECTIONS.map((c) => ({ label: c.name, to: ROUTES.collection(c.slug) })),
  },
  {
    title: 'Shop',
    links: [
      ...DEPARTMENTS.slice(0, 5).map((d) => ({ label: d.name, to: ROUTES.collection(d.slug) })),
      { label: 'View everything', to: ROUTES.collection('all') },
    ],
  },
  {
    title: 'The House',
    links: [
      { label: 'Our Legacy', to: ROUTES.legacy },
      { label: 'Our Story', to: ROUTES.about },
      { label: 'Craftsmanship', to: `${ROUTES.about}#craftsmanship` },
      { label: 'The Journal', to: ROUTES.blog },
      { label: 'Testimonials', to: ROUTES.testimonials },
      { label: 'Gallery', to: ROUTES.gallery },
      { label: 'Contact', to: ROUTES.contact },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Video Consultation', to: ROUTES.videoConsultation },
      { label: 'Rishta Plan 11+1', to: ROUTES.rishtaPlan },
      { label: 'Customer Reviews', to: ROUTES.reviews },
      { label: 'Frequently Asked', to: ROUTES.faq },
      { label: 'Shipping Policy', to: ROUTES.shipping },
      { label: 'Return Policy', to: ROUTES.returns },
      { label: 'Terms & Conditions', to: ROUTES.terms },
      { label: 'Privacy Policy', to: ROUTES.privacy },
    ],
  },
]
