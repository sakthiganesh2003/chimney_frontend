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
    technician_ref_id: technicianRefId || null,
  }

  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)

  if (error) {
    console.error('assignTechnician error:', error)
  } else {
    try {
      const apiKey = process.env.CALLMEBOT_API_KEY
      if (apiKey) {
        const { data: booking } = await supabase
          .from('bookings')
          .select(`*, services ( name ), customer:profiles!customer_id ( full_name, phone ), technician:technicians!technician_ref_id ( name )`)
          .eq('id', bookingId)
          .single()

        if (booking) {
          const custName    = booking.customer?.full_name || booking.guest_name || 'Guest'
          const custPhone   = booking.customer?.phone || booking.guest_phone || 'N/A'
          const serviceName = booking.services?.name || 'Chimney Service'
          const newStatus   = status.replace('_', ' ').toUpperCase()
          const techName    = booking.technician?.name || 'None'

          const lines = [
            `🔄 *Booking Updated — Chimney Doctors*`,
            ``,
            `👤 Customer: ${custName}`,
            `📞 Phone:    ${custPhone}`,
            `🛠 Service:  ${serviceName}`,
            `📅 Status:   *${newStatus}*`,
            `👤 Tech:     ${techName}`,
            `💬 Chat:     https://wa.me/91${custPhone.replace(/[^0-9]/g, '')}`
          ].join('\n')

          await fetch(
            `https://api.callmebot.com/whatsapp.php?phone=919361564650&text=${encodeURIComponent(lines)}&apikey=${apiKey}`
          )
        }
      }
    } catch (err) {
      console.error('WhatsApp status update notification failed:', err)
    }

    revalidatePath('/admin/bookings')
    revalidatePath('/admin')
  }
}

export async function deleteBooking(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return

  const bookingId = formData.get('booking_id') as string
  if (!bookingId) return

  const { error } = await supabase.from('bookings').delete().eq('id', bookingId)
  if (error) {
    console.error('deleteBooking error:', error)
  } else {
    revalidatePath('/admin/bookings')
    revalidatePath('/admin')
  }
}
