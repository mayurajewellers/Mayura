import { useCallback, useEffect, useState } from 'react'
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle } from '@hooks/index'
import adminCollectionService from '@services/adminCollectionService'
import PageHero from '@components/layout/PageHero'
import Button from '@components/common/Button'
import { Checkbox, TextField } from '@components/common/Field'
import SmartImage from '@components/common/SmartImage'
import AdminImagePicker from '@components/admin/media/AdminImagePicker'
import cn from '@utils/cn'

export default function AdminCollectionsPage() {
  useDocumentTitle('Admin Collection Management')

  const [collections, setCollections] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState(null)
  const [deleteCollection, setDeleteCollection] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    kicker: 'Signature Collection',
    tagline: '',
    meaning: '',
    intro: '',
    story: '',
    heroImage: '/images/editorial/layered-haram-trunk.jpg',
    displayOrder: 1,
    isActive: true,
  })

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    setFeedback({ type: '', message: '' })

    const params = { page, limit: 10 }
    if (search.trim()) params.search = search.trim()

    const res = await adminCollectionService.getAdminCollections(params)

    if (res.success) {
      setCollections(res.collections)
      setPagination(res.pagination)
    } else {
      setFeedback({ type: 'error', message: res.message || 'Could not load collections.' })
    }
    setLoading(false)
  }, [page, search])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const openCreateModal = () => {
    setEditingCollection(null)
    setFormData({
      name: '',
      slug: '',
      kicker: 'Signature Collection',
      tagline: '',
      meaning: '',
      intro: '',
      story: '',
      heroImage: '/images/editorial/layered-haram-trunk.jpg',
      displayOrder: (collections.length || 0) + 1,
      isActive: true,
    })
    setModalOpen(true)
  }

  const openEditModal = (col) => {
    setEditingCollection(col)
    setFormData({
      name: col.name || '',
      slug: col.slug || '',
      kicker: col.kicker || 'Signature Collection',
      tagline: col.tagline || '',
      meaning: col.meaning || '',
      intro: col.intro || '',
      story: col.story || '',
      heroImage: col.heroImage || col.coverImage || '/images/editorial/layered-haram-trunk.jpg',
      displayOrder: col.displayOrder || 1,
      isActive: col.isActive !== undefined ? col.isActive : true,
    })
    setModalOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setFeedback({ type: '', message: '' })

    let res
    if (editingCollection) {
      res = await adminCollectionService.updateCollection(editingCollection._id || editingCollection.id, formData)
    } else {
      res = await adminCollectionService.createCollection(formData)
    }

    if (res.success) {
      setModalOpen(false)
      setFeedback({ type: 'success', message: res.message })
      fetchCollections()
    } else {
      setFeedback({ type: 'error', message: res.message })
    }
    setActionLoading(false)
  }

  const handleSoftDelete = async () => {
    if (!deleteCollection) return
    setActionLoading(true)

    const res = await adminCollectionService.deleteCollection(deleteCollection._id || deleteCollection.id)
    if (res.success) {
      setDeleteCollection(null)
      setFeedback({ type: 'success', message: 'Collection soft-deleted successfully (isActive set to false).' })
      fetchCollections()
    } else {
      setFeedback({ type: 'error', message: res.message })
    }
    setActionLoading(false)
  }

  return (
    <>
      <PageHero
        eyebrow="Admin CMS"
        title="Signature Collection Management"
        lede="Create, edit, and soft-delete jewellery collection groupings in MongoDB."
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Admin Collections' }]}
      >
        <div className="mt-6 flex justify-end">
          <Button variant="primary" icon={Plus} iconPosition="left" onClick={openCreateModal}>
            Add New Collection
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

          {/* Search Bar */}
          <div className="mj-panel p-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-charcoal-50" />
              <input
                type="text"
                placeholder="Search collection name or slug..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 pl-9 pr-4 font-sans text-body-xs focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Collections Table */}
          <div className="mj-panel p-6 overflow-hidden">
            {loading ? (
              <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
            ) : !collections.length ? (
              <p className="py-16 text-center text-body-sm text-charcoal-200">
                No collections found matching search criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-body-sm">
                  <thead>
                    <tr className="border-b border-charcoal/10 text-body-xs uppercase tracking-luxe text-charcoal-50">
                      <th className="py-3 pr-4">Collection</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4">Tagline</th>
                      <th className="py-3 px-4 text-center">Order</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/[0.07]">
                    {collections.map((c) => (
                      <tr key={c._id || c.id} className="hover:bg-champagne-50/50 transition-colors">
                        <td className="py-3.5 pr-4 flex items-center gap-3">
                          <SmartImage
                            src={c.heroImage || '/images/editorial/layered-haram-trunk.jpg'}
                            alt=""
                            ratio="aspect-square"
                            rounded="rounded-luxe"
                            className="w-10 shrink-0 border border-charcoal/10"
                          />
                          <div>
                            <p className="font-display font-medium text-charcoal">{c.name}</p>
                            <span className="font-sans text-[0.7rem] text-charcoal-50">{c.kicker}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-body-xs text-bronze">{c.slug}</td>
                        <td className="py-3.5 px-4 font-sans text-body-xs text-charcoal-200 max-w-xs truncate">
                          {c.tagline || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold">{c.displayOrder || 1}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              'inline-block px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase',
                              c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-charcoal/10 text-charcoal-200',
                            )}
                          >
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(c)}
                              className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-champagne-100 hover:text-bronze transition-colors"
                              title="Edit collection"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteCollection(c)}
                              className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Soft delete collection"
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
                {editingCollection ? 'Edit Collection' : 'Create New Collection'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5 text-charcoal-100 hover:text-charcoal" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="Collection Name"
                  name="name"
                  required
                  placeholder="Anantara"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <TextField
                  label="Slug"
                  name="slug"
                  placeholder="anantara"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <TextField
                label="Tagline / Kicker"
                name="tagline"
                placeholder="Bridal Heritage Gold"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />

              <div className="space-y-2">
                <label className="block font-sans text-body-xs font-semibold uppercase tracking-luxe text-charcoal">
                  Intro / Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.intro}
                  onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                  className="w-full rounded-luxe border border-charcoal/15 bg-white p-3 font-sans text-body-xs focus:border-gold focus:outline-none"
                />
              </div>

              <AdminImagePicker
                label="Collection Cover Image"
                folder="mayura/collections"
                value={formData.heroImage}
                onChange={(newUrl) => setFormData({ ...formData, heroImage: newUrl })}
              />

              <div className="flex items-center justify-between border-t border-charcoal/10 pt-4">
                <Checkbox
                  label="Active (Visible in Storefront)"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : editingCollection ? 'Save Changes' : 'Create Collection'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE DIALOG */}
      {deleteCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-panel bg-ivory p-6 shadow-xl">
            <h3 className="font-display text-display-xs text-charcoal">Confirm Soft Delete</h3>
            <p className="mt-3 text-body-sm text-charcoal-200">
              Are you sure you want to soft-delete collection <strong>{deleteCollection.name}</strong>? This sets{' '}
              <code className="bg-champagne-100 px-1 py-0.5 rounded text-bronze">isActive = false</code>,
              hiding it from the public storefront while retaining its MongoDB document.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteCollection(null)}>
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
