/**
 * Bespoke thin-line jewellery icons.
 *
 * Lucide covers the interface furniture, but there is no line set for
 * jhumkas, harams or kadas — so the category rail uses these instead.
 * All are drawn on a 24×24 grid with a 1.1 stroke to sit beside Lucide.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.1,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

const Svg = ({ children, className, ...rest }) => (
  <svg {...base} className={className} {...rest}>
    {children}
  </svg>
)

/** Peacock plume — the house mark, used for "All Jewellery". */
export const PlumeIcon = (props) => (
  <Svg {...props}>
    <path d="M12 21c0-4.6-2.1-7.1-2.1-10.6 0-2.8 2.1-4.6 2.1-4.6s2.1 1.8 2.1 4.6C14.1 13.9 12 16.4 12 21Z" />
    <path d="M8.1 19.4c-1.6-3.4-4.3-4.2-5.8-6.9-1.2-2.1-.4-4.5-.4-4.5s2.5.4 3.9 2.6c1.9 2.6 1.6 5.5 2.3 8.8Z" />
    <path d="M15.9 19.4c1.6-3.4 4.3-4.2 5.8-6.9 1.2-2.1.4-4.5.4-4.5s-2.5.4-3.9 2.6c-1.9 2.6-1.6 5.5-2.3 8.8Z" />
    <circle cx="12" cy="3.6" r="1.5" />
  </Svg>
)

/** Stacked bullion bars. */
export const GoldBarsIcon = (props) => (
  <Svg {...props}>
    <path d="M9.4 6.5h5.2l1.5 3.4H7.9l1.5-3.4Z" />
    <path d="M4.6 13.1h5.2l1.5 3.4H3.1l1.5-3.4Z" />
    <path d="M14.2 13.1h5.2l1.5 3.4h-8.2l1.5-3.4Z" />
    <path d="M2.4 19.9h19.2" />
  </Svg>
)

/** Round-brilliant diamond. */
export const DiamondIcon = (props) => (
  <Svg {...props}>
    <path d="M4.5 9.4h15L12 20.2 4.5 9.4Z" />
    <path d="M7.8 3.8h8.4l3.3 5.6H4.5l3.3-5.6Z" />
    <path d="M7.8 3.8 9.6 9.4 12 20.2 14.4 9.4l1.8-5.6" />
    <path d="M9.6 9.4h4.8" />
  </Svg>
)

/** Pair of jhumkas. */
export const EarringsIcon = (props) => (
  <Svg {...props}>
    <path d="M7 3.2v2.6" />
    <circle cx="7" cy="7.1" r="1.4" />
    <path d="M4 15.2c0-1.9 1.3-4.5 3-4.5s3 2.6 3 4.5H4Z" />
    <path d="M4.6 17.6h4.8M5.4 20h3.2" />
    <path d="M17 3.2v2.6" />
    <circle cx="17" cy="7.1" r="1.4" />
    <path d="M14 15.2c0-1.9 1.3-4.5 3-4.5s3 2.6 3 4.5h-6Z" />
    <path d="M14.6 17.6h4.8M15.4 20h3.2" />
  </Svg>
)

/** Solitaire ring. */
export const RingIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="14.8" r="6.2" />
    <path d="m9.6 7.6 2.4-3 2.4 3" />
    <path d="M9.6 7.6h4.8l-2.4 2.6-2.4-2.6Z" />
  </Svg>
)

/** Fine chain — daily wear. */
export const ChainIcon = (props) => (
  <Svg {...props}>
    <path d="M3.4 4.4c0 6.6 3.9 12 8.6 12s8.6-5.4 8.6-12" />
    <circle cx="12" cy="19.2" r="2.4" />
    <path d="M12 16.4v.4" />
    <circle cx="7.2" cy="10.6" r=".9" />
    <circle cx="16.8" cy="10.6" r=".9" />
  </Svg>
)

/** Emerald-cut gemstone. */
export const GemstoneIcon = (props) => (
  <Svg {...props}>
    <path d="M7.4 4.4h9.2l3 4.6-7.6 10.6L4.4 9 7.4 4.4Z" />
    <path d="M4.4 9h15.2" />
    <path d="M9.4 9 12 19.6 14.6 9l-1.4-4.6h-2.4L9.4 9Z" />
  </Svg>
)

/** Two interlocking bands — wedding. */
export const WeddingRingsIcon = (props) => (
  <Svg {...props}>
    <circle cx="8.6" cy="14.4" r="5.4" />
    <circle cx="15.4" cy="14.4" r="5.4" />
    <path d="m13.4 5.2 1.9-2.4 1.9 2.4" />
    <path d="M13.4 5.2h3.8l-1.9 2.2-1.9-2.2Z" />
  </Svg>
)

/** Bangle / kada. */
export const BangleIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.4" />
    <circle cx="12" cy="12" r="5.4" />
    <path d="M12 3.6v3M12 17.4v3M3.6 12h3M17.4 12h3" />
  </Svg>
)

/** Necklace with a pendant — harams. */
export const NecklaceIcon = (props) => (
  <Svg {...props}>
    <path d="M4 3.6c0 5.9 3.6 10.4 8 10.4s8-4.5 8-10.4" />
    <path d="M12 14v1.8" />
    <path d="m10.2 15.8h3.6l1 2.4-2.8 3.2-2.8-3.2 1-2.4Z" />
  </Svg>
)

/** Gift box. */
export const GiftBoxIcon = (props) => (
  <Svg {...props}>
    <path d="M3.6 10.4h16.8v9.2a1 1 0 0 1-1 1H4.6a1 1 0 0 1-1-1v-9.2Z" />
    <path d="M2.8 7h18.4v3.4H2.8V7Z" />
    <path d="M12 7v13.6" />
    <path d="M12 7S10.6 3.2 8.4 3.2 6 6.2 8.4 7H12Z" />
    <path d="M12 7s1.4-3.8 3.6-3.8S18 6.2 15.6 7H12Z" />
  </Svg>
)

/** Overflow menu. */
export const MoreIcon = (props) => (
  <Svg {...props}>
    <circle cx="5" cy="12" r="1.4" />
    <circle cx="12" cy="12" r="1.4" />
    <circle cx="19" cy="12" r="1.4" />
  </Svg>
)

export const JEWEL_ICONS = {
  plume: PlumeIcon,
  gold: GoldBarsIcon,
  diamond: DiamondIcon,
  earrings: EarringsIcon,
  ring: RingIcon,
  chain: ChainIcon,
  gemstone: GemstoneIcon,
  wedding: WeddingRingsIcon,
  bangle: BangleIcon,
  necklace: NecklaceIcon,
  gift: GiftBoxIcon,
  more: MoreIcon,
}
