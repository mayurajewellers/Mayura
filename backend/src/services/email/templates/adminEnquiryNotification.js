import escapeHtml from '../utils/escapeHtml.js'

export const adminEnquiryNotificationTemplate = (enquiry) => {
  const name = escapeHtml(enquiry.name)
  const email = escapeHtml(enquiry.email)
  const phone = escapeHtml(enquiry.phone)
  const subject = escapeHtml(enquiry.subject || 'General enquiry')
  const message = escapeHtml(enquiry.message)
  const source = escapeHtml(enquiry.source || 'contact')
  const dateStr = enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')

  const subjectLine = `New customer enquiry — ${subject} — ${name}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2B2625; line-height: 1.6; background-color: #FAF8F5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E8E2D9; border-radius: 8px; padding: 32px; }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #F0ECE4; }
          .brand { font-size: 20px; font-weight: bold; color: #8C6D3B; text-transform: uppercase; }
          .content { padding: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          td { padding: 8px 12px; border-bottom: 1px solid #F4EFEA; }
          td.label { font-weight: bold; color: #736B65; width: 30%; }
          .box { background: #FAF8F5; border: 1px solid #E8E2D9; padding: 16px; border-radius: 4px; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Mayura Jewellers — Admin Notification</div>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #8C827A;">New Customer Enquiry Submitted</p>
          </div>
          <div class="content">
            <table>
              <tr><td class="label">Customer Name:</td><td>${name}</td></tr>
              <tr><td class="label">Email Address:</td><td><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td class="label">Phone / WhatsApp:</td><td><a href="tel:${phone}">${phone}</a></td></tr>
              <tr><td class="label">Subject / Service:</td><td>${subject}</td></tr>
              <tr><td class="label">Submission Source:</td><td>${source}</td></tr>
              <tr><td class="label">Received At:</td><td>${dateStr} IST</td></tr>
            </table>
            <p style="font-weight: bold; color: #574F48; margin-bottom: 8px;">Customer Message:</p>
            <div class="box">${message}</div>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
New customer enquiry received on Mayura Jewellers.

Customer Name: ${enquiry.name}
Email Address: ${enquiry.email}
Phone / WhatsApp: ${enquiry.phone}
Subject / Service: ${enquiry.subject || 'General enquiry'}
Submission Source: ${enquiry.source || 'contact'}
Received At: ${dateStr} IST

Message:
${enquiry.message}
  `.trim()

  return { subject: subjectLine, html, text }
}
