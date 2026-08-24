import escapeHtml from '../utils/escapeHtml.js'

export const enquiryConfirmationTemplate = (enquiry) => {
  const name = escapeHtml(enquiry.name)
  const subject = escapeHtml(enquiry.subject || 'General enquiry')
  const message = escapeHtml(enquiry.message)

  const subjectLine = 'Enquiry received — Mayura Jewellers'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2B2625; line-height: 1.6; background-color: #FAF8F5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E8E2D9; border-radius: 8px; padding: 32px; }
          .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #F0ECE4; }
          .brand { font-size: 22px; font-weight: bold; color: #8C6D3B; letter-spacing: 2px; text-transform: uppercase; }
          .content { padding: 24px 0; }
          .box { background: #FAF8F5; border-left: 4px solid #C4A468; padding: 16px; margin: 16px 0; border-radius: 4px; }
          .footer { font-size: 13px; color: #736B65; text-align: center; border-top: 1px solid #F0ECE4; padding-top: 20px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Mayura Jewellers</div>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #8C827A;">Fine Jewellery · Thakur Village, Mumbai</p>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for writing to Mayura Jewellers. We have received your enquiry regarding <strong>${subject}</strong>.</p>
            <div class="box">
              <p style="margin: 0; font-weight: bold; color: #574F48;">Your Message:</p>
              <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p>Our team reviews every message carefully and will reply within one working day. If your request is urgent, please call or WhatsApp us on +91 91675 89002.</p>
            <p>Warm regards,<br><strong>Mayura Jewellers Team</strong></p>
          </div>
          <div class="footer">
            <p>Vasant Utsav, Shop No. 5, Near Rangoli Building, Thakur Village, Kandivali East, Mumbai 400101</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Dear ${enquiry.name},

Thank you for writing to Mayura Jewellers. We have received your enquiry regarding: ${enquiry.subject || 'General enquiry'}.

Your Message:
${enquiry.message}

Our team reviews every message carefully and will reply within one working day. If your request is urgent, please call or WhatsApp us on +91 91675 89002.

Warm regards,
Mayura Jewellers Team
Thakur Village, Kandivali East, Mumbai 400101
  `.trim()

  return { subject: subjectLine, html, text }
}
