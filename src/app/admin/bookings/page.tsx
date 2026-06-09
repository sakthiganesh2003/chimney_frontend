import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { assignTechnician } from '../actions'

export default async function AdminBookings({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; technician?: string; search?: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const params = await searchParams
  const statusFilter = params.status || ''
  const technicianFilter = params.technician || ''
  const searchFilter = params.search || ''

  // Build dynamic Supabase query
  let query = supabase
    .from('bookings')
    .select(`
      *,
      services ( name ),
      customer:profiles!customer_id ( full_name, phone ),
      technician:technicians!technician_ref_id ( id, name, phone )
    `)

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  if (technicianFilter) {
    if (technicianFilter === 'unassigned') {
      query = query.is('technician_ref_id', null)
    } else {
      query = query.eq('technician_ref_id', technicianFilter)
    }
  }

  // Fetch bookings
  let { data: bookings } = await query.order('created_at', { ascending: false })

  // Client-side text filter for nested/complex fields
  if (searchFilter && bookings) {
    const searchLower = searchFilter.toLowerCase()
    bookings = bookings.filter(booking => {
      const customerName = booking.customer?.full_name?.toLowerCase() || ''
      const customerPhone = booking.customer?.phone?.toLowerCase() || ''
      const serviceName = booking.services?.name?.toLowerCase() || ''
      const address = booking.address?.toLowerCase() || ''
      const city = booking.city?.toLowerCase() || ''
      const pincode = booking.pincode?.toLowerCase() || ''
      return customerName.includes(searchLower) ||
             customerPhone.includes(searchLower) ||
             serviceName.includes(searchLower) ||
             address.includes(searchLower) ||
             city.includes(searchLower) ||
             pincode.includes(searchLower)
    })
  }

  // Fetch all technicians from new table (no auth needed)
  const { data: technicians } = await supabase
    .from('technicians')
    .select('id, name, phone')
    .order('name')

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Assign technicians and update booking statuses.
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg shrink-0">
          Total: <strong>{bookings?.length || 0}</strong> bookings
        </div>
      </div>

      {/* Filter panel */}
      <Card className="p-5 mb-6 border border-border/80 shadow-sm">
        <form method="GET" action="/admin/bookings" className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full min-w-[200px] space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search</label>
            <input
              type="text"
              name="search"
              placeholder="Search customer, phone, address, pincode, service..."
              defaultValue={searchFilter}
              className="w-full text-sm border border-input rounded-md h-10 px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          
          <div className="w-full lg:w-48 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full text-sm border border-input rounded-md h-10 px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring font-medium"
            >
              <option value="">All Statuses</option>
              <option value="pending">🟡 Pending</option>
              <option value="confirmed">🔵 Confirmed</option>
              <option value="in_progress">🟣 In Progress</option>
              <option value="completed">🟢 Completed</option>
              <option value="cancelled">🔴 Cancelled</option>
            </select>
          </div>

          <div className="w-full lg:w-56 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Technician</label>
            <select
              name="technician"
              defaultValue={technicianFilter}
              className="w-full text-sm border border-input rounded-md h-10 px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring font-medium"
            >
              <option value="">All Technicians</option>
              <option value="unassigned">⚠️ Unassigned</option>
              {technicians?.map(tech => (
                <option key={tech.id} value={tech.id}>👤 {tech.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full lg:w-auto shrink-0 justify-end">
            <Button type="submit" size="sm" className="h-10 font-bold px-5 shadow-sm">
              Filter
            </Button>
            {(statusFilter || technicianFilter || searchFilter) && (
              <a href="/admin/bookings" className="block">
                <Button type="button" variant="outline" size="sm" className="h-10 px-4">
                  Clear
                </Button>
              </a>
            )}
          </div>
        </form>
      </Card>

      {technicians?.length === 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          ⚠️ No technicians found. Please{' '}
          <a href="/admin/technicians" className="font-semibold underline">add technicians</a>{' '}
          first before assigning bookings.
        </div>
      )}

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
                <th className="px-6 py-4 font-medium text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings?.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{booking.services?.name}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{booking.customer?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{booking.customer?.phone}</div>
                    <div className="text-xs text-slate-400 mt-1 max-w-[200px] leading-tight">
                      {booking.address}{booking.landmark ? ', ' + booking.landmark : ''}, {booking.city} – {booking.pincode}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>{new Date(booking.scheduled_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(booking.scheduled_date).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold 
                      ${booking.status === 'pending'     ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'confirmed'   ? 'bg-blue-100   text-blue-800'   :
                        booking.status === 'in_progress' ? 'bg-indigo-100 text-indigo-800' :
                        booking.status === 'completed'   ? 'bg-green-100  text-green-800'  :
                                                           'bg-red-100    text-red-800'}`}>
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {booking.technician ? (
                      <div>
                        <div className="font-medium text-blue-700">{booking.technician.name}</div>
                        {booking.technician.phone && (
                          <div className="text-xs text-muted-foreground">{booking.technician.phone}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-amber-600 text-xs font-medium italic">⚠ Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(booking.status !== 'completed' && booking.status !== 'cancelled') ? (
                      <form action={assignTechnician} className="flex gap-2 justify-end items-center flex-wrap min-w-[240px]">
                        <input type="hidden" name="booking_id" value={booking.id} />
                        <select
                          name="technician_ref_id"
                          className="text-xs border border-input rounded-md px-3 py-1.5 bg-background hover:bg-accent/50 transition-colors focus:outline-none focus:ring-1 focus:ring-ring flex-1 min-w-[150px] shadow-sm font-medium"
                          defaultValue={booking.technician_ref_id || ''}
                        >
                          <option value="">-- No Technician --</option>
                          {technicians?.map(tech => (
                            <option key={tech.id} value={tech.id}>
                              👤 {tech.name}{tech.phone ? ` (${tech.phone})` : ''}
                            </option>
                          ))}
                        </select>
                        <select
                          name="status"
                          className="text-xs border border-input rounded-md px-3 py-1.5 bg-background hover:bg-accent/50 transition-colors focus:outline-none focus:ring-1 focus:ring-ring shadow-sm font-semibold text-slate-700 dark:text-slate-200"
                          defaultValue={booking.status}
                        >
                          <option value="pending" className="text-yellow-600 font-medium">🟡 Pending</option>
                          <option value="confirmed" className="text-blue-600 font-medium">🔵 Confirmed</option>
                          <option value="in_progress" className="text-indigo-600 font-medium">🟣 In Progress</option>
                          <option value="completed" className="text-green-600 font-medium">🟢 Completed</option>
                          <option value="cancelled" className="text-red-600 font-medium">🔴 Cancelled</option>
                        </select>
                        <Button type="submit" size="sm" className="h-[30px] text-xs px-3 font-semibold shadow-sm transition-all hover:scale-[1.02]">Update</Button>
                      </form>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        {booking.status === 'completed' ? '✓ Completed' : '✗ Cancelled'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!bookings || bookings.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="text-4xl mb-2">📋</div>
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
