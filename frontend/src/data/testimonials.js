/** Customer reviews. Demonstration content for a frontend-only build. */

export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Priya Deshmukh',
    location: 'Thakur Village, Kandivali',
    rating: 5,
    date: '2026-06-14',
    verified: true,
    purchase: 'Anantara Polki Choker',
    headline: 'They talked me out of the more expensive set',
    quote:
      'I had gone in prepared to spend considerably more. Darshil put both sets on the tray, explained exactly where the extra ₹80,000 was going, and said plainly that for my mother\'s frame the lighter one would sit better. He was right. I have never had a jeweller argue against his own margin before.',
  },
  {
    id: 't2',
    name: 'Rakesh & Anjali Mehta',
    location: 'Borivali East',
    rating: 5,
    date: '2026-05-02',
    verified: true,
    purchase: 'Bridal commission — full suite',
    headline: 'Four months, three fittings, no surprises',
    quote:
      'We ordered our daughter\'s bridal set in January for a May wedding. Every date they gave us they kept. We saw a silver sample before any gold was cut, and the final weight was within two grams of the quotation. On the morning of the wedding they sent someone with a polishing cloth. That is not a service anybody asked for.',
  },
  {
    id: 't3',
    name: 'Sunita Nair',
    location: 'Malad West',
    rating: 5,
    date: '2026-06-28',
    verified: true,
    purchase: 'Nilaya Diamond Line Necklace',
    headline: 'Certificates handed over without my asking',
    quote:
      'The IGI certificate was in the box, the HUID matched the invoice, and the young man at the counter showed me how to check it on the BIS app himself. I have bought from far larger showrooms that made me ask twice for the same paperwork.',
  },
  {
    id: 't4',
    name: 'Farhan Qureshi',
    location: 'Kandivali East',
    rating: 5,
    date: '2026-04-19',
    verified: true,
    purchase: 'Vikram Gents Diamond Bar Ring',
    headline: 'Resized twice, no charge, no sighing',
    quote:
      'I got the size wrong, then got it wrong again in the other direction. Both times they fixed it in three days without a word about it. The ring itself has taken a year of gym and site visits and still looks like the day I bought it.',
  },
  {
    id: 't5',
    name: 'Meera Iyer',
    location: 'Thane West',
    rating: 5,
    date: '2026-03-08',
    verified: true,
    purchase: 'Vanaja Temple Lakshmi Haram',
    headline: 'Proper Thanjavur work, in Mumbai',
    quote:
      'I am from Kumbakonam and I know what nakashi work is supposed to look like. This is the real thing — raised, not cast, and the Lakshmi has a face rather than a smudge. I had assumed I would have to order from home. I no longer do.',
  },
  {
    id: 't6',
    name: 'Aditya Kulkarni',
    location: 'Goregaon',
    rating: 5,
    date: '2026-07-02',
    verified: true,
    purchase: 'Solaire Halo Solitaire Ring',
    headline: 'An hour with a loupe and no pressure',
    quote:
      'They put four stones on a tray at four price points and let me look at all of them under a loupe before anyone mentioned money. I ended up buying the second cheapest, and nobody tried to move me up. The proposal went fine, since you ask.',
  },
  {
    id: 't7',
    name: 'Kavita Shah',
    location: 'Kandivali West',
    rating: 4,
    date: '2026-02-21',
    verified: true,
    purchase: 'Kanaka Gold Rosette Studs',
    headline: 'Small purchase, same attention',
    quote:
      'I bought a pair of studs worth twenty-five thousand rupees and was treated exactly as attentively as the couple beside me spending five lakh. The only thing I would change is the seating — the shop gets busy on Saturdays and there is nowhere to wait.',
  },
  {
    id: 't8',
    name: 'Ramesh Bhandari',
    location: 'Dahisar',
    rating: 5,
    date: '2026-01-30',
    verified: true,
    purchase: 'Old gold exchange & remake',
    headline: 'Weighed and tested in front of me',
    quote:
      'My mother\'s old bangles were forty years old and I had no invoice. They tested them on the machine while I watched, showed me the reading, explained the deduction before quoting, and remade them into two chains and a pendant. Everything was itemised on paper.',
  },
  {
    id: 't9',
    name: 'Neha Pillai',
    location: 'Vasant Utsav, Thakur Village',
    rating: 5,
    date: '2026-05-25',
    verified: true,
    purchase: 'Aarambh Kids Gold Bangles',
    headline: 'Safety was the first thing they mentioned',
    quote:
      'For my son\'s first birthday. Before showing me anything, they explained why the bells are soldered and why there is no hinge. That was not a sales point — it was the first thing out of his mouth. I have since sent four cousins there.',
  },
  {
    id: 't10',
    name: 'Dr. Vandana Rao',
    location: 'Borivali West',
    rating: 5,
    date: '2026-06-06',
    verified: true,
    purchase: 'Nilaya Diamond Huggie Hoops',
    headline: 'They survive twelve-hour shifts',
    quote:
      'I needed something I could wear under a surgical cap and never think about. Nine months in, they have not once come loose and I have not once caught them on anything. Worth every rupee of the premium over a snap hoop.',
  },
  {
    id: 't11',
    name: 'Jignesh Patel',
    location: 'Kandivali East',
    rating: 5,
    date: '2026-04-11',
    verified: true,
    purchase: 'Bandhan Classic Mangalsutra',
    headline: 'The rate was written down before I decided',
    quote:
      'They wrote out the full calculation on a pad — net weight, rate, making, GST — handed it to me and let me sit with it. No jeweller in this area had done that for me before. I bought there and I will keep buying there.',
  },
  {
    id: 't12',
    name: 'Alisha Fernandes',
    location: 'Andheri West',
    rating: 5,
    date: '2026-07-15',
    verified: true,
    purchase: 'Chandrika Rose Gold Threaders',
    headline: 'Worth the drive from Andheri',
    quote:
      'Found them through a friend\'s wedding set. The threaders are so light I check my ears to make sure they are still there. Small shop, unhurried service, and the tea is good.',
  },
]

export const AVERAGE_RATING = (
  TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0) / TESTIMONIALS.length
).toFixed(1)

export const RATING_DISTRIBUTION = [5, 4, 3, 2, 1].map((stars) => ({
  stars,
  count: TESTIMONIALS.filter((t) => t.rating === stars).length,
  percent: Math.round(
    (TESTIMONIALS.filter((t) => t.rating === stars).length / TESTIMONIALS.length) * 100,
  ),
}))

export const FEATURED_TESTIMONIALS = TESTIMONIALS.slice(0, 6)
