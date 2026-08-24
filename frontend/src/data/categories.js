/**
 * Two axes of navigation.
 *
 *  DEPARTMENTS — how a customer arrives ("I'm buying for a wedding")
 *  TYPES       — what they end up holding ("a pair of jhumkas")
 *
 * Both resolve through the same /collections/:slug route.
 */

export const DEPARTMENTS = [
  {
    slug: 'gold-jewellery',
    name: 'Gold Jewellery',
    kicker: '22K & 18K',
    blurb:
      'Hallmarked yellow gold, drawn and set by hand. The pieces a family keeps.',
    longBlurb:
      'Every gram is 916 or 750 hallmarked and carries a six-digit HUID. Our goldsmiths still finish by hand — you can feel it in the weight of a jhumka and the way a chain falls.',
    image: '/images/editorial/trousseau-gold-set.jpg',
    coverImage: '/images/editorial/gold-haram-velvet.jpg',
    accent: 'gold',
  },
  {
    slug: 'diamond-jewellery',
    name: 'Diamond Jewellery',
    kicker: 'IGI & GIA graded',
    blurb: 'Certified natural diamonds in white, yellow and rose gold settings.',
    longBlurb:
      'Independently graded before they are set, and again before they leave the store. Certificates travel with the piece so a valuation is never guesswork.',
    image: '/images/products/ring-white-gold-halo.jpg',
    coverImage: '/images/editorial/macro-rosegold-sage.jpg',
    accent: 'silver',
  },
  {
    slug: 'bridal-collection',
    name: 'Bridal Collection',
    kicker: 'Trousseau & ceremony',
    blurb: 'Harams, polki sets and matched suites, sized for the whole week.',
    longBlurb:
      'A wedding is not one outfit — it is seven days of them. We plan bridal orders as a suite: the heavy set for the ceremony, the lighter pieces for the days around it, and the one thing she will still wear at fifty.',
    image: '/images/editorial/bridal-polki-necklace.jpg',
    coverImage: '/images/editorial/bride-gujarati.jpg',
    accent: 'gold',
  },
  {
    slug: 'daily-wear',
    name: 'Daily Wear',
    kicker: 'Light & unbreakable',
    blurb: 'Under twelve grams, screwed backs, nothing that snags a dupatta.',
    longBlurb:
      'Designed to survive a commute, a kitchen and a toddler. Lower gram weights, secure findings, and finishes that do not dull when they meet perfume.',
    image: '/images/styled/chain-gold-teal.jpg',
    coverImage: '/images/editorial/everyday-sisters.jpg',
    accent: 'gold',
  },
  {
    slug: 'men-collection',
    name: 'Men',
    kicker: 'Rings, bands & chains',
    blurb: 'Weighted, matte-finished, cut for a wider hand.',
    longBlurb:
      'Broader shanks, heavier links and brushed finishes. Sized generously — most men order two sizes larger than they expect.',
    image: '/images/products/ring-gents-square-diamond.jpg',
    coverImage: '/images/editorial/men-signet-ring.jpg',
    accent: 'bronze',
  },
  {
    slug: 'kids-collection',
    name: 'Kids',
    kicker: 'First jewels',
    blurb: 'Featherweight gold with rounded edges and safety clasps.',
    longBlurb:
      'Nothing sharp, nothing loose, nothing a child can open alone. Sized for a first birthday, a naming day, or a first day of school.',
    image: '/images/editorial/charms-evil-eye.jpg',
    coverImage: '/images/editorial/charms-evil-eye.jpg',
    accent: 'gold',
  },
  {
    slug: 'gemstones',
    name: 'Gemstones',
    kicker: 'Rubies, emeralds & more',
    blurb: 'Natural coloured stones, independently certified, never sold on trust alone.',
    longBlurb:
      'Rubies, emeralds and polki set the traditional way — in closed settings over foil, or claw-set against hallmarked gold. Every significant stone carries independent certification.',
    image: '/images/editorial/rings-gemstone-pastel.jpg',
    coverImage: '/images/editorial/bridal-emerald-necklace.jpg',
    accent: 'gold',
  },
  {
    slug: 'italian-collection',
    name: 'Italian Collection',
    kicker: 'Machine-drawn precision',
    blurb: 'Italian chain work — the lightest wearable gold made anywhere.',
    longBlurb:
      'Machine-drawn Italian links in weights hand work cannot reach. Rope, box, singapore and figaro patterns that fall like fabric and survive daily wear.',
    image: '/images/styled/chain-gold-teal.jpg',
    coverImage: '/images/styled/chain-gold-teal.jpg',
    accent: 'gold',
  },
  {
    slug: 'gold-coins',
    name: 'Gold Coins',
    kicker: 'Coins & bars',
    /* TODO(client): replace with dedicated coin photography when available. */
    image: '/images/editorial/gold-haram-velvet.jpg',
    coverImage: '/images/editorial/gold-haram-velvet.jpg',
    blurb: 'Hallmarked coins and bars for gifting, savings and ceremony.',
    longBlurb:
      'BIS hallmarked coins and bars in sealed assay packaging, billed transparently at the day’s rate with the making charge written on the invoice.',
    accent: 'gold',
  },
]

export const TYPES = [
  {
    slug: 'necklaces',
    name: 'Necklaces & Harams',
    image: '/images/editorial/bridal-ruby-haram.jpg',
    blurb: 'Chokers, long harams and matched suites.',
  },
  {
    slug: 'earrings',
    name: 'Earrings',
    image: '/images/styled/earrings-jhumka-teal.jpg',
    blurb: 'Studs, jhumkas, hoops and ear cuffs.',
  },
  {
    slug: 'rings',
    name: 'Rings',
    image: '/images/products/ring-split-shank-halo.jpg',
    blurb: 'Solitaires, bands and everyday gold.',
  },
  {
    slug: 'bangles',
    name: 'Bangles & Bracelets',
    image: '/images/editorial/kundan-bangles.jpg',
    blurb: 'Kadas, kangans and slim chain bracelets.',
  },
  {
    slug: 'mangalsutra',
    name: 'Mangalsutra',
    image: '/images/styled/mangalsutra-gold-teal.jpg',
    blurb: 'Traditional and contemporary, short and long.',
  },
  {
    slug: 'pendants',
    name: 'Pendants',
    image: '/images/products/pendant-diamond-leaf.jpg',
    blurb: 'Solitaire, devotional and everyday motifs.',
  },
  {
    slug: 'chains',
    name: 'Chains',
    image: '/images/styled/chain-gold-teal.jpg',
    blurb: 'Rope, box, singapore and figaro links.',
  },
]

export const getDepartment = (slug) => DEPARTMENTS.find((d) => d.slug === slug)
export const getType = (slug) => TYPES.find((t) => t.slug === slug)
