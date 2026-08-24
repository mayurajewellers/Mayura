import { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Filter,
  History,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sliders,
  XCircle,
} from 'lucide-react'
import { useDocumentTitle } from '@hooks/index'
import adminInventoryService from '@services/adminInventoryService'
import Button from '@components/common/Button'
import SmartImage from '@components/common/SmartImage'
import cn from '@utils/cn'

export default function AdminInventoryPage() {
  useDocumentTitle('Inventory Control & Stock Audit — Mayura Admin')

  const [inventory, setInventory] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('') // '', 'LOW_STOCK', 'OUT_OF_STOCK', 'IN_STOCK'
  const [page, setPage] = useState(1)

  // Adjustment Modal State
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [adjustmentType, setAdjustmentType] = useState('ADD') // 'ADD', 'REMOVE', 'SET'
  const [quantityInput, setQuantityInput] = useState('')
  const [reasonInput, setReasonInput] = useState('New stock received')
  const [adjusting, setAdjusting] = useState(false)
  const [feedback, setFeedback] = useState('')

  // History Drawer / Modal State
  const [showHistory, setShowHistory] = useState(false)
  const [historyLogs, setHistoryLogs] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchInventory = useCallback(async () => {
    setRefreshing(true)
    const params = {
      page,
      limit: 20,
    }
    if (search.trim()) params.search = search.trim()
    if (statusFilter) params.status = statusFilter

    const res = await adminInventoryService.getAdminInventory(params)
    if (res.success && res.inventory) {
      setInventory(res.inventory)
      setPagination(res.pagination)
    }
    setLoading(false)
    setRefreshing(false)
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const openAdjustModal = (product) => {
    setSelectedProduct(product)
    setAdjustmentType('SET')
    setQuantityInput(String(product.inventoryQuantity ?? 0))
    setReasonInput('Stock audit')
    setFeedback('')
    setShowHistory(false)
  }

  const handleAdjustStock = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return
    const targetId = selectedProduct._id || selectedProduct.id
    if (!targetId) {
      setFeedback('Invalid product selection.')
      return
    }

    const q = parseInt(quantityInput, 10)
    if (isNaN(q) || q < 0) {
      setFeedback('Please enter a valid non-negative quantity.')
      return
    }

    setAdjusting(true)
    setFeedback('')

    const res = await adminInventoryService.adjustStock(targetId, {
      adjustmentType,
      quantity: q,
      reason: reasonInput,
    })

    if (res.success && res.data) {
      const updatedProduct = res.data.product || {}
      const newQty = updatedProduct.inventoryQuantity !== undefined ? updatedProduct.inventoryQuantity : q
      const newStatus = updatedProduct.stockStatus || 'IN_STOCK'
      const newInStock = updatedProduct.inStock !== undefined ? updatedProduct.inStock : newQty > 0

      setFeedback(`Stock updated successfully! New stock level: ${newQty} units.`)
      fetchInventory()

      // Immediately sync table list row
      setInventory((prev) =>
        prev.map((item) =>
          (item._id === targetId || item.id === targetId)
            ? {
                ...item,
                inventoryQuantity: newQty,
                stockStatus: newStatus,
                inStock: newInStock,
              }
            : item,
        ),
      )

      // Update active modal product snapshot
      setSelectedProduct((prev) =>
        prev
          ? {
              ...prev,
              inventoryQuantity: newQty,
              inStock: newInStock,
              stockStatus: newStatus,
            }
          : null,
      )
    } else {
      setFeedback(res.message || 'Failed to adjust stock.')
    }
    setAdjusting(false)
  }

  const fetchHistory = async (product) => {
    if (!product) return
    setShowHistory(true)
    setHistoryLoading(true)
    const res = await adminInventoryService.getInventoryHistory(product._id)
    if (res.success && res.transactions) {
      setHistoryLogs(res.transactions)
    }
    setHistoryLoading(false)
  }

  const getStockStatusBadge = (status) => {
    switch (status) {
      case 'IN_STOCK':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300'
      case 'LOW_STOCK':
        return 'bg-amber-50 text-amber-900 border-amber-300'
      case 'OUT_OF_STOCK':
        return 'bg-rose-50 text-rose-800 border-rose-300'
      default:
        return 'bg-champagne-100 text-charcoal-200 border-charcoal/20'
    }
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <span className="mj-eyebrow">Catalogue Operations</span>
          <h1 className="font-display text-display-xs text-charcoal font-bold">
            Inventory Control & Stock Audit
          </h1>
          <p className="text-body-xs text-charcoal-50 mt-1">
            Real-time inventory levels, low-stock warnings, and stock adjustments with full audit logs.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchInventory}
          disabled={refreshing}
          icon={RefreshCw}
          className={refreshing ? 'animate-spin' : ''}
        >
          Refresh
        </Button>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="rounded-panel bg-white p-5 border border-charcoal/10 shadow-sm space-y-4 text-body-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setStatusFilter('')
                setPage(1)
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-body-xs font-semibold transition-all border',
                statusFilter === ''
                  ? 'bg-charcoal text-ivory border-charcoal'
                  : 'bg-white text-charcoal border-charcoal/20 hover:bg-champagne-50',
              )}
            >
              All Stock
            </button>
            <button
              onClick={() => {
                setStatusFilter('LOW_STOCK')
                setPage(1)
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-body-xs font-semibold transition-all border flex items-center gap-1.5',
                statusFilter === 'LOW_STOCK'
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Low Stock Warning
            </button>
            <button
              onClick={() => {
                setStatusFilter('OUT_OF_STOCK')
                setPage(1)
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-body-xs font-semibold transition-all border flex items-center gap-1.5',
                statusFilter === 'OUT_OF_STOCK'
                  ? 'bg-rose-700 text-white border-rose-700'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100',
              )}
            >
              <XCircle className="h-3.5 w-3.5" /> Out of Stock
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[260px] flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-100" />
            <input
              type="text"
              placeholder="Search product name or SKU…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-luxe border border-charcoal/15 bg-champagne-50/50 py-2 pl-10 pr-4 text-body-xs font-sans text-charcoal placeholder-charcoal-100 focus:border-gold focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[0.7rem] text-charcoal-50 font-semibold border-t border-charcoal/10 pt-3">
          <span>Filter: {statusFilter ? statusFilter.replace('_', ' ') : 'All Products'}</span>
          <span>{pagination?.total || inventory.length} products total</span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="mj-panel p-6 shadow-sm bg-white">
        {loading ? (
          <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
        ) : !inventory.length ? (
          <div className="py-16 text-center text-body-sm text-charcoal-200">
            No products match the selected stock criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-body-sm">
              <thead>
                <tr className="border-b border-charcoal/10 text-body-xs uppercase tracking-luxe text-charcoal-50">
                  <th className="py-3 pr-4">Product Details</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4 text-center">Stock Status</th>
                  <th className="py-3 px-4 text-center">Low Stock Alert</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/[0.07]">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-champagne-50/60 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <SmartImage
                          src={item.images?.[0] || '/images/editorial/studs-gold-rosette.jpg'}
                          alt={item.name}
                          ratio="aspect-square"
                          rounded="rounded-luxe"
                          className="w-12 h-12 shrink-0 border border-gold/30 object-cover"
                        />
                        <div className="min-w-0">
                          <h4 className="font-display font-semibold text-charcoal text-body-sm truncate">
                            {item.name}
                          </h4>
                          <span className="text-[0.68rem] text-charcoal-50 uppercase font-semibold">
                            {item.type} · {item.collection}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-body-xs font-bold text-charcoal">
                      {item.sku}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={cn(
                          'font-mono font-bold text-body-md tabular-nums px-2.5 py-0.5 rounded-luxe',
                          item.inventoryQuantity === 0
                            ? 'text-rose-700 bg-rose-50'
                            : item.inventoryQuantity <= (item.lowStockThreshold || 5)
                            ? 'text-amber-800 bg-amber-50'
                            : 'text-emerald-800 bg-emerald-50',
                        )}
                      >
                        {item.inventoryQuantity || 0} units
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold border uppercase',
                          getStockStatusBadge(item.stockStatus),
                        )}
                      >
                        {item.stockStatus === 'LOW_STOCK' && <AlertTriangle className="h-3 w-3" />}
                        {item.stockStatus === 'OUT_OF_STOCK' && <XCircle className="h-3 w-3" />}
                        {item.stockStatus === 'IN_STOCK' && <CheckCircle2 className="h-3 w-3" />}
                        {item.stockStatus?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-body-xs text-charcoal-200">
                      Threshold: {item.lowStockThreshold || 5}
                    </td>

                    <td className="py-3.5 pl-4 text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => openAdjustModal(item)}
                        icon={Sliders}
                      >
                        Adjust Stock
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
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
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

      {/* STOCK ADJUSTMENT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-panel bg-white p-6 shadow-2xl space-y-6 font-sans text-body-xs">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <div>
                <span className="mj-eyebrow">Stock Management Operation</span>
                <h3 className="font-display text-body-lg font-bold text-charcoal">
                  Adjust Inventory Stock
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-luxe p-1 text-charcoal-100 hover:bg-champagne-100"
              >
                ✕
              </button>
            </div>

            {/* Target Product Snapshot */}
            <div className="flex items-center gap-4 bg-champagne-50 p-4 rounded-luxe border border-charcoal/10">
              <SmartImage
                src={selectedProduct.images?.[0] || '/images/editorial/studs-gold-rosette.jpg'}
                alt=""
                ratio="aspect-square"
                rounded="rounded-luxe"
                className="w-14 h-14 shrink-0 border border-gold/30 object-cover"
              />
              <div className="min-w-0">
                <h4 className="font-display font-bold text-charcoal text-body-sm truncate">
                  {selectedProduct.name}
                </h4>
                <p className="font-mono text-[0.7rem] text-charcoal-50">SKU: {selectedProduct.sku}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono font-bold text-bronze text-body-xs">
                    Current: {selectedProduct.inventoryQuantity ?? 0} units
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.2 rounded-full text-[0.6rem] font-bold border uppercase',
                      getStockStatusBadge(selectedProduct.stockStatus),
                    )}
                  >
                    {selectedProduct.stockStatus?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {feedback && (
              <div className="rounded-luxe border border-emerald-500/30 bg-emerald-500/10 p-3 font-sans text-body-xs font-semibold text-emerald-800">
                {feedback}
              </div>
            )}

            {!showHistory ? (
              <form onSubmit={handleAdjustStock} className="space-y-4">
                <div>
                  <label className="block mb-1.5 font-semibold uppercase text-[0.65rem] text-charcoal">
                    Adjustment Operation Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustmentType('ADD')}
                      className={cn(
                        'py-2 px-3 rounded-luxe font-bold text-body-xs border transition-all',
                        adjustmentType === 'ADD'
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-charcoal border-charcoal/20 hover:bg-champagne-50',
                      )}
                    >
                      + ADD STOCK
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentType('REMOVE')}
                      className={cn(
                        'py-2 px-3 rounded-luxe font-bold text-body-xs border transition-all',
                        adjustmentType === 'REMOVE'
                          ? 'bg-rose-700 text-white border-rose-700'
                          : 'bg-white text-charcoal border-charcoal/20 hover:bg-champagne-50',
                      )}
                    >
                      - REMOVE STOCK
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentType('SET')}
                      className={cn(
                        'py-2 px-3 rounded-luxe font-bold text-body-xs border transition-all',
                        adjustmentType === 'SET'
                          ? 'bg-bronze text-white border-bronze'
                          : 'bg-white text-charcoal border-charcoal/20 hover:bg-champagne-50',
                      )}
                    >
                      = SET EXACT
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-semibold uppercase text-[0.65rem] text-charcoal">
                    Quantity Units ({adjustmentType})
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Enter quantity count…"
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
                  />
                  {/* Live Calculation Preview Banner */}
                  {(() => {
                    const currentQty = selectedProduct.inventoryQuantity ?? 0
                    const inputQty = parseInt(quantityInput, 10)
                    const isValid = !isNaN(inputQty) && inputQty >= 0

                    let predicted = currentQty
                    if (isValid) {
                      if (adjustmentType === 'ADD') predicted = currentQty + inputQty
                      else if (adjustmentType === 'REMOVE') predicted = Math.max(0, currentQty - inputQty)
                      else if (adjustmentType === 'SET') predicted = inputQty
                    }

                    return (
                      <div className="mt-2 rounded-lg border border-gold/30 bg-gold/5 p-2.5 flex items-center justify-between text-body-xs font-sans">
                        <span className="text-charcoal-200">
                          Current: <strong className="text-charcoal">{currentQty}</strong>
                        </span>
                        <span className="text-bronze font-bold">➔</span>
                        <span className="text-charcoal font-bold">
                          New Stock Level: <span className="text-bronze underline">{isValid ? predicted : currentQty} units</span>
                        </span>
                      </div>
                    )
                  })()}
                </div>

                <div>
                  <label className="block mb-1 font-semibold uppercase text-[0.65rem] text-charcoal">
                    Audit Reason
                  </label>
                  <select
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    className="w-full rounded-luxe border border-charcoal/20 bg-white p-3 text-body-xs text-charcoal focus:border-gold focus:outline-none"
                  >
                    <option value="New stock received">New stock received</option>
                    <option value="Damaged item">Damaged item</option>
                    <option value="Manual correction">Manual correction</option>
                    <option value="Stock audit">Stock audit</option>
                    <option value="Showroom transfer">Showroom transfer</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-charcoal/10">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchHistory(selectedProduct)}
                    icon={History}
                  >
                    Audit Logs
                  </Button>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={adjusting}>
                      {adjusting ? 'Saving Adjustment…' : 'Save Stock Adjustment'}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              /* Transaction History Trail View */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                  <h4 className="font-display font-bold text-charcoal text-body-sm flex items-center gap-2">
                    <History className="h-4 w-4 text-bronze" /> Inventory Audit Log History
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className="text-body-xs font-semibold text-bronze hover:underline"
                  >
                    ← Back to Adjust Form
                  </button>
                </div>

                {historyLoading ? (
                  <div className="h-40 animate-pulse rounded-card bg-champagne-100" />
                ) : !historyLogs.length ? (
                  <div className="py-8 text-center text-body-xs text-charcoal-200">
                    No past stock adjustments recorded for this product yet.
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y divide-charcoal/10 border border-charcoal/10 rounded-luxe bg-champagne-50/50 p-3 space-y-2">
                    {historyLogs.map((tx) => (
                      <div key={tx._id} className="pt-2 pb-2 flex items-center justify-between text-[0.72rem]">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                'font-bold font-mono px-1.5 py-0.2 rounded text-[0.65rem]',
                                tx.adjustment >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
                              )}
                            >
                              {tx.adjustment >= 0 ? `+${tx.adjustment}` : tx.adjustment}
                            </span>
                            <span className="font-bold text-charcoal uppercase text-[0.65rem]">{tx.type}</span>
                          </div>
                          <p className="text-charcoal-200 mt-0.5">{tx.reason}</p>
                        </div>
                        <div className="text-right font-mono text-charcoal-50">
                          <p className="font-bold text-charcoal">{tx.previousQuantity} → {tx.newQuantity}</p>
                          <p className="text-[0.62rem]">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
