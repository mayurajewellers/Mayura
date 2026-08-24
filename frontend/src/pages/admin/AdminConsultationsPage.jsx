import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Calendar, Eye, Filter, RefreshCw, Search, Video } from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import consultationService from '@services/consultationService'
import Button from '@components/common/Button'
import cn from '@utils/cn'

export default function AdminConsultationsPage() {
  useDocumentTitle('Video Consultation Bookings — Mayura Admin')

  const [consultations, setConsultations] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [modalFeedback, setModalFeedback] = useState('')

  const fetchConsultations = useCallback(async () => {
    setRefreshing(true)
    setErrorMessage('')

    const params = {
      page,
      limit: 20,
    }
    if (statusFilter) params.status = statusFilter
    if (search.trim()) params.search = search.trim()

    const res = await consultationService.getAdminConsultations(params)

    if (res.success) {
      setConsultations(res.consultations || [])
      setPagination(res.pagination || null)
    } else {
      if (res.status === 401) {
        setErrorMessage('Your admin session has expired. Please log in again.')
      } else if (res.status === 403) {
        setErrorMessage('You do not have permission to access this page.')
      } else {
        setErrorMessage(res.message || 'Unable to load video consultations.')
      }
    }
    setLoading(false)
    setRefreshing(false)
  }, [statusFilter, search, page])

  useEffect(() => {
    fetchConsultations()
  }, [fetchConsultations])

  const handleUpdateStatus = async (id) => {
    if (!newStatus) return
    setUpdatingId(id)
    setModalFeedback('')

    const res = await consultationService.updateConsultationStatus(id, {
      status: newStatus,
      adminNotes,
    })

    if (res.success && res.consultation) {
      setModalFeedback(`Booking status updated to ${newStatus}.`)
      if (selectedConsultation && selectedConsultation._id === id) {
        setSelectedConsultation(res.consultation)
      }
      fetchConsultations()
    } else {
      setModalFeedback(res.message || 'Failed to update consultation status.')
    }
    setUpdatingId(null)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300'
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-800 border-blue-300'
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-800 border-rose-300'
      case 'REQUESTED':
      default:
        return 'bg-amber-50 text-amber-900 border-amber-300'
    }
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <span className="mj-eyebrow">Customer Operations</span>
          <h1 className="font-display text-display-xs text-charcoal font-bold">
            Video Consultation Booking Queue
          </h1>
          <p className="text-body-xs text-charcoal-50 mt-1">
            Manage scheduled 1-on-1 virtual jewellery styling appointments and customer requests.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchConsultations}
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
          <Button variant="outline" size="xs" onClick={fetchConsultations}>
            Retry
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-panel bg-white p-4 border border-charcoal/10 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-100" />
            <input
              type="text"
              placeholder="Search customer name, email, or phone…"
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
              <option value="REQUESTED">Requested</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <span className="font-sans text-body-xs text-charcoal-50 font-semibold">
          {pagination?.total !== undefined ? `${pagination.total} bookings` : `${consultations.length} bookings`}
        </span>
      </div>

      {/* Table */}
      <div className="mj-panel p-6 shadow-sm bg-white">
        {loading ? (
          <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
        ) : !consultations.length ? (
          <div className="py-16 text-center text-body-sm text-charcoal-200">
            No video consultations found matching filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-body-sm">
              <thead>
                <tr className="border-b border-charcoal/10 text-body-xs uppercase tracking-luxe text-charcoal-50">
                  <th className="py-3 pr-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Requested Slot</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 pl-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/[0.07]">
                {consultations.map((c) => (
                  <tr key={c._id} className="hover:bg-champagne-50/60 transition-colors">
                    <td className="py-3.5 pr-4">
                      <p className="font-display font-semibold text-charcoal text-body-sm">{c.name}</p>
                      <span className="font-sans text-[0.7rem] text-charcoal-50">{c.email || 'No email provided'}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-body-xs text-charcoal font-semibold">
                      {c.phone}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-bronze text-body-xs">
                        {c.preferredDate ? new Date(c.preferredDate).toLocaleDateString('en-IN') : 'TBD'}
                      </p>
                      <span className="text-[0.68rem] text-charcoal-50 font-mono">{c.preferredTime}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center uppercase text-[0.65rem] text-charcoal-50 font-bold">
                      {c.consultationType || 'Video Call'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase border',
                          getStatusBadgeClass(c.status),
                        )}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 pl-4 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setSelectedConsultation(c)
                          setNewStatus(c.status)
                          setAdminNotes(c.adminNotes || '')
                          setModalFeedback('')
                        }}
                        icon={Eye}
                      >
                        Inspect
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
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total bookings)
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

      {/* Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-panel border border-gold/30 bg-white p-6 shadow-2xl space-y-6 font-sans">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <div>
                <span className="mj-eyebrow">Video Consultation Appointment</span>
                <h3 className="font-display text-body-lg font-bold text-charcoal">
                  {selectedConsultation.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="rounded-luxe p-1 text-charcoal-100 hover:bg-champagne-100"
              >
                ✕
              </button>
            </div>

            <div className="bg-champagne-50 p-4 rounded-luxe border border-charcoal/10 text-body-xs space-y-2">
              <p><strong>Phone:</strong> {selectedConsultation.phone}</p>
              <p><strong>Email:</strong> {selectedConsultation.email || 'Not provided'}</p>
              <p><strong>Preferred Date:</strong> {selectedConsultation.preferredDate ? new Date(selectedConsultation.preferredDate).toLocaleDateString('en-IN') : 'TBD'}</p>
              <p><strong>Preferred Time:</strong> {selectedConsultation.preferredTime}</p>
              <p><strong>Consultation Type:</strong> {selectedConsultation.consultationType}</p>
              {selectedConsultation.message && (
                <p className="mt-2 text-charcoal-200 border-t border-charcoal/10 pt-2">
                  <strong>Notes/Request:</strong> {selectedConsultation.message}
                </p>
              )}
            </div>

            {modalFeedback && (
              <div className="rounded-luxe border border-emerald-500/30 bg-emerald-500/10 p-3 font-sans text-body-xs font-semibold text-emerald-800">
                {modalFeedback}
              </div>
            )}

            <div className="space-y-4 text-body-xs">
              <div>
                <label className="block mb-1 font-semibold uppercase tracking-luxe text-[0.65rem] text-charcoal">
                  Booking Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-luxe border border-charcoal/20 bg-white py-2 px-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
                >
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase tracking-luxe text-[0.65rem] text-charcoal">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal appointment notes…"
                  className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-charcoal/10">
                <Button variant="outline" size="sm" onClick={() => setSelectedConsultation(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedConsultation._id)}
                  disabled={updatingId === selectedConsultation._id}
                >
                  {updatingId === selectedConsultation._id ? 'Saving…' : 'Save Booking Status'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
