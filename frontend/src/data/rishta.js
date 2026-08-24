/**
 * Rishta Plan — Mayura's 11 + 1 jewellery savings scheme.
 *
 * Figures follow the client's approved 11+1 calculator reference:
 *   pay a fixed amount monthly for 11 months → Mayura adds one instalment
 *   as bonus → buy jewellery worth 12 instalments.
 *
 * TERMS below restate the client's reference card. TODO(client): confirm
 * the final legal wording before enrolment goes live online.
 */

export const RISHTA = {
  name: 'Rishta Plan',
  months: 11,
  bonusMultiple: 1, // bonus = one monthly instalment
  minMonthly: 1000,
  maxMonthly: 200000,
  presets: [2000, 5000, 10000, 20000],
}

export const RISHTA_EXAMPLES = [
  { monthly: 2000, collected: 22000, bonus: 2000, value: 24000 },
  { monthly: 5000, collected: 55000, bonus: 5000, value: 60000 },
  { monthly: 20000, collected: 220000, bonus: 20000, value: 240000 },
]

export const RISHTA_TERMS = [
  'The scheme is valid on gold, diamond and platinum jewellery.',
  'If the scheme is closed before the maturity month, no benefit or bonus is added.',
  'The scheme card cannot be transferred to another name.',
  'The monthly amount is set at enrolment and cannot be changed.',
  'No two offers can be clubbed in one purchase bill.',
]

export const calculateRishta = (monthly) => {
  const m = Math.max(0, Math.round(Number(monthly) || 0))
  const collected = m * RISHTA.months
  const bonus = m * RISHTA.bonusMultiple
  return { monthly: m, collected, bonus, value: collected + bonus }
}
