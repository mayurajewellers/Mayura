import { Instagram } from 'lucide-react'
import { INSTAGRAM_TILES } from '@data/gallery'
import { SOCIAL_LINKS } from '@constants/site'
import SectionHeading from '@components/common/SectionHeading'
import SmartImage from '@components/common/SmartImage'
import { Stagger, StaggerItem } from '@components/motion/Stagger'

export default function InstagramGallery() {
  const instagram = SOCIAL_LINKS.find((s) => s.icon === 'instagram')

  return (
    <section className="mj-section-sm bg-ivory pb-section" aria-labelledby="instagram">
      <div className="mj-container">
        <SectionHeading
          id="instagram"
          eyebrow="@mayurajewellers"
          title="From the counter this week"
          lede="New arrivals, finished commissions and the occasional photograph of the workshop floor."
          align="center"
          className="mb-12 lg:mb-16"
        />
      </div>

      <Stagger
        className="grid grid-cols-2 gap-1.5 px-1.5 sm:grid-cols-4 sm:gap-2 sm:px-2 lg:grid-cols-8"
        stagger={0.05}
      >
        {INSTAGRAM_TILES.map((tile) => (
          <StaggerItem key={tile.src} distance={16}>
            <a
              href={instagram?.href ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group/ig relative block overflow-hidden bg-champagne-100"
              aria-label={`${tile.alt} — view on Instagram`}
            >
              <SmartImage
                src={tile.src}
                alt={tile.alt}
                ratio="aspect-square"
                rounded="rounded-none"
                imgClassName="transition-transform duration-1200 ease-luxe group-hover/ig:scale-110"
              />
              <span
                className="absolute inset-0 flex items-center justify-center bg-espresso/0 opacity-0 transition-all duration-500 ease-luxe group-hover/ig:bg-espresso/45 group-hover/ig:opacity-100"
                aria-hidden="true"
              >
                <Instagram className="h-5 w-5 text-ivory" strokeWidth={1.3} />
              </span>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
