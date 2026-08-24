import dotenv from 'dotenv'
import createConsoleProvider from './providers/consoleProvider.js'
import createResendProvider from './providers/resendProvider.js'

import { enquiryConfirmationTemplate } from './templates/enquiryConfirmation.js'
import { adminEnquiryNotificationTemplate } from './templates/adminEnquiryNotification.js'
import { consultationRequestedTemplate } from './templates/consultationRequested.js'
import { adminConsultationNotificationTemplate } from './templates/adminConsultationNotification.js'
import { consultationConfirmedTemplate } from './templates/consultationConfirmed.js'
import { consultationCancelledTemplate } from './templates/consultationCancelled.js'
import { newsletterWelcomeTemplate } from './templates/newsletterWelcome.js'

dotenv.config()

/**
 * Instantiate provider based on process.env.EMAIL_PROVIDER
 * console -> development/testing (default)
 * resend -> production
 */
const getProvider = () => {
  const providerType = (process.env.EMAIL_PROVIDER || 'console').toLowerCase().trim()
  const fromName = process.env.EMAIL_FROM_NAME || 'Mayura Jewellers'
  const fromAddress = process.env.EMAIL_FROM || 'info@mayurajewellers.com'
  const fullFrom = `${fromName} <${fromAddress}>`

  switch (providerType) {
    case 'resend':
      return createResendProvider(process.env.RESEND_API_KEY, fullFrom)
    case 'console':
    default:
      return createConsoleProvider()
  }
}

let activeProvider = getProvider()

export const setEmailProvider = (customProvider) => {
  activeProvider = customProvider
}

export const getAdminRecipientEmail = () => {
  return process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'info@mayurajewellers.com'
}

/**
 * Base email dispatcher — Fail-safe side-effect wrapper
 */
export const dispatchEmail = async ({ to, templateName, templateData, replyTo }) => {
  if (!to || !to.trim()) {
    console.log(`[EMAIL_SKIPPED] Recipient email is empty for template '${templateName}'.`)
    return { success: false, reason: 'Empty recipient email' }
  }

  try {
    const { subject, html, text } = templateData
    const result = await activeProvider.sendEmail({
      to: to.trim().toLowerCase(),
      subject,
      html,
      text,
      replyTo: replyTo ? replyTo.trim().toLowerCase() : undefined,
      templateName,
    })
    return result
  } catch (error) {
    // Safe logging without exposing secrets
    console.error(
      `[EMAIL_FAILED] Provider: '${activeProvider.name}' | Template: '${templateName}' | To: ${to} | Error: ${error.message}`,
    )
    return { success: false, error: error.message }
  }
}

/**
 * Send Customer & Admin emails when an enquiry is created
 */
export const sendEnquiryEmails = async (enquiry) => {
  const adminEmail = getAdminRecipientEmail()

  // 1. Customer confirmation
  const customerPromise = dispatchEmail({
    to: enquiry.email,
    templateName: 'enquiryConfirmation',
    templateData: enquiryConfirmationTemplate(enquiry),
  })

  // 2. Admin notification with replyTo set to customer email (FROM remains verified Mayura sender)
  const adminPromise = dispatchEmail({
    to: adminEmail,
    templateName: 'adminEnquiryNotification',
    templateData: adminEnquiryNotificationTemplate(enquiry),
    replyTo: enquiry.email,
  })

  return Promise.all([customerPromise, adminPromise])
}

/**
 * Send Customer & Admin emails when a consultation is requested
 */
export const sendConsultationRequestedEmails = async (consultation) => {
  const adminEmail = getAdminRecipientEmail()

  // 1. Customer confirmation (if email provided)
  let customerPromise = Promise.resolve(null)
  if (consultation.email && consultation.email.trim()) {
    customerPromise = dispatchEmail({
      to: consultation.email,
      templateName: 'consultationRequested',
      templateData: consultationRequestedTemplate(consultation),
    })
  }

  // 2. Admin notification with replyTo set to customer email (if available)
  const adminPromise = dispatchEmail({
    to: adminEmail,
    templateName: 'adminConsultationNotification',
    templateData: adminConsultationNotificationTemplate(consultation),
    replyTo: consultation.email || undefined,
  })

  return Promise.all([customerPromise, adminPromise])
}

/**
 * Send consultation confirmed email
 */
export const sendConsultationConfirmedEmail = async (consultation) => {
  if (!consultation.email || !consultation.email.trim()) return null
  return dispatchEmail({
    to: consultation.email,
    templateName: 'consultationConfirmed',
    templateData: consultationConfirmedTemplate(consultation),
  })
}

/**
 * Send consultation cancelled email
 */
export const sendConsultationCancelledEmail = async (consultation) => {
  if (!consultation.email || !consultation.email.trim()) return null
  return dispatchEmail({
    to: consultation.email,
    templateName: 'consultationCancelled',
    templateData: consultationCancelledTemplate(consultation),
  })
}

/**
 * Send welcome email when a customer subscribes to Mayura Insiders newsletter
 */
export const sendNewsletterWelcomeEmail = async (subscriber) => {
  return dispatchEmail({
    to: subscriber.email,
    templateName: 'newsletterWelcome',
    templateData: newsletterWelcomeTemplate(subscriber),
  })
}

export default {
  dispatchEmail,
  sendEnquiryEmails,
  sendConsultationRequestedEmails,
  sendConsultationConfirmedEmail,
  sendConsultationCancelledEmail,
  sendNewsletterWelcomeEmail,
  setEmailProvider,
}

