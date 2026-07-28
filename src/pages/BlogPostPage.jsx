import { Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { getPost, relatedPosts } from '@data/blog'
import { useDocumentTitle } from '@hooks/index'
import { formatDate } from '@utils/format'
import PageHero from '@components/layout/PageHero'
import SectionHeading from '@components/common/SectionHeading'
import ImageReveal from '@components/motion/ImageReveal'
import Reveal from '@components/motion/Reveal'
import Button from '@components/common/Button'
import Flourish from '@components/common/Flourish'
import { BlogCard } from '@components/cards/index.jsx'

/** Renders one block of the post body. Keeps the article component readable. */
function Block({ block }) {
  switch (block.type) {
    case 'lede':
      return (
        <p className="font-serif text-[clamp(1.25rem,2.2vw,1.625rem)] font-light leading-[1.6] text-charcoal">
          {block.text}
        </p>
      )
    case 'heading':
      return (
        <h2 className="mt-14 font-display text-display-xs leading-snug text-charcoal">
          {block.text}
        </h2>
      )
    case 'quote':
      return (
        <blockquote className="my-12 border-l-2 border-gold py-2 pl-7">
          <p className="mj-quote">{block.text}</p>
        </blockquote>
      )
    case 'list':
      return (
        <ul className="my-8 space-y-3.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-4 text-body leading-[1.9] text-charcoal-200">
              <span className="mt-[0.7rem] h-1 w-1 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )
    case 'paragraph':
    default:
      return <p className="text-body leading-[1.95] text-charcoal-200">{block.text}</p>
  }
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const post = getPost(slug)

  useDocumentTitle(post?.title ?? 'Journal')

  if (!post) return <Navigate to={ROUTES.blog} replace />

  const related = relatedPosts(post, 3)

  return (
    <>
      <PageHero
        eyebrow={post.category}
        title={post.title}
        image={post.image}
        height="lg"
        breadcrumbs={[
          { label: 'Home', to: ROUTES.home },
          { label: 'Journal', to: ROUTES.blog },
          { label: post.category },
        ]}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-body-sm text-ivory/60">
          <span>{post.author}</span>
          <span className="text-ivory/25" aria-hidden="true">·</span>
          <span>{formatDate(post.date)}</span>
          <span className="text-ivory/25" aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.4} aria-hidden="true" />
            {post.readMinutes} min read
          </span>
        </div>
      </PageHero>

      {/* --------------------------------------------------------- article */}
      <article className="mj-section bg-ivory">
        <div className="mj-container-narrow">
          <div className="space-y-6">
            {post.body.map((block, index) => (
              <Reveal key={index} delay={Math.min(index, 4) * 0.03} direction="up" distance={16}>
                <Block block={block} />
              </Reveal>
            ))}
          </div>

          {post.image2 && (
            <div className="my-14">
              <ImageReveal src={post.image2} alt="" ratio="aspect-[16/10]" />
            </div>
          )}

          <Flourish className="my-16" />

          <Reveal>
            <div className="rounded-panel border border-charcoal/[0.08] bg-champagne-50 p-8 sm:p-10">
              <p className="mj-eyebrow mb-5">Written by</p>
              <p className="font-display text-[1.375rem] text-charcoal">{post.author}</p>
              <p className="mt-4 text-body-sm leading-[1.9] text-charcoal-200">
                Everything in the Journal is written at the counter, by the people who make and sell
                these pieces. If you disagree with something here, come and argue about it — we
                enjoy that far more than being agreed with.
              </p>
              <Button variant="outline" size="sm" className="mt-7" to={ROUTES.contact}>
                Visit the shop
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 flex justify-center">
              <Button variant="ghost" to={ROUTES.blog} icon={ArrowLeft} iconPosition="left">
                Back to the Journal
              </Button>
            </div>
          </Reveal>
        </div>
      </article>

      {/* --------------------------------------------------------- related */}
      {related.length > 0 && (
        <section className="mj-section bg-ivory-300">
          <div className="mj-container">
            <SectionHeading
              eyebrow="Keep reading"
              title="More from the journal"
              link={ROUTES.blog}
              linkLabel="All writing"
              className="mb-14"
            />
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <BlogCard key={item.slug} post={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
