'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

async function uploadImages(supabase: SupabaseClient, files: File[]): Promise<string[]> {
  const urls: string[] = []
  for (const file of files) {
    if (!file || file.size === 0) continue
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage
      .from('service-images')
      .upload(fileName, file, { contentType: file.type, upsert: false })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('service-images').getPublicUrl(data.path)
      urls.push(urlData.publicUrl)
    }
  }
  return urls
}

export async function addService(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price_estimate = formData.get('price_estimate') as string
  const additional_info = formData.get('additional_info') as string

  if (!name || !price_estimate) return

  // Upload up to 5 images
  const imageFiles = [
    formData.get('image_0') as File,
    formData.get('image_1') as File,
    formData.get('image_2') as File,
    formData.get('image_3') as File,
    formData.get('image_4') as File,
  ].filter(f => f && f.size > 0)

  const images = await uploadImages(supabase, imageFiles)

  const { error } = await supabase.from('services').insert({
    name,
    description,
    price_estimate,
    additional_info,
    images
  })

  if (!error) {
    revalidatePath('/admin/services')
    revalidatePath('/')
  }
  redirect('/admin/services')
}

export async function editService(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price_estimate = formData.get('price_estimate') as string
  const additional_info = formData.get('additional_info') as string

  if (!id || !name || !price_estimate) return

  // Get existing images to preserve them
  const existingImagesJson = formData.get('existing_images') as string
  let existingImages: string[] = []
  try { existingImages = JSON.parse(existingImagesJson) || [] } catch { existingImages = [] }

  // Handle image deletions
  const deleteIndexes = formData.getAll('delete_image') as string[]
  const keptImages = existingImages.filter((_, i) => !deleteIndexes.includes(String(i)))

  // Upload new images
  const newImageFiles = [
    formData.get('image_0') as File,
    formData.get('image_1') as File,
    formData.get('image_2') as File,
    formData.get('image_3') as File,
    formData.get('image_4') as File,
  ].filter(f => f && f.size > 0)

  const newUrls = await uploadImages(supabase, newImageFiles)
  const images = [...keptImages, ...newUrls].slice(0, 5)

  const { error } = await supabase.from('services').update({
    name,
    description,
    price_estimate,
    additional_info,
    images
  }).eq('id', id)

  if (!error) {
    revalidatePath('/admin/services')
    revalidatePath('/')
    revalidatePath(`/services/${id}`)
  }
  redirect('/admin/services')
}

export async function deleteService(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const serviceId = formData.get('id') as string
  if (!serviceId) return

  const { error } = await supabase.from('services').delete().eq('id', serviceId)

  if (!error) {
    revalidatePath('/admin/services')
    revalidatePath('/')
  }
  redirect('/admin/services')
}
