import { useCallback, useEffect, useState } from 'react'
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle } from '@hooks/index'
import adminBannerService from '@services/adminBannerService'
import PageHero from '@components/layout/PageHero'
import Button from '@components/common/Button'
import { Checkbox, TextField } from '@components/common/Field'
import SmartImage from '@components/common/SmartImage'
import AdminImagePicker from '@components/admin/media/AdminImagePicker'
import cn from '@utils/cn'

const PLACEMENT_OPTIONS = [
  { label: 'All Placements', value: '' },
  { label: 'Homepage Hero', value: 'homepage-hero' },
  { label: 'Homepage Promo', value: 'homepage-promo' },
  { label: 'Collection Banner', value: 'collection-banner' },
  { label: 'Category Banner', value: 'category-banner' },
  { label: 'Modal Banner', value: 'modal-banner' },
]

export default function AdminBannersPage() {
  useDocumentTitle('Admin Banner CMS Management')

  const [banners, setBanners] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [placement, setPlacement] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [deleteBanner, setDeleteBanner] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    placement: 'homepage-hero',
    eyebrow: '',
    headline: '',
    subheadline: '',
    description: '',
    desktopImage: '/images/hero/carousel-1.jpg',
    mobileImage: '/images/hero/carousel-1.jpg',
    ctaLabel: 'Explore Collection',
    ctaHref: '/collections/anantara',
    displayOrder: 1,
    isActive: true,
    isFeatured: false,
  })

  const fetchBanners = useCallback(async () => {
    setLoading(true)
    setFeedback({ type: '', message: '' })

    const params = { page, limit: 10 }
    if (search.trim()) params.search = search.trim()
    if (placement) params.placement = placement
    if (isActiveFilter) params.isActive = isActiveFilter

    const res = await adminBannerService.getAdminBanners(params)

    if (res.success) {
      setBanners(res.banners)
      setPagination(res.pagination)
    } else {
      setFeedback({ type: 'error', message: res.message || 'Could not load banners.' })
    }
    setLoading(false)
  }, [page, search, placement, isActiveFilter])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  const openCreateModal = () => {
    setEditingBanner(null)
    setFormData({
      title: '',
      slug: '',
      placement: 'homepage-hero',
      eyebrow: 'ROYAL HERITAGE',
      headline: 'The Anantara Collection',
      subheadline: 'Crafted for modern royalty',
      description: '',
      desktopImage: '/images/hero/carousel-1.jpg',
      mobileImage: '/images/hero/carousel-1.jpg',
      ctaLabel: 'Explore Collection',
      ctaHref: '/collections/anantara',
      displayOrder: (banners.length || 0) + 1,
      isActive: true,
      isFeatured: false,
    })
    setModalOpen(true)
  }

  const openEditModal = (b) => {
    setEditingBanner(b)
    setFormData({
      title: b.title || '',
      slug: b.slug || '',
      placement: b.placement || 'homepage-hero',
      eyebrow: b.eyebrow || '',
      headline: b.headline || '',
      subheadline: b.subheadline || '',
      description: b.description || '',
      desktopImage: b.desktopImage || '/images/hero/carousel-1.jpg',
      mobileImage: b.mobileImage || '',
      ctaLabel: b.cta?.label || '',
      ctaHref: b.cta?.href || '',
      displayOrder: b.displayOrder || 1,
      isActive: b.isActive !== undefined ? b.isActive : true,
      isFeatured: Boolean(b.isFeatured),
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
      placement: formData.placement,
      eyebrow: formData.eyebrow,
      headline: formData.headline,
      subheadline: formData.subheadline,
      description: formData.description,
      desktopImage: formData.desktopImage,
      mobileImage: formData.mobileImage || null,
      cta: {
        label: formData.ctaLabel,
        href: formData.ctaHref,
      },
      displayOrder: Number(formData.displayOrder) || 0,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
    }

    let res
    if (editingBanner) {
      res = await adminBannerService.updateBanner(editingBanner._id || editingBanner.id, payload)
    } else {
      res = await adminBannerService.createBanner(payload)
    }

    if (res.success) {
      setModalOpen(false)
      setFeedback({ type: 'success', message: res.message })
      fetchBanners()
    } else {
      setFeedback({ type: 'error', message: res.message })
    }
    setActionLoading(false)
  }

  const handleSoftDelete = async () => {
    if (!deleteBanner) return
    setActionLoading(true)

    const res = await adminBannerService.deleteBanner(deleteBanner._id || deleteBanner.id)
    if (res.success) {
      setDeleteBanner(null)
      setFeedback({ type: 'success', message: 'Banner soft-deleted successfully (isActive set to false).' })
      fetchBanners()
    } else {
      setFeedback({ type: 'error', message: res.message })
    }
    setActionLoading(false)
  }

  return (
    <>
      <PageHero
        eyebrow="Admin CMS"
        title="Banner & Carousel Management"
        lede="Create, edit, search, and soft-delete hero and promotional banners in MongoDB."
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Admin Banners' }]}
      >
        <div className="mt-6 flex justify-end">
          <Button variant="primary" icon={Plus} iconPosition="left" onClick={openCreateModal}>
            Add New Banner
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
                  placeholder="Search banner title or slug..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 pl-9 pr-4 font-sans text-body-xs focus:border-gold focus:outline-none"
                />
              </div>

              <select
                value={placement}
                onChange={(e) => {
                  setPlacement(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
              >
                {PLACEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={isActiveFilter}
                onChange={(e) => {
                  setIsActiveFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
              >
                <option value="">All Active & Inactive</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive / Soft-Deleted Only</option>
              </select>
            </div>
          </div>

          {/* Banners Table */}
          <div className="mj-panel p-6 overflow-hidden">
            {loading ? (
              <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
            ) : !banners.length ? (
              <p className="py-16 text-center text-body-sm text-charcoal-200">
                No banners found matching search criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-body-sm">
                  <thead>
                    <tr className="border-b border-charcoal/10 text-body-xs uppercase tracking-luxe text-charcoal-50">
                      <th className="py-3 pr-4">Banner</th>
                      <th className="py-3 px-4">Placement</th>
                      <th className="py-3 px-4 text-center">Order</th>
                      <th className="py-3 px-4 text-center">Featured</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/[0.07]">
                    {banners.map((b) => (
                      <tr key={b._id || b.id} className="hover:bg-champagne-50/50 transition-colors">
                        <td className="py-3.5 pr-4 flex items-center gap-3">
                          <SmartImage
                            src={b.desktopImage || '/images/hero/carousel-1.jpg'}
                            alt=""
                            ratio="aspect-video"
                            rounded="rounded-luxe"
                            className="w-16 shrink-0 border border-charcoal/10"
                          />
                          <div>
                            <p className="font-display font-medium text-charcoal">{b.title}</p>
                            <span className="font-sans text-[0.7rem] text-bronze">{b.slug}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-body-xs text-charcoal-200 capitalize">
                          {b.placement}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold">{b.displayOrder || 0}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              'inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase',
                              b.isFeatured ? 'bg-amber-50 text-amber-700' : 'bg-charcoal/5 text-charcoal-200',
                            )}
                          >
                            {b.isFeatured ? 'Featured' : 'Standard'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              'inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase',
                              b.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-charcoal/10 text-charcoal-200',
                            )}
                          >
                            {b.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(b)}
                              className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-champagne-100 hover:text-bronze transition-colors"
                              title="Edit banner"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteBanner(b)}
                              className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Soft delete banner"
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
          <div className="w-full max-w-xl rounded-panel bg-ivory p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <h3 className="font-display text-display-xs text-charcoal">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5 text-charcoal-100 hover:text-charcoal" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="Title"
                  name="title"
                  required
                  placeholder="Royal Anantara Banner"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <TextField
                  label="Slug"
                  name="slug"
                  placeholder="royal-anantara-banner"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-sans text-body-xs font-semibold uppercase tracking-luxe text-charcoal">
                    Placement
                  </label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
                  >
                    {PLACEMENT_OPTIONS.filter((o) => o.value).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <TextField
                  label="Display Order"
                  name="displayOrder"
                  type="number"
                  value={String(formData.displayOrder)}
                  onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                />
              </div>

              <AdminImagePicker
                label="Banner Desktop Image"
                folder="mayura/banners"
                value={formData.desktopImage}
                onChange={(newUrl) => setFormData({ ...formData, desktopImage: newUrl })}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="Eyebrow Text"
                  name="eyebrow"
                  value={formData.eyebrow}
                  onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                />
                <TextField
                  label="Headline"
                  name="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="CTA Label"
                  name="ctaLabel"
                  value={formData.ctaLabel}
                  onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                />
                <TextField
                  label="CTA Href"
                  name="ctaHref"
                  value={formData.ctaHref}
                  onChange={(e) => setFormData({ ...formData, ctaHref: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap gap-6 border-t border-charcoal/10 pt-4">
                <Checkbox
                  label="Active (Visible in Storefront)"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Checkbox
                  label="Featured Banner"
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
                  {actionLoading ? 'Saving...' : editingBanner ? 'Save Changes' : 'Create Banner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE DIALOG */}
      {deleteBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-panel bg-ivory p-6 shadow-xl">
            <h3 className="font-display text-display-xs text-charcoal">Confirm Soft Delete</h3>
            <p className="mt-3 text-body-sm text-charcoal-200">
              Are you sure you want to soft-delete banner <strong>{deleteBanner.title}</strong>? This sets{' '}
              <code className="bg-champagne-100 px-1 py-0.5 rounded text-bronze">isActive = false</code>,
              hiding it from the public storefront while retaining its MongoDB record.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteBanner(null)}>
                Cancel
              </Button>
              <Button variant="primary" className="bg-rose-700 hover:bg-rose-800" onClick={handleSoftDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Soft Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
