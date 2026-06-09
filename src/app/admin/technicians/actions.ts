'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// Add a new technician (no auth account needed)
export async function addTechnician(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const name  = (formData.get('name')  as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const notes = (formData.get('notes') as string)?.trim()

  if (!name) return

  const { error } = await supabase.from('technicians').insert({
    name,
    phone: phone || null,
    email: email || null,
    notes: notes || null,
  })

  if (error) {
    console.error('Add technician error:', error)
    return redirect('/admin/technicians?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/technicians')
  revalidatePath('/admin/bookings')
}

// Update technician info
export async function updateTechnician(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const id    = (formData.get('id')    as string)?.trim()
  const name  = (formData.get('name')  as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const notes = (formData.get('notes') as string)?.trim()

  if (!id || !name) return

  await supabase.from('technicians').update({
    name,
    phone: phone || null,
    email: email || null,
    notes: notes || null,
  }).eq('id', id)

  revalidatePath('/admin/technicians')
  revalidatePath('/admin/bookings')
}

// Delete a technician
export async function deleteTechnician(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const id = formData.get('id') as string
  if (!id) return

  // Unassign from bookings first
  await supabase.from('bookings').update({ technician_ref_id: null }).eq('technician_ref_id', id)

  await supabase.from('technicians').delete().eq('id', id)

  revalidatePath('/admin/technicians')
  revalidatePath('/admin/bookings')
}
