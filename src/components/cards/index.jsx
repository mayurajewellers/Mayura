import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Quote } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { EASE_LUXE } from '@constants/motion'
import { formatDate } from '@utils/format'
import SmartImage from '@components/common/SmartImage'
import Rating from '@components/common/Rating'
import { Badge } from '@components/common/index.jsx'
import cn from '@utils/cn'

export { default as ProductCard } from './ProductCard'

/* =========================================================================
   CollectionCard — the tall editorial card used on the collections index
   ====================================================================== */
export function CollectionCard({ collection, className, ratio = 'aspect-[3/4]', index = 0 }) {
  return (
    <motion.article
      className={cn('group/col relative', className)}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: EASE_LUXE }}
    >
      <Link to={ROUTES.collection(collection.slug)} className="block">
        <div className="relative overflow-hidden rounded-card bg-champagne-100">
          <SmartImage
            src={collection.coverImage}
            alt={collection.name}
            ratio={ratio}
            rounded="rounded-card"
            imgClassName="transition-transform duration-1200 ease-luxe group-hover/col:scale-[1.06]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-scrim-card opacity-90 transition-opacity duration-700 group-hover/col:opacity-100"
            aria-hidden="true"
          />

          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
            <p className="mj-eyebrow-light mb-3">{collection.kicker}</p>
            <h3 className="mj-display text-display-sm text-ivory">{collection.name}</h3>
            <p className="mt-2 font-serif text-[1.0625rem] italic text-ivory/70">
              {collection.tagline}
            </p>

            <div className="mt-6 flex items-center gap-2.5 font-sans text-eyebrow uppercase tracking-luxe text-gold-200">
              <span className="mj-underline">Explore</span>
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-500 ease-luxe group-hover/col:translate-x-0.5 group-hover/col:-translate-y-0.5"
                strokeWidth={1.4}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

/* =========================================================================
   CategoryCard — arch-topped tile for shop-by-category
   ====================================================================== */
export function CategoryCard({ category, className, index = 0 }) {
  return (
    <motion.article
      className={cn('group/cat text-center', className)}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.07, ease: EASE_LUXE }}
    >
      <Link to={ROUTES.collection(category.slug)} className="block">
        <div className="relative overflow-hidden rounded-[9rem_9rem_0.375rem_0.375rem] bg-champagne-100">
          <SmartImage
            src={category.image}
            alt={category.name}
            ratio="aspect-[4/5]"
            rounded="rounded-[9rem_9rem_0.375rem_0.375rem]"
            imgClassName="transition-transform duration-1200 ease-luxe group-hover/cat:scale-[1.07]"
          />
          <span
            className="pointer-events-none absolute inset-0 rounded-[9rem_9rem_0.375rem_0.375rem] ring-1 ring-inset ring-charcoal/[0.06] transition-all duration-700 group-hover/cat:ring-gold/40"
            aria-hidden="true"
          />
        </div>

        <h3 className="mt-6 font-display text-[1.125rem] leading-snug text-charcoal transition-colors duration-300 group-hover/cat:text-bronze">
          {category.name}
        </h3>
        {category.kicker && (
          <p className="mt-1.5 font-sans text-body-xs text-charcoal-50">{category.kicker}</p>
        )}
      </Link>
    </motion.article>
  )
}

/* =========================================================================
   StoryCard — used for craftsmanship and values blocks
   ====================================================================== */
export function StoryCard({ icon: Icon, title, copy, meta, index = 0, className, tone = 'dark' }) {
  const light = tone === 'light'
  return (
    <motion.div
      className={cn(
        'group/story relative border-t pt-8',
        light ? 'border-ivory/15' : 'border-charcoal/12',
        className,
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay: index * 0.09, ease: EASE_LUXE }}
    >
      <span
        className={cn(
          'absolute -top-px left-0 h-px w-0 transition-[width] duration-900 ease-luxe group-hover/story:w-full',
          'bg-gold',
        )}
        aria-hidden="true"
      />

      {Icon && (
        <Icon
          className={cn('mb-6 h-6 w-6', light ? 'text-gold-200' : 'text-bronze')}
          strokeWidth={1}
          aria-hidden="true"
        />
      )}
      {meta && (
        <p className={cn('mb-3', light ? 'mj-eyebrow-light' : 'mj-eyebrow')}>{meta}</p>
      )}
      <h3
        className={cn(
          'font-display text-[1.25rem] leading-snug',
          light ? 'text-ivory' : 'text-charcoal',
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          'mt-3.5 text-body-sm leading-[1.9]',
          light ? 'text-ivory/60' : 'text-charcoal-200',
        )}
      >
        {copy}
      </p>
    </motion.div>
  )
}

