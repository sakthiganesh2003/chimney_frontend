import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Flame, CheckCircle2, Clock, IndianRupee,
  UserCog, CalendarCheck, MapPin, User
} from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all bookings with details
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`*, services(name), customer:profiles!customer_id(full_name), technician:technicians!technician_ref_id(name)`)
    .order('created_at', { ascending: false })

  // Fetch technician count from new table
  const { count: technicianCount } = await supabase
    .from('technicians')
    .select('*', { count: 'exact', head: true })


  const totalBookings = bookings?.length || 0
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0
  const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0
  const inProgressBookings = bookings?.filter(b => b.status === 'in_progress').length || 0

  const totalRevenue = bookings?.reduce((acc, curr) => {
    if (curr.status === 'completed' && curr.total_amount) {
      return acc + Number(curr.total_amount)
    }
    return acc
  }, 0) || 0

  // Recent 5 bookings
  const recentBookings = bookings?.slice(0, 5) || []

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-indigo-100 text-indigo-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">From completed bookings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Flame className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime bookings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {inProgressBookings} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <UserCog className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{technicianCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <a href="/admin/technicians" className="underline hover:text-foreground">Manage technicians →</a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Status Summary Row ── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
        {[
          { label: 'Pending', count: pendingBookings, color: 'bg-yellow-500' },
          { label: 'Confirmed', count: bookings?.filter(b => b.status === 'confirmed').length || 0, color: 'bg-blue-500' },
          { label: 'In Progress', count: inProgressBookings, color: 'bg-indigo-500' },
          { label: 'Completed', count: completedBookings, color: 'bg-green-500' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border/60 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-3 h-10 rounded-full ${s.color}`} />
            <div>
              <div className="text-xl font-bold">{s.count}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Bookings ── */}
      <Card>
        <CardHeader className="border-b bg-muted/10 flex flex-row items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Recent Bookings</CardTitle>
          <a href="/admin/bookings" className="ml-auto text-xs text-primary hover:underline">View all →</a>
        </CardHeader>
        <CardContent className="p-0">
          {recentBookings.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No bookings yet.</div>
          ) : (
            <div className="divide-y">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  {/* Service icon */}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-primary" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{booking.services?.name || 'Service'}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {booking.customer?.full_name || 'Customer'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {booking.city}
                      </span>
                    </div>
                  </div>

                  {/* Technician */}
                  <div className="hidden md:block text-xs text-center min-w-[100px]">
                    {booking.technician ? (
                      <span className="text-blue-700 font-medium">{booking.technician.name}</span>
                    ) : (
                      <span className="text-amber-600 italic">Unassigned</span>
                    )}
                    <div className="text-muted-foreground">Technician</div>
                  </div>

                  {/* Date */}
                  <div className="hidden sm:block text-xs text-muted-foreground text-right min-w-[80px]">
                    {new Date(booking.scheduled_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>

                  {/* Status badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${getStatusStyle(booking.status)}`}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
