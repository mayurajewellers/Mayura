import { CONTACT, OWNER } from '@constants/site'

/**
 * Legal and policy copy. Written for an Indian jewellery retailer and kept
 * in one module so the four legal pages share a single rendering component.
 *
 * NOTE FOR THE CLIENT: this is professionally drafted template copy, not
 * legal advice. Have it reviewed by your advocate before publication, and
 * check the GST rates and statutory references against the position on the
 * date you go live.
 */

const CONTACT_BLOCK = {
  heading: 'Contact us about this policy',
  paragraphs: [
    `Mayura Jewellers, ${CONTACT.addressOneLine}`,
    `Proprietor: ${OWNER.name}`,
    `Email: ${CONTACT.email} · Telephone / WhatsApp: ${CONTACT.phonePrimary}`,
    'We respond to written queries within three working days.',
  ],
}

export const POLICIES = {
  terms: {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    kicker: 'Legal',
    updated: '2026-07-01',
    /* Rendered as clause bullets rather than prose — these are the
       showroom's own terms, reproduced as supplied. */
    variant: 'clauses',
    intro:
      'By entering into a transaction with Mayura Jewellers you are deemed to have read and accepted the terms and conditions below. If anything here is unclear, please ask us at the counter — we would far rather explain a clause than rely on it.',
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
          'In case of sale/exchange/buyback original invoice is to be produced.',
          'No deduction in weight is made in case of exchange of our 22/22kt, 18/18kt & 14/14kt ornament with the new ornament.',
          'In case of platinum exchange / buyback original invoice and platinum guild certificate is to be produced.',
        ],
      },
      {
        heading: 'Weight, Wear & Tear',
        paragraphs: [
          'The Company is not responsible for any damage/weight loss of jewellery due to wear and tear or usage of the ornaments purchased by the customer.',
          'Before leaving the showroom customers are requested to kindly check the ornaments along with the weight while purchasing them.',
          'Once sold, no complaints regarding above will be entertained.',
          'In case of repairing & polishing of ornaments minor weight loss is unavoidable.',
          'Minor weight loss is also normal due to usage of ornament.',
          'All jewellery items are breakable, please handle with care.',
        ],
      },
      {
        heading: 'Payment & Delivery',
        paragraphs: [
          'All deliveries will be made strictly against payment of Cash/Credit Cards/Debit Cards/RTGS/NEFT/Bank Draft/UPI. In case of RTGS/NEFT, material will be delivered after 4Hrs. from the time of Credit to the account.',
          'In case of payment made by cheque / bank draft, delivery of goods will be made only after realisation of the cheque / bank draft. In case of dishonor of such cheque / bank draft, the transaction automatically stands cancelled.',
          'PAN Card will be required for transaction above Rs. 2 Lacs.',
          'No Credit will be allowed under any circumstances.',
          'Refunds in excess or Rs.10000/- shall be made only by way of account payee cheque/NEFT or RTGS. The same will be issued only customer name.',
          'Packing, Postage, GST and other incidental charges are charged separately.',
          'Composite Supply inclusive of labour charges, hallmarking charges and other charges.',
          'Making charges will be applicable as per the day’s gold rate.',
        ],
      },
      {
        heading: 'Buyback',
        paragraphs: [
          'There is no buyback value of colour & semi-precious stones, astrological stones, silver articles & silver ornaments.',
          'In case of buyback of ornaments, buyback rate on the prevalent day is applicable, with reference to buy back of certified diamonds the diamond certificate given to the customer during purchase should accompany the product. Payment will be made by a/c. payee cheque only. (Identify proof in the form of PAN card will be required for issuing a/c payee cheque)',
        ],
      },
      {
        heading: 'Designs, Orders & Deposits',
        paragraphs: [
          'Ornaments are made closely following the designs or samples approved, but deviation is possible in the process of manufacturing. However, they are not liable for cancellation if any deviation arises due to unforeseen circumstances.',
          'Privilege coupons are subject of confirmation from the issuing company.',
          'Full gold value is to be paid as advance for undertaking Customer Orders.',
          'Every effort is made to execute the orders on the due date of delivery.',
          'However, the orders are not liable for cancellation if any delay arises due to unforeseen circumstances.',
          'In case the Customer fails to take delivery of the ordered ornaments within one month from the stipulated date of delivery the company is not liable to retain the ordered ornaments. However, the company reserves the right to adjust the making charges against the advanced receipt is these cases.',
          'In case of order utmost care is taken to keep weights very near to estimate.',
          'However, the actual weight of the ornament may vary from the estimated weight, which is unavoidable.',
          'The Customer need to bring the original copy of the advance receipt/deposit receipt in order to adjust the same or to take delivery, failing which a FIR/GD is required to be lodged with the concerned police station.',
          'The company is not liable to retain deposited ornaments is case the Customer fails to take delivery of the such ornaments within three months from the stipulated date of delivery.',
          'Refund of advance will not be made under any circumstances.',
        ],
      },
      {
        heading: 'Hallmarking',
        paragraphs: [
          'Consumer can get the purity of the Hallmarked jewellery / artefacts verified from any of the BIS recognized A & H Centre.',
          'List of BIS recognized A & H Centre along with address and contact details is available on the website www.bis.gov.in',
          'Hallmarking charges @Rs.45/- per article or as may be decided from time to time paid by jeweler firm / manufacturer.',
          'No Hallmarking done for sale of Kundan / Polki / Jadaau Jewellery in terms Sr. No. (k) of sub Clause (3) of Clause 2 Hallmarking of Gold Jewellery & Gold Artefacts (Second Amendment) Order 2021 dated 23.06.2021.',
          'No Hallmarking done for sale of Jewellery / Artefacts below 2 Grams in terms of Sr. No. (b) of sub clause (3) of Clause 2 of Hallmarking of Gold Jewellery & Gold Artefacts Order 2020 dated 15.01.2020.',
          'No Hallmarking done for sale gold bullion in any shape of bar, plate, sheet, foil, rod, wire, strip, tube or coin in terms of Sr. no. (g) of sub clause (3) of Clause 2 of Hallmarking of Gold Jewellery & Gold artefacts Order 2020 dated 15.01.2020.',
        ],
      },
      {
        heading: 'General',
        paragraphs: [
          'The Company reserves the right to alter the terms and condition whenever necessary.',
          'Any dispute is subject to the jurisdiction of Mumbai High Court.',
          'By entering in to this transaction you have been deemed to have read and accepted above terms and conditions.',
        ],
      },
      CONTACT_BLOCK,
    ],
  },

  privacy: {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    kicker: 'Legal',
    updated: '2026-07-01',
    intro:
      'This policy explains what personal information Mayura Jewellers collects, why we collect it, how long we keep it and what you can ask us to do with it. It covers both this website and our shop at Thakur Village.',
    sections: [
      {
        heading: '1. What this website collects',
        paragraphs: [
          'This website is a frontend-only showcase. It has no server, no database and no analytics account. Nothing you type into a form on this site is transmitted anywhere.',
          'Two things are stored, and both stay on your own device: the contents of your wishlist and cart, held in your browser\'s local storage; and your recent searches, held the same way. Clearing your browser data removes both permanently. We cannot see either.',
          'Fonts are loaded from Google Fonts, which means Google receives your IP address when the page loads. That is the only third-party request this site makes.',
        ],
      },
      {
        heading: '2. What we collect in the shop',
        paragraphs: [
          'When you buy from us, or place an order by telephone or WhatsApp, we collect: your name, postal address, telephone number and email address; details of what you bought; and, where the law requires it, identification documents.',
          'For transactions where PAN is statutorily required — currently cash purchases at or above ₹2,00,000 — we collect and retain a copy of your PAN as required by the Income Tax Act.',
          'For bridal and custom commissions we may hold photographs, sketches and measurements supplied by you, for the duration of the commission and our warranty obligations.',
        ],
      },
      {
        heading: '3. Why we hold it',
        paragraphs: [
          'To fulfil your order, arrange delivery, and provide warranty, repair, resizing and exchange services over the life of the article.',
          'To comply with our obligations under Indian tax, hallmarking and anti-money-laundering law.',
          'To contact you about your order. We send marketing messages only where you have asked us to, and you can stop them at any time.',
        ],
      },
      {
        heading: '4. Who we share it with',
        paragraphs: [
          'Courier partners, limited to the name, address and telephone number needed to deliver your parcel.',
          'BIS-recognised assaying centres and independent gemmological laboratories, in connection with hallmarking and certification.',
          'Our accountants and, where legally compelled, tax and law-enforcement authorities.',
          'We do not sell, rent or trade personal information to anyone, for any purpose, ever.',
        ],
      },
      {
        heading: '5. How long we keep it',
        paragraphs: [
          'Invoice and transaction records: eight years, as required by Indian tax law.',
          'Warranty, repair and service records: for as long as we provide lifetime service on the article.',
          'Marketing contact details: until you ask us to stop, and then only a suppression record so that we do not contact you again by mistake.',
        ],
      },
      {
        heading: '6. Your rights',
        paragraphs: [
          'You may ask us for a copy of the personal information we hold about you, ask us to correct anything inaccurate, or ask us to delete information we are not legally required to retain.',
          'Write to ' + CONTACT.email + ' or speak to us at the counter. We will respond within thirty days, and there is no charge.',
          'You may withdraw consent to marketing at any time by replying STOP to any message, using the unsubscribe link in any email, or telling us in person.',
        ],
      },
      {
        heading: '7. Security',
        paragraphs: [
          'Physical records are held in a locked facility at our premises. Digital records are held on access-controlled devices with encrypted storage.',
          'We do not store card numbers, CVV data or bank credentials in any form. Card transactions are processed entirely by the bank\'s own terminal.',
        ],
      },
      {
        heading: '8. Children',
        paragraphs: [
          'We do not knowingly collect personal information from anyone under eighteen. Purchases of children\'s jewellery are made by a parent or guardian, and it is their information we hold, not the child\'s.',
        ],
      },
      {
        heading: '9. CCTV',
        paragraphs: [
          'Our premises are monitored by CCTV for the security of customers, staff and stock. Recordings are retained for thirty days and are then overwritten, unless required for an investigation.',
        ],
      },
      {
        heading: '10. Changes to this policy',
        paragraphs: [
          'We will post any change on this page and update the date at the top. Material changes affecting how we use existing information will be notified directly to affected customers.',
        ],
      },
      CONTACT_BLOCK,
    ],
  },

  shipping: {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    kicker: 'Support',
    updated: '2026-07-01',
    intro:
      'How your order is packed, insured, despatched and delivered — and what to do if something goes wrong on the way.',
    sections: [
      {
        heading: '1. Where we deliver',
        paragraphs: [
          'We deliver to all serviceable pin codes across India.',
          'Within Mumbai, Thane and Navi Mumbai we offer hand delivery by appointment, at no charge, by a member of our own team.',
          'We do not currently ship outside India. If you are abroad and would like a piece delivered to a family member in India, we are glad to arrange it.',
        ],
      },
      {
        heading: '2. Processing and despatch times',
        paragraphs: [
          'Ready-stock articles: despatched within 2–4 working days of confirmed payment.',
          'Made-to-order articles: 3–5 weeks from written confirmation of the specification.',
          'Bridal commissions: 8–14 weeks, with a delivery date confirmed in writing before any deposit is taken.',
          'Resizing, engraving and personalisation add 2–4 working days.',
        ],
      },
      {
        heading: '3. Delivery times and charges',
        paragraphs: [
          'Mumbai Metropolitan Region: 1–3 working days from despatch. Rest of Maharashtra: 2–4 working days. Rest of India: 3–7 working days. North-eastern states, Jammu & Kashmir, Ladakh and island territories: 5–10 working days.',
          'Delivery is free on all orders above ₹25,000. Below that, a flat charge of ₹250 covers insured despatch anywhere in India.',
          'Hand delivery within Mumbai, Thane and Navi Mumbai is always free of charge.',
        ],
      },
      {
        heading: '4. Insurance and packaging',
        paragraphs: [
          'Every consignment is insured for its full declared value from the moment it leaves our counter until it is signed for. Loss or damage in transit is our risk, not yours.',
          'Parcels are shipped in plain, unbranded, tamper-evident packaging that gives no indication of the contents. We do not print our name on the outer.',
          'Each article travels in its fitted box with its hallmark card, certificates and tax invoice.',
        ],
      },
      {
        heading: '5. Receiving your parcel',
        paragraphs: [
          'Delivery requires a signature. Please check that the tamper-evident seal is intact and that the parcel is undamaged before signing.',
          'If the seal is broken or the packaging is damaged, refuse the delivery and telephone us immediately on ' + CONTACT.phonePrimary + '. Do not accept it and open it later.',
          'For consignments above ₹2,00,000 the person named on the invoice must accept delivery in person and produce photo identification.',
          'We recommend filming the opening of the parcel. It is not required, but it resolves the rare dispute quickly.',
        ],
      },
      {
        heading: '6. Failed and refused deliveries',
        paragraphs: [
          'Our courier will attempt delivery three times. After the third attempt the parcel returns to us and we will contact you to arrange redespatch.',
          'Where a parcel is returned because an incorrect address was supplied or delivery was repeatedly refused without cause, a redespatch charge of ₹250 applies.',
        ],
      },
      {
        heading: '7. Tracking',
        paragraphs: [
          'A tracking link is sent by SMS and email on despatch.',
          'You may also send your order number to us on WhatsApp at ' + CONTACT.phonePrimary + ' and we will tell you exactly where the parcel is.',
        ],
      },
      {
        heading: '8. Store collection',
        paragraphs: [
          'Collection from our Thakur Village store is available on every order at no charge, and is our preferred method for high-value pieces.',
          'Bring your order confirmation and photo identification. We will have the article cleaned, boxed and ready.',
        ],
      },
      CONTACT_BLOCK,
    ],
  },

  returns: {
    slug: 'return-policy',
    title: 'Return, Exchange & Buyback Policy',
    kicker: 'Support',
    updated: '2026-07-01',
    intro:
      'What you can return, what you can exchange, what we will buy back, and exactly what is deducted in each case. No small print you have to ask for.',
    sections: [
      {
        heading: '1. Fifteen-day return',
        paragraphs: [
          'Ready-stock articles may be returned within fifteen days of delivery for a full refund, provided they are unworn, undamaged, in their original packaging, and accompanied by the tax invoice, hallmark card and all certificates.',
          'Refunds are made to the original payment method within seven to ten working days of the returned article passing inspection.',
          'Delivery charges, where paid, are refunded only where the article was faulty or incorrectly supplied.',
        ],
      },
      {
        heading: '2. What cannot be returned',
        paragraphs: [
          'Made-to-order, custom and bridal commissions.',
          'Engraved or otherwise personalised articles.',
          'Articles that have been resized, altered or repaired at your request.',
          'Earrings and nose pins, for reasons of hygiene, unless faulty.',
          'Articles showing signs of wear, damage, or work carried out by another jeweller.',
          'These exclusions do not affect your statutory rights in respect of faulty goods.',
        ],
      },
      {
        heading: '3. Lifetime exchange',
        paragraphs: [
          'Gold jewellery purchased from Mayura Jewellers may be exchanged against a new purchase at any time in the future, for as long as you own it.',
          'On exchange, gold is valued at the prevailing rate for its purity on the day of exchange, based on net weight. Making charges and taxes paid on the original purchase are not refundable, and stone value is credited at our assessed value, not at the original invoice value.',
          'The article must carry its original hallmark and HUID, and must be accompanied by the original invoice. Where the invoice has been lost we will still accept the article, but we will test it and value it as unidentified gold.',
          'The new purchase must be of equal or greater value. We do not pay cash differences on exchange.',
        ],
      },
      {
        heading: '4. Buyback',
        paragraphs: [
          'We will buy back gold jewellery sold by us at the prevailing rate for its purity, on net weight, less a refining and handling deduction currently set at 5% for articles bought from us with their original invoice.',
          'For gold not purchased from us, or purchased without an invoice, the article is tested on our XRF analyser in your presence and valued at the rate for the purity read, less the applicable refining deduction. We will show you the reading and explain the deduction before quoting.',
          'Buyback payments above ₹10,000 are made by bank transfer, in accordance with law.',
        ],
      },
      {
        heading: '5. Faulty or incorrectly supplied articles',
        paragraphs: [
          'If an article is faulty or differs from what was ordered, tell us within seven days of delivery. We will collect it at our cost and repair, replace or refund it at your election.',
          'Manufacturing defects arising later are covered by our lifetime warranty. See the Terms & Conditions, clause 9.',
        ],
      },
      {
        heading: '6. How to start a return',
        paragraphs: [
          'Telephone or WhatsApp us on ' + CONTACT.phonePrimary + ', or email ' + CONTACT.email + ', quoting your invoice number.',
          'We will arrange an insured reverse pickup, or you may return the article to the store in person.',
          'Do not send jewellery by ordinary post or by any uninsured service. We cannot accept responsibility for articles lost in transit to us where the despatch was not arranged by us.',
        ],
      },
      {
        heading: '7. Refund timelines',
        paragraphs: [
          'Inspection is completed within two working days of receipt.',
          'Approved refunds are initiated within one working day of inspection, and typically appear within seven to ten working days depending on your bank.',
          'You will receive written confirmation at each stage.',
        ],
      },
      CONTACT_BLOCK,
    ],
  },
}

export const getPolicy = (key) => POLICIES[key]