/* =========================================================================
   ReviewCard
   ====================================================================== */
export function ReviewCard({ testimonial, className, index = 0, tone = 'dark' }) {
  const light = tone === 'light'
  return (
    <motion.figure
      className={cn(
        'flex h-full flex-col rounded-card border p-8 transition-all duration-500 ease-luxe',
        light
          ? 'border-ivory/12 bg-ivory/[0.04] hover:border-gold/35'
          : 'border-charcoal/[0.08] bg-white/55 hover:-translate-y-1 hover:shadow-card-hover',
        className,
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: EASE_LUXE }}
    >
      <Quote
        className={cn('mb-5 h-6 w-6 shrink-0', light ? 'text-gold/60' : 'text-gold/70')}
        strokeWidth={1}
        aria-hidden="true"
      />

      <Rating value={testimonial.rating} size="xs" tone={tone} className="mb-5" />

      {testimonial.headline && (
        <h3
          className={cn(
            'mb-3 font-display text-[1.0625rem] leading-snug',
            light ? 'text-ivory' : 'text-charcoal',
          )}
        >
          {testimonial.headline}
        </h3>
      )}

      <blockquote
        className={cn(
          'flex-1 text-body-sm leading-[1.95]',
          light ? 'text-ivory/65' : 'text-charcoal-200',
        )}
      >
        {testimonial.quote}
      </blockquote>

      <figcaption
        className={cn(
          'mt-7 border-t pt-5',
          light ? 'border-ivory/12' : 'border-charcoal/10',
        )}
      >
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'font-sans text-body-sm font-medium',
              light ? 'text-ivory' : 'text-charcoal',
            )}
          >
            {testimonial.name}
          </p>
          {testimonial.verified && <Badge tone={light ? 'gold' : 'success'}>Verified</Badge>}
        </div>
        <p className={cn('mt-1 font-sans text-body-xs', light ? 'text-ivory/40' : 'text-charcoal-50')}>
          {testimonial.location}
          {testimonial.purchase && ` · ${testimonial.purchase}`}
        </p>
      </figcaption>
    </motion.figure>
  )
}

/* =========================================================================
   BlogCard
   ====================================================================== */
export function BlogCard({ post, className, index = 0, featured = false }) {
  return (
    <motion.article
      className={cn('group/post relative flex h-full flex-col', className)}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.75, delay: index * 0.08, ease: EASE_LUXE }}
    >
      <div className="overflow-hidden rounded-card bg-champagne-100">
        <SmartImage
          src={post.image}
          alt={post.title}
          ratio={featured ? 'aspect-[16/10]' : 'aspect-[4/3]'}
          rounded="rounded-card"
          imgClassName="transition-transform duration-1200 ease-luxe group-hover/post:scale-[1.05]"
        />
      </div>

      <div className="flex flex-1 flex-col pt-6">
        <div className="mb-3.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="mj-eyebrow">{post.category}</span>
          <span className="text-charcoal/20" aria-hidden="true">
            ·
          </span>
          <span className="font-sans text-body-xs text-charcoal-50">
            {post.readMinutes} min read
          </span>
        </div>

        <h3
          className={cn(
            'font-display leading-[1.32] text-charcoal transition-colors duration-300 group-hover/post:text-bronze',
            featured ? 'text-display-xs' : 'text-[1.125rem]',
          )}
        >
          <Link
            to={ROUTES.blogPost(post.slug)}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </Link>
        </h3>

        <p className="mt-3.5 flex-1 text-body-sm leading-[1.9] text-charcoal-200">{post.excerpt}</p>

        <p className="mt-6 font-sans text-body-xs text-charcoal-50">
          {post.author} · {formatDate(post.date)}
        </p>
      </div>
    </motion.article>
  )
}
