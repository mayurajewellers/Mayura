import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Filter, Mail, RefreshCw, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import newsletterService from '@services/newsletterService'
import Button from '@components/common/Button'
import cn from '@utils/cn'

export default function AdminNewsletterPage() {
  useDocumentTitle('Insiders Newsletter Subscribers — Mayura Admin')

  const [subscribers, setSubscribers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [updatingId, setUpdatingId] = useState(null)
  const [feedback, setFeedback] = useState('')

  const fetchSubscribers = useCallback(async () => {
    setRefreshing(true)
    setErrorMessage('')

    const params = {
      page,
      limit: 20,
    }
    if (statusFilter) params.status = statusFilter
    if (search.trim()) params.search = search.trim()

    const res = await newsletterService.getAdminNewsletter(params)

    if (res.success) {
      setSubscribers(res.subscribers || [])
      setPagination(res.pagination || null)
    } else {
      if (res.status === 401) {
        setErrorMessage('Your admin session has expired. Please log in again.')
      } else if (res.status === 403) {
        setErrorMessage('You do not have permission to access this page.')
      } else {
        setErrorMessage(res.message || 'Unable to load newsletter subscribers.')
      }
    }
    setLoading(false)
    setRefreshing(false)
  }, [statusFilter, search, page])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  const handleToggleStatus = async (subscriber) => {
    if (!subscriber) return
    setUpdatingId(subscriber._id)
    setFeedback('')

    const targetStatus = subscriber.status === 'SUBSCRIBED' ? 'UNSUBSCRIBED' : 'SUBSCRIBED'
    const res = await newsletterService.updateSubscriberStatus(subscriber._id, {
      status: targetStatus,
    })

    if (res.success) {
      setFeedback(`Updated ${subscriber.email} to ${targetStatus}.`)
      fetchSubscribers()
    } else {
      setFeedback(res.message || 'Failed to update subscriber status.')
    }
    setUpdatingId(null)
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <span className="mj-eyebrow">Customer Operations</span>
          <h1 className="font-display text-display-xs text-charcoal font-bold">
            Insiders Newsletter Subscribers
          </h1>
          <p className="text-body-xs text-charcoal-50 mt-1">
            Manage subscribed email lists, signup acquisition channels, and subscription statuses.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchSubscribers}
          disabled={refreshing}
          icon={RefreshCw}
          className={refreshing ? 'animate-spin' : ''}
        >
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-panel border border-rose-200 bg-rose-50 p-4 text-body-xs font-semibold text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchSubscribers}>
            Retry
          </Button>
        </div>
      )}

      {/* Action Feedback */}
      {feedback && (
        <div className="rounded-luxe border border-emerald-500/30 bg-emerald-500/10 p-3 font-sans text-body-xs font-semibold text-emerald-800">
          {feedback}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-panel bg-white p-4 border border-charcoal/10 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-100" />
            <input
              type="text"
              placeholder="Search subscriber email address…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-luxe border border-charcoal/15 bg-champagne-50/50 py-2 pl-10 pr-4 text-body-xs font-sans text-charcoal focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-bronze" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-luxe border border-charcoal/15 bg-white py-2 px-3 text-body-xs font-sans text-charcoal focus:border-gold focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="SUBSCRIBED">Subscribed</option>
              <option value="UNSUBSCRIBED">Unsubscribed</option>
            </select>
          </div>
        </div>

        <span className="font-sans text-body-xs text-charcoal-50 font-semibold">
          {pagination?.total !== undefined ? `${pagination.total} total subscribers` : `${subscribers.length} total subscribers`}
        </span>
      </div>

      {/* Table */}
      <div className="mj-panel p-6 shadow-sm bg-white">
        {loading ? (
          <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
        ) : !subscribers.length ? (
          <div className="py-16 text-center text-body-sm text-charcoal-200">
            No newsletter subscribers found matching filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-body-sm">
              <thead>
                <tr className="border-b border-charcoal/10 text-body-xs uppercase tracking-luxe text-charcoal-50">
                  <th className="py-3 pr-4">Subscriber Email</th>
                  <th className="py-3 px-4">Signup Channel</th>
                  <th className="py-3 px-4 text-center">Subscription Status</th>
                  <th className="py-3 px-4 text-right">Subscribed Date</th>
                  <th className="py-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/[0.07]">
                {subscribers.map((s) => (
                  <tr key={s._id} className="hover:bg-champagne-50/60 transition-colors">
                    <td className="py-3.5 pr-4 font-semibold text-charcoal">{s.email}</td>

                    <td className="py-3.5 px-4 text-body-xs uppercase text-charcoal-50 font-bold">
                      {s.source || 'Website Footer'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase border',
                          s.status === 'SUBSCRIBED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200',
                        )}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-body-xs font-mono text-charcoal-50">
                      {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString('en-IN') : new Date(s.createdAt).toLocaleDateString('en-IN')}
                    </td>

                    <td className="py-3.5 pl-4 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleToggleStatus(s)}
                        disabled={updatingId === s._id}
                        icon={s.status === 'SUBSCRIBED' ? ToggleRight : ToggleLeft}
                      >
                        {s.status === 'SUBSCRIBED' ? 'Unsubscribe' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-charcoal/10 pt-4 text-body-xs">
            <span className="text-charcoal-50">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total subscribers)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
