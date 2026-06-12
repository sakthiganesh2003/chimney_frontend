import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { assignTechnician } from '../actions'
import { Pagination } from '@/components/ui/pagination'
import { DeleteBookingButton } from '@/components/DeleteBookingButton'
import { FilterForm } from '@/components/FilterForm'
import { ViewBookingModal } from '@/components/ViewBookingModal'
import {
  CalendarDays, User, Phone, MapPin, Clock, Trash2,
  Filter, Search, AlertCircle, MessageSquare
} from 'lucide-react'

const PAGE_SIZE = 5

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed:   'bg-blue-100   text-blue-800   border-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completed:   'bg-green-100  text-green-800  border-green-200',
  cancelled:   'bg-red-100    text-red-800    border-red-200',
}
const STATUS_EMOJI: Record<string, string> = {
  pending: '🟡', confirmed: '🔵', in_progress: '🟣', completed: '🟢', cancelled: '🔴',
}

export default async function AdminBookings({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    technician?: string
    search?: string
    date?: string   // 'today' | 'week' | 'month' | ''
    page?: string
  }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const params        = await searchParams
  const statusFilter    = params.status    || ''
  const technicianFilter = params.technician || ''
  const searchFilter    = params.search    || ''
  const dateFilter      = params.date      || ''
  const page            = Math.max(1, parseInt(params.page || '1', 10))

  // ── Build main query ───────────────────────────────────────────────────────
  let query = supabase.from('bookings').select(`
    *,
    services ( name ),
    customer:profiles!customer_id ( full_name, phone ),
    technician:technicians!technician_ref_id ( id, name, phone )
  `)

  if (statusFilter)  query = query.eq('status', statusFilter)
  if (technicianFilter) {
    technicianFilter === 'unassigned'
      ? (query = query.is('technician_ref_id', null))
      : (query = query.eq('technician_ref_id', technicianFilter))
  }

  // Date range filter
  const now = new Date()
  if (dateFilter === 'today') {
    const start = new Date(now); start.setHours(0, 0, 0, 0)
    const end   = new Date(now); end.setHours(23, 59, 59, 999)
    query = query.gte('scheduled_date', start.toISOString()).lte('scheduled_date', end.toISOString())
  } else if (dateFilter === 'week') {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0)
    const end   = new Date(now); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999)
    query = query.gte('scheduled_date', start.toISOString()).lte('scheduled_date', end.toISOString())
  } else if (dateFilter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    query = query.gte('scheduled_date', start.toISOString()).lte('scheduled_date', end.toISOString())
  }

  // ── Count for pagination ───────────────────────────────────────────────────
  let countQ = supabase.from('bookings').select('*', { count: 'exact', head: true })
  if (statusFilter)    countQ = countQ.eq('status', statusFilter)
  if (technicianFilter) {
    technicianFilter === 'unassigned'
      ? (countQ = countQ.is('technician_ref_id', null))
      : (countQ = countQ.eq('technician_ref_id', technicianFilter))
  }
  if (dateFilter === 'today') {
    const s = new Date(now); s.setHours(0,0,0,0)
    const e = new Date(now); e.setHours(23,59,59,999)
    countQ = countQ.gte('scheduled_date', s.toISOString()).lte('scheduled_date', e.toISOString())
  } else if (dateFilter === 'week') {
    const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0,0,0,0)
    const e = new Date(now); e.setDate(s.getDate() + 6); e.setHours(23,59,59,999)
    countQ = countQ.gte('scheduled_date', s.toISOString()).lte('scheduled_date', e.toISOString())
  } else if (dateFilter === 'month') {
    const s = new Date(now.getFullYear(), now.getMonth(), 1)
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    countQ = countQ.gte('scheduled_date', s.toISOString()).lte('scheduled_date', e.toISOString())
  }
  const { count: totalCount } = await countQ

  // ── Fetch paginated data ───────────────────────────────────────────────────
  const start = (page - 1) * PAGE_SIZE
  const end   = start + PAGE_SIZE - 1
  const { data: bookings, error: bookingsError } = await query.order('created_at', { ascending: false }).range(start, end)
  if (bookingsError) console.error('🔴 Bookings fetch error:', JSON.stringify(bookingsError))

  // Client-side text search (applied after fetch for nested fields)
  let filteredBookings = bookings
  if (searchFilter && filteredBookings) {
    const q = searchFilter.toLowerCase()
    filteredBookings = filteredBookings.filter(b =>
      (b.customer?.full_name || b.guest_name || '').toLowerCase().includes(q) ||
      (b.customer?.phone || b.guest_phone || '').toLowerCase().includes(q) ||
      (b.services?.name || '').toLowerCase().includes(q) ||
      (b.address || '').toLowerCase().includes(q) ||
      (b.city || '').toLowerCase().includes(q) ||
      (b.pincode || '').toLowerCase().includes(q)
    )
  }

  // ── Technicians list for dropdowns ────────────────────────────────────────
  const { data: technicians } = await supabase.from('technicians').select('id, name, phone').order('name')

  // ── Today stats ───────────────────────────────────────────────────────────
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999)
  const { count: todayCount } = await supabase
    .from('bookings').select('*', { count: 'exact', head: true })
    .gte('scheduled_date', todayStart.toISOString())
    .lte('scheduled_date', todayEnd.toISOString())

  const { count: pendingCount } = await supabase
    .from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending')

  const extraParams: Record<string, string> = {}
  if (statusFilter)     extraParams.status     = statusFilter
  if (technicianFilter) extraParams.technician = technicianFilter
  if (searchFilter)     extraParams.search     = searchFilter
  if (dateFilter)       extraParams.date       = dateFilter

  const hasFilters = !!(statusFilter || technicianFilter || searchFilter || dateFilter)

  return (
    <div className="p-4 md:p-8">

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Bookings</h1>
          <p className="text-muted-foreground mt-1">Assign technicians, update statuses, and manage all orders.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Today badge */}
          <Link href="/admin/bookings?date=today">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-all
              ${dateFilter === 'today'
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}>
              <CalendarDays className="w-4 h-4" />
              Today
              <span className="bg-amber-200 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {todayCount ?? 0}
              </span>
            </div>
          </Link>
          <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-xl border">
            <span className="text-yellow-600 font-bold">{pendingCount ?? 0}</span> pending
            &nbsp;·&nbsp;
            <span className="font-bold text-foreground">{totalCount ?? 0}</span> total
          </div>
        </div>
      </div>

      {/* ── Quick Filter Tabs ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { label: '📋 All', value: '' },
          { label: '📅 Today', value: 'today' },
          { label: '📆 This Week', value: 'week' },
          { label: '🗓️ This Month', value: 'month' },
        ].map(tab => {
          const href = tab.value
            ? `/admin/bookings?date=${tab.value}${statusFilter ? `&status=${statusFilter}` : ''}`
            : `/admin/bookings${statusFilter ? `?status=${statusFilter}` : ''}`
          return (
            <Link key={tab.value} href={href}>
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer
                ${dateFilter === tab.value
                  ? 'bg-primary text-primary-foreground border-primary shadow'
                  : 'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                {tab.label}
              </span>
            </Link>
          )
        })}

        <div className="ml-auto flex flex-wrap gap-2">
          {(['pending','confirmed','in_progress','completed','cancelled'] as const).map(s => {
            const href = `/admin/bookings?status=${s}${dateFilter ? `&date=${dateFilter}` : ''}`
            return (
              <Link key={s} href={statusFilter === s ? `/admin/bookings${dateFilter ? `?date=${dateFilter}` : ''}` : href}>
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer
                  ${statusFilter === s
                    ? `${STATUS_STYLES[s]} border`
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                  }`}>
                  {STATUS_EMOJI[s]} {s.replace('_', ' ')}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Advanced Filter Panel ── */}
      <Card className="p-5 mb-6 border border-border/80 shadow-sm">
        <FilterForm
          technicians={technicians}
          searchFilter={searchFilter}
          technicianFilter={technicianFilter}
          dateFilter={dateFilter}
          statusFilter={statusFilter}
          hasFilters={hasFilters}
        />
      </Card>

      {technicians?.length === 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          No technicians found. Please{' '}
          <a href="/admin/technicians" className="font-semibold underline">add technicians</a>{' '}
          first before assigning bookings.
        </div>
      )}

      {/* ── Bookings Table ── */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/60 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3.5 font-semibold">#</th>
                <th className="px-5 py-3.5 font-semibold">Customer Details</th>
                <th className="px-5 py-3.5 font-semibold">Service & Address</th>
                <th className="px-5 py-3.5 font-semibold">Scheduled</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Technician</th>
                <th className="px-5 py-3.5 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBookings?.map((booking, idx) => {
                const customerName  = booking.customer?.full_name  || booking.guest_name  || 'Guest'
                const customerPhone = booking.customer?.phone      || booking.guest_phone || ''
                const isGuest       = !booking.customer_id

                return (
                  <tr key={booking.id} className="hover:bg-muted/20 transition-colors group">

                    {/* Row number */}
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">
                      {start + idx + 1}
                    </td>

                    {/* ── Customer Details ── */}
                    <td className="px-5 py-4 min-w-[220px]">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 mt-0.5">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5 flex-wrap">
                            {customerName}
                            {isGuest && (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                                GUEST
                              </span>
                            )}
                          </div>

                          {/* Phone */}
                          {customerPhone && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-xs text-slate-600 font-medium">{customerPhone}</span>
                              <a
                                href={`https://wa.me/91${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Hi ${customerName}, this is Chimney Doctors. Your booking for ${booking.services?.name || 'Chimney Service'} is ${booking.status.replace('_', ' ').toUpperCase()}.`
                                )}`}
                                target="_blank" rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700"
                                title="WhatsApp"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.416 1.46 5.515 0 10.002-4.484 10.005-9.998.002-2.67-1.037-5.18-2.92-7.067C17.265 1.662 14.755.626 12.01.626c-5.518 0-10.005 4.486-10.008 10c-.001 1.93.504 3.812 1.461 5.422L2.387 20.3l4.26-1.146zm11.233-5.321c-.3-.15-1.774-.875-2.049-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.89-1.687-1.493-1.49-1.668-1.79-.175-.3-.018-.462.13-.611.134-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52-.172-.007-.368-.009-.565-.009-.197 0-.517.074-.788.374-.27.3-1.03 1.007-1.03 2.456s1.056 2.846 1.203 3.045c.149.2 2.077 3.173 5.033 4.448.703.303 1.252.483 1.68.619.706.224 1.35.193 1.859.117.568-.085 1.774-.726 2.024-1.427.25-.7.25-1.3.175-1.427-.075-.125-.275-.2-.575-.35z"/>
                                </svg>
                              </a>
                            </div>
                          )}


                          {/* Notes */}
                          {booking.guest_notes && (
                            <div className="flex items-start gap-1 mt-1.5">
                              <MessageSquare className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-amber-700 font-medium leading-tight max-w-[180px]">
                                {booking.guest_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ── Service & Address ── */}
                    <td className="px-5 py-4 min-w-[200px]">
                      <div className="font-semibold text-slate-800">{booking.services?.name}</div>
                      <div className="flex items-start gap-1 mt-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-500 leading-tight max-w-[200px]">
                          {booking.address}
                          {booking.landmark ? `, ${booking.landmark}` : ''},&nbsp;
                          {booking.city} – {booking.pincode}
                        </p>
                      </div>
                    </td>

                    {/* ── Scheduled Date ── */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">
                          {new Date(booking.scheduled_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(booking.scheduled_date).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                        </span>
                      </div>
                    </td>

                    {/* ── Status ── */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[booking.status] || ''}`}>
                        {STATUS_EMOJI[booking.status]} {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>

                    {/* ── Technician ── */}
                    <td className="px-5 py-4">
                      {booking.technician ? (
                        <div>
                          <div className="font-semibold text-blue-700 text-sm">{booking.technician.name}</div>
                          {booking.technician.phone && (
                            <div className="text-xs text-muted-foreground">{booking.technician.phone}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-amber-600 text-xs font-semibold italic flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Unassigned
                        </span>
                      )}
                    </td>

                    {/* ── Actions ── */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2 items-end min-w-[260px]">

                        {/* Update form */}
                        {booking.status !== 'completed' && booking.status !== 'cancelled' ? (
                          <form action={assignTechnician} className="flex gap-1.5 items-center flex-wrap justify-end w-full">
                            <input type="hidden" name="booking_id" value={booking.id} />
                            <select
                              name="technician_ref_id"
                              defaultValue={booking.technician_ref_id || ''}
                              className="text-xs border border-input rounded-lg px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring flex-1 min-w-[130px] font-medium"
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
                              defaultValue={booking.status}
                              className="text-xs border border-input rounded-lg px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
                            >
                              <option value="pending">🟡 Pending</option>
                              <option value="confirmed">🔵 Confirmed</option>
                              <option value="in_progress">🟣 In Progress</option>
                              <option value="completed">🟢 Completed</option>
                              <option value="cancelled">🔴 Cancelled</option>
                            </select>
                            <Button type="submit" size="sm" className="h-7 text-xs px-3 font-semibold">
                              Update
                            </Button>
                          </form>
                        ) : (
                          <span className="text-xs text-muted-foreground italic self-end">
                            {booking.status === 'completed' ? '✓ Completed' : '✗ Cancelled'}
                          </span>
                        )}

                        {/* Action buttons (View Details & Delete) */}
                        <div className="flex items-center gap-2 mt-1">
                          <ViewBookingModal booking={booking} />
                          <DeleteBookingButton
                            bookingId={booking.id}
                            customerName={customerName}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {(!filteredBookings || filteredBookings.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                    <div className="text-5xl mb-3">📋</div>
                    <p className="font-semibold text-slate-600 mb-1">No bookings found</p>
                    <p className="text-xs text-slate-400">
                      {hasFilters ? 'Try adjusting or clearing your filters.' : 'No bookings have been made yet.'}
                    </p>
                    {hasFilters && (
                      <Link href="/admin/bookings" className="inline-flex mt-3 text-xs font-semibold text-primary underline">
                        Clear all filters
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Pagination ── */}
      <Pagination
        page={page}
        totalCount={totalCount || 0}
        pageSize={PAGE_SIZE}
        baseUrl="/admin/bookings"
        extraParams={extraParams}
      />
    </div>
  )
}
