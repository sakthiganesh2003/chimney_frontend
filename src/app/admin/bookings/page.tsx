import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { assignTechnician } from '../actions'

export default async function AdminBookings() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      services ( name ),
      customer:profiles!customer_id ( full_name, phone ),
      technician:profiles!technician_id ( full_name )
    `)
    .order('created_at', { ascending: false })

  // Fetch all technicians
  const { data: technicians } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'technician')

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Bookings</h1>
          <p className="text-muted-foreground mt-1">View all service requests and assign technicians.</p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Technician</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings?.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{booking.services?.name}</td>
                  <td className="px-6 py-4">
                    <div>{booking.customer?.full_name}</div>
                    <div className="text-xs text-muted-foreground mb-1">{booking.customer?.phone}</div>
                    <div className="text-xs text-slate-500">
                      {booking.address}, {booking.landmark ? booking.landmark + ', ' : ''}{booking.city} - {booking.pincode}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(booking.scheduled_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                        booking.status === 'in_progress' ? 'bg-indigo-100 text-indigo-800' : 
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {booking.technician ? (
                      <span className="font-medium">{booking.technician.full_name}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(booking.status !== 'completed' && booking.status !== 'cancelled') && (
                      <form action={assignTechnician} className="flex gap-2 justify-end items-center flex-wrap">
                        <input type="hidden" name="booking_id" value={booking.id} />
                        <select 
                          name="technician_id" 
                          className="text-xs border rounded px-2 py-1"
                          defaultValue={booking.technician_id || ""}
                          required
                        >
                          <option value="" disabled>Select Tech</option>
                          {technicians?.map(tech => (
                            <option key={tech.id} value={tech.id}>{tech.full_name}</option>
                          ))}
                        </select>
                        <select 
                          name="status"
                          className="text-xs border rounded px-2 py-1"
                          defaultValue={booking.status}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <Button type="submit" size="sm" variant="secondary" className="h-7 text-xs">Update</Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {(!bookings || bookings.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
