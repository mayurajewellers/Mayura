import escapeHtml from '../utils/escapeHtml.js'

export const consultationCancelledTemplate = (consultation) => {
  const name = escapeHtml(consultation.name)
  const dateStr = consultation.preferredDate
    ? new Date(consultation.preferredDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Scheduled Date'
  const timeSlot = escapeHtml(consultation.preferredTime)

  const subjectLine = 'Consultation cancelled — Mayura Jewellers'

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
          .status-badge { display: inline-block; background: #FCE8E6; color: #C5221F; border: 1px solid #FAD2CF; padding: 6px 12px; font-size: 13px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
          .details { background: #FAF8F5; border: 1px solid #E8E2D9; padding: 16px; margin: 16px 0; border-radius: 6px; }
          .footer { font-size: 13px; color: #736B65; text-align: center; border-top: 1px solid #F0ECE4; padding-top: 20px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Mayura Jewellers</div>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #8C827A;">Consultation Status Update</p>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Your consultation booking request has been cancelled.</p>
            <div style="margin: 16px 0;"><span class="status-badge">Status: CANCELLED</span></div>
            <div class="details">
              <p style="margin: 0 0 8px 0; font-weight: bold;">Cancelled Appointment Slot:</p>
              <p style="margin: 4px 0;">📅 <strong>Date:</strong> ${dateStr}</p>
              <p style="margin: 4px 0;">⏰ <strong>Time:</strong> ${timeSlot}</p>
            </div>
            <p>If you would like to reschedule for a different date or time, please submit a new request on our website or contact us on WhatsApp at +91 91675 89002.</p>
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

Your consultation booking request has been cancelled.

STATUS: CANCELLED

Cancelled Appointment Slot:
- Date: ${dateStr}
- Time: ${consultation.preferredTime}

If you would like to reschedule for a different date or time, please submit a new request on our website or contact us on WhatsApp at +91 91675 89002.

Warm regards,
Mayura Jewellers Team
Thakur Village, Kandivali East, Mumbai 400101
  `.trim()

  return { subject: subjectLine, html, text }
}
