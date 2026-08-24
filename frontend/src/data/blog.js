/** The Mayura Journal — buying guides, care notes and jewellery writing. */

export const BLOG_CATEGORIES = [
  'Buying Guides',
  'Jewellery Care',
  'Bridal',
  'Gold Investment',
  'Trends',
]

export const BLOG_POSTS = [
  {
    slug: 'how-to-read-a-hallmark',
    title: 'How to read a hallmark — and why you should, every time',
    category: 'Buying Guides',
    excerpt:
      'Four marks, six digits and a two-minute check on your phone. Everything a buyer needs to know about BIS hallmarking, in plain language.',
    readMinutes: 6,
    date: '2026-07-04',
    author: 'Darshil Bhandari',
    image: '/images/editorial/studs-gold-rosette.jpg',
    featured: true,
    body: [
      {
        type: 'lede',
        text: 'Since June 2021 it has been illegal to sell unhallmarked gold jewellery in most of India. That is a good law. It is also a law most buyers do not know how to make use of — because nobody has ever shown them what the marks mean.',
      },
      { type: 'heading', text: 'The four marks' },
      {
        type: 'paragraph',
        text: 'A hallmarked piece carries the BIS lozenge, the purity grade, and a six-digit alphanumeric HUID. That is it. Since the 2021 revision the jeweller\'s mark and the assaying centre mark are no longer struck separately — they are encoded in the HUID instead. If someone shows you five or six marks on a new piece and calls it "extra certification", be curious.',
      },
      {
        type: 'list',
        items: [
          'BIS lozenge — the standards mark itself',
          '916 or 22K — 91.6% pure gold. 750 or 18K — 75% pure',
          'HUID — six characters, unique to that one article',
        ],
      },
      { type: 'heading', text: 'Where the marks actually are' },
      {
        type: 'paragraph',
        text: 'On a ring, inside the shank. On a chain or bracelet, on the clasp or a small soldered tag beside it. On a necklace, usually on the reverse of the clasp. On earrings, on the post — which is why you rarely see them without a loupe. They are laser-marked and deliberately small: a hallmark should not disfigure the piece.',
      },
      { type: 'heading', text: 'The two-minute check' },
      {
        type: 'paragraph',
        text: 'Download the BIS Care app. Choose "Verify HUID". Type the six characters. It returns the article type, purity, and the registration number of the jeweller who had it hallmarked. Do this at the counter, before you pay. Any jeweller who is uncomfortable with you doing it has told you something useful.',
      },
      {
        type: 'quote',
        text: 'A hallmark is not a favour a jeweller does you. It is a legal minimum. What you should judge a shop on is what it does beyond that.',
      },
      { type: 'heading', text: 'What a hallmark does not tell you' },
      {
        type: 'paragraph',
        text: 'It certifies purity. It says nothing about the quality of the making, the security of the settings, the grade of the stones, or whether the making charge you were quoted is reasonable. Those are judgements, and they are the reason it still matters where you buy.',
      },
    ],
  },
  {
    slug: 'gold-rate-and-making-charges',
    title: 'What you are actually paying for: gold rate, making charges and GST',
    category: 'Gold Investment',
    excerpt:
      'The four numbers behind every jewellery invoice in India, and the two places a buyer usually loses money without noticing.',
    readMinutes: 8,
    date: '2026-06-18',
    author: 'Darshil Bhandari',
    image: '/images/editorial/gold-haram-velvet.jpg',
    featured: true,
    body: [
      {
        type: 'lede',
        text: 'Ask most buyers what they paid for a chain and they will tell you a single figure. Ask them how much of it was gold and the answer is usually a shrug. Here is the whole calculation.',
      },
      { type: 'heading', text: 'The four components' },
      {
        type: 'list',
        items: [
          'Net gold weight × the day\'s rate for that purity',
          'Making charges — a percentage of gold value, or a flat rate per gram',
          'Stone value, billed separately from gold',
          'GST — 3% on jewellery, 5% on making charges billed separately',
        ],
      },
      { type: 'heading', text: 'Where the money quietly goes: net versus gross' },
      {
        type: 'paragraph',
        text: 'Gross weight includes stones, enamel and lac. Net weight is gold alone. You should be charged for gold at net weight. In a heavy kundan piece the difference can be six or seven grams — at today\'s rates, a substantial sum. Always ask for both figures, and always check that both appear on the invoice.',
      },
      { type: 'heading', text: 'Where it goes again: making charges on exchange' },
      {
        type: 'paragraph',
        text: 'When you exchange an old piece, you recover the value of the gold. You do not recover the making charge you paid on it, ever. This is why a 10% making charge on a plain band and a 25% making charge on an intricate one are not comparable numbers — one is a far larger permanent cost. Neither is wrong. Elaborate work takes elaborate labour. But you should know which you are choosing.',
      },
      {
        type: 'quote',
        text: 'If a shop will not write the calculation out on paper, that is the answer to whatever question you were about to ask.',
      },
      { type: 'heading', text: 'A worked example' },
      {
        type: 'paragraph',
        text: 'A 22K chain, gross 10.2g, net 10.2g (no stones), at a rate of ₹7,200 per gram = ₹73,440. Making at 12% = ₹8,813. GST at 3% on ₹82,253 = ₹2,468. Total ₹84,721. Every one of those five numbers should be printed on your invoice. If any is missing, ask.',
      },
    ],
  },
  {
    slug: 'choosing-a-bridal-set',
    title: 'Choosing a bridal set: a four-month plan',
    category: 'Bridal',
    excerpt:
      'Most bridal orders go wrong for the same three reasons. A working timeline, from first conversation to the morning of the wedding.',
    readMinutes: 9,
    date: '2026-05-30',
    author: 'Mayura Atelier',
    image: '/images/editorial/bride-gujarati.jpg',
    featured: true,
    body: [
      {
        type: 'lede',
        text: 'A wedding is not one outfit. It is seven days of them, and the jewellery that works for the muhurtham is often unwearable at the sangeet. Plan the suite, not the piece.',
      },
      { type: 'heading', text: 'Four months out — the conversation' },
      {
        type: 'paragraph',
        text: 'Bring photographs of the outfits, or the fabric if it is being stitched. Bring the family pieces that are being reworked. Bring the bride. Nothing gets drawn at this meeting; we are working out what the jewellery has to do, and on which days.',
      },
      { type: 'heading', text: 'Three months out — design and deposit' },
      {
        type: 'paragraph',
        text: 'CAD renders, weights and a quotation in writing. Weights matter more than anyone expects: a 70-gram haram is a genuinely different physical experience from a 45-gram one after six hours. If the bride has not worn heavy jewellery before, say so, and we will plan around it.',
      },
      { type: 'heading', text: 'Eight weeks out — the silver sample' },
      {
        type: 'paragraph',
        text: 'For anything above about thirty grams we make a silver sample first. It costs us a week and it has saved more commissions than any other single practice. She wears it, walks in it, sits down in it. Changes at this stage are free; changes after the gold is cut are not.',
      },
      { type: 'heading', text: 'Two weeks out — fitting and final polish' },
      {
        type: 'paragraph',
        text: 'Final fitting with the blouse, because a neckline changes everything about where a choker sits. Adjustments to clasps and sahara chains. Then a final polish, and the pieces go into their trunk.',
      },
      {
        type: 'quote',
        text: 'The three commonest bridal mistakes: ordering too late, ordering too heavy, and ordering without the blouse.',
      },
      { type: 'heading', text: 'The morning itself' },
      {
        type: 'paragraph',
        text: 'Pack a polishing cloth, a spare safety pin, and a small pair of pliers. Someone will need all three. Put the heaviest piece on last and take it off first.',
      },
    ],
  },
  {
    slug: 'caring-for-polki-and-kundan',
    title: 'Caring for polki and kundan (it is not like caring for gold)',
    category: 'Jewellery Care',
    excerpt:
      'Uncut diamond set in lac behaves nothing like a claw-set brilliant. Five rules that will keep a bridal set intact for thirty years.',
    readMinutes: 5,
    date: '2026-04-22',
    author: 'Mayura Atelier',
    image: '/images/editorial/bridal-polki-necklace.jpg',
    image2: '/images/editorial/kundan-bangles.jpg',
    body: [
      {
        type: 'lede',
        text: 'Almost every ruined polki set we see has been ruined the same way: someone cleaned it.',
      },
      { type: 'heading', text: 'Why polki is different' },
      {
        type: 'paragraph',
        text: 'In a kundan setting the stone sits on 24K gold foil, bedded in lac — a natural resin. The foil is what makes polki glow; the lac is what holds everything in place. Both are vulnerable to water and heat in a way a claw-set diamond simply is not.',
      },
      { type: 'heading', text: 'The five rules' },
      {
        type: 'list',
        items: [
          'Never immerse in water. Not soapy water, not "just quickly".',
          'Never use an ultrasonic cleaner. It will loosen every stone at once.',
          'Wipe with a dry, soft cloth only — cotton or flannel, not tissue.',
          'Store flat with the stones facing up, in the fitted box, away from humidity.',
          'Put jewellery on last, after perfume and hairspray have dried.',
        ],
      },
      { type: 'heading', text: 'When it does need attention' },
      {
        type: 'paragraph',
        text: 'If a stone lifts, stop wearing the piece immediately — one loose stone quickly becomes three. Re-bedding is a workshop job and takes about a week. We do it free for pieces bought here, and at cost for pieces that were not.',
      },
      {
        type: 'quote',
        text: 'Bring a bridal set in a fortnight before the wedding and we will refresh it, free, whoever made it.',
      },
    ],
  },
  {
    slug: 'daily-wear-that-survives',
    title: 'Daily wear that actually survives daily wear',
    category: 'Buying Guides',
    excerpt:
      'Screw backs, bezel settings, laser welding and flat inner profiles. The unglamorous engineering that decides whether you still own a piece in ten years.',
    readMinutes: 6,
    date: '2026-03-14',
    author: 'Darshil Bhandari',
    image: '/images/editorial/everyday-sisters.jpg',
    body: [
      {
        type: 'lede',
        text: 'The difference between jewellery you wear and jewellery you keep meaning to wear is almost never the design. It is four or five construction decisions nobody photographs.',
      },
      { type: 'heading', text: 'Screw backs, not push backs' },
      {
        type: 'paragraph',
        text: 'A butterfly back loosens. A screw back does not. It takes ten seconds longer to put on and it is the single biggest reason a pair of studs survives a decade instead of becoming a single stud in a drawer.',
      },
      { type: 'heading', text: 'Bezel over claw, for anything worn under a sleeve' },
      {
        type: 'paragraph',
        text: 'Claws catch on knitwear, and a bent claw is a lost stone. A full or half bezel wraps the girdle in metal. It shows slightly less of the stone and it removes the failure mode entirely. For an everyday pendant or a line necklace, take the bezel.',
      },
      { type: 'heading', text: 'Laser welding on fine chains' },
      {
        type: 'paragraph',
        text: 'A soldered joint on a 1.1mm chain has a filler metal in it that is softer than the chain. A laser weld fuses the gold to itself. On anything under 2mm it is the difference between a chain that lasts a decade and one that parts at the back of the neck in a year.',
      },
      { type: 'heading', text: 'Flat inner profiles for stacking' },
      {
        type: 'paragraph',
        text: 'If you intend to wear two rings on one finger, both need flat or slightly domed inner walls. Two round-profile bands rub each other thin — you will lose half a gram between them over five years, and neither will sit straight.',
      },
    ],
  },
  {
    slug: 'temple-jewellery-a-short-history',
    title: 'Temple jewellery: a short history of a very long tradition',
    category: 'Trends',
    excerpt:
      'From the Chola bronzes to a Kandivali counter — how nakashi work travelled, what makes it authentic, and how to tell struck from cast.',
    readMinutes: 7,
    date: '2026-02-08',
    author: 'Mayura Atelier',
    image: '/images/editorial/bride-telugu.jpg',
    image2: '/images/editorial/bridal-antique-haram.jpg',
    body: [
      {
        type: 'lede',
        text: 'Temple jewellery began, quite literally, as jewellery for temples — ornaments made to adorn deities in the great Chola-era shrines of Tamil Nadu. It moved onto human necks around the seventeenth century, by way of the devadasi dancers who wore it in performance.',
      },
      { type: 'heading', text: 'The vocabulary' },
      {
        type: 'paragraph',
        text: 'Kasu malai — a chain of coins, each struck with Lakshmi. Vanki — the angular armlet worn above the elbow. Oddiyanam — the waist belt. Nakashi — the raised repoussé work that defines the whole style. Learn four words and the whole category opens up.',
      },
      { type: 'heading', text: 'Struck versus cast: how to tell' },
      {
        type: 'paragraph',
        text: 'True nakashi is raised from a sheet of gold by hammering from behind, over pitch. The reverse of a struck piece is concave and shows tool marks; the reverse of a cast piece is flat and smooth, and often shows tiny casting pores under a loupe. Turn the piece over. It takes three seconds and it tells you most of what you need to know.',
      },
      {
        type: 'quote',
        text: 'Cast temple jewellery is not fraudulent, and it costs a great deal less. But it should not be sold at the price of struck work.',
      },
      { type: 'heading', text: 'Why the antique finish is a patina, not a paint' },
      {
        type: 'paragraph',
        text: 'A proper antique finish is a controlled chemical patina in the recesses, with the high points burnished back to bright gold. It is part of the metal. A sprayed or plated "antique" finish will wear off on a blouse within a season. Rub an inconspicuous area firmly with a thumb — if anything transfers, it is a coating.',
      },
    ],
  },
  {
    slug: 'diamond-grades-that-matter',
    title: 'Which diamond grades actually matter at which size',
    category: 'Buying Guides',
    excerpt:
      'Colour matters more than clarity below half a carat, and the reverse above one. Where to spend, and where you are buying a certificate rather than a diamond.',
    readMinutes: 7,
    date: '2026-01-17',
    author: 'Darshil Bhandari',
    image: '/images/products/ring-white-gold-halo.jpg',
    body: [
      {
        type: 'lede',
        text: 'The four Cs are real, but they are not equally important, and which one matters most changes with the size of the stone. Nobody selling you a diamond has much incentive to say so.',
      },
      { type: 'heading', text: 'Under 0.30 ct: cut, then colour' },
      {
        type: 'paragraph',
        text: 'At this size an inclusion is invisible to the naked eye no matter what the certificate says. Buy SI clarity and put the money into colour and cut instead — a well-cut G will out-sparkle a badly-cut E every day of the week.',
      },
      { type: 'heading', text: '0.30–1.00 ct: cut, colour, then clarity' },
      {
        type: 'paragraph',
        text: 'Around half a carat, SI2 inclusions start becoming findable if you know where to look. VS2 is the sensible floor. Colour below H starts showing warmth against white gold, though it is almost invisible in a yellow gold setting — which is a genuine way to save money.',
      },
      { type: 'heading', text: 'Above 1.00 ct: clarity comes forward' },
      {
        type: 'paragraph',
        text: 'A large table shows everything. Above a carat, VS1 or better is worth paying for, and the difference between VS1 and VVS2 is usually not — that gap is where you are buying a certificate rather than a diamond.',
      },
      {
        type: 'quote',
        text: 'Ask to see two stones side by side under a loupe before anybody mentions price. If a shop will not do that, go elsewhere.',
      },
      { type: 'heading', text: 'The one thing never to compromise on' },
      {
        type: 'paragraph',
        text: 'Cut. It is the only C that is entirely about human skill rather than geology, and it is the one that decides whether a stone looks alive. An Excellent-cut stone one grade lower in colour and clarity will look better and cost less than a Good-cut stone that grades well on paper.',
      },
    ],
  },
  {
    slug: 'gold-as-a-holding',
    title: 'Jewellery is not an investment — and that is fine',
    category: 'Gold Investment',
    excerpt:
      'An honest look at what you recover on exchange, how it compares with a sovereign bond or an ETF, and why people buy jewellery anyway.',
    readMinutes: 6,
    date: '2025-12-05',
    author: 'Darshil Bhandari',
    image: '/images/editorial/heirloom-generations.jpg',
    body: [
      {
        type: 'lede',
        text: 'I sell jewellery for a living and I will still tell you plainly: if your only goal is exposure to the gold price, jewellery is the least efficient way to get it.',
      },
      { type: 'heading', text: 'What you actually recover' },
      {
        type: 'paragraph',
        text: 'On exchange you recover the gold at that day\'s rate for its purity. You do not recover the making charge, the GST, or the stone value at anything close to what you paid. On a piece with 20% making, you are roughly 23% down on day one, before the price of gold moves at all.',
      },
      { type: 'heading', text: 'How the alternatives compare' },
      {
        type: 'list',
        items: [
          'Sovereign Gold Bonds — no making charge, and they pay interest. Least efficient to exit early.',
          'Gold ETFs — low expense ratio, fully liquid, no storage question.',
          'Coins and bars — small premium, but you must store them and insure them.',
          'Jewellery — the largest premium by a distance, and the only one you can wear.',
        ],
      },
      {
        type: 'quote',
        text: 'Buy jewellery because you want to wear it, or because it will be handed down. Buy bonds because you want the gold price. Confusing the two is how people end up disappointed in both.',
      },
      { type: 'heading', text: 'If you are buying jewellery anyway' },
      {
        type: 'paragraph',
        text: 'Prefer 22K over 18K, because the exchange value is higher. Prefer plain gold over heavily stone-set, because stone weight is deducted and stones are valued conservatively on return. Prefer lower making charges for pieces you may exchange, and pay the higher making charge only for the pieces you intend to keep.',
      },
    ],
  },
]

export const getPost = (slug) => BLOG_POSTS.find((p) => p.slug === slug)
export const FEATURED_POSTS = BLOG_POSTS.filter((p) => p.featured)

export const relatedPosts = (post, limit = 3) =>
  BLOG_POSTS.filter((p) => p.slug !== post?.slug)
    .sort((a, b) => (b.category === post?.category ? 1 : 0) - (a.category === post?.category ? 1 : 0))
    .slice(0, limit)
