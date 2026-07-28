import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Expand } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { GALLERY_GROUPS, GALLERY_ITEMS } from '@data/gallery'
import { useDocumentTitle } from '@hooks/index'
import { EASE_LUXE } from '@constants/motion'
import PageHero from '@components/layout/PageHero'
import SmartImage from '@components/common/SmartImage'
import Modal from '@components/common/Modal'
import cn from '@utils/cn'

const SPANS = {
  tall: 'sm:row-span-2',
  wide: 'sm:col-span-2',
  normal: '',
}

const RATIOS = {
  tall: 'aspect-[3/4]',
  wide: 'aspect-[16/10]',
  normal: 'aspect-square',
}

export default function GalleryPage() {
  useDocumentTitle('Gallery')
  const [group, setGroup] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  const items = useMemo(
    () => (group === 'All' ? GALLERY_ITEMS : GALLERY_ITEMS.filter((item) => item.group === group)),
    [group],
  )

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="The work, the room, the people"
        lede="Finished commissions, pieces on the counter, and the occasional photograph from the bench. Everything here was made or sold at Thakur Village."
        image="/images/editorial/bridal-couple.jpg"
        height="md"
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Gallery' }]}
      />

      <section className="mj-section bg-ivory">
        <div className="mj-container-wide">
          <nav aria-label="Gallery filters" className="mb-12 lg:mb-16">
            <ul className="flex flex-wrap justify-center gap-2.5">
              {GALLERY_GROUPS.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => setGroup(name)}
                    aria-pressed={group === name}
                    className={cn(
                      'rounded-full border px-6 py-2.5 font-sans text-eyebrow uppercase tracking-luxe transition-all duration-400 ease-luxe',
                      group === name
                        ? 'border-charcoal bg-charcoal text-ivory'
                        : 'border-charcoal/12 text-charcoal-200 hover:border-gold hover:bg-gold/[0.07] hover:text-bronze',
                    )}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* masonry-style grid using span hints from the data */}
          <div className="grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {items.map((item, index) => (
              <motion.figure
                key={item.src}
                layout
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: (index % 8) * 0.05, ease: EASE_LUXE }}
                className={cn('group/fig relative', SPANS[item.span] ?? '')}
              >
                <button
                  type="button"
                  onClick={() => setLightbox(item)}
                  className="block w-full text-left"
                  aria-label={`View larger — ${item.alt}`}
                >
                  <SmartImage
                    src={item.src}
                    alt={item.alt}
                    ratio={RATIOS[item.span] ?? 'aspect-square'}
                    imgClassName="transition-transform duration-1200 ease-luxe group-hover/fig:scale-[1.05]"
                  />
                  <span
                    className="pointer-events-none absolute inset-0 rounded-card bg-scrim-card opacity-0 transition-opacity duration-500 group-hover/fig:opacity-100"
                    aria-hidden="true"
                  />
                  <span
                    className="pointer-events-none absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-charcoal opacity-0 backdrop-blur transition-opacity duration-500 group-hover/fig:opacity-100"
                    aria-hidden="true"
                  >
                    <Expand className="h-4 w-4" strokeWidth={1.4} />
                  </span>
                  <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition-all duration-500 ease-luxe group-hover/fig:translate-y-0 group-hover/fig:opacity-100">
                    <span className="mj-eyebrow-light block">{item.group}</span>
                    <span className="mt-1.5 block font-display text-body text-ivory">
                      {item.caption}
                    </span>
                  </figcaption>
                </button>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <Modal
        open={Boolean(lightbox)}
        onClose={() => setLightbox(null)}
        label={lightbox?.alt ?? 'Image'}
        size="max-w-5xl"
        className="bg-espresso"
      >
        {lightbox && (
          <div className="p-4 sm:p-8">
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="mx-auto max-h-[76vh] w-auto rounded-luxe object-contain"
            />
            <div className="mt-6 text-center">
              <p className="mj-eyebrow-light mb-2">{lightbox.group}</p>
              <p className="font-display text-[1.25rem] text-ivory">{lightbox.caption}</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
