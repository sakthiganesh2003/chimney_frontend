'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ImagePlus, X, Save, Loader2, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  description?: string
  price_estimate?: string
  additional_info?: string
  images?: string[]
}

export default function EditServicePage() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const router = useRouter()

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [info, setInfo] = useState('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImageFiles, setNewImageFiles] = useState<(File | null)[]>([null, null, null, null, null])
  const [newImagePreviews, setNewImagePreviews] = useState<(string | null)[]>([null, null, null, null, null])

  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') toast.success(message)
    else toast.error(message)
  }

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('services').select('*').eq('id', id).single()
      if (error || !data) { router.push('/admin/services'); return }
      setService(data)
      setName(data.name || '')
      setDescription(data.description || '')
      setPrice(data.price_estimate || '')
      setInfo(data.additional_info || '')
      setExistingImages(data.images || [])
      setLoading(false)
    }
    load()
  }, [id])

  const handleNewImage = (index: number, file: File | null) => {
    const files = [...newImageFiles]
    const previews = [...newImagePreviews]
    files[index] = file
    previews[index] = file ? URL.createObjectURL(file) : null
    setNewImageFiles(files)
    setNewImagePreviews(previews)
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const uploadNewImages = async (): Promise<string[]> => {
    const urls: string[] = []
    for (const file of newImageFiles) {
      if (!file) continue
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('service-images').upload(fileName, file, { upsert: false })
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('service-images').getPublicUrl(data.path)
        urls.push(urlData.publicUrl)
      }
    }
    return urls
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) return showToast('Name and price are required', 'error')
    setSaving(true)
    try {
      const newUrls = await uploadNewImages()
      const images = [...existingImages, ...newUrls].slice(0, 5)

      const { error } = await supabase.from('services').update({
        name, description, price_estimate: price, additional_info: info, images
      }).eq('id', id)

      if (error) showToast('Save failed: ' + error.message, 'error')
      else {
        showToast('Service updated!', 'success')
        setTimeout(() => router.push('/admin/services'), 1000)
      }
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  const slotsAvailable = Math.max(0, 5 - existingImages.length)

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fadeInUp">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/services" className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Edit Service</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Updating: <strong>{service?.name}</strong></p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-base">Service Details</h2>
          <div className="space-y-1.5">
            <Label>Service Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Price Estimate *</Label>
            <Input value={price} onChange={e => setPrice(e.target.value)} required className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>Additional Information</Label>
            <textarea
              value={info}
              onChange={e => setInfo(e.target.value)}
              className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-base mb-1">Current Images ({existingImages.length}/5)</h2>
            <p className="text-xs text-muted-foreground mb-4">Click the ✕ on any image to remove it.</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {existingImages.map((url, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                  <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] rounded px-1">#{idx+1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Images */}
        {slotsAvailable > 0 && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-primary" />
              Add New Images ({slotsAvailable} slot{slotsAvailable !== 1 ? 's' : ''} left)
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {Array.from({ length: slotsAvailable }).map((_, i) => (
                <div key={i} className="relative aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors overflow-hidden group">
                  {newImagePreviews[i] ? (
                    <>
                      <img src={newImagePreviews[i]!} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleNewImage(i, null)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <ImagePlus className="w-5 h-5 text-muted-foreground/40" />
                      <span className="text-[9px] text-muted-foreground mt-0.5">Add</span>
                      <input type="file" accept="image/*" className="sr-only"
                        onChange={e => handleNewImage(i, e.target.files?.[0] || null)} />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {slotsAvailable === 0 && existingImages.length === 5 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
            Maximum 5 images. Remove existing images to add new ones.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Link href="/admin/services" className="flex-1">
            <Button variant="outline" type="button" className="w-full h-11 rounded-xl">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving} className="flex-1 h-11 rounded-xl font-semibold gap-2 shadow-lg shadow-primary/20">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
