import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    // Fetch all technicians
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, created_at')
      .eq('role', 'technician')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Fetch booking counts per technician
    const { data: bookings } = await supabase
      .from('bookings')
      .select('technician_id, status')
      .not('technician_id', 'is', null)

    const technicians = (profiles || []).map(tech => {
      const techBookings = bookings?.filter(b => b.technician_id === tech.id) || []
      const active = techBookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length
      const completed = techBookings.filter(b => b.status === 'completed').length
      return {
        ...tech,
        active,
        completed,
        total: techBookings.length,
      }
    })

    return NextResponse.json({ technicians })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
