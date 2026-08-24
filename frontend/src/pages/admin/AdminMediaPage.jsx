import { useCallback, useEffect, useState } from 'react'
import { Edit2, Image as ImageIcon, Plus, Search, Trash2, X } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle } from '@hooks/index'
import adminMediaService from '@services/adminMediaService'
import PageHero from '@components/layout/PageHero'
import Button from '@components/common/Button'
import { Checkbox, TextField } from '@components/common/Field'
import SmartImage from '@components/common/SmartImage'
import cn from '@utils/cn'

export default function AdminMediaPage() {
  useDocumentTitle('Admin Media Library')

  const [mediaList, setMediaList] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [folder, setFolder] = useState('')
  const [provider, setProvider] = useState('')
  const [page, setPage] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingMedia, setEditingMedia] = useState(null)
  const [deleteMedia, setDeleteMedia] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const [formData, setFormData] = useState({
    name: '',
    publicId: '',
    url: '',
    provider: 'local',
    resourceType: 'image',
    folder: 'general',
    altText: '',
    caption: '',
    isActive: true,
  })

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    setFeedback({ type: '', message: '' })

    const params = { page, limit: 12 }
    if (search.trim()) params.search = search.trim()
    if (folder) params.folder = folder
    if (provider) params.provider = provider

    const res = await adminMediaService.getAdminMedia(params)

    if (res.success) {
      setMediaList(res.media)
      setPagination(res.pagination)
    } else {
      setFeedback({ type: 'error', message: res.message || 'Could not load media records.' })
    }
    setLoading(false)
  }, [page, search, folder, provider])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const openCreateModal = () => {
    setEditingMedia(null)
    setFormData({
      name: '',
      publicId: `media-${Date.now()}`,
      url: '/images/editorial/layered-haram-trunk.jpg',
      provider: 'local',
      resourceType: 'image',
      folder: 'general',
      altText: '',
      caption: '',
      isActive: true,
    })
    setModalOpen(true)
  }

  const openEditModal = (m) => {
    setEditingMedia(m)
    setFormData({
      name: m.name || '',
      publicId: m.publicId || '',
      url: m.url || '',
      provider: m.provider || 'local',
      resourceType: m.resourceType || 'image',
      folder: m.folder || 'general',
      altText: m.altText || '',
      caption: m.caption || '',
      isActive: m.isActive !== undefined ? m.isActive : true,
    })
    setModalOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setFeedback({ type: '', message: '' })

    let res
    if (editingMedia) {
      res = await adminMediaService.updateMedia(editingMedia._id || editingMedia.id, formData)
    } else {
      res = await adminMediaService.createMedia(formData)
    }

    if (res.success) {
      setModalOpen(false)
      setFeedback({ type: 'success', message: res.message })
      fetchMedia()
    } else {
      setFeedback({ type: 'error', message: res.message })
    }
    setActionLoading(false)
  }

  const handleSoftDelete = async () => {
    if (!deleteMedia) return
    setActionLoading(true)

    const res = await adminMediaService.deleteMedia(deleteMedia._id || deleteMedia.id)
    if (res.success) {
      setDeleteMedia(null)
      setFeedback({ type: 'success', message: 'Media record soft-deleted successfully.' })
      fetchMedia()
    } else {
      setFeedback({ type: 'error', message: res.message || 'Media deletion refused by server (it may be referenced by an active banner).' })
    }
    setActionLoading(false)
  }

  return (
    <>
      <PageHero
        eyebrow="Admin CMS"
        title="Media Library Records"
        lede="Register, organize, and manage storage-agnostic media asset records in MongoDB."
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Admin Media' }]}
      >
        <div className="mt-6 flex justify-end">
          <Button variant="primary" icon={Plus} iconPosition="left" onClick={openCreateModal}>
            Register Media Asset
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
                  placeholder="Search media name or publicId..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 pl-9 pr-4 font-sans text-body-xs focus:border-gold focus:outline-none"
                />
              </div>

              <select
                value={folder}
                onChange={(e) => {
                  setFolder(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
              >
                <option value="">All Folders</option>
                <option value="general">general</option>
                <option value="banners">banners</option>
                <option value="products">products</option>
                <option value="editorial">editorial</option>
              </select>

              <select
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
              >
                <option value="">All Storage Providers</option>
                <option value="local">local</option>
                <option value="cloudinary">cloudinary</option>
                <option value="external">external</option>
              </select>
            </div>
          </div>

          {/* Media Records Grid */}
          <div className="mj-panel p-6 overflow-hidden">
            {loading ? (
              <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
            ) : !mediaList.length ? (
              <p className="py-16 text-center text-body-sm text-charcoal-200">
                No media assets found matching criteria.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {mediaList.map((m) => (
                  <div key={m._id || m.id} className="rounded-luxe border border-charcoal/10 bg-white p-4 space-y-3 hover:border-gold transition-all">
                    <SmartImage
                      src={m.url || '/images/editorial/layered-haram-trunk.jpg'}
                      alt={m.altText || m.name}
                      ratio="aspect-square"
                      rounded="rounded-luxe"
                      className="w-full border border-charcoal/10"
                    />
                    <div>
                      <h4 className="font-display font-medium text-charcoal truncate text-body-sm">{m.name}</h4>
                      <p className="font-mono text-[0.65rem] text-bronze truncate">{m.publicId}</p>
                    </div>
                    <div className="flex items-center justify-between text-[0.65rem] font-sans">
                      <span className="px-2 py-0.5 rounded-full bg-champagne-100 text-charcoal uppercase font-semibold">{m.provider}</span>
                      <span className={cn('px-2 py-0.5 rounded-full font-bold uppercase', m.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-charcoal/10 text-charcoal-200')}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-charcoal/10 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-champagne-100 hover:text-bronze transition-colors"
                        title="Edit media metadata"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteMedia(m)}
                        className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Soft delete media"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
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
                {editingMedia ? 'Edit Media Record' : 'Register New Media Asset'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5 text-charcoal-100 hover:text-charcoal" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="Media Name"
                  name="name"
                  required
                  placeholder="Layered Haram Trunk Image"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <TextField
                  label="Public ID"
                  name="publicId"
                  required
                  placeholder="editorial-haram-trunk-01"
                  value={formData.publicId}
                  onChange={(e) => setFormData({ ...formData, publicId: e.target.value })}
                />
              </div>

              <TextField
                label="Asset URL"
                name="url"
                required
                placeholder="/images/editorial/layered-haram-trunk.jpg"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />

              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block font-sans text-body-xs font-semibold uppercase tracking-luxe text-charcoal">
                    Provider
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
                  >
                    <option value="local">local</option>
                    <option value="cloudinary">cloudinary</option>
                    <option value="external">external</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-sans text-body-xs font-semibold uppercase tracking-luxe text-charcoal">
                    Resource Type
                  </label>
                  <select
                    value={formData.resourceType}
                    onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                    className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
                  >
                    <option value="image">image</option>
                    <option value="video">video</option>
                  </select>
                </div>

                <TextField
                  label="Folder"
                  name="folder"
                  value={formData.folder}
                  onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between border-t border-charcoal/10 pt-4">
                <Checkbox
                  label="Active Asset"
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
                  {actionLoading ? 'Saving...' : editingMedia ? 'Save Changes' : 'Register Asset'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE DIALOG */}
      {deleteMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-panel bg-ivory p-6 shadow-xl">
            <h3 className="font-display text-display-xs text-charcoal">Confirm Soft Delete</h3>
            <p className="mt-3 text-body-sm text-charcoal-200">
              Are you sure you want to soft-delete media <strong>{deleteMedia.name}</strong>? This sets{' '}
              <code className="bg-champagne-100 px-1 py-0.5 rounded text-bronze">isActive = false</code>.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteMedia(null)}>
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
