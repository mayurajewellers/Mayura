import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Save, Sparkles } from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import homepageService from '@services/homepageService'
import Button from '@components/common/Button'
import AdminImagePicker from '@components/admin/media/AdminImagePicker'

export default function AdminHomepageCMSPage() {
  useDocumentTitle('Admin Homepage CMS')

  const [homepageData, setHomepageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchHomepage = useCallback(async () => {
    setRefreshing(true)
    const res = await homepageService.getHomepage()
    if (res.success && res.data) {
      setHomepageData(res.data)
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchHomepage()
  }, [fetchHomepage])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await homepageService.updateHomepageSection('hero', homepageData?.hero || {})
    if (res.success) {
      setMessage('Homepage CMS section saved successfully.')
    } else {
      setMessage('Could not save homepage section.')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
        <div>
          <h2 className="font-display text-body-lg font-bold text-charcoal flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-bronze" /> Homepage Editorial CMS
          </h2>
          <p className="font-sans text-body-xs text-charcoal-50">Manage hero headings and featured section settings.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHomepage} disabled={refreshing} icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {message && (
        <div className="rounded-luxe border border-emerald-500/30 bg-emerald-500/10 p-4 font-sans text-body-xs font-semibold text-emerald-800">
          {message}
        </div>
      )}

      {loading ? (
        <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
      ) : (
        <form onSubmit={handleSave} className="mj-panel p-6 shadow-sm space-y-6 font-sans text-body-xs">
          <div>
            <label className="block font-semibold uppercase tracking-luxe text-[0.65rem] text-charcoal mb-2">Hero Main Title</label>
            <input
              type="text"
              value={homepageData?.hero?.title || 'Crafting Eternal Gold & Diamond Treasures'}
              onChange={(e) => setHomepageData({ ...homepageData, hero: { ...(homepageData?.hero || {}), title: e.target.value } })}
              className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-luxe text-[0.65rem] text-charcoal mb-2">Hero Subtitle</label>
            <textarea
              rows={3}
              value={homepageData?.hero?.subtitle || 'Four generations of certified craftsmanship across Bihar.'}
              onChange={(e) => setHomepageData({ ...homepageData, hero: { ...(homepageData?.hero || {}), subtitle: e.target.value } })}
              className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <AdminImagePicker
            label="Featured Hero Section Image"
            folder="mayura/homepage"
            value={homepageData?.hero?.image || '/images/editorial/layered-haram-trunk.jpg'}
            onChange={(newUrl) => setHomepageData({ ...homepageData, hero: { ...(homepageData?.hero || {}), image: newUrl } })}
          />

          <Button type="submit" variant="primary" disabled={saving} icon={Save}>
            {saving ? 'Saving Section…' : 'Save Homepage CMS'}
          </Button>
        </form>
      )}
    </div>
  )
}
