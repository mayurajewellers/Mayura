import { useEffect, useState } from 'react'
import { ROUTES } from '@constants/routes'
import { AVERAGE_RATING as STATIC_RATING, FEATURED_TESTIMONIALS as STATIC_FEATURED, TESTIMONIALS as STATIC_TESTIMONIALS } from '@data/testimonials'
import testimonialService from '@services/testimonialService'
import SectionHeading from '@components/common/SectionHeading'
import Rating from '@components/common/Rating'
import Reveal from '@components/motion/Reveal'
import { ReviewCard } from '@components/cards/index.jsx'

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(() => STATIC_FEATURED)
  const [totalCount, setTotalCount] = useState(() => STATIC_TESTIMONIALS.length)
  const [averageRating, setAverageRating] = useState(() => STATIC_RATING)

  useEffect(() => {
    let isSubscribed = true
    testimonialService
      .getTestimonials()
      .then((res) => {
        if (!isSubscribed) return
        if (res.success && res.testimonials && res.testimonials.length > 0) {
          const featured = res.testimonials.filter((t) => t.isFeatured)
          setTestimonials(featured.length > 0 ? featured.slice(0, 3) : res.testimonials.slice(0, 3))
          setTotalCount(res.testimonials.length)
          if (res.averageRating) setAverageRating(res.averageRating)
        }
      })
      .catch(() => {})

    return () => {
      isSubscribed = false
    }
  }, [])

  return (
    <section className="mj-section mj-grain relative bg-espresso" aria-labelledby="testimonials">
      <div className="mj-container">
        <SectionHeading
          id="testimonials"
          eyebrow="In their words"
          title="What people say afterwards"
          lede="Reviews from customers across Kandivali, Borivali, Malad and Thane. We have not edited them."
          tone="light"
          link={ROUTES.testimonials}
          linkLabel="Read all reviews"
          className="mb-10"
        />

        <Reveal delay={0.1} className="mb-14 lg:mb-16">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-ivory/12 py-5">
            <Rating value={Number(averageRating)} size="md" tone="light" />
            <span className="font-display text-[1.375rem] tabular-nums text-ivory">
              {averageRating}
            </span>
            <span className="font-sans text-body-sm text-ivory/50">
              from {totalCount} verified customers
            </span>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <ReviewCard
              key={testimonial.id || index}
              testimonial={testimonial}
              index={index}
              tone="light"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
