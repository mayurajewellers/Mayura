import { useCallback, useEffect, useState } from 'react'
import { Image as ImageIcon, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import galleryService from '@services/galleryService'
import Button from '@components/common/Button'
import SmartImage from '@components/common/SmartImage'
import AdminImagePicker from '@components/admin/media/AdminImagePicker'

export default function AdminGalleryCMSPage() {
  useDocumentTitle('Admin Media Gallery CMS')

  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', image: '', category: 'showroom' })

  const fetchGallery = useCallback(async () => {
    setRefreshing(true)
    const res = await galleryService.getAdminGallery()
    if (res.success && res.data?.gallery) {
      setGallery(res.data.gallery)
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const handleCreate = async (e) => {
    e.preventDefault()
    const res = await galleryService.createGalleryItem(formData)
    if (res.success) {
      setShowModal(false)
      setFormData({ title: '', image: '', category: 'showroom' })
      fetchGallery()
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Soft-delete this gallery item?')) return
    const res = await galleryService.deleteGalleryItem(id)
    if (res.success) fetchGallery()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
        <div>
          <h2 className="font-display text-body-lg font-bold text-charcoal flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-bronze" /> Showroom Gallery CMS
          </h2>
          <p className="font-sans text-body-xs text-charcoal-50">Manage showroom imagery and editorial photo grid items.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchGallery} disabled={refreshing} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)} icon={Plus}>
            Add Gallery Item
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
      ) : !gallery.length ? (
        <div className="py-16 text-center text-body-sm text-charcoal-200">No gallery items uploaded.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {gallery.map((g) => (
            <div key={g._id} className="mj-panel p-3 space-y-2 relative group overflow-hidden">
              <SmartImage src={g.image || '/images/editorial/studs-gold-rosette.jpg'} alt="" ratio="aspect-square" rounded="rounded-luxe" />
              <div className="flex items-center justify-between">
                <h4 className="font-display font-semibold text-charcoal text-body-xs truncate">{g.title || 'Showroom Photo'}</h4>
                <span className="uppercase text-[0.6rem] text-bronze font-bold">{g.category}</span>
              </div>
              <button
                onClick={() => handleDelete(g._id)}
                className="absolute top-4 right-4 text-white bg-rose-600/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs">
          <form onSubmit={handleCreate} className="w-full max-w-md rounded-panel bg-white p-6 shadow-2xl space-y-4 font-sans text-body-xs">
            <h3 className="font-display text-body-lg font-bold text-charcoal">Add Gallery Asset</h3>
            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem]">Title / Caption</label>
              <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-luxe border p-2.5" />
            </div>
            <AdminImagePicker
              label="Gallery Image"
              folder="mayura/gallery"
              value={formData.image}
              onChange={(newUrl) => setFormData({ ...formData, image: newUrl })}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Gallery Item</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
