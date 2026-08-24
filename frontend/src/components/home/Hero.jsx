import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { EASE_LUXE, EASE_SILK } from '@constants/motion'
import bannerService from '@services/bannerService'
import cn from '@utils/cn'


const STATIC_SLIDES = [
  {
    id: 'bridal',
    eyebrow: 'The bridal atelier',
    title: 'Made by hand.',
    titleAccent: 'Kept for generations.',
    copy: 'Hallmarked 22K harams, polki chokers and matched suites — eight to fourteen weeks on the bench, fitted three times before they leave.',
    cta: { label: 'Explore Bridal', to: ROUTES.collection('bridal-collection') },
    secondary: { label: 'Book a consultation', to: ROUTES.contact },
    /* Client-supplied hero photography — /public/images/hero */
    image: '/images/hero/mayura-hero-01.jpg',
    imagePosition: '62% 22%',
    panel: 'bg-espresso text-ivory',
    tone: 'light',
  },
  {
    id: 'assurance',
    eyebrow: 'Free at our counter',
    title: 'Gold testing.',
    titleAccent: 'Melting. Valuation.',
    copy: 'Bring in any gold, from anywhere. We will test its purity on the XRF while you watch, melt it or value it — at no charge, whether you bought it here or not.',
    cta: { label: 'See our services', to: `${ROUTES.legacy}#services` },
    secondary: { label: 'Book a home visit', to: ROUTES.contact },
    /* Client-supplied hero photography — /public/images/hero */
    image: '/images/hero/mayura-hero-02.jpg',
    imagePosition: '58% 24%',
    panel: 'bg-champagne text-espresso',
    tone: 'dark',
  },
  {
    id: 'diamond',
    eyebrow: 'IGI & GIA certified',
    title: 'One stone,',
    titleAccent: 'chosen slowly.',
    copy: 'We will put four diamonds on a tray at four price points, hand you a loupe, and explain honestly what separates them before anybody mentions money.',
    cta: { label: 'View Solaire', to: ROUTES.collection('solaire') },
    secondary: { label: 'Diamond guide', to: ROUTES.blogPost('diamond-grades-that-matter') },
    /* Client-supplied hero photography — /public/images/hero */
    image: '/images/editorial/mayura-hero-06.jpg',
    imagePosition: '64% 26%',
    panel: 'bg-ivory-300 text-charcoal',
    tone: 'dark',
  },
  {
    id: 'legacy',
    eyebrow: 'Kandivali East · Since 2004',
    title: 'Three generations.',
    titleAccent: 'One counter.',
    copy: 'The largest jewellery showroom in Kandivali — 1,350 sq ft, seventeen people, and a family that has weighed gold across a counter since before most of them were born.',
    cta: { label: 'Read our legacy', to: ROUTES.legacy },
    secondary: { label: 'Visit the store', to: ROUTES.contact },
    image: '/images/editorial/mayura-hero-04.jpg',
    imagePosition: 'center',
    panel: 'bg-bronze-600 text-ivory',
    tone: 'light',
  },
  {
    id: 'daily',
    eyebrow: 'Under twelve grams',
    title: 'Light enough',
    titleAccent: 'to forget.',
    copy: 'Screwed backs, bezel settings and laser-welded links. Designed to survive a commute, a kitchen and a toddler — and still look like itself in ten years.',
    cta: { label: 'Shop Daily Wear', to: ROUTES.collection('daily-wear') },
    secondary: { label: 'What actually survives', to: ROUTES.blogPost('daily-wear-that-survives') },
    image: '/images/editorial/mayura-hero-05.jpg',
    imagePosition: 'center',
    panel: 'bg-ivory-500 text-charcoal',
    tone: 'dark',
  },
]

/* Display interval per slide. The travel animation itself stays at 900ms —
   only the dwell time was shortened, so nothing flashes. Manual interaction
   still resets this timer (the effect re-arms whenever `index` changes). */
const AUTOPLAY_MS = 4800

