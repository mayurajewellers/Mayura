import { useCallback, useEffect, useState } from 'react'
import {
  Check,
  Edit2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle } from '@hooks/index'
import adminProductService from '@services/adminProductService'
import collectionService from '@services/collectionService'
import { formatPrice } from '@utils/format'
import PageHero from '@components/layout/PageHero'
import Button from '@components/common/Button'
import { Checkbox, SelectField, TextField } from '@components/common/Field'
import SmartImage from '@components/common/SmartImage'
import AdminImagePicker from '@components/admin/media/AdminImagePicker'
import cn from '@utils/cn'

export default function AdminProductsPage() {
  useDocumentTitle('Admin Product Management')

  const [products, setProducts] = useState([])
  const [collections, setCollections] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    type: 'Necklace',
    collection: 'anantara',
    metal: '22K Gold',
    metalKey: 'gold-22k',
    purity: '22K',
    price: 50000,
    grossWeight: 15,
    netWeight: 14.5,
    makingCharges: '12%',
    inventoryQuantity: 25,
    lowStockThreshold: 5,
    inStock: true,
    isFeatured: false,
    isActive: true,
    description: '',
  })

  // Load collections dropdown choices
  useEffect(() => {
    collectionService.getCollections().then((res) => {
      if (res.success && res.collections) {
        setCollections(res.collections)
      }
    })
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setFeedback({ type: '', message: '' })

    const params = {
      page,
      limit: 10,
      sort,
    }
    if (search.trim()) params.search = search.trim()
    if (selectedCollection) params.collection = selectedCollection
    if (isActiveFilter) params.isActive = isActiveFilter

    const res = await adminProductService.getAdminProducts(params)

    if (res.success) {
      setProducts(res.products)
      setPagination(res.pagination)
    } else {
      setFeedback({ type: 'error', message: res.message || 'Could not load products.' })
    }
    setLoading(false)
  }, [page, search, selectedCollection, isActiveFilter, sort])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData({
      sku: '',
      name: '',
      type: 'Necklace',
      collection: collections[0]?.slug || 'anantara',
      metal: '22K Gold',
      metalKey: 'gold-22k',
      purity: '22K',
      price: 50000,
      grossWeight: 15,
      netWeight: 14.5,
      makingCharges: '12%',
      inStock: true,
      isFeatured: false,
      isActive: true,
      description: '',
    })
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku || '',
      name: product.name || '',
      type: product.type || 'Necklace',
      collection: product.collection || 'anantara',
      metal: product.metal || '22K Gold',
      metalKey: product.metalKey || 'gold-22k',
      purity: product.purity || '22K',
      price: product.price || 0,
      grossWeight: product.grossWeight || 0,
      netWeight: product.netWeight || 0,
      makingCharges: product.makingCharges || '',
      inventoryQuantity: product.inventoryQuantity !== undefined ? product.inventoryQuantity : 25,
      lowStockThreshold: product.lowStockThreshold !== undefined ? product.lowStockThreshold : 5,
      inStock: product.inStock !== undefined ? product.inStock : true,
      isFeatured: Boolean(product.isFeatured),
      isActive: product.isActive !== undefined ? product.isActive : true,
      description: product.description || '',
    })
    setModalOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setFeedback({ type: '', message: '' })

    let res
    if (editingProduct) {
      res = await adminProductService.updateProduct(editingProduct._id || editingProduct.id, formData)
    } else {
      res = await adminProductService.createProduct(formData)
    }

    if (res.success) {
      setModalOpen(false)
      setFeedback({ type: 'success', message: res.message })
      fetchProducts()
    } else {
      setFeedback({ type: 'error', message: res.message })
    }
    setActionLoading(false)
  }

  const handleSoftDelete = async () => {
    if (!deleteProduct) return
    setActionLoading(true)

    const res = await adminProductService.deleteProduct(deleteProduct._id || deleteProduct.id)
    if (res.success) {
      setDeleteProduct(null)
      setFeedback({ type: 'success', message: 'Product soft-deleted successfully (isActive set to false).' })
      fetchProducts()
    } else {
      setFeedback({ type: 'error', message: res.message })
    }
    setActionLoading(false)
  }

  return (
    <>
      <PageHero
        eyebrow="Admin CMS"
        title="Product Catalogue Management"
        lede="Create, update, search, filter, and soft-delete jewellery products in MongoDB."
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Admin Products' }]}
      >
        <div className="mt-6 flex justify-end">
          <Button variant="primary" icon={Plus} iconPosition="left" onClick={openCreateModal}>
            Add New Product
          </Button>
        </div>
      </PageHero>

      <section className="mj-section bg-ivory py-12">
        <div className="mj-container space-y-8">
          {/* Feedback message */}
          {feedback.message && (
            <div
              className={cn(
                'rounded-luxe border p-4 font-sans text-body-sm font-medium flex items-center justify-between',
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-800',
              )}
            >
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback({ type: '', message: '' })}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Search and Filters bar */}
          <div className="mj-panel p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-charcoal-50" />
                <input
                  type="text"
                  placeholder="Search SKU or name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 pl-9 pr-4 font-sans text-body-xs focus:border-gold focus:outline-none"
                />
              </div>

              {/* Collection Filter */}
              <select
                value={selectedCollection}
                onChange={(e) => {
                  setSelectedCollection(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
              >
                <option value="">All Collections</option>
                {collections.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={isActiveFilter}
                onChange={(e) => {
                  setIsActiveFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
              >
                <option value="">All Active & Inactive</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive / Soft-Deleted Only</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="weight-desc">Weight: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="mj-panel p-6 overflow-hidden">
            {loading ? (
              <div className="h-64 animate-pulse rounded-card bg-champagne-100" />
            ) : !products.length ? (
              <p className="py-16 text-center text-body-sm text-charcoal-200">
                No products found matching the criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-body-sm">
                  <thead>
                    <tr className="border-b border-charcoal/10 text-body-xs uppercase tracking-luxe text-charcoal-50">
                      <th className="py-3 pr-4">Product</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Collection</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4 text-center">Current Stock</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal/[0.07]">
                    {products.map((p) => (
                      <tr key={p._id || p.id} className="hover:bg-champagne-50/50 transition-colors">
                        <td className="py-3.5 pr-4 flex items-center gap-3">
                          <SmartImage
                            src={p.images?.[0] || '/images/products/placeholder.jpg'}
                            alt=""
                            ratio="aspect-square"
                            rounded="rounded-luxe"
                            className="w-10 shrink-0 border border-charcoal/10"
                          />
                          <div>
                            <p className="font-display font-medium text-charcoal">{p.name}</p>
                            <span className="font-sans text-[0.7rem] text-charcoal-50">{p.metal}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-body-xs text-charcoal-200">{p.sku}</td>
                        <td className="py-3.5 px-4 font-sans text-body-xs text-bronze capitalize">{p.collection}</td>
                        <td className="py-3.5 px-4 font-semibold text-charcoal">{formatPrice(p.price)}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              'inline-block px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold font-mono',
                              (p.inventoryQuantity || 0) === 0
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : (p.inventoryQuantity || 0) <= (p.lowStockThreshold || 5)
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                            )}
                          >
                            {p.inventoryQuantity || 0} units
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              'inline-block px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase',
                              p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-charcoal/10 text-charcoal-200',
                            )}
                          >
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-champagne-100 hover:text-bronze transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteProduct(p)}
                              className="p-1.5 rounded-luxe text-charcoal-100 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Soft delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-charcoal/10 pt-4 font-sans text-body-xs">
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
        </div>
      </section>

      {/* ================================================= CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-panel bg-ivory p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <h3 className="font-display text-display-xs text-charcoal">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5 text-charcoal-100 hover:text-charcoal" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="SKU"
                  name="sku"
                  required
                  placeholder="MJNK1001"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
                <TextField
                  label="Product Name"
                  name="name"
                  required
                  placeholder="Anantara Polki Choker"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-sans text-body-xs font-semibold uppercase tracking-luxe text-charcoal">
                    Category / Type
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-sans text-body-xs font-semibold uppercase tracking-luxe text-charcoal">
                    Collection (Slug String)
                  </label>
                  <select
                    value={formData.collection}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                    className="w-full rounded-luxe border border-charcoal/15 bg-white py-2.5 px-3 font-sans text-body-xs focus:border-gold focus:outline-none"
                  >
                    {collections.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name} ({c.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <TextField
                  label="Price (₹)"
                  name="price"
                  type="number"
                  required
                  value={String(formData.price)}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
                <TextField
                  label="Gross Weight (g)"
                  name="grossWeight"
                  type="number"
                  value={String(formData.grossWeight)}
                  onChange={(e) => setFormData({ ...formData, grossWeight: Number(e.target.value) })}
                />
                <TextField
                  label="Net Weight (g)"
                  name="netWeight"
                  type="number"
                  value={String(formData.netWeight)}
                  onChange={(e) => setFormData({ ...formData, netWeight: Number(e.target.value) })}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="Metal Description"
                  name="metal"
                  value={formData.metal}
                  onChange={(e) => setFormData({ ...formData, metal: e.target.value })}
                />
                <TextField
                  label="Purity Tag"
                  name="purity"
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="Initial / Current Stock Quantity"
                  name="inventoryQuantity"
                  type="number"
                  required
                  value={String(formData.inventoryQuantity)}
                  onChange={(e) => setFormData({ ...formData, inventoryQuantity: Number(e.target.value) })}
                />
                <TextField
                  label="Low Stock Alert Threshold"
                  name="lowStockThreshold"
                  type="number"
                  value={String(formData.lowStockThreshold)}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                />
              </div>

              <AdminImagePicker
                label="Primary Product Image"
                folder="mayura/products"
                value={Array.isArray(formData.images) ? formData.images[0] : formData.images}
                onChange={(newUrl) => setFormData({ ...formData, images: [newUrl] })}
              />

              <div className="flex flex-wrap gap-6 border-t border-charcoal/10 pt-4">
                <Checkbox
                  label="In Stock"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                />
                <Checkbox
                  label="Featured Product"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <Checkbox
                  label="Active (Visible in Storefront)"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= SOFT DELETE DIALOG */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-panel bg-ivory p-6 shadow-xl">
            <h3 className="font-display text-display-xs text-charcoal">Confirm Soft Delete</h3>
            <p className="mt-3 text-body-sm text-charcoal-200">
              Are you sure you want to soft-delete <strong>{deleteProduct.name}</strong>? This sets{' '}
              <code className="bg-champagne-100 px-1 py-0.5 rounded text-bronze">isActive = false</code>,
              hiding it from the public storefront while retaining its MongoDB document for analytics history.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteProduct(null)}>
                Cancel
              </Button>
              <Button variant="primary" className="bg-rose-700 hover:bg-rose-800" onClick={handleSoftDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Soft Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
