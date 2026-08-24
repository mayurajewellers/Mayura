import { useEffect, useRef, useState } from 'react'
import { Check, FolderOpen, Image as ImageIcon, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react'
import adminMediaService from '@services/adminMediaService'
import Button from '@components/common/Button'
import SmartImage from '@components/common/SmartImage'
import cn from '@utils/cn'

export default function AdminImagePicker({
  value,
  onChange,
  label = 'Image Asset',
  folder = 'mayura/uploads',
  className = '',
}) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [showLibraryModal, setShowLibraryModal] = useState(false)
  const [libraryMedia, setLibraryMedia] = useState([])
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [librarySearch, setLibrarySearch] = useState('')

  const currentUrl = typeof value === 'string' ? value : value?.url || value?.secureUrl || ''

  const handleDeviceUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')

    const res = await adminMediaService.uploadMedia(file, folder)

    if (res.success && res.media?.url) {
      onChange(res.media.url)
    } else {
      setUploadError(res.message || 'Upload failed. Please try again.')
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const fetchLibraryMedia = async () => {
    setLibraryLoading(true)
    const res = await adminMediaService.getAdminMedia({ search: librarySearch })
    if (res.success && res.media) {
      setLibraryMedia(res.media)
    }
    setLibraryLoading(false)
  }

  useEffect(() => {
    if (showLibraryModal) {
      fetchLibraryMedia()
    }
  }, [showLibraryModal, librarySearch])

  return (
    <div className={cn('space-y-2 font-sans text-body-xs', className)}>
      <label className="block font-semibold uppercase tracking-luxe text-[0.65rem] text-charcoal">
        {label}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleDeviceUpload}
        className="hidden"
      />

      {currentUrl ? (
        /* Image Preview & Management Card */
        <div className="mj-panel p-3 flex items-center justify-between gap-4 border border-gold/40 bg-white">
          <div className="flex items-center gap-3.5 min-w-0">
            <SmartImage
              src={currentUrl}
              alt=""
              ratio="aspect-square"
              rounded="rounded-luxe"
              className="w-14 shrink-0 border border-gold/30"
            />
            <div className="min-w-0">
              <p className="font-mono text-[0.7rem] text-charcoal truncate font-semibold">
                {currentUrl.split('/').pop()}
              </p>
              <span className="inline-flex items-center gap-1 text-[0.6rem] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-200">
                <Check className="h-3 w-3" /> Asset Selected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Replace'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onChange('')}
              className="text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Action buttons when no image is selected */
        <div className="flex flex-wrap items-center gap-3 bg-champagne-50/60 p-4 rounded-luxe border border-charcoal/15">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            icon={uploading ? Loader2 : Upload}
            className={uploading ? 'animate-spin' : ''}
          >
            {uploading ? 'Uploading Image…' : 'Upload from Device'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowLibraryModal(true)}
            icon={FolderOpen}
          >
            Choose from Media Vault
          </Button>
        </div>
      )}

      {uploadError && (
        <p className="text-[0.7rem] font-semibold text-rose-600">{uploadError}</p>
      )}

      {/* Media Library Selection Modal */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4 backdrop-blur-xs">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-panel border border-gold/30 bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <div>
                <span className="mj-eyebrow">Mayura Media Library Vault</span>
                <h3 className="font-display text-body-lg font-bold text-charcoal">
                  Select Existing Asset
                </h3>
              </div>
              <button
                onClick={() => setShowLibraryModal(false)}
                className="rounded-luxe p-1 text-charcoal-100 hover:bg-champagne-100"
              >
                ✕
              </button>
            </div>

            {/* Library Search */}
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="Search library assets by filename or public ID…"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                className="flex-1 rounded-luxe border border-charcoal/20 bg-champagne-50/50 py-2 px-3 text-body-xs font-sans text-charcoal focus:border-gold focus:outline-none"
              />
              <Button variant="outline" size="xs" onClick={fetchLibraryMedia} icon={RefreshCw}>
                Refresh
              </Button>
            </div>

            {/* Grid */}
            {libraryLoading ? (
              <div className="h-48 animate-pulse rounded-card bg-champagne-100" />
            ) : !libraryMedia.length ? (
              <div className="py-12 text-center text-body-sm text-charcoal-200">
                No media assets found in library. Upload a new image above!
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 max-h-96 overflow-y-auto pr-1">
                {libraryMedia.map((m) => (
                  <button
                    key={m.id || m.publicId}
                    type="button"
                    onClick={() => {
                      onChange(m.url)
                      setShowLibraryModal(false)
                    }}
                    className="mj-panel p-2 hover:border-gold border border-charcoal/10 transition-all text-left group flex flex-col justify-between"
                  >
                    <SmartImage src={m.url} alt="" ratio="aspect-square" rounded="rounded-luxe" />
                    <p className="mt-2 font-mono text-[0.65rem] text-charcoal truncate font-semibold group-hover:text-bronze">
                      {m.name || m.publicId}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
