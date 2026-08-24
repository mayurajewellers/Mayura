import { useCallback, useEffect, useState } from 'react'
import { Plus, RefreshCw, Save, ShieldCheck, Trash2, X } from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import policyService from '@services/policyService'
import Button from '@components/common/Button'
import { TextField } from '@components/common/Field'

export default function AdminPoliciesCMSPage() {
  useDocumentTitle('Admin Store Policies CMS')

  const [policies, setPolicies] = useState([])
  const [activePolicySlug, setActivePolicySlug] = useState('shipping')
  const [currentPolicy, setCurrentPolicy] = useState(null)

  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [intro, setIntro] = useState('')

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [newPolicyData, setNewPolicyData] = useState({
    title: '',
    slug: '',
    kicker: 'Store Policy',
    intro: '',
    content: '',
  })

  const fetchPolicies = useCallback(async () => {
    setRefreshing(true)
    const res = await policyService.getAdminPolicies()
    if (res.success && res.data?.policies) {
      setPolicies(res.data.policies)
      const active = res.data.policies.find((p) => p.slug === activePolicySlug) || res.data.policies[0]
      if (active) {
        setActivePolicySlug(active.slug)
        setCurrentPolicy(active)
        setTitle(active.title || '')
        setIntro(active.intro || '')
        setContent(active.content || (active.sections ? JSON.stringify(active.sections, null, 2) : ''))
      }
    }
    setLoading(false)
    setRefreshing(false)
  }, [activePolicySlug])

  useEffect(() => {
    fetchPolicies()
  }, [fetchPolicies])

  const handleSelectPolicy = (p) => {
    setActivePolicySlug(p.slug)
    setCurrentPolicy(p)
    setTitle(p.title || '')
    setIntro(p.intro || '')
    setContent(p.content || (p.sections ? JSON.stringify(p.sections, null, 2) : ''))
    setMessage('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!currentPolicy) return
    setSaving(true)
    setMessage('')

    const payload = {
      title,
      intro,
      content,
      sections: [{ heading: title, body: content }],
    }

    const res = await policyService.updatePolicy(currentPolicy._id || currentPolicy.slug, payload)
    if (res.success) {
      setMessage(`Store Policy (${currentPolicy.slug}) updated successfully.`)
      fetchPolicies()
    } else {
      setMessage(res.message || 'Could not update policy.')
    }
    setSaving(false)
  }

  const handleCreatePolicy = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const payload = {
      title: newPolicyData.title,
      slug: newPolicyData.slug.toLowerCase().trim().replace(/\s+/g, '-'),
      kicker: newPolicyData.kicker || 'Store Policy',
      intro: newPolicyData.intro,
      sections: [{ heading: newPolicyData.title, body: newPolicyData.content }],
      content: newPolicyData.content,
      isActive: true,
    }

    const res = await policyService.createPolicy(payload)
    if (res.success) {
      setShowAddModal(false)
      setMessage(`New policy '${newPolicyData.title}' created successfully!`)
      setActivePolicySlug(payload.slug)
      setNewPolicyData({ title: '', slug: '', kicker: 'Store Policy', intro: '', content: '' })
      fetchPolicies()
    } else {
      setMessage(res.message || 'Failed to create policy.')
    }
    setSaving(false)
  }

  const handleDeletePolicy = async (p) => {
    if (!window.confirm(`Deactivate policy '${p.title}'?`)) return
    const res = await policyService.deletePolicy(p._id || p.slug)
    if (res.success) {
      setMessage(`Policy '${p.title}' deactivated.`)
      fetchPolicies()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <h2 className="font-display text-body-lg font-bold text-charcoal flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-bronze" /> Legal & Store Policies CMS
          </h2>
          <p className="font-sans text-body-xs text-charcoal-50">Manage terms, privacy, shipping, returns, and custom store policies.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchPolicies} disabled={refreshing} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)} icon={Plus}>
            Add Store Policy
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-luxe border border-emerald-500/30 bg-emerald-500/10 p-4 font-sans text-body-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Policy Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-charcoal/10 pb-3 overflow-x-auto">
        {policies.map((p) => (
          <div key={p.slug || p._id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSelectPolicy(p)}
              className={`px-3.5 py-2 rounded-luxe font-sans text-body-xs font-semibold uppercase tracking-luxe transition-all ${
                activePolicySlug === p.slug ? 'bg-gold text-espresso shadow-sm' : 'bg-white text-charcoal-200 border hover:bg-champagne-50'
              }`}
            >
              {p.title || p.slug}
            </button>
            <button
              onClick={() => handleDeletePolicy(p)}
              className="p-1.5 text-charcoal-100 hover:text-rose-600 rounded-luxe transition-colors"
              title="Deactivate policy"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
      ) : currentPolicy ? (
        <form onSubmit={handleSave} className="mj-panel p-6 shadow-sm space-y-4 font-sans text-body-xs">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Policy Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem] text-charcoal">Slug ID</label>
              <input
                disabled
                value={currentPolicy.slug}
                className="w-full rounded-luxe border border-charcoal/20 bg-charcoal/5 p-2.5 font-mono text-body-xs text-charcoal-200 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold uppercase text-[0.65rem] text-charcoal">Policy Intro Summary</label>
            <input
              type="text"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              className="w-full rounded-luxe border border-charcoal/20 bg-white p-2.5 text-body-xs text-charcoal focus:border-gold focus:outline-none"
              placeholder="Brief summary of policy terms..."
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-luxe text-[0.65rem] text-charcoal mb-2">
              Policy Details & Terms Body
            </label>
            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 font-sans text-body-xs text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" disabled={saving} icon={Save}>
            {saving ? 'Saving Policy…' : `Save ${currentPolicy.title || currentPolicy.slug} Policy`}
          </Button>
        </form>
      ) : (
        <div className="py-12 text-center text-body-xs text-charcoal-200">No policy selected. Click "Add Store Policy" to register one.</div>
      )}

      {/* CREATE POLICY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs overflow-y-auto">
          <form onSubmit={handleCreatePolicy} className="w-full max-w-lg rounded-panel bg-white p-6 shadow-2xl space-y-4 font-sans text-body-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <h3 className="font-display text-body-lg font-bold text-charcoal">Add New Store Policy</h3>
              <button type="button" onClick={() => setShowAddModal(false)}><X className="h-5 w-5 text-charcoal-100" /></button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Policy Title"
                placeholder="Lifetime Warranty Policy"
                value={newPolicyData.title}
                onChange={(e) => {
                  const val = e.target.value
                  setNewPolicyData((prev) => ({
                    ...prev,
                    title: val,
                    slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  }))
                }}
                required
              />
              <TextField
                label="Policy Slug"
                placeholder="lifetime-warranty"
                value={newPolicyData.slug}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, slug: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem]">Policy Intro</label>
              <input
                type="text"
                placeholder="Overview of warranty coverage and claims..."
                value={newPolicyData.intro}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, intro: e.target.value })}
                className="w-full rounded-luxe border p-2.5"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold uppercase text-[0.65rem]">Policy Body / Terms Content</label>
              <textarea
                required
                rows={6}
                placeholder="Enter complete policy terms and conditions..."
                value={newPolicyData.content}
                onChange={(e) => setNewPolicyData({ ...newPolicyData, content: e.target.value })}
                className="w-full rounded-luxe border p-2.5"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-charcoal/10">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Creating…' : 'Create Policy'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
