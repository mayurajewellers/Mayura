import { ROUTES } from '@constants/routes'

/**
 * Structured content for the new homepage sections. Everything here is a
 * plain data array so a CMS or API can replace it without touching JSX.
 */

/* ---------------------------------------------------------------------------
   Shop by Category — the six primary windows directly beneath the hero.
   Slugs resolve through the existing /collections/:slug route.
   ------------------------------------------------------------------------ */
export const SHOP_CATEGORIES = [
  { slug: 'gold-jewellery', name: 'Gold Jewellery', kicker: '22K & 18K hallmarked', image: '/images/editorial/trousseau-gold-set.jpg' },
  { slug: 'diamond-jewellery', name: 'Diamond Jewellery', kicker: 'IGI & GIA certified', image: '/images/products/ring-white-gold-halo.jpg' },
  { slug: 'gemstones', name: 'Gemstones', kicker: 'Rubies, emeralds & more', image: '/images/editorial/rings-gemstone-pastel.jpg' },
  { slug: 'italian-collection', name: 'Italian Collection', kicker: 'Machine-drawn precision', image: '/images/styled/chain-gold-teal.jpg' },
  /* TODO(client): replace with dedicated coin photography when available. */
  { slug: 'gold-coins', name: 'Gold Coins', kicker: 'Coins & bars', image: '/images/editorial/gold-haram-velvet.jpg' },
  { slug: 'kids-collection', name: 'Kids', kicker: 'First jewels', image: '/images/editorial/charms-evil-eye.jpg' },
]

/* ---------------------------------------------------------------------------
   The Mayura Advantage — customer benefits strip beneath the categories.
   Only claims already made elsewhere on this site (policies, FAQ, services).
   ------------------------------------------------------------------------ */
export const ADVANTAGES = [
  { icon: 'shield-check', title: 'BIS Hallmarked', copy: 'Six-digit HUID on every gold piece — verify it yourself on the BIS Care app.' },
  { icon: 'gem', title: 'Certified Diamonds', copy: 'IGI, GIA or SGL graded. The certificate travels with the piece.' },
  { icon: 'scale', title: 'Transparent Pricing', copy: 'Weight, rate, making charge and GST written down before you decide.' },
  { icon: 'repeat', title: 'Lifetime Exchange', copy: 'Gold back at the prevailing rate, for as long as you own it.' },
  { icon: 'undo', title: '15-Day Returns', copy: 'Unworn pieces in original packaging, with certificate and invoice.' },
  { icon: 'video', title: 'Video Consultation', copy: 'See up to five designs live from home before you visit.' },
]

/* ---------------------------------------------------------------------------
   7 Mayura Promises.
   Items 1 and 2 are the client's approved statements, used verbatim.
   Items 3–7 are drawn from commitments already published on this site.
   TODO(client): replace items 3–7 with the five official remaining promises.
   ------------------------------------------------------------------------ */
export const MAYURA_PROMISES = [
  {
    n: '01',
    icon: 'badge-check',
    title: '100% HUID Certified Hallmark Gold',
    copy: 'Every gold article carries the BIS lozenge, the purity grade and a six-digit HUID you can verify on the BIS Care app before you pay.',
    approved: true,
  },
  {
    n: '02',
    icon: 'gem',
    title: '100% Natural Diamond Certified by IGI / GIA',
    copy: 'Only natural, independently graded diamonds. The certificate is handed over with the piece, without your asking.',
    approved: true,
  },
  {
    n: '03',
    icon: 'scale',
    title: 'Pricing Written Down First',
    copy: 'Net weight, rate, making charge and GST on paper before you decide — never after.',
    approved: false, // TODO(client): confirm or replace
  },
  {
    n: '04',
    icon: 'repeat',
    title: 'Lifetime Exchange',
    copy: 'Exchange gold jewellery at the prevailing rate for as long as you own it, with deductions stated before you buy.',
    approved: false, // TODO(client): confirm or replace
  },
  {
    n: '05',
    icon: 'flask',
    title: 'Free Gold Testing & Melting',
    copy: 'Any gold, from anywhere, tested on the XRF while you watch — free, whether or not you bought it here.',
    approved: false, // TODO(client): confirm or replace
  },
  {
    n: '06',
    icon: 'truck',
    title: 'Insured Doorstep Delivery',
    copy: 'Signature-required, fully insured despatch across India on every order.',
    approved: false, // TODO(client): confirm or replace
  },
  {
    n: '07',
    icon: 'heart-handshake',
    title: 'Honest Advice, Even Against Our Margin',
    copy: 'If the lighter set suits her better, we say so. We would rather keep the family than the sale.',
    approved: false, // TODO(client): confirm or replace
  },
]

/* ---------------------------------------------------------------------------
   Brands Family — the houses within Mayura Jewellers.
   These are Mayura's own signature collections presented as sub-brands.
   `logo` is null until the client supplies artwork; the carousel renders an
   elegant wordmark from `name` + `kicker` in the meantime.
   TODO(client): drop official logo files into /public/images/brands and set
   the `logo` paths here.
   ------------------------------------------------------------------------ */
export const BRANDS_FAMILY = [
  { key: 'anantara', name: 'Anantara', kicker: 'Bridal Heirloom', logo: null, to: ROUTES.collection('anantara') },
  { key: 'kanaka', name: 'Kanaka', kicker: 'Pure Gold Classics', logo: null, to: ROUTES.collection('kanaka') },
  { key: 'vanaja', name: 'Vanaja', kicker: 'Temple & Antique', logo: null, to: ROUTES.collection('vanaja') },
  { key: 'nilaya', name: 'Nilaya', kicker: 'Everyday Diamond', logo: null, to: ROUTES.collection('nilaya') },
  { key: 'solaire', name: 'Solaire', kicker: 'Solitaires & Engagement', logo: null, to: ROUTES.collection('solaire') },
  { key: 'chandrika', name: 'Chandrika', kicker: 'Modern Minimal', logo: null, to: ROUTES.collection('chandrika') },
]

/* ---------------------------------------------------------------------------
   Explore Our Diamond Cuts — rendered with original inline SVG outlines
   (see DiamondCutIcons), never with third-party imagery.
   ------------------------------------------------------------------------ */
export const DIAMOND_CUTS = [
  { key: 'emerald', name: 'Emerald' },
  { key: 'oval', name: 'Oval' },
  { key: 'cushion', name: 'Cushion' },
  { key: 'round', name: 'Round' },
  { key: 'princess', name: 'Princess' },
  { key: 'pear', name: 'Pear' },
  { key: 'marquise', name: 'Marquise' },
  { key: 'heart', name: 'Heart' },
]

/* ---------------------------------------------------------------------------
   Mayura Jewellers Insiders — signup band copy.
   ------------------------------------------------------------------------ */
export const INSIDERS = {
  eyebrow: 'Mayura Jewellers Insiders',
  heading: 'Join Mayura Jewellers Insiders',
  copy: 'Enticing deals, latest arrivals, new collections and quiet invitations to private viewings — before anyone else hears about them.',
  disclaimer: 'Saved on this device for now — signups will reach the store once online services launch.',
}
