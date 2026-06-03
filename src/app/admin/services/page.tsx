'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, ImagePlus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


type Service = {
  id: string
  name: string
  description: string
  price_estimate: string
  additional_info: string
  images: string[]
  created_at: string
}

export default function AdminServicesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Add form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [info, setInfo] = useState('')
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null, null])
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null, null])

  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') toast.success(message)
    else toast.error(message)
  }

  const fetchServices = async () => {
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false })
    if (!error && data) setServices(data)
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [])

  const handleImageChange = (index: number, file: File | null) => {
    const newFiles = [...imageFiles]
    const newPreviews = [...imagePreviews]
    newFiles[index] = file
    newPreviews[index] = file ? URL.createObjectURL(file) : null
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  const uploadImages = async (files: (File | null)[]): Promise<string[]> => {
    const urls: string[] = []
    for (const file of files) {
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) return showToast('Name and price are required', 'error')
    setSaving(true)
    try {
      const images = await uploadImages(imageFiles)
      const { error } = await supabase.from('services').insert({ name, description, price_estimate: price, additional_info: info, images })
      if (error) { showToast('Failed to add service: ' + error.message, 'error') }
      else {
        showToast('Service added successfully!', 'success')
        setName(''); setDescription(''); setPrice(''); setInfo('')
        setImageFiles([null, null, null, null, null])
        setImagePreviews([null, null, null, null, null])
        fetchServices()
        router.refresh()
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string, serviceName: string) => {
    if (!confirm(`Delete "${serviceName}"? This cannot be undone.`)) return
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) showToast('Delete failed: ' + error.message, 'error')
    else { showToast('Service deleted!', 'success'); fetchServices(); router.refresh() }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">

      <div className="mb-8 animate-fadeInUp">
        <h1 className="text-3xl font-extrabold tracking-tight">Service Management</h1>
        <p className="text-muted-foreground mt-1">Add, edit, and delete chimney services with real image uploads.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* ─── Add Form ─── */}
        <div className="lg:col-span-2 animate-fadeInUp">
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              Add New Service
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Service Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Deep Cleaning" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="flex min-h-[70px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Brief description..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Price Estimate *</Label>
                <Input value={price} onChange={e => setPrice(e.target.value)} required placeholder="e.g., From ₹1000" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>Additional Information</Label>
                <textarea
                  value={info}
                  onChange={e => setInfo(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Extra service details..."
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <ImagePlus className="w-3.5 h-3.5 text-muted-foreground" /> Images (up to 5)
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {[0,1,2,3,4].map(i => (
                    <div key={i} className="relative aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors overflow-hidden cursor-pointer group">
                      {imagePreviews[i] ? (
                        <>
                          <img src={imagePreviews[i]!} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => handleImageChange(i, null)}
                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                          <ImagePlus className="w-4 h-4 text-muted-foreground/50" />
                          <span className="text-[9px] text-muted-foreground mt-0.5">#{i+1}</span>
                          <input type="file" accept="image/*" className="sr-only"
                            onChange={e => handleImageChange(i, e.target.files?.[0] || null)} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Click each box to upload an image.</p>
              </div>

              <Button type="submit" disabled={saving} className="w-full h-11 rounded-xl font-semibold mt-2">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Plus className="w-4 h-4 mr-2" /> Create Service</>}
              </Button>
            </form>
          </div>
        </div>

        {/* ─── Services List ─── */}
        <div className="lg:col-span-3 space-y-4 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-bold">
            Existing Services <span className="text-muted-foreground font-normal text-base">({services.length})</span>
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && services.length === 0 && (
            <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center">
              <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No services yet. Add your first one!</p>
            </div>
          )}

          {services.map((service) => (
            <div key={service.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
              <div className="flex flex-col sm:flex-row">
                {/* Thumbnail */}
                <div className="sm:w-36 h-32 sm:h-auto shrink-0 overflow-hidden bg-muted/50">
                  {service.images?.[0] ? (
                    <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImagePlus className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-5">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="font-bold text-lg leading-tight">{service.name}</h3>
                    <span className="font-bold text-primary text-sm shrink-0 ml-4">{service.price_estimate}</span>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{service.description}</p>

                  {/* Image thumbnails */}
                  {service.images?.length > 0 && (
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      {service.images.slice(0,5).map((url, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-lg overflow-hidden border border-border shrink-0">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <span className="text-xs text-muted-foreground self-center ml-1">{service.images.length} photo{service.images.length > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/admin/services/${service.id}/edit`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Pencil className="w-3 h-3" /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(service.id, service.name)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
