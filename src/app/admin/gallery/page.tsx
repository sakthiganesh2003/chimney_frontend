'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Images, Upload, Trash2, X, Loader2, ImagePlus, ZoomIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type GalleryImage = {
  name: string
  publicUrl: string
}

const BUCKET = 'gallery-images'

export default function AdminGalleryPage() {
  const supabase = createClient()
  const router = useRouter()

  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingName, setDeletingName] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchImages = async () => {
    const { data, error } = await supabase.storage.from(BUCKET).list('', {
      limit: 200,
      sortBy: { column: 'created_at', order: 'desc' },
    })
    if (error) {
      toast.error('Failed to load gallery: ' + error.message)
      setLoading(false)
      return
    }
    const imgs: GalleryImage[] = (data || [])
      .filter((f) => f.name !== '.emptyFolderPlaceholder')
      .map((f) => ({
        name: f.name,
        publicUrl: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      }))
    setImages(imgs)
    setLoading(false)
  }

  useEffect(() => {
    fetchImages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    setSelectedFiles((prev) => [...prev, ...newFiles])
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeSelected = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx])
      return prev.filter((_, i) => i !== idx)
    })
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return toast.error('Please select at least one image.')
    setUploading(true)
    let successCount = 0
    for (const file of selectedFiles) {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, { upsert: false })
      if (!error) successCount++
      else toast.error(`Failed to upload ${file.name}: ${error.message}`)
    }
    if (successCount > 0) {
      toast.success(`${successCount} image${successCount > 1 ? 's' : ''} uploaded successfully!`)
      setSelectedFiles([])
      setPreviews([])
      await fetchImages()
      router.refresh()
    }
    setUploading(false)
  }

  const handleDelete = async (imgName: string) => {
    if (!confirm('Delete this image? This cannot be undone.')) return
    setDeletingName(imgName)
    const { error } = await supabase.storage.from(BUCKET).remove([imgName])
    if (error) {
      toast.error('Delete failed: ' + error.message)
    } else {
      toast.success('Image deleted.')
      await fetchImages()
      router.refresh()
    }
    setDeletingName(null)
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8 animate-fadeInUp">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Images className="w-5 h-5 text-primary" />
          </div>
          Gallery Management
        </h1>
        <p className="text-muted-foreground mt-1 ml-1">Upload and manage photos displayed on the public gallery page.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">

        {/* ─── Upload Panel ─── */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              Upload Images
            </h2>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                handleFileSelect(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${dragOver
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-border hover:border-primary/50 hover:bg-primary/3'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <ImagePlus className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">Drag & drop images here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WEBP supported</p>
            </div>

            {/* Selected Previews */}
            {previews.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Selected ({previews.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeSelected(idx) }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="w-full h-11 rounded-xl font-semibold mt-5"
            >
              {uploading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                : <><Upload className="w-4 h-4 mr-2" /> Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Image${selectedFiles.length > 1 ? 's' : ''}` : 'Images'}</>
              }
            </Button>
          </div>
        </div>

        {/* ─── Gallery Grid ─── */}
        <div className="lg:col-span-3 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              Uploaded Images{' '}
              <span className="text-muted-foreground font-normal text-base">({images.length})</span>
            </h2>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && images.length === 0 && (
            <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center">
              <Images className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-slate-600">No images yet</p>
              <p className="text-sm text-muted-foreground mt-1">Upload some images using the panel on the left.</p>
            </div>
          )}

          {!loading && images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <div
                  key={img.name}
                  className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/20 group shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                >
                  <img
                    src={img.publicUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setLightbox(img.publicUrl)}
                      className="w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow hover:bg-white hover:scale-110 transition-all"
                      title="Preview"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(img.name)}
                      disabled={deletingName === img.name}
                      className="w-9 h-9 rounded-full bg-red-500/90 text-white flex items-center justify-center shadow hover:bg-red-600 hover:scale-110 transition-all disabled:opacity-50"
                      title="Delete image"
                    >
                      {deletingName === img.name
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
