import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Expand, ZoomIn } from 'lucide-react'
import { EASE_LUXE } from '@constants/motion'
import Modal from '@components/common/Modal'
import SmartImage from '@components/common/SmartImage'
import cn from '@utils/cn'

/**
 * Product gallery with thumbnails, cursor-tracked magnifier on desktop and a
 * full-screen lightbox. The magnifier uses background-position rather than a
 * transform so the zoom stays sharp at 220%.
 */
export default function ProductGallery({ images = [], name, badge }) {
  const [active, setActive] = useState(0)
  const [zooming, setZooming] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [lightbox, setLightbox] = useState(false)
  const frame = useRef(null)

  const onMove = (event) => {
    const rect = frame.current?.getBoundingClientRect()
    if (!rect) return
    setOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    })
  }

  const src = images[active]

  return (
    <div className="lg:flex lg:gap-5">
      {/* --------------------------------------------------- thumbnails */}
      {images.length > 1 && (
        <div className="order-1 mt-4 flex gap-3 lg:mt-0 lg:w-20 lg:flex-col">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={index === active}
              className={cn(
                'group/thumb w-20 shrink-0 overflow-hidden rounded-luxe border transition-all duration-400 ease-luxe lg:w-full',
                index === active
                  ? 'border-gold'
                  : 'border-charcoal/8 opacity-65 hover:opacity-100',
              )}
            >
              <SmartImage src={image} alt="" ratio="aspect-square" rounded="rounded-none" />
            </button>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------ main frame */}
      <div className="order-2 flex-1">
        <div
          ref={frame}
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={onMove}
          className="group/frame relative aspect-editorial overflow-hidden rounded-card bg-champagne-50"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={src}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE_LUXE }}
            >
              <img
                src={src}
                alt={`${name} — view ${active + 1}`}
                className="h-full w-full object-cover"
                loading={active === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </motion.div>
          </AnimatePresence>

          {/* desktop magnifier */}
          <div
            className={cn(
              'pointer-events-none absolute inset-0 hidden bg-champagne-50 bg-no-repeat transition-opacity duration-300 lg:block',
              zooming ? 'opacity-100' : 'opacity-0',
            )}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: '220%',
              backgroundPosition: `${origin.x}% ${origin.y}%`,
            }}
            aria-hidden="true"
          />

          {badge && (
            <span className="mj-badge-gold pointer-events-none absolute left-4 top-4">{badge}</span>
          )}

          <span
            className="pointer-events-none absolute bottom-4 left-4 hidden items-center gap-2 rounded-full bg-ivory/90 px-3.5 py-2 font-sans text-eyebrow uppercase tracking-luxe text-charcoal-100 opacity-0 backdrop-blur transition-opacity duration-400 group-hover/frame:opacity-100 lg:flex"
            aria-hidden="true"
          >
            <ZoomIn className="h-3 w-3" strokeWidth={1.5} />
            Hover to zoom
          </span>

          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Open full-screen view"
            className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/8 bg-ivory/90 text-charcoal-100 backdrop-blur transition-all duration-400 ease-luxe hover:bg-charcoal hover:text-ivory"
          >
            <Expand className="h-4 w-4" strokeWidth={1.4} />
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------- lightbox */}
      <Modal
        open={lightbox}
        onClose={() => setLightbox(false)}
        label={`${name} — full screen`}
        size="max-w-5xl"
        className="bg-espresso"
      >
        <div className="p-4 sm:p-8">
          <img
            src={src}
            alt={`${name} — full screen`}
            className="mx-auto max-h-[78vh] w-auto rounded-luxe object-contain"
          />
          {images.length > 1 && (
            <div className="mt-5 flex justify-center gap-3">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`View image ${index + 1}`}
                  className={cn(
                    'h-1.5 w-8 rounded-full transition-colors duration-400',
                    index === active ? 'bg-gold' : 'bg-ivory/25 hover:bg-ivory/45',
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
