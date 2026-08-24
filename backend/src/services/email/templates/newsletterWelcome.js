import escapeHtml from '../utils/escapeHtml.js'

export const newsletterWelcomeTemplate = (subscriber) => {
  const email = escapeHtml(subscriber.email)

  const subjectLine = 'Welcome to Mayura Jewellers'

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
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #8C827A;">Mayura Insiders · Notes from the Workshop</p>
          </div>
          <div class="content">
            <p>Welcome to Mayura Insiders!</p>
            <p>Your subscription for <strong>${email}</strong> has been confirmed. You will be the first to receive preview invitations for new handcrafted gold & diamond collections, seasonal showcases, and jewellery care guidance directly from our Thakur Village workshop.</p>
            <div class="box">
              <p style="margin: 0; font-weight: bold; color: #574F48;">What to expect:</p>
              <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                <li>Exclusive previews of new bridal & heritage collections</li>
                <li>Private event invitations at our Kandivali showroom</li>
                <li>Purity & hallmarking buyer guides</li>
              </ul>
            </div>
            <p>If you ever wish to stop receiving updates, let us know anytime by replying to this email.</p>
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
Welcome to Mayura Insiders!

Your subscription for ${subscriber.email} has been confirmed. You will be the first to receive preview invitations for new handcrafted gold & diamond collections, seasonal showcases, and jewellery care guidance directly from our Thakur Village workshop.

What to expect:
- Exclusive previews of new bridal & heritage collections
- Private event invitations at our Kandivali showroom
- Purity & hallmarking buyer guides

Warm regards,
Mayura Jewellers Team
Thakur Village, Kandivali East, Mumbai 400101
  `.trim()

  return { subject: subjectLine, html, text }
}
