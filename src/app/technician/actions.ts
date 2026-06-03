'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateBookingStatus(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Basic authorization: Verify user is technician or admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'technician' && profile?.role !== 'admin') return

  const bookingId = formData.get('booking_id') as string
  const status = formData.get('status') as string

  const { error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (!error) {
    revalidatePath('/technician')
    revalidatePath('/admin')
  }
}
