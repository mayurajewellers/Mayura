import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { BLOG_CATEGORIES as STATIC_CATEGORIES, BLOG_POSTS as STATIC_POSTS, FEATURED_POSTS as STATIC_FEATURED } from '@data/blog'
import { useDocumentTitle } from '@hooks/index'
import blogService from '@services/blogService'
import { formatDate } from '@utils/format'
import PageHero from '@components/layout/PageHero'
import SectionHeading from '@components/common/SectionHeading'
import ImageReveal from '@components/motion/ImageReveal'
import Reveal from '@components/motion/Reveal'
import { BlogCard } from '@components/cards/index.jsx'
import cn from '@utils/cn'

export default function BlogPage() {
  useDocumentTitle('The Journal')
  const [category, setCategory] = useState('All')
  const [posts, setPosts] = useState(() => STATIC_POSTS)

  useEffect(() => {
    let isSubscribed = true
    blogService
      .getBlogPosts()
      .then((res) => {
        if (!isSubscribed) return
        if (res.success && res.posts && res.posts.length > 0) {
          setPosts(res.posts)
        }
      })
      .catch(() => {})

    return () => {
      isSubscribed = false
    }
  }, [])

  const lead = useMemo(() => {
    const featured = posts.find((p) => p.featured)
    return featured || posts[0] || STATIC_FEATURED[0]
  }, [posts])

  const rest = useMemo(
    () =>
      posts.filter(
        (post) => post.slug !== lead?.slug && (category === 'All' || post.category === category),
      ),
    [posts, category, lead],
  )

  return (
    <>
      <PageHero
        eyebrow="The Mayura Journal"
        title="Notes from the workshop"
        lede="Buying guides, care notes and the occasional argument about whether jewellery counts as an investment. Written by the people who make it."
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Journal' }]}
      />

      {/* ------------------------------------------------------ lead post */}
      {lead && (
        <section className="border-b border-charcoal/[0.07] bg-ivory py-14 lg:py-20">
          <div className="mj-container">
            <article className="group/lead grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <Link to={ROUTES.blogPost(lead.slug)} className="block">
                  <ImageReveal
                    src={lead.image}
                    alt={lead.title}
                    ratio="aspect-[16/10]"
                    imgClassName="transition-transform duration-1200 ease-luxe group-hover/lead:scale-[1.03]"
                  />
                </Link>
              </div>

              <div className="lg:col-span-5">
                <Reveal direction="left">
                  <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="mj-eyebrow">Latest</span>
                    <span className="text-charcoal/20" aria-hidden="true">·</span>
                    <span className="font-sans text-body-xs text-charcoal-50">{lead.category}</span>
                    <span className="text-charcoal/20" aria-hidden="true">·</span>
                    <span className="font-sans text-body-xs text-charcoal-50">
                      {lead.readMinutes} min read
                    </span>
                  </div>

                  <h2 className="mj-display text-display-md">
                    <Link
                      to={ROUTES.blogPost(lead.slug)}
                      className="transition-colors duration-300 hover:text-bronze"
                    >
                      {lead.title}
                    </Link>
                  </h2>

                  <p className="mt-6 text-body leading-[1.9] text-charcoal-200">{lead.excerpt}</p>

                  <p className="mt-7 font-sans text-body-xs text-charcoal-50">
                    {lead.author} · {formatDate(lead.date)}
                  </p>

                  <Link
                    to={ROUTES.blogPost(lead.slug)}
                    className="group/link mt-8 inline-flex items-center gap-3 font-sans text-label uppercase tracking-wider2 text-charcoal transition-colors duration-300 hover:text-bronze"
                  >
                    <span className="mj-underline">Read the note</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-500 ease-luxe group-hover/link:translate-x-1"
                      strokeWidth={1.4}
                      aria-hidden="true"
                    />
                  </Link>
                </Reveal>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------- post grid */}
      <section className="mj-section bg-ivory">
        <div className="mj-container">
          <SectionHeading eyebrow="All writing" title="Everything in the journal" className="mb-10" />

          <nav aria-label="Journal categories" className="mb-14">
            <ul className="flex flex-wrap gap-2.5">
              {['All', ...STATIC_CATEGORIES].map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => setCategory(name)}
                    aria-pressed={category === name}
                    className={cn(
                      'rounded-full border px-5 py-2.5 font-sans text-eyebrow uppercase tracking-luxe transition-all duration-400 ease-luxe',
                      category === name
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

          {rest.length ? (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, index) => (
                <BlogCard key={post.slug} post={post} index={index} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-body text-charcoal-200">
              Nothing in that category yet — more is being written.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
