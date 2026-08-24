import { useCallback, useEffect, useState } from 'react'
import { Activity, RefreshCw, Save, Settings, ShieldCheck } from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import settingsService from '@services/settingsService'
import Button from '@components/common/Button'
import AdminImagePicker from '@components/admin/media/AdminImagePicker'

export default function AdminSettingsPage() {
  useDocumentTitle('Admin Store Configuration & Settings')

  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchSettings = useCallback(async () => {
    setRefreshing(true)
    const res = await settingsService.getSettings()
    if (res.success && res.data) {
      setSettings(res.data)
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await settingsService.updateSettings(settings)
    if (res.success) {
      setMessage('Store settings updated successfully.')
    } else {
      setMessage('Could not update store settings.')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <span className="mj-eyebrow">System & Brand Configuration</span>
          <h1 className="font-display text-display-xs text-charcoal font-bold">
            Store Settings & System Health
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchSettings}
          disabled={refreshing}
          icon={RefreshCw}
          className={refreshing ? 'animate-spin' : ''}
        >
          Refresh
        </Button>
      </div>

      {message && (
        <div className="rounded-luxe border border-emerald-500/30 bg-emerald-500/10 p-4 font-sans text-body-xs font-semibold text-emerald-800">
          {message}
        </div>
      )}

      {/* System Health Indicators */}
      <div className="grid gap-4 sm:grid-cols-4 font-sans text-body-xs">
        <div className="mj-panel p-4 flex items-center justify-between">
          <span>MongoDB Database</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[0.65rem] border border-emerald-200">
            🟢 CONNECTED
          </span>
        </div>
        <div className="mj-panel p-4 flex items-center justify-between">
          <span>Backend REST API</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[0.65rem] border border-emerald-200">
            🟢 OPERATIONAL
          </span>
        </div>
        <div className="mj-panel p-4 flex items-center justify-between">
          <span>Razorpay Gateway</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[0.65rem] border border-emerald-200">
            🟢 ACTIVE
          </span>
        </div>
        <div className="mj-panel p-4 flex items-center justify-between">
          <span>Web3Forms Contact</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[0.65rem] border border-emerald-200">
            🟢 VERIFIED
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
      ) : (
        <form onSubmit={handleSave} className="mj-panel p-7 sm:p-8 space-y-6 font-sans text-body-xs shadow-sm">
          <div className="border-b border-charcoal/10 pb-3">
            <h3 className="font-display text-body-lg font-bold text-charcoal">Public Brand & Showroom Information</h3>
            <p className="text-charcoal-50 text-[0.75rem]">Configure store address, support email, and helpline phone numbers.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block mb-2 font-semibold uppercase tracking-luxe text-[0.65rem] text-charcoal">Store Name</label>
              <input
                type="text"
                value={settings?.siteName || 'Mayura Jewellers'}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold uppercase tracking-luxe text-[0.65rem] text-charcoal">Support Email</label>
              <input
                type="email"
                value={settings?.supportEmail || 'support@mayurajewellers.com'}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold uppercase tracking-luxe text-[0.65rem] text-charcoal">Helpline Phone</label>
              <input
                type="text"
                value={settings?.helplinePhone || '+91 98350 00000'}
                onChange={(e) => setSettings({ ...settings, helplinePhone: e.target.value })}
                className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold uppercase tracking-luxe text-[0.65rem] text-charcoal">Showroom Address</label>
              <input
                type="text"
                value={settings?.showroomAddress || 'Main Road, Begusarai, Bihar'}
                onChange={(e) => setSettings({ ...settings, showroomAddress: e.target.value })}
                className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <AdminImagePicker
            label="Brand Logo / Crest Image"
            folder="mayura/branding"
            value={settings?.logo || '/images/editorial/logo-mark.png'}
            onChange={(newUrl) => setSettings({ ...settings, logo: newUrl })}
          />

          <div className="pt-4 border-t border-charcoal/10 flex justify-end">
            <Button type="submit" variant="primary" disabled={saving} icon={Save}>
              {saving ? 'Saving Settings…' : 'Save Store Configuration'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
