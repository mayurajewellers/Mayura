import mongoose from 'mongoose'

const siteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'main',
      unique: true,
      index: true,
    },
    brand: {
      name: { type: String, default: 'Mayura Jewellers' },
      shortName: { type: String, default: 'Mayura' },
      tagline: { type: String, default: 'Fine Gold & Diamond Jewellery' },
      established: { type: Number, default: 2004 },
      city: { type: String, default: 'Mumbai' },
      meaning: { type: String, default: '' },
      positioning: { type: String, default: '' },
    },
    owner: {
      name: { type: String, default: 'Darshil Bhandari' },
      role: { type: String, default: 'Founder & Proprietor' },
      message: { type: String, default: '' },
    },
    contact: {
      businessName: { type: String, default: 'Mayura Jewellers' },
      legalName: { type: String, default: 'Mayura Jewellers' },
      addressLines: [{ type: String }],
      addressShort: { type: String, default: '' },
      addressOneLine: { type: String, default: '' },
      locality: { type: String, default: 'Kandivali East' },
      region: { type: String, default: 'MH' },
      postalCode: { type: String, default: '400101' },
      country: { type: String, default: 'India' },
      email: { type: String, default: 'mayurajewellers2019@gmail.com' },
      phonePrimary: { type: String, default: '+91 91675 89002' },
      phonePrimaryRaw: { type: String, default: '919167589002' },
      phoneDisplayShort: { type: String, default: '+91 91675 89002' },
      whatsapp: { type: String, default: '919167589002' },
      whatsappUrl: { type: String, default: 'https://wa.me/919167589002' },
      whatsappTooltip: { type: String, default: 'Chat with Jewellery Expert' },
      currency: { type: String, default: 'INR' },
      currencySymbol: { type: String, default: '₹' },
      mapQuery: { type: String, default: '' },
      mapEmbedUrl: { type: String, default: '' },
      mapDirectionsUrl: { type: String, default: '' },
    },
    businessHours: [
      {
        day: { type: String, required: true },
        hours: { type: String, required: true },
        note: { type: String, default: '' },
      },
    ],
    socialLinks: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
        handle: { type: String, default: '' },
        icon: { type: String, default: '' },
      },
    ],
    businessDetails: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    assurances: [
      {
        icon: { type: String, default: '' },
        title: { type: String, required: true },
        copy: { type: String, required: true },
      },
    ],
    newsletter: {
      eyebrow: { type: String, default: 'The Mayura Letter' },
      heading: { type: String, default: 'Notes from the workshop' },
      copy: { type: String, default: '' },
    },
    defaultSeo: {
      titleTemplate: { type: String, default: '%s — Mayura Jewellers' },
      defaultTitle: { type: String, default: 'Mayura Jewellers — Fine Gold & Diamond Jewellery, Mumbai' },
      description: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  },
)

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema)

export default SiteSettings
