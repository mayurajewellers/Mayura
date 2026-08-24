import { BellRing } from 'lucide-react'
import { notificationService } from '@/services/notificationService'
import Modal from '@components/common/Modal'
import Button from '@components/common/Button'

/**
 * Mayura-branded pre-permission modal for browser notifications.
 *
 * The browser's native permission prompt cannot be styled or pre-empted —
 * this modal only explains the value, and `Notification.requestPermission()`
 * is called exclusively from the explicit "Allow notifications" button.
 * Whatever the customer chooses is remembered so they are never nagged.
 */
export default function NotificationPrompt({ open, onClose, onResult }) {
  const decline = () => {
    notificationService.markPrompted('dismissed')
    onClose()
    onResult?.('dismissed')
  }

  const allow = async () => {
    const outcome = await notificationService.requestPermission()
    notificationService.markPrompted(outcome)
    onClose()
    onResult?.(outcome)
  }

  return (
    <Modal open={open} onClose={decline} label="Updates and offers" size="max-w-md">
      <div className="mj-grain relative overflow-hidden rounded-t-panel bg-espresso px-8 pb-8 pt-10 text-center sm:rounded-t-panel">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-royal-800/70 text-gold">
          <BellRing className="h-6 w-6" strokeWidth={1.2} aria-hidden="true" />
        </span>
        <h2 className="mj-display mt-6 text-display-xs text-ivory">
          Would you like updates & offers?
        </h2>
        <p className="mx-auto mt-3.5 max-w-xs text-body-sm leading-[1.85] text-ivory/65">
          New collections, gold rate movements and private-viewing invitations — sent as browser
          notifications, only when there is something worth telling you.
        </p>
      </div>

      <div className="space-y-3 p-7">
        <Button variant="gold" fullWidth onClick={allow}>
          Allow notifications
        </Button>
        <Button variant="ghost" fullWidth onClick={decline}>
          Not now
        </Button>
        <p className="pt-1 text-center font-sans text-[0.6875rem] leading-relaxed text-charcoal-50">
          Your browser will ask once to confirm. Notifications can be turned off anytime from
          browser settings.
        </p>
      </div>
    </Modal>
  )
}
