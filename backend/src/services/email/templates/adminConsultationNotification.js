import escapeHtml from '../utils/escapeHtml.js'

export const adminConsultationNotificationTemplate = (consultation) => {
  const name = escapeHtml(consultation.name)
  const email = escapeHtml(consultation.email || 'N/A')
  const phone = escapeHtml(consultation.phone)
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
  const message = escapeHtml(consultation.message || 'No additional notes')

  let itemsHtml = 'None selected'
  if (Array.isArray(consultation.items) && consultation.items.length > 0) {
    itemsHtml = consultation.items
      .map((item) => {
        if (typeof item === 'string') return `<li>${escapeHtml(item)}</li>`
        if (item && item.title) return `<li>${escapeHtml(item.title)}</li>`
        return `<li>${escapeHtml(JSON.stringify(item))}</li>`
      })
      .join('')
    itemsHtml = `<ul>${itemsHtml}</ul>`
  }

  const subjectLine = `New consultation request — ${type} — ${name}`

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
          td.label { font-weight: bold; color: #736B65; width: 35%; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Mayura Jewellers — Admin Notification</div>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #8C827A;">New Consultation Request</p>
          </div>
          <div class="content">
            <table>
              <tr><td class="label">Customer Name:</td><td>${name}</td></tr>
              <tr><td class="label">Phone / WhatsApp:</td><td><a href="tel:${phone}">${phone}</a></td></tr>
              <tr><td class="label">Email Address:</td><td>${email !== 'N/A' ? `<a href="mailto:${email}">${email}</a>` : 'N/A'}</td></tr>
              <tr><td class="label">Type:</td><td>${type.toUpperCase()}</td></tr>
              <tr><td class="label">Requested Date:</td><td>${dateStr}</td></tr>
              <tr><td class="label">Requested Time:</td><td>${timeSlot}</td></tr>
            </table>
            <p style="font-weight: bold; color: #574F48; margin-bottom: 4px;">Selected Designs to View:</p>
            ${itemsHtml}
            <p style="font-weight: bold; color: #574F48; margin-top: 16px; margin-bottom: 4px;">Customer Notes:</p>
            <p style="background: #FAF8F5; padding: 12px; border: 1px solid #E8E2D9; border-radius: 4px;">${message}</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
New consultation request on Mayura Jewellers.

Customer Name: ${consultation.name}
Phone / WhatsApp: ${consultation.phone}
Email Address: ${consultation.email || 'N/A'}
Type: ${(consultation.consultationType || 'video').toUpperCase()}
Requested Date: ${dateStr}
Requested Time: ${consultation.preferredTime}

Selected Designs:
${Array.isArray(consultation.items) ? consultation.items.map((i) => typeof i === 'string' ? i : i.title).join(', ') : 'None'}

Customer Notes:
${consultation.message || 'No additional notes'}
  `.trim()

  return { subject: subjectLine, html, text }
}
