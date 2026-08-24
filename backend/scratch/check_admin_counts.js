import mongoose from 'mongoose'
import dotenv from 'dotenv'

import Order from '../src/models/Order.js'
import Enquiry from '../src/models/Enquiry.js'
import Consultation from '../src/models/Consultation.js'
import NewsletterSubscriber from '../src/models/NewsletterSubscriber.js'

dotenv.config()

const runCheck = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  await mongoose.connect(mongoUri)

  const [orders, enquiries, consultations, subscribers] = await Promise.all([
    Order.countDocuments(),
    Enquiry.countDocuments(),
    Consultation.countDocuments(),
    NewsletterSubscriber.countDocuments(),
  ])

  console.log('=== CURRENT MONGODB DOCUMENT COUNTS ===')
  console.log('Orders Total:', orders)
  console.log('Enquiries Total:', enquiries)
  console.log('Consultations Total:', consultations)
  console.log('Subscribers Total:', subscribers)

  await mongoose.disconnect()
}

runCheck()
