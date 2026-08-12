/**
 * Original line-art outlines of the classic diamond cuts, drawn in-house so
 * the site never leans on third-party or competitor imagery. Each icon is a
 * 64×64 stroke drawing that inherits `currentColor`.
 */

const base = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.1,
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

export function EmeraldCut(props) {
  return (
    <svg {...base} {...props}>
      <rect x="14" y="8" width="36" height="48" />
      <rect x="19" y="14" width="26" height="36" />
      <rect x="24" y="20" width="16" height="24" />
      <path d="M14 8l5 6M50 8l-5 6M14 56l5-6M50 56l-5-6" />
    </svg>
  )
}

export function OvalCut(props) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="32" cy="32" rx="16" ry="24" />
      <path d="M32 8v48M16 32h32M20.5 17.5L43.5 46.5M43.5 17.5L20.5 46.5" />
    </svg>
  )
}

export function CushionCut(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 10h24q10 0 10 10v24q0 10-10 10H20q-10 0-10-10V20q0-10 10-10Z" />
      <path d="M25 18h14q8 0 8 8v12q0 8-8 8H25q-8 0-8-8V26q0-8 8-8Z" transform="translate(0 0)" />
      <path d="M10 20l7 6M54 20l-7 6M10 44l7-6M54 44l-7-6M32 10v8M32 46v8" />
    </svg>
  )
}

export function RoundCut(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="32" cy="32" r="23" />
      <circle cx="32" cy="32" r="11" />
      <path d="M32 9v12M32 43v12M9 32h12M43 32h12M15.7 15.7l8 8M48.3 15.7l-8 8M15.7 48.3l8-8M48.3 48.3l-8-8" />
    </svg>
  )
}

export function PrincessCut(props) {
  return (
    <svg {...base} {...props}>
      <rect x="11" y="11" width="42" height="42" />
      <path d="M11 11l42 42M53 11L11 53M32 11v42M11 32h42" />
    </svg>
  )
}

export function PearCut(props) {
  return (
    <svg {...base} {...props}>
      <path d="M32 7C38 18 48 26 48 38a16 16 0 0 1-32 0C16 26 26 18 32 7Z" />
      <path d="M32 7v47M22 30l20 16M42 30L22 46" />
    </svg>
  )
}

export function MarquiseCut(props) {
  return (
    <svg {...base} {...props}>
      <path d="M32 6C42 16 44 24 44 32s-2 16-12 26C22 48 20 40 20 32s2-16 12-26Z" />
      <path d="M32 6v52M23 20l18 24M41 20L23 44" />
    </svg>
  )
}

export function HeartCut(props) {
  return (
    <svg {...base} {...props}>
      <path d="M32 55C18 42 11 34 11 24a11 11 0 0 1 21-4 11 11 0 0 1 21 4c0 10-7 18-21 31Z" />
      <path d="M32 20v35M20 33l12 10M44 33L32 43" />
    </svg>
  )
}

export const DIAMOND_CUT_ICONS = {
  emerald: EmeraldCut,
  oval: OvalCut,
  cushion: CushionCut,
  round: RoundCut,
  princess: PrincessCut,
  pear: PearCut,
  marquise: MarquiseCut,
  heart: HeartCut,
}

export default DIAMOND_CUT_ICONS
