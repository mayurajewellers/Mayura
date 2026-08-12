import { Link } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import { DIAMOND_CUTS } from '@data/homepage'
import { DIAMOND_CUT_ICONS } from '@components/common/DiamondCutIcons'
import SectionHeading from '@components/common/SectionHeading'
import { Stagger, StaggerItem } from '@components/motion/Stagger'

/**
 * Explore Our Diamond Cuts — the last editorial section before the footer.
 * Eight classic cuts as original line drawings; each links into search so
 * the customer lands on real pieces, not a dead end.
 */
export default function DiamondCuts() {
  return (
    <section className="border-t border-charcoal/[0.07] bg-ivory-100" aria-labelledby="diamond-cuts">
      <div className="mj-container py-section-sm">
        <SectionHeading
          id="diamond-cuts"
          eyebrow="Where geometry elevates style"
          title="Explore Our Diamond Cuts"
          align="center"
          size="md"
          flourish
          className="mb-12 lg:mb-16"
        />

        <Stagger
          className="mj-hide-scrollbar-x -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-y-10 sm:px-0 lg:grid-cols-8"
          stagger={0.05}
        >
          {DIAMOND_CUTS.map((cut) => {
            const Icon = DIAMOND_CUT_ICONS[cut.key]
            return (
              <StaggerItem key={cut.key} className="shrink-0">
                <Link
                  to={`${ROUTES.collection('diamond-jewellery')}`}
                  className="group/cut flex w-24 flex-col items-center gap-3.5 rounded-luxe px-2 py-3 transition-colors duration-300 sm:w-auto"
                  aria-label={`${cut.name} cut diamond jewellery`}
                >
                  <span className="text-charcoal-100 transition-all duration-500 ease-luxe group-hover/cut:-translate-y-1 group-hover/cut:text-bronze">
                    {Icon && <Icon className="h-14 w-14" />}
                  </span>
                  <span className="font-sans text-eyebrow uppercase tracking-luxe text-charcoal-200 transition-colors duration-300 group-hover/cut:text-bronze">
                    {cut.name}
                  </span>
                </Link>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
