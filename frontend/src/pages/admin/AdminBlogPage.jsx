import { useCallback, useEffect, useState } from 'react'
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle } from '@hooks/index'
import adminBlogService from '@services/adminBlogService'
import PageHero from '@components/layout/PageHero'
import Button from '@components/common/Button'
import { Checkbox, TextField } from '@components/common/Field'
import SmartImage from '@components/common/SmartImage'
import AdminImagePicker from '@components/admin/media/AdminImagePicker'
import cn from '@utils/cn'

const CATEGORY_OPTIONS = [
  'Buying Guides',
  'Jewellery Care',
  'Bridal',
  'Gold Investment',
  'Trends',
]

const STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'ARCHIVED']

export default function AdminBlogPage() {
  useDocumentTitle('Admin Blog CMS Management')

  const [posts, setPosts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [deletePost, setDeletePost] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Buying Guides',
    author: 'Mayura Atelier',
    readTime: 5,
    excerpt: '',
    content: '<p>Handcrafted jewellery editorial content...</p>',
    coverImage: '/images/editorial/layered-haram-trunk.jpg',
    status: 'PUBLISHED',
    isFeatured: false,
    isActive: true,
    metaTitle: '',
    metaDescription: '',
  })

  const fetchBlogPosts = useCallback(async () => {
    setLoading(true)
    setFeedback({ type: '', message: '' })

    const params = { page, limit: 10 }
    if (search.trim()) params.search = search.trim()
    if (category) params.category = category
    if (status) params.status = status

    const res = await adminBlogService.getAdminBlogPosts(params)

    if (res.success) {
      setPosts(res.posts)
      setPagination(res.pagination)
    } else {
      setFeedback({ type: 'error', message: res.message || 'Could not load blog posts.' })
    }
    setLoading(false)
  }, [page, search, category, status])

  useEffect(() => {
    fetchBlogPosts()
  }, [fetchBlogPosts])

  const openCreateModal = () => {
    setEditingPost(null)
    setFormData({
      title: '',
      slug: '',
      category: 'Buying Guides',
      author: 'Mayura Atelier',
      readTime: 5,
      excerpt: 'Comprehensive guide to selecting gold and diamond heritage jewellery.',
      content: '<p>Handcrafted jewellery editorial content...</p>',
      coverImage: '/images/editorial/layered-haram-trunk.jpg',
      status: 'PUBLISHED',
      isFeatured: false,
      isActive: true,
      metaTitle: '',
      metaDescription: '',
    })
    setModalOpen(true)
  }

  const openEditModal = (p) => {
    setEditingPost(p)
    setFormData({
      title: p.title || '',
      slug: p.slug || '',
      category: p.category || 'Buying Guides',
      author: p.author || 'Mayura Atelier',
      readTime: p.readTime || 5,
      excerpt: p.excerpt || '',
      content: typeof p.content === 'string' ? p.content : JSON.stringify(p.content),
      coverImage: p.coverImage || '/images/editorial/layered-haram-trunk.jpg',
      status: p.status || 'PUBLISHED',
      isFeatured: Boolean(p.isFeatured),
      isActive: p.isActive !== undefined ? p.isActive : true,
      metaTitle: p.seo?.metaTitle || '',
      metaDescription: p.seo?.metaDescription || '',
    })
    setModalOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setFeedback({ type: '', message: '' })

    const payload = {
      title: formData.title,
      slug: formData.slug,
      category: formData.category,
      author: formData.author,
      readTime: Number(formData.readTime) || 5,
      excerpt: formData.excerpt,
      content: formData.content,
      coverImage: formData.coverImage,
      status: formData.status,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
      seo: {
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
      },
    }

    let res
    if (editingPost) {
      res = await adminBlogService.updateBlogPost(editingPost._id || editingPost.id, payload)
    } else {
      res = await adminBlogService.createBlogPost(payload)
    }

    if (res.success) {
      setModalOpen(false)
      setFeedback({ type: 'success', message: res.message })
      fetchBlogPosts()
    } else {
      setFeedback({ type: 'error', message: res.message })
    }
    setActionLoading(false)
  }

  const handleSoftDelete = async () => {
    if (!deletePost) return
    setActionLoading(true)

    const res = await adminBlogService.deleteBlogPost(deletePost._id || deletePost.id)
    if (res.success) {
      setDeletePost(null)
      setFeedback({ type: 'success', message: 'Blog post archived successfully.' })
      fetchBlogPosts()
    } else {
      setFeedback({ type: 'error', message: res.message })
    }
    setActionLoading(false)
  }

  return (
    <>
      <PageHero
        eyebrow="Admin CMS"
        title="Blog Editorial Management"
        lede="Create, draft, publish, and archive journal articles and heritage guides in MongoDB."
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Admin Blog' }]}
      >
        <div className="mt-6 flex justify-end">
          <Button variant="primary" icon={Plus} iconPosition="left" onClick={openCreateModal}>
            Create New Post
          </Button>
        </div>
      </PageHero>

      <section className="mj-section bg-ivory py-12">
        <div className="mj-container space-y-8">
          {/* Feedback message */}
          {feedback.message && (
            <div
              className={cn(
                'rounded-luxe border p-4 font-sans text-body-sm font-medium flex items-center justify-between',
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-800',
              )}
            >
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback({ type: '', message: '' })}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Search & Filters */}
          <div className="mj-panel p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-charcoal-50" />
                <input
                  type="text"
                  placeholder="Search blog title or excerpt..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 pl-9 pr-4 font-sans text-body-xs focus:border-gold focus:outline-none"
                />
              </div>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Blog Table */}
          <div className="mj-panel p-6 overflow-hidden">
            {loading ? (
              <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
            ) : !posts.length ? (
              <p className="py-16 text-center text-body-sm text-charcoal-200">
                No blog posts found matching search criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-body-sm">
                  <thead>
                    <tr className="border-b border-charcoal/10 text-body-xs uppercase tracking-luxe text-charcoal-50">
                      <th className="py-3 pr-4">Article</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Read Time</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Featured</th>
                      <th className="py-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/[0.07]">
                    {posts.map((p) => (
                      <tr key={p._id || p.id} className="hover:bg-champagne-50/50 transition-colors">
                        <td className="py-3.5 pr-4 flex items-center gap-3">
                          <SmartImage
                            src={p.coverImage || '/images/editorial/layered-haram-trunk.jpg'}
                            alt=""
                            ratio="aspect-square"
                            rounded="rounded-luxe"
                            className="w-10 shrink-0 border border-charcoal/10"
                          />
                          <div>
                            <p className="font-display font-medium text-charcoal">{p.title}</p>
                            <span className="font-sans text-[0.7rem] text-bronze">{p.slug}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-body-xs text-charcoal-200">
                          {p.category}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold">{p.readTime || 5} min</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              'inline-block px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase',
                              p.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700'
                                : p.status === 'DRAFT'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-charcoal/10 text-charcoal-200',
                            )}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              'inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase',
                              p.isFeatured ? 'bg-amber-50 text-amber-700' : 'bg-charcoal/5 text-charcoal-200',
                            )}
                          >
                            {p.isFeatured ? 'Featured' : 'Standard'}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-champagne-100 hover:text-bronze transition-colors"
                              title="Edit blog post"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletePost(p)}
                              className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Archive blog post"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-panel bg-ivory p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <h3 className="font-display text-display-xs text-charcoal">
                {editingPost ? 'Edit Blog Article' : 'Create New Article'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5 text-charcoal-100 hover:text-charcoal" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="Article Title"
                  name="title"
                  required
                  placeholder="Guide to Polki Diamond Jewellery"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <TextField
                  label="Slug"
                  name="slug"
                  placeholder="guide-to-polki-diamond-jewellery"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block font-sans text-body-xs font-semibold uppercase tracking-luxe text-charcoal">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-sans text-body-xs font-semibold uppercase tracking-luxe text-charcoal">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <TextField
                  label="Read Time (min)"
                  name="readTime"
                  type="number"
                  value={String(formData.readTime)}
                  onChange={(e) => setFormData({ ...formData, readTime: Number(e.target.value) })}
                />
              </div>

              <AdminImagePicker
                label="Blog Cover Image"
                folder="mayura/blog"
                value={formData.coverImage}
                onChange={(newUrl) => setFormData({ ...formData, coverImage: newUrl })}
              />

              <div className="space-y-2">
                <label className="block font-sans text-body-xs font-semibold uppercase tracking-luxe text-charcoal">
                  Article Excerpt
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full rounded-luxe border border-charcoal/15 bg-white p-3 font-sans text-body-xs focus:border-gold focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-sans text-body-xs font-semibold uppercase tracking-luxe text-charcoal">
                  Body Content (HTML / Text)
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full rounded-luxe border border-charcoal/15 bg-white p-3 font-sans text-body-xs focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-6 border-t border-charcoal/10 pt-4">
                <Checkbox
                  label="Active (Visible in Storefront when Published)"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Checkbox
                  label="Featured Editorial"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : editingPost ? 'Save Changes' : 'Create Article'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE DIALOG */}
      {deletePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-panel bg-ivory p-6 shadow-xl">
            <h3 className="font-display text-display-xs text-charcoal">Confirm Article Archive</h3>
            <p className="mt-3 text-body-sm text-charcoal-200">
              Are you sure you want to archive blog post <strong>{deletePost.title}</strong>? This sets{' '}
              <code className="bg-champagne-100 px-1 py-0.5 rounded text-bronze">status = 'ARCHIVED'</code>,
              hiding it from the public blog storefront while preserving its MongoDB record.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeletePost(null)}>
                Cancel
              </Button>
              <Button variant="primary" className="bg-rose-700 hover:bg-rose-800" onClick={handleSoftDelete} disabled={actionLoading}>
                {actionLoading ? 'Archiving...' : 'Archive Post'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
