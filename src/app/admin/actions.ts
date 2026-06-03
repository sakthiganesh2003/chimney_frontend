'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function assignTechnician(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verify user is admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const bookingId = formData.get('booking_id') as string
  const technicianId = formData.get('technician_id') as string
  const status = formData.get('status') as string

  if (!bookingId || !status) return

  const updateData: any = { 
    status,
    updated_at: new Date().toISOString() 
  }

  if (technicianId) {
    updateData.technician_id = technicianId
  }

  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)

  if (!error) {
    revalidatePath('/admin/bookings')
  } else {
    console.error(error)
  }
}
