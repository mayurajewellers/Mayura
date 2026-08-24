/**
 * Production Resend Provider Adapter
 */
export const createResendProvider = (apiKey, fromAddress) => {
  return {
    name: 'resend',
    async sendEmail(options) {
      const { to, subject, html, text, replyTo } = options

      if (!apiKey) {
        throw new Error('Resend API key is missing from environment configuration.')
      }

      const payload = {
        from: fromAddress || 'Mayura Jewellers <orders@mayurajewellers.com>',
        to: [to],
        subject,
        html,
        text,
      }

      if (replyTo) {
        payload.reply_to = replyTo
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Resend API error (${response.status})`)
      }

      console.log(`[EMAIL_SENT] [ResendProvider] To: ${to} | Subject: '${subject}' | ID: ${data.id}`)

      return {
        success: true,
        provider: 'resend',
        messageId: data.id,
      }
    },
  }
}

export default createResendProvider