export default function Hero() {
  const [slides, setSlides] = useState(STATIC_SLIDES)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()
  const timer = useRef(null)
  const touch = useRef(null)

  useEffect(() => {
    let isSubscribed = true
    bannerService
      .getBanners({ placement: 'homepage-hero' })
      .then((res) => {
        if (!isSubscribed) return
        if (res.success && res.banners && res.banners.length > 0) {
          const apiSlides = res.banners.map((b, i) => ({
            id: b.id || b.slug || `hero-banner-${i}`,
            eyebrow: b.eyebrow || 'Mayura Jewellers',
            title: b.title || 'Fine Jewellery',
            titleAccent: b.titleAccent || b.subtitle || '',
            copy: b.copy || b.description || '',
            cta: b.cta?.label ? { label: b.cta.label, to: b.cta.to || b.link || ROUTES.collection('all') } : { label: 'Explore Collection', to: ROUTES.collection('all') },
            secondary: b.secondary?.label ? { label: b.secondary.label, to: b.secondary.to || ROUTES.contact } : { label: 'Book a consultation', to: ROUTES.contact },
            image: b.desktopImage || b.image || '/images/hero/mayura-hero-01.jpg',
            imagePosition: b.imagePosition || 'center',
            panel: b.panel || (i % 2 === 0 ? 'bg-espresso text-ivory' : 'bg-champagne text-espresso'),
            tone: b.tone || (i % 2 === 0 ? 'light' : 'dark'),
          }))
          setSlides(apiSlides)
        }
      })
      .catch(() => { })

    return () => {
      isSubscribed = false
    }
  }, [])

  const go = useCallback(
    (next) => {
      setIndex(((next % slides.length) + slides.length) % slides.length)
    },
    [slides.length],
  )

  /* Touch swipe — horizontal drags of 48px+ page the carousel; vertical
     movement is left alone so normal page scrolling is never hijacked. */
  const onTouchStart = (event) => {
    const t = event.touches[0]
    touch.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (event) => {
    if (!touch.current) return
    const t = event.changedTouches[0]
    const dx = t.clientX - touch.current.x
    const dy = t.clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      go(index + (dx < 0 ? 1 : -1))
    }
  }

  useEffect(() => {
    if (paused || reduced) return undefined
    timer.current = window.setTimeout(() => go(index + 1), AUTOPLAY_MS)
    return () => window.clearTimeout(timer.current)
  }, [index, paused, reduced, go])

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(index + 1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(index - 1)
    }
  }

  return (
    <section
      aria-label="Featured collections"
      aria-roledescription="carousel"
      className="relative overflow-hidden bg-ivory pb-8 pt-5 lg:pb-10 lg:pt-7"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* The page's single <h1>. Slide headlines are styled paragraphs — a
          rotating banner is not a heading hierarchy. */}
      <h1 className="sr-only">
        Mayura Jewellers — fine gold and diamond jewellery, Kandivali East, Mumbai
      </h1>

      {/* ------------------------------------------------------- the track */}
      <div className="px-[3vw] sm:px-[4vw]">
        <div
          className="flex transition-transform duration-900 ease-luxe"
          style={{ transform: `translateX(-${(index * 100) / slides.length}%)`, width: `${slides.length * 100}%` }}
        >
          {slides.map((slide, slideIndex) => {
            const isActive = slideIndex === index
            return (
              <div
                key={slide.id}
                className="shrink-0 px-1.5 sm:px-2.5"
                style={{ width: `${100 / slides.length}%` }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${slideIndex + 1} of ${slides.length} — ${slide.title} ${slide.titleAccent}`}
                aria-hidden={!isActive}
              >
                <div
                  className={cn(
                    'grid overflow-hidden rounded-panel shadow-card transition-opacity duration-700',
                    'lg:grid-cols-[1.02fr_1fr]',
                    isActive ? 'opacity-100' : 'opacity-45',
                  )}
                >
                  {/* ------------------------------------------- type panel */}
                  <div
                    className={cn(
                      'mj-grain relative order-2 flex flex-col justify-center px-7 py-10 sm:px-12 sm:py-14 lg:order-1 lg:px-16 lg:py-18 xl:px-20',
                      slide.panel,
                    )}
                  >
                    <motion.div
                      key={`${slide.id}-${isActive}`}
                      initial={false}
                      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.9, y: 8 }}
                      transition={{ duration: 0.7, ease: EASE_LUXE }}
                    >
                      <p
                        className={cn(
                          'mb-5 font-sans text-eyebrow font-medium uppercase tracking-luxe',
                          slide.tone === 'light' ? 'text-gold-200' : 'text-bronze',
                        )}
                      >
                        {slide.eyebrow}
                      </p>

                      <p className="mj-display text-[clamp(2rem,4.2vw,3.75rem)]">
                        <span className="block">{slide.title}</span>
                        <span
                          className={cn(
                            'block font-serif italic',
                            slide.tone === 'light' ? 'text-gold-200' : 'text-bronze',
                          )}
                        >
                          {slide.titleAccent}
                        </span>
                      </p>

                      <p
                        className={cn(
                          'mt-6 max-w-md text-body leading-[1.9]',
                          slide.tone === 'light' ? 'text-ivory/70' : 'text-charcoal-200',
                        )}
                      >
                        {slide.copy}
                      </p>

                      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <Link
                          to={slide.cta.to}
                          tabIndex={isActive ? 0 : -1}
                          className="group/cta mj-btn-gold mj-btn-sheen"
                        >
                          <span className="relative z-10">{slide.cta.label}</span>
                          <ArrowRight
                            className="relative z-10 h-4 w-4 transition-transform duration-500 ease-luxe group-hover/cta:translate-x-1"
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                        </Link>
                        <Link
                          to={slide.secondary.to}
                          tabIndex={isActive ? 0 : -1}
                          className={cn(
                            'mj-link font-sans text-label uppercase tracking-wider2',
                            slide.tone === 'light' ? '!text-ivory/75 hover:!text-ivory' : 'text-charcoal',
                          )}
                        >
                          {slide.secondary.label}
                        </Link>
                      </div>
                    </motion.div>
                  </div>

                  {/* -------------------------------------------- the image */}
                  <div className="relative order-1 min-h-[15rem] overflow-hidden bg-champagne-100 sm:min-h-[19rem] lg:order-2 lg:min-h-[32rem]">
                    <motion.img
                      src={slide.image}
                      alt={`${slide.title} ${slide.titleAccent}`}
                      loading={slideIndex === 0 ? 'eager' : 'lazy'}
                      fetchpriority={slideIndex === 0 ? 'high' : undefined}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ objectPosition: slide.imagePosition }}
                      animate={isActive && !reduced ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ duration: 9, ease: EASE_SILK }}
                    />
                    <span
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/25 to-transparent lg:bg-gradient-to-r lg:from-espresso/20 lg:to-transparent"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------- controls */}
      <div className="mj-container-wide mt-6 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/12 text-charcoal-100 transition-all duration-400 ease-luxe hover:border-gold hover:bg-charcoal hover:text-ivory"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.4} />
        </button>

        <ul className="flex items-center gap-2.5">
          {slides.map((slide, slideIndex) => (
            <li key={slide.id}>
              <button
                type="button"
                onClick={() => go(slideIndex)}
                aria-label={`Go to slide ${slideIndex + 1}`}
                aria-current={slideIndex === index}
                className={cn(
                  'block rotate-45 transition-all duration-500 ease-luxe',
                  slideIndex === index
                    ? 'h-2.5 w-2.5 bg-bronze'
                    : 'h-2 w-2 bg-charcoal/20 hover:bg-charcoal/45',
                )}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next slide"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/12 text-charcoal-100 transition-all duration-400 ease-luxe hover:border-gold hover:bg-charcoal hover:text-ivory"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.4} />
        </button>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Resume autoplay' : 'Pause autoplay'}
          className="ml-1 hidden h-9 w-9 items-center justify-center rounded-full text-charcoal-50 transition-colors duration-300 hover:text-charcoal sm:flex"
        >
          {paused ? (
            <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
          ) : (
            <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </section>
  )
}
