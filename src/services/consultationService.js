import { STORAGE_KEYS } from '@constants/routes'

/**
 * consultationService — video-call consultation requests.
 *
 * NO backend / calendar integration exists yet. Requests are validated on
 * the client and stored locally so the flow can be demonstrated end-to-end;
 * the confirmation screen states plainly that the request was recorded on
 * this device and that the store confirms the slot over phone/WhatsApp.
 *
 * FUTURE API INTEGRATION POINT: replace `submit` with
 * `POST /api/consultations` and source `availableSlots` from real
 * availability instead of the static business-hours grid below.
 */

export const CONSULTATION_SLOTS = [
  '11:30 am', '12:30 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm',
]

const MAX_ITEMS = 5

const read = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.consultations)) ?? []
  } catch {
    return []
  }
}

export const consultationService = {
  maxItems: MAX_ITEMS,

  /** Next 14 days, excluding nothing — the store is open every day. */
  availableDates(from = new Date()) {
    const dates = []
    for (let i = 1; i <= 14; i += 1) {
      const d = new Date(from)
      d.setDate(d.getDate() + i)
      dates.push(d)
    }
    return dates
  },

  validate({ items, name, phone, date, slot }) {
    const errors = {}
    if (!items?.length) errors.items = 'Choose at least one design to look at together.'
    if (items?.length > MAX_ITEMS) errors.items = `Up to ${MAX_ITEMS} designs per consultation.`
    if (!name?.trim() || name.trim().length < 2) errors.name = 'Please tell us your name.'
    if (!/^[6-9]\d{9}$/.test((phone ?? '').replace(/\D/g, '').slice(-10))) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number.'
    }
    if (!date) errors.date = 'Pick a date that suits you.'
    if (!slot) errors.slot = 'Pick a time slot.'
    return errors
  },

  async submit(request) {
    const errors = this.validate(request)
    if (Object.keys(errors).length) return { ok: false, errors }

    const record = {
      id: `VC-${Date.now().toString(36).toUpperCase()}`,
      ...request,
      submittedAt: new Date().toISOString(),
      status: 'requested', // a real backend would move this to 'confirmed'
    }

    try {
      const all = read()
      all.push(record)
      window.localStorage.setItem(STORAGE_KEYS.consultations, JSON.stringify(all))
    } catch {
      /* storage blocked — still return the record so the UI can confirm */
    }
    return { ok: true, record }
  },
}

export default consultationService
