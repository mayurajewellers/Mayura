/**
 * Development & Testing Provider (Console Mode)
 * Safe mock adapter that logs email metadata without making external HTTP/SMTP requests or exposing secrets.
 */
export const createConsoleProvider = () => {
  return {
    name: 'console',
    async sendEmail(options) {
      const { to, subject, html, text, replyTo, templateName } = options

      console.log(`[EMAIL_SENT] [ConsoleProvider] Template: '${templateName || 'custom'}' | To: ${to} | Subject: '${subject}' | Reply-To: ${replyTo || 'default'}`)

      return {
        success: true,
        provider: 'console',
        messageId: `console-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      }
    },
  }
}

export default createConsoleProvider
