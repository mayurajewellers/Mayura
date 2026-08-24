import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Save, ShieldCheck } from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import policyService from '@services/policyService'
import Button from '@components/common/Button'

export default function AdminPoliciesCMSPage() {
  useDocumentTitle('Admin Store Policies CMS')

  const [activePolicy, setActivePolicy] = useState('shipping')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchPolicy = useCallback(async () => {
    setRefreshing(true)
    const res = await policyService.getPolicy(activePolicy)
    if (res.success && res.data) {
      setContent(res.data.content || '')
    }
    setLoading(false)
    setRefreshing(false)
  }, [activePolicy])

  useEffect(() => {
    fetchPolicy()
  }, [fetchPolicy])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await policyService.updatePolicy(activePolicy, { content })
    if (res.success) {
      setMessage(`Store Policy (${activePolicy}) updated successfully.`)
    } else {
      setMessage('Could not update policy.')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
        <div>
          <h2 className="font-display text-body-lg font-bold text-charcoal flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-bronze" /> Legal & Store Policies CMS
          </h2>
          <p className="font-sans text-body-xs text-charcoal-50">Manage customer terms, privacy policies, shipping, and returns.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPolicy} disabled={refreshing} icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {message && (
        <div className="rounded-luxe border border-emerald-500/30 bg-emerald-500/10 p-4 font-sans text-body-xs font-semibold text-emerald-800">
          {message}
        </div>
      )}

      {/* Policy Selector */}
      <div className="flex items-center gap-2 border-b border-charcoal/10 pb-2">
        {['shipping', 'returns', 'privacy', 'terms'].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActivePolicy(key)}
            className={`px-3 py-1.5 rounded-luxe font-sans text-body-xs font-semibold uppercase tracking-luxe ${
              activePolicy === key ? 'bg-gold text-espresso' : 'bg-white text-charcoal-200 border'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
      ) : (
        <form onSubmit={handleSave} className="mj-panel p-6 shadow-sm space-y-4 font-sans text-body-xs">
          <div>
            <label className="block font-semibold uppercase tracking-luxe text-[0.65rem] text-charcoal mb-2">
              Policy HTML Content ({activePolicy})
            </label>
            <textarea
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 font-mono text-body-xs text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" disabled={saving} icon={Save}>
            {saving ? 'Saving Policy…' : `Save ${activePolicy} Policy`}
          </Button>
        </form>
      )}
    </div>
  )
}
