'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function assignTechnician(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const bookingId       = formData.get('booking_id') as string
  const technicianRefId = formData.get('technician_ref_id') as string
  const status          = formData.get('status') as string

  if (!bookingId || !status) return

  const updateData: Record<string, string | null> = {
    status,
    // Set or clear technician_ref_id
    technician_ref_id: technicianRefId || null,
  }

  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)

  if (error) {
    console.error('assignTechnician error:', error)
  } else {
    revalidatePath('/admin/bookings')
    revalidatePath('/admin')
  }
}
