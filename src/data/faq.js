/**
 * FAQ content, organised in the category structure used across the Indian
 * jewellery retail sector (general merchandise, delivery, online purchase,
 * payments, sizing, account) and extended with the assurance topics
 * customers ask about most: purity, certification, care, warranty and
 * customisation.
 */

export const FAQ_CATEGORIES = [
  {
    id: 'general',
    title: 'General Merchandise',
    blurb: 'Purity, hallmarking, weights and what is actually in the box.',
    items: [
      {
        q: 'Is all your gold jewellery BIS hallmarked?',
        a: 'Yes. Every gold article we sell carries the BIS mark, the purity grade (916 for 22K, 750 for 18K), and a six-digit alphanumeric HUID. You can verify that HUID yourself on the BIS Care app before you leave the counter — we will wait while you do it. We do not sell unhallmarked gold in any weight, including children\'s pieces.',
      },
      {
        q: 'What is the difference between 22K and 18K gold?',
        a: '22K is 91.6% pure gold and 18K is 75% pure. 22K is richer in colour and holds its value better on exchange, which is why traditional Indian jewellery is made in it. 18K is harder, so it holds stones far more securely — that is why almost all diamond jewellery is made in 18K. Neither is "better"; they are for different jobs.',
      },
      {
        q: 'What is the difference between gross weight and net weight?',
        a: 'Gross weight is everything on the scale — gold, stones, enamel, the lot. Net weight is the gold alone, once stone and non-gold weight is deducted. You are charged for gold at net weight and for stones separately. Both figures are printed on every invoice we issue, and both are shown on every product page on this site.',
      },
      {
        q: 'How is the final price of a piece calculated?',
        a: 'Four components: (1) net gold weight × the day\'s rate for that purity, (2) making charges, quoted either as a percentage of gold value or a flat rate per gram, (3) the value of any stones, and (4) GST at 3% on the total. Hallmarking charges are included. We will write the whole calculation out on paper if you ask — most customers do, and we prefer it.',
      },
      {
        q: 'Do your product photographs show the actual piece?',
        a: 'Photographs are of the design, shot under studio lighting. Because every piece is finished by hand, small variations in finish, stone placement and weight are normal and are part of what makes handmade jewellery handmade. Weights on the site are indicative to within ±3%; the exact weight of your piece is on your invoice.',
      },
      {
        q: 'Do you sell lab-grown diamonds?',
        a: 'We stock natural diamonds by default and label them as such. We will source certified lab-grown stones on request, priced accordingly, and the certificate will state clearly that the stone is laboratory-grown. What we will not do is sell you one without telling you.',
      },
      {
        q: 'Do you buy old gold, and how is it valued?',
        a: 'Yes. Old gold is tested on an XRF machine in front of you, the purity is read off the display, and the value is calculated at that day\'s rate for that purity, less any refining loss on articles below 916. We do not accept gold without an invoice or a hallmark for exchange against a new purchase — we will still test and value it, but we will explain the deduction first.',
      },
    ],
  },
  {
    id: 'purity-certification',
    title: 'Gold Purity & Diamond Certification',
    blurb: 'How to check for yourself that what you are holding is what we said it is.',
    items: [
      {
        q: 'What is a HUID and where do I find it on my jewellery?',
        a: 'HUID stands for Hallmark Unique Identification — a six-digit alphanumeric code laser-marked on each hallmarked article, unique to that piece. On a ring it is usually inside the shank; on a chain, on the clasp tag; on a necklace, on the reverse of the clasp or a soldered tag. It is small — bring it to us and we will show you under the loupe.',
      },
      {
        q: 'How do I verify my HUID independently?',
        a: 'Download the BIS Care app (free, on Android and iOS), open "Verify HUID", and enter the six characters. It will return the article type, purity, the jeweller\'s registration number and the assaying centre. If any of it does not match your invoice, tell us immediately and we will resolve it.',
      },
      {
        q: 'Who certifies your diamonds?',
        a: 'Solitaires above 0.30 ct are certified by GIA or IGI. Smaller melee and pavé work is certified by IGI or SGL at the lot level. The physical certificate is handed over with the piece and the report number is printed on your invoice. Larger centre stones are laser-inscribed on the girdle with the report number, visible under 10× magnification.',
      },
      {
        q: 'What do the diamond grades on your product pages mean?',
        a: 'Colour runs D (colourless) to Z (tinted); we stock D–H. Clarity runs FL/IF, VVS1–2, VS1–2, SI1–2, I1–3; we stock down to SI, and label it honestly. In a piece under half a carat, colour matters more to the eye than clarity. Above a carat, the reverse. We would rather explain that than upsell you.',
      },
      {
        q: 'Will you give me a valuation certificate for insurance?',
        a: 'Yes, free of charge, at the time of purchase and again any time you ask. The valuation states current replacement value, which is not the same as your purchase price and will change with the gold rate. Most insurers want it re-issued every three years.',
      },
      {
        q: 'What if I suspect my piece is not the purity stated?',
        a: 'Bring it in. We will test it on the XRF in front of you at no charge, whether or not you bought it here. If a piece we sold you tests below its stated purity, we will replace it and refund the difference in full, without argument.',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery & Shipment',
    blurb: 'How your order travels, and what happens when it arrives.',
    items: [
      {
        q: 'Which areas do you deliver to?',
        a: 'We deliver across India. Within Mumbai, Thane and Navi Mumbai we can hand-deliver by appointment. Elsewhere in India we use insured, signature-required courier. We do not ship internationally at present.',
      },
      {
        q: 'How long will my order take?',
        a: 'In-stock pieces are dispatched within 2–4 working days and typically reach you in 3–7 working days. Made-to-order pieces take 3–5 weeks. Bridal commissions take 8–14 weeks, and we will give you a date in writing before you pay a deposit.',
      },
      {
        q: 'What does delivery cost?',
        a: 'Free on every order above ₹25,000, which is the overwhelming majority. Below that, a flat ₹250 covers insured despatch anywhere in India. There is no charge for hand delivery within Mumbai.',
      },
      {
        q: 'Is my parcel insured in transit?',
        a: 'Yes, at full declared value, from the moment it leaves our counter until it is signed for. The parcel is unbranded and gives no indication of its contents. If it is lost or damaged in transit, that is our loss and not yours.',
      },
      {
        q: 'Can somebody else accept delivery for me?',
        a: 'Yes, provided you tell us in advance and they can produce a photo ID matching the name you give. For orders above ₹2,00,000 we require the person named on the invoice to accept delivery personally, or to collect from the store.',
      },
      {
        q: 'What should I check before signing for a parcel?',
        a: 'Check that the tamper-evident seal is intact and the parcel weight matches the label. If the seal is broken or the packaging is damaged, refuse the delivery and call us on +91 91675 89002 immediately. Do not accept it and open it later — once signed for, a broken seal is much harder to resolve.',
      },
      {
        q: 'Can I collect from the store instead?',
        a: 'Always, and we prefer it. Order online, choose store collection, and we will have the piece cleaned, boxed and waiting. Bring the order confirmation and a photo ID.',
      },
    ],
  },
  {
    id: 'online-purchase',
    title: 'Online Purchase',
    blurb: 'Ordering, changing your mind, and what the rate is at any given moment.',
    items: [
      {
        q: 'Is the gold rate on the site live?',
        a: 'The rate shown is updated each business morning and holds for that day. Because the price of a gold piece is calculated at the rate on the day of billing, the amount confirmed at checkout is the amount you pay — it will not move afterwards, even if the rate does.',
      },
      {
        q: 'Can I change or cancel an order after placing it?',
        a: 'In-stock orders can be changed or cancelled free of charge until they are dispatched. Once dispatched, our return policy applies. Made-to-order and bridal pieces can be cancelled within 48 hours of confirmation; after that, work has started and the deposit is adjusted against the making charge already incurred.',
      },
      {
        q: 'Can I see a piece before I commit to buying it?',
        a: 'Yes. Book a viewing at the store and we will have it on the tray when you arrive. For bridal commissions we will show you a wax or a silver sample before any gold is cut.',
      },
      {
        q: 'Do you offer a try-at-home service?',
        a: 'Within Kandivali, Borivali, Malad and Thakur Village, yes — for selected daily-wear and diamond pieces, by appointment. A member of our team stays with the pieces throughout. Call us to arrange it.',
      },
      {
        q: 'How do I track my order?',
        a: 'You will receive a tracking link by SMS and email at dispatch. You can also simply WhatsApp us on +91 91675 89002 with your order number and we will tell you where it is.',
      },
      {
        q: 'What if the piece I want is out of stock?',
        a: 'Almost everything can be remade. Tell us the design and your size and we will quote a delivery date — usually three to five weeks. Prices are confirmed at the rate on the day of billing, not the day of order.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    blurb: 'What we accept, what it costs, and what appears on your invoice.',
    items: [
      {
        q: 'Which payment methods do you accept?',
        a: 'UPI, NEFT/RTGS/IMPS bank transfer, all major credit and debit cards, and cash within the legal limit. For bridal orders we work on a deposit-and-balance basis, with the balance due before despatch.',
      },
      {
        q: 'Is there a cash limit?',
        a: 'Yes. Under Section 269ST of the Income Tax Act we cannot accept ₹2,00,000 or more in cash in a single transaction, from a single person, in a single day. Above that, payment must be by bank transfer, card or UPI.',
      },
      {
        q: 'Do you charge GST, and at what rate?',
        a: '3% GST on gold and diamond jewellery, and 5% on making charges where these are billed separately. Both are shown as separate lines on your invoice — we do not fold tax into a headline price.',
      },
      {
        q: 'Do you offer EMI?',
        a: 'Yes, on credit cards from most major banks, typically over 3, 6, 9 or 12 months. Interest, if any, is set by your bank and not by us. Ask at the counter and we will tell you which banks are currently offering a no-cost option.',
      },
      {
        q: 'Do you run a gold savings or monthly instalment scheme?',
        a: 'We run a simple eleven-month savings plan: you deposit a fixed amount monthly, and on the twelfth month we contribute one instalment. The accumulated value is redeemable against any purchase at the rate on the day of redemption. Terms are handed over in writing at enrolment — please read them.',
      },
      {
        q: 'Is my payment information stored on this website?',
        a: 'No. This site does not process payments and stores no card or bank information. Payment is completed in store or through your bank\'s own channels.',
      },
    ],
  },
  {
    id: 'sizing',
    title: 'Product Sizing',
    blurb: 'Getting it right the first time, and fixing it when we do not.',
    items: [
      {
        q: 'How do I find my ring size at home?',
        a: 'Wrap a strip of paper around the base of the finger, mark where it overlaps, and measure the length in millimetres. Divide by 3.14 to get the diameter, then match against our chart. Do it in the evening — fingers are smallest in the morning and after air conditioning. If you are between sizes, go up.',
      },
      {
        q: 'How do I measure for a bangle?',
        a: 'Bring the thumb across to touch the little finger, and measure around the widest part of the folded hand with a tape. Match that circumference to our size chart. Indian bangle sizes (2.4, 2.6, 2.8 and so on) refer to internal diameter in inches and eighths.',
      },
      {
        q: 'Do you resize rings, and is it free?',
        a: 'Free once, within twelve months of purchase, for up to two sizes in either direction. Beyond that, or beyond twelve months, we charge for the gold added and the labour only. Eternity bands and fully pavé shanks cannot be resized — they have to be remade.',
      },
      {
        q: 'Can chains and necklaces be shortened or lengthened?',
        a: 'Yes. Shortening is done at no charge and the removed gold is credited back to you at that day\'s rate. Lengthening is charged at the rate for the gold added, plus labour.',
      },
      {
        q: 'What length of chain should I buy?',
        a: '16" sits at the base of the throat, 18" just below the collarbone, 20" at the top of the sternum, 22"–24" mid-chest and works over a kurta. For a pendant, 18" suits most women and 22" most men.',
      },
    ],
  },
  {
    id: 'care-warranty',
    title: 'Care, Warranty & Repairs',
    blurb: 'Keeping a piece for thirty years rather than three.',
    items: [
      {
        q: 'How should I clean gold jewellery at home?',
        a: 'Warm water, a drop of plain dish soap, and a soft toothbrush. Rinse and dry with a lint-free cloth. That is all it needs. Avoid toothpaste — it is abrasive and it will dull a polished finish over time.',
      },
      {
        q: 'How do I care for diamonds?',
        a: 'What dulls a diamond is skin oil, not dust. Soak for ten minutes in warm soapy water, brush gently behind the stone where oil collects, rinse and dry. Never use bleach, chlorine or ammonia — they attack the alloy the diamond is set in, not the stone.',
      },
      {
        q: 'How should I care for polki, kundan and enamel?',
        a: 'Keep them away from water entirely — polki and kundan are set on lac, and moisture will lift them. Wipe with a dry cloth only, store flat with the stones facing up, and never put them through an ultrasonic cleaner. Bring them to us before a wedding and we will refresh them free.',
      },
      {
        q: 'What does the warranty cover?',
        a: 'Manufacturing defects for life: failed solder joints, defective clasps, stones lost from a setting that was faulty rather than damaged. It does not cover accidental damage, normal wear, loss, or work done by another jeweller. Repairs outside warranty are quoted before we start.',
      },
      {
        q: 'How often should white gold be re-plated?',
        a: 'Rhodium is a surface plating and it wears. Rings need re-plating every 12–18 months, earrings and pendants far less often because they see less friction. Ask at the counter and we will quote it before we start.',
      },
      {
        q: 'Can you repair jewellery I did not buy from you?',
        a: 'Yes. We will assess it, quote before we start, and tell you honestly if the repair costs more than the piece is worth. We do not touch another jeweller\'s hallmark or alter a HUID.',
      },
    ],
  },
  {
    id: 'customisation',
    title: 'Customisation & Bridal',
    blurb: 'Making something that does not exist yet.',
    items: [
      {
        q: 'Can you make a piece to my own design?',
        a: 'Yes — it is a large part of what we do. Bring a photograph, a sketch, or a piece you want reinterpreted. We will produce a CAD render and a quotation within a week. Nothing is cut until you have approved both, in writing.',
      },
      {
        q: 'Can you remake my grandmother\'s jewellery into something wearable?',
        a: 'Frequently, and it is the work we like most. The old piece is weighed and tested in front of you, the gold is credited at that day\'s rate, and you pay only the difference plus making. If the piece has family value, consider keeping one element — a clasp, a medallion — and building around it.',
      },
      {
        q: 'How long does a custom or bridal commission take?',
        a: 'A single custom piece takes 3–5 weeks. A full bridal suite takes 8–14 weeks depending on the work involved. Plan bridal orders at least four months before the wedding; we would rather turn an order down than rush it.',
      },
      {
        q: 'Do you charge for design and CAD?',
        a: 'The first CAD render and two revisions are free. Beyond that we charge ₹2,500 per revision, refunded in full against the order if you go ahead.',
      },
      {
        q: 'Can I supply my own stones?',
        a: 'Yes. We will inspect and weigh them in your presence and record them on the job card. We will decline to set stones that are chipped or badly abraded, because they will not survive setting — we will tell you why, and show you under the loupe.',
      },
      {
        q: 'Do you engrave?',
        a: 'Yes, free of charge on bands and lockets — names, dates, or a short line in English, Hindi, Gujarati or Marathi. Hand engraving takes two working days; laser engraving is same-day.',
      },
    ],
  },
  {
    id: 'account',
    title: 'My Account & Registration',
    blurb: 'Note: this website is a showcase. Accounts are demonstration only.',
    items: [
      {
        q: 'Do I need an account to browse or order?',
        a: 'No. This website is a showcase for our collections — the account, wishlist, cart and checkout screens are demonstrations and are not connected to any server. To place a real order, call or WhatsApp us on +91 91675 89002, or visit the store.',
      },
      {
        q: 'Is my personal information stored by this website?',
        a: 'Nothing you type into this site is transmitted anywhere. Wishlist and cart contents are held in your own browser\'s local storage and never leave your device. Clearing your browser data clears them.',
      },
      {
        q: 'How do I update the details you hold on me?',
        a: 'Call us on +91 91675 89002 or email mayurajewellers2019@gmail.com and we will update our records the same day. If you would like the details we hold, or would like them deleted, ask and we will do it within thirty days.',
      },
      {
        q: 'How do I unsubscribe from your messages?',
        a: 'Reply STOP to any WhatsApp or SMS, use the unsubscribe link at the foot of any email, or simply tell us at the counter. We remove you the same day and we do not sell contact details to anyone, ever.',
      },
    ],
  },
]

/** Flattened list, used by the search page and the FAQ jump navigation. */
export const ALL_FAQS = FAQ_CATEGORIES.flatMap((c) =>
  c.items.map((item) => ({ ...item, category: c.title, categoryId: c.id })),
)

/** The five questions we get asked most — surfaced on the contact page. */
export const TOP_FAQS = [
  ALL_FAQS.find((f) => f.q.startsWith('Is all your gold')),
  ALL_FAQS.find((f) => f.q.startsWith('How is the final price')),
  ALL_FAQS.find((f) => f.q.startsWith('Do you resize rings')),
  ALL_FAQS.find((f) => f.q.startsWith('How long does a custom')),
  ALL_FAQS.find((f) => f.q.startsWith('Do you offer free cleaning')),
].filter(Boolean)
