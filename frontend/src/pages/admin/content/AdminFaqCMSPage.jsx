import { useCallback, useEffect, useState } from 'react'
import { HelpCircle, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import faqService from '@services/faqService'
import Button from '@components/common/Button'

export default function AdminFaqCMSPage() {
  useDocumentTitle('Admin FAQ CMS')

  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ question: '', answer: '', category: 'general' })

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

  const handleCreate = async (e) => {
    e.preventDefault()
    const res = await faqService.createFaq(formData)
    if (res.success) {
      setShowModal(false)
      setFormData({ question: '', answer: '', category: 'general' })
      fetchFaqs()
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Soft-delete this FAQ item?')) return
    const res = await faqService.deleteFaq(id)
    if (res.success) fetchFaqs()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
        <div>
          <h2 className="font-display text-body-lg font-bold text-charcoal flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-bronze" /> Frequently Asked Questions CMS
          </h2>
          <p className="font-sans text-body-xs text-charcoal-50">Manage customer enquiry FAQs and store policy help guides.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchFaqs} disabled={refreshing} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)} icon={Plus}>
            Add FAQ Question
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
      ) : !faqs.length ? (
        <div className="py-16 text-center text-body-sm text-charcoal-200">No FAQ entries registered.</div>
      ) : (
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f._id} className="mj-panel p-5 space-y-2 relative group font-sans text-body-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-semibold text-charcoal text-body-sm">{f.question}</h4>
                <span className="uppercase text-[0.65rem] text-bronze font-bold">{f.category}</span>
              </div>
              <p className="text-charcoal-200">{f.answer}</p>
              <button
                onClick={() => handleDelete(f._id)}
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
            <h3 className="font-display text-body-lg font-bold text-charcoal">Add FAQ Question</h3>
            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem]">Question</label>
              <input required type="text" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="w-full rounded-luxe border p-2.5" />
            </div>
            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem]">Answer</label>
              <textarea required rows={3} value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} className="w-full rounded-luxe border p-2.5" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save FAQ</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
