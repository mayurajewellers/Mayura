import { useEffect, useState } from 'react'
import { MessageCircle, Star } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { AVERAGE_RATING as STATIC_RATING, RATING_DISTRIBUTION as STATIC_DISTRIBUTION, TESTIMONIALS as STATIC_TESTIMONIALS } from '@data/testimonials'
import { useDocumentTitle } from '@hooks/index'
import testimonialService from '@services/testimonialService'
import PageHero from '@components/layout/PageHero'
import Rating from '@components/common/Rating'
import Button from '@components/common/Button'
import Reveal from '@components/motion/Reveal'
import { ReviewCard } from '@components/cards/index.jsx'

export default function TestimonialsPage() {
  useDocumentTitle('Testimonials')

  const [testimonials, setTestimonials] = useState(() => STATIC_TESTIMONIALS)
  const [averageRating, setAverageRating] = useState(() => STATIC_RATING)
  const [ratingDistribution, setRatingDistribution] = useState(() => STATIC_DISTRIBUTION)

  useEffect(() => {
    let isSubscribed = true
    testimonialService
      .getTestimonials()
      .then((res) => {
        if (!isSubscribed) return
        if (res.success && res.testimonials && res.testimonials.length > 0) {
          setTestimonials(res.testimonials)
          if (res.averageRating) setAverageRating(res.averageRating)
          if (res.ratingDistribution && res.ratingDistribution.length > 0) {
            setRatingDistribution(res.ratingDistribution)
          }
        }
      })
      .catch(() => {})

    return () => {
      isSubscribed = false
    }
  }, [])

  return (
    <>
      <PageHero
        eyebrow="In their words"
        title="What people say afterwards"
        lede="Reviews from customers across Kandivali, Borivali, Malad and Thane. Published as written — including the one about the seating."
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Testimonials' }]}
      />

      {/* ------------------------------------------------------- summary */}
      <section className="border-b border-charcoal/[0.07] bg-ivory-300">
        <div className="mj-container py-14 lg:py-18">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-display-lg leading-none text-charcoal">
                  {averageRating}
                </span>
                <span className="font-sans text-body text-charcoal-50">/ 5</span>
              </div>
              <Rating value={Number(averageRating)} size="lg" className="mt-5" />
              <p className="mt-4 font-sans text-body-sm text-charcoal-200">
                from {testimonials.length} verified customers
              </p>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-5">
              <ul className="space-y-2.5">
                {ratingDistribution.map((row) => (
                  <li key={row.stars} className="flex items-center gap-4">
                    <span className="flex w-12 shrink-0 items-center gap-1 font-sans text-body-xs tabular-nums text-charcoal-100">
                      {row.stars}
                      <Star className="h-3 w-3 fill-gold text-gold" strokeWidth={0} aria-hidden="true" />
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-charcoal/8">
                      <span
                        className="block h-full rounded-full bg-gold transition-all duration-1200 ease-luxe"
                        style={{ width: `${row.percent}%` }}
                      />
                    </span>
                    <span className="w-10 shrink-0 text-right font-sans text-body-xs tabular-nums text-charcoal-50">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.16} className="lg:col-span-3">
              <p className="text-body-sm leading-[1.9] text-charcoal-200">
                Every review here is from a customer who bought something. We do not solicit them,
                we do not edit them, and we publish the critical ones too.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                href={CONTACT.whatsappUrl}
                target="_blank"
                icon={MessageCircle}
                iconPosition="left"
              >
                Leave a review
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- reviews */}
      <section className="mj-section bg-ivory">
        <div className="mj-container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <ReviewCard key={testimonial.id || index} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- closing */}
      <section className="mj-grain relative bg-espresso">
        <div className="mj-container py-20 text-center lg:py-26">
          <Reveal>
            <p className="mj-eyebrow-light mb-6">Come and judge for yourself</p>
            <h2 className="mj-display mx-auto max-w-2xl text-display-md text-ivory">
              The best review is the one you write after
            </h2>
            <div className="mt-11 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Button variant="gold" to={ROUTES.contact}>
                Visit the shop
              </Button>
              <Button variant="outlineLight" to={ROUTES.collections}>
                Browse the collections
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
