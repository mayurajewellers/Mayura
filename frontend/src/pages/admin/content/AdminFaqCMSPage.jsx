import { useCallback, useEffect, useState } from 'react'
import { Edit2, HelpCircle, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import faqService from '@services/faqService'
import Button from '@components/common/Button'
import { Checkbox, TextField } from '@components/common/Field'

export default function AdminFaqCMSPage() {
  useDocumentTitle('Admin FAQ CMS')

  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    isActive: true,
  })

  const fetchFaqs = useCallback(async () => {
    setRefreshing(true)
    const res = await faqService.getAdminFaqs()
    if (res.success && res.data?.faqs) {
      setFaqs(res.data.faqs)
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchFaqs()
  }, [fetchFaqs])

  const openCreateModal = () => {
    setEditingFaq(null)
    setFormData({ question: '', answer: '', category: 'general', isActive: true })
    setShowModal(true)
  }

  const openEditModal = (faq) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question || faq.q || '',
      answer: faq.answer || faq.a || '',
      category: faq.category || 'general',
      isActive: faq.isActive !== undefined ? faq.isActive : true,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    let res
    if (editingFaq) {
      res = await faqService.updateFaq(editingFaq._id || editingFaq.id, formData)
    } else {
      res = await faqService.createFaq(formData)
    }

    if (res.success) {
      setShowModal(false)
      setMessage(editingFaq ? 'FAQ question updated successfully!' : 'New FAQ question added successfully!')
      fetchFaqs()
    } else {
      setMessage(res.message || 'Failed to save FAQ entry.')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Soft-delete this FAQ item?')) return
    const res = await faqService.deleteFaq(id)
    if (res.success) {
      setMessage('FAQ item deactivated.')
      fetchFaqs()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <h2 className="font-display text-body-lg font-bold text-charcoal flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-bronze" /> Frequently Asked Questions CMS
          </h2>
          <p className="font-sans text-body-xs text-charcoal-50">Manage customer enquiry FAQs, categories, and answers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchFaqs} disabled={refreshing} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={openCreateModal} icon={Plus}>
            Add FAQ Question
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
      ) : !faqs.length ? (
        <div className="py-16 text-center text-body-sm text-charcoal-200">No FAQ entries registered. Click "Add FAQ Question" above.</div>
      ) : (
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f._id || f.id} className="mj-panel p-5 space-y-2 relative group font-sans text-body-xs hover:border-gold transition-all">
              <div className="flex items-center justify-between pr-16">
                <h4 className="font-display font-semibold text-charcoal text-body-sm">{f.question || f.q}</h4>
                <span className="uppercase text-[0.65rem] bg-champagne-100 px-2 py-0.5 rounded-full text-bronze font-bold">{f.category || 'general'}</span>
              </div>
              <p className="text-charcoal-200 pr-16">{f.answer || f.a}</p>
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(f)}
                  className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-champagne-100 hover:text-bronze transition-colors"
                  title="Edit FAQ"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(f._id || f.id)}
                  className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Soft delete FAQ"
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
                {editingFaq ? 'Edit FAQ Question' : 'Add FAQ Question'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)}><X className="h-5 w-5 text-charcoal-100" /></button>
            </div>

            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem]">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-luxe border border-charcoal/20 bg-white p-2.5 text-body-xs text-charcoal focus:border-gold focus:outline-none uppercase"
              >
                <option value="general">General Merchandise & Orders</option>
                <option value="purity">Gold Purity & Hallmarking</option>
                <option value="customization">Bridal & Custom Orders</option>
                <option value="shipping">Shipping & Security</option>
                <option value="returns">Returns & Exchange Policy</option>
                <option value="care">Jewellery Care & Cleaning</option>
              </select>
            </div>

            <TextField
              label="Question"
              required
              placeholder="What gold purity hallmarks do you offer?"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            />

            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem]">Answer</label>
              <textarea
                required
                rows={4}
                placeholder="Enter complete answer for customers..."
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="w-full rounded-luxe border border-charcoal/20 bg-white p-2.5 text-body-xs text-charcoal focus:border-gold focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between border-t border-charcoal/10 pt-3">
              <Checkbox
                label="Active FAQ"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save FAQ'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
