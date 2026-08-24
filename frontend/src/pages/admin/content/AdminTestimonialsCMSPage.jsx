import { useCallback, useEffect, useState } from 'react'
import { Plus, RefreshCw, Star, Trash2 } from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import testimonialService from '@services/testimonialService'
import Button from '@components/common/Button'

export default function AdminTestimonialsCMSPage() {
  useDocumentTitle('Admin Testimonials CMS')

  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', rating: 5, content: '', location: '' })

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

  const handleCreate = async (e) => {
    e.preventDefault()
    const res = await testimonialService.createTestimonial(formData)
    if (res.success) {
      setShowModal(false)
      setFormData({ name: '', rating: 5, content: '', location: '' })
      fetchTestimonials()
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Soft-delete this testimonial review?')) return
    const res = await testimonialService.deleteTestimonial(id)
    if (res.success) fetchTestimonials()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
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
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)} icon={Plus}>
            Add Testimonial
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
      ) : !testimonials.length ? (
        <div className="py-16 text-center text-body-sm text-charcoal-200">No customer testimonials recorded.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t._id} className="mj-panel p-5 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-semibold text-charcoal">{t.name}</h4>
                  <span className="text-[0.65rem] text-charcoal-50">{t.location || 'Verified Buyer'}</span>
                </div>
                <div className="flex items-center text-amber-500 text-body-xs">
                  {'★'.repeat(t.rating || 5)}
                </div>
              </div>
              <p className="font-sans text-body-xs text-charcoal-200 italic">"{t.content}"</p>
              <button
                onClick={() => handleDelete(t._id)}
                className="absolute top-4 right-4 text-charcoal-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs">
          <form onSubmit={handleCreate} className="w-full max-w-md rounded-panel bg-white p-6 shadow-2xl space-y-4 font-sans text-body-xs">
            <h3 className="font-display text-body-lg font-bold text-charcoal">Add Testimonial Quote</h3>
            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem]">Customer Name</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-luxe border p-2.5" />
            </div>
            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem]">Quote Content</label>
              <textarea required rows={3} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full rounded-luxe border p-2.5" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Testimonial</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
