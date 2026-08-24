import { useCallback, useEffect, useState } from 'react'
import { Edit2, Plus, RefreshCw, Star, Trash2, X } from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import testimonialService from '@services/testimonialService'
import Button from '@components/common/Button'
import { Checkbox, TextField } from '@components/common/Field'

export default function AdminTestimonialsCMSPage() {
  useDocumentTitle('Admin Testimonials CMS')

  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    content: '',
    location: '',
    isFeatured: false,
    isActive: true,
  })

  const fetchTestimonials = useCallback(async () => {
    setRefreshing(true)
    const res = await testimonialService.getAdminTestimonials()
    if (res.success && res.data?.testimonials) {
      setTestimonials(res.data.testimonials)
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  const openCreateModal = () => {
    setEditingTestimonial(null)
    setFormData({ name: '', rating: 5, content: '', location: 'Verified Buyer', isFeatured: false, isActive: true })
    setShowModal(true)
  }

  const openEditModal = (t) => {
    setEditingTestimonial(t)
    setFormData({
      name: t.name || '',
      rating: t.rating || 5,
      content: t.content || t.quote || '',
      location: t.location || 'Verified Buyer',
      isFeatured: Boolean(t.isFeatured),
      isActive: t.isActive !== undefined ? Boolean(t.isActive) : true,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    let res
    if (editingTestimonial) {
      res = await testimonialService.updateTestimonial(editingTestimonial._id || editingTestimonial.id, formData)
    } else {
      res = await testimonialService.createTestimonial(formData)
    }

    if (res.success) {
      setShowModal(false)
      setMessage(editingTestimonial ? 'Testimonial updated successfully!' : 'New testimonial added successfully!')
      fetchTestimonials()
    } else {
      setMessage(res.message || 'Failed to save testimonial.')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Soft-delete this testimonial review?')) return
    const res = await testimonialService.deleteTestimonial(id)
    if (res.success) {
      setMessage('Testimonial deactivated.')
      fetchTestimonials()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <h2 className="font-display text-body-lg font-bold text-charcoal flex items-center gap-2">
            <Star className="h-5 w-5 text-bronze" /> Testimonials CMS
          </h2>
          <p className="font-sans text-body-xs text-charcoal-50">Manage customer review quotes and verified ratings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchTestimonials} disabled={refreshing} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={openCreateModal} icon={Plus}>
            Add Testimonial
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-luxe border border-emerald-500/30 bg-emerald-500/10 p-4 font-sans text-body-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {loading ? (
        <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
      ) : !testimonials.length ? (
        <div className="py-16 text-center text-body-sm text-charcoal-200">No customer testimonials recorded. Click "Add Testimonial" above.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t._id || t.id} className="mj-panel p-5 space-y-3 relative group hover:border-gold transition-all">
              <div className="flex items-center justify-between pr-16">
                <div>
                  <h4 className="font-display font-semibold text-charcoal">{t.name}</h4>
                  <span className="text-[0.65rem] text-charcoal-50">{t.location || 'Verified Buyer'}</span>
                </div>
                <div className="flex items-center text-amber-500 text-body-xs">
                  {'★'.repeat(t.rating || 5)}
                </div>
              </div>
              <p className="font-sans text-body-xs text-charcoal-200 italic pr-16">"{t.content || t.quote}"</p>
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-champagne-100 hover:text-bronze transition-colors"
                  title="Edit testimonial"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(t._id || t.id)}
                  className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Soft delete testimonial"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs overflow-y-auto">
          <form onSubmit={handleSave} className="w-full max-w-md rounded-panel bg-white p-6 shadow-2xl space-y-4 font-sans text-body-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <h3 className="font-display text-body-lg font-bold text-charcoal">
                {editingTestimonial ? 'Edit Testimonial Quote' : 'Add Testimonial Quote'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)}><X className="h-5 w-5 text-charcoal-100" /></button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Customer Name"
                required
                placeholder="Priya Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                label="Location / Badge"
                placeholder="Verified Buyer — Mumbai"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem]">Star Rating (1 to 5)</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value, 10) })}
                className="w-full rounded-luxe border border-charcoal/20 bg-white p-2.5 text-body-xs text-charcoal focus:border-gold focus:outline-none"
              >
                <option value={5}>★★★★★ (5 Stars)</option>
                <option value={4}>★★★★☆ (4 Stars)</option>
                <option value={3}>★★★☆☆ (3 Stars)</option>
                <option value={2}>★★☆☆☆ (2 Stars)</option>
                <option value={1}>★☆☆☆☆ (1 Star)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem]">Quote Content</label>
              <textarea
                required
                rows={4}
                placeholder="Enter customer review quote..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full rounded-luxe border border-charcoal/20 bg-white p-2.5 text-body-xs text-charcoal focus:border-gold focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between border-t border-charcoal/10 pt-3">
              <Checkbox
                label="Featured Review"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              <Checkbox
                label="Active Review"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save Testimonial'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
