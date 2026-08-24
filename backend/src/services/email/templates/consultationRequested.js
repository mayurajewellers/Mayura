import escapeHtml from '../utils/escapeHtml.js'

export const consultationRequestedTemplate = (consultation) => {
  const name = escapeHtml(consultation.name)
  const dateStr = consultation.preferredDate
    ? new Date(consultation.preferredDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Selected Date'
  const timeSlot = escapeHtml(consultation.preferredTime)
  const type = escapeHtml(consultation.consultationType || 'video')

  const subjectLine = 'Consultation request received — Mayura Jewellers'

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
          .status-badge { display: inline-block; background: #FFF4E5; color: #B25E00; border: 1px solid #FFE0B2; padding: 6px 12px; font-size: 13px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
          .details { background: #FAF8F5; border: 1px solid #E8E2D9; padding: 16px; margin: 16px 0; border-radius: 6px; }
          .footer { font-size: 13px; color: #736B65; text-align: center; border-top: 1px solid #F0ECE4; padding-top: 20px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Mayura Jewellers</div>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #8C827A;">Personal Jewellery Consultation</p>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>We have received your request for a <strong>${type.toUpperCase()}</strong> consultation.</p>
            <div style="margin: 16px 0;"><span class="status-badge">Status: REQUESTED</span></div>
            <div class="details">
              <p style="margin: 0 0 8px 0; font-weight: bold;">Requested Slot Details:</p>
              <p style="margin: 4px 0;">📅 <strong>Date:</strong> ${dateStr}</p>
              <p style="margin: 4px 0;">⏰ <strong>Time:</strong> ${timeSlot}</p>
            </div>
            <p style="color: #736B65; font-size: 14px;"><em>Please note: This is a request confirmation. Our showroom team will contact you via phone or WhatsApp to confirm your appointment time and send the video link.</em></p>
            <p>If you need to change your requested time, please reply to this email or reach us on WhatsApp (+91 91675 89002).</p>
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
Dear ${consultation.name},

We have received your request for a ${consultation.consultationType || 'video'} consultation.

STATUS: REQUESTED

Requested Slot Details:
- Date: ${dateStr}
- Time: ${consultation.preferredTime}

Please note: This is a request confirmation. Our showroom team will contact you via phone or WhatsApp to confirm your appointment time and send the video link.

Warm regards,
Mayura Jewellers Team
Thakur Village, Kandivali East, Mumbai 400101
  `.trim()

  return { subject: subjectLine, html, text }
}
