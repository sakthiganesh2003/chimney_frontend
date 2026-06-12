import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { logout } from '../auth/actions'
import { Flame, LogOut, Clock, CheckCircle2, XCircle, PlusCircle, Calendar, MapPin, IndianRupee, User, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role === 'admin') redirect('/admin')

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`*, services ( name, price_estimate ), technician:technicians!technician_ref_id ( name, phone )`)
    .eq('customer_id', user.id)
    .order('scheduled_date', { ascending: false })

  // Dashboard message from redirect
  const pending = bookings?.filter(b => b.status === 'pending').length || 0
  const completed = bookings?.filter(b => b.status === 'completed').length || 0
  const totalSpent = bookings?.filter(b => b.status === 'completed').reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0) || 0

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock }
      case 'confirmed': return { label: 'Confirmed', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle2 }
      case 'in_progress': return { label: 'In Progress', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: AlertCircle }
      case 'completed': return { label: 'Completed', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 }
      case 'cancelled': return { label: 'Cancelled', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle }
      default: return { label: status, className: 'bg-muted text-muted-foreground', icon: Clock }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img 
            src="/chimney_icon.png" 
            alt="Chimney Doctors" 
            className="w-8 h-8 object-contain rounded-xl group-hover:scale-115 transition-transform duration-300 bg-white p-0.5 border"
          />
          <span className="font-extrabold text-lg tracking-tight">Chimney Doctors</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold leading-none">{profile?.full_name || 'Customer'}</span>
            <span className="text-xs text-muted-foreground mt-0.5">My Account</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <form action={logout}>
            <button type="submit" className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page title + CTA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fadeInUp">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Track your bookings and manage your service history.</p>
          </div>
          <Link href="/#services" className={buttonVariants({ className: 'gap-2 rounded-xl' })}>
            <PlusCircle className="w-4 h-4" /> Book New Service
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 animate-stagger">
          {[
            { label: 'Total Bookings', value: bookings?.length || 0, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Pending Jobs', value: pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Completed Jobs', value: completed, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fadeInUp">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-extrabold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings List */}
        <div className="animate-fadeInUp">
          <h2 className="text-lg font-bold mb-4">Your Bookings</h2>
          {(!bookings || bookings.length === 0) ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">No bookings yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Schedule your first chimney service and enjoy a cleaner kitchen.</p>
              <Link href="/#services" className={buttonVariants({ variant: 'outline', className: 'gap-2' })}>
                <PlusCircle className="w-4 h-4" /> Browse Services
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {bookings.map((booking, idx) => {
                const statusConfig = getStatusConfig(booking.status)
                const StatusIcon = statusConfig.icon
                return (
                  <div
                    key={booking.id}
                    className="bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fadeInUp"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {/* Card Header */}
                    <div className="px-5 py-4 border-b border-border/50 flex justify-between items-center bg-muted/30">
                      <div className="font-bold text-sm truncate max-w-[55%]">{booking.services?.name}</div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.className}`}>
                        <StatusIcon className="w-3 h-3" /> {statusConfig.label}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{new Date(booking.scheduled_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-muted-foreground shrink-0">Address:</span>
                        <span className="font-medium line-clamp-1">{booking.address}, {booking.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <IndianRupee className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-bold text-primary">₹{booking.total_amount}</span>
                      </div>

                      {booking.technician && (
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {booking.technician.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Assigned Technician</div>
                            <div className="text-sm font-semibold">{booking.technician.name}</div>
                          </div>
                          {booking.technician.phone && (
                            <span className="ml-auto text-xs text-muted-foreground">{booking.technician.phone}</span>
                          )}
                        </div>
                      )}

                      {booking.status === 'completed' && (
                        <div className="mt-2 pt-3 border-t border-border/50">
                          <Link
                            href={`/dashboard/feedback/${booking.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold transition-colors border border-amber-200"
                          >
                            ★ Submit Feedback & Rating
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
