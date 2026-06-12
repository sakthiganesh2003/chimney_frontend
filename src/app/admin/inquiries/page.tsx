import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Clock, MessageSquare, Flame } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'

export default async function AdminInquiries({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const supabase = await createClient()

  // Security check: Only allow admins
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const params = await searchParams
  const searchFilter = params.search || ''
  const PAGE_SIZE = 10
  const page = Math.max(1, parseInt(params.page || '1', 10))

  // Count total
  const { count: totalCount } = await supabase
    .from('contact_submissions')
    .select('*', { count: 'exact', head: true })

  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  // Fetch contact submissions sorted by newest first
  let { data: inquiries } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .range(start, end)

  // Client-side text filter for nested/complex fields
  if (searchFilter && inquiries) {
    const searchLower = searchFilter.toLowerCase()
    inquiries = inquiries.filter(inquiry => {
      const name = (inquiry.name || '').toLowerCase()
      const phone = (inquiry.phone || '').toLowerCase()
      const email = (inquiry.email || '').toLowerCase()
      const service = (inquiry.service_type || '').toLowerCase()
      const message = (inquiry.message || '').toLowerCase()
      return name.includes(searchLower) ||
             phone.includes(searchLower) ||
             email.includes(searchLower) ||
             service.includes(searchLower) ||
             message.includes(searchLower)
    })
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Inquiries</h1>
          <p className="text-muted-foreground mt-1">
            View and respond to inquiries submitted from the website contact form.
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg shrink-0">
          Total: <strong>{inquiries?.length || 0}</strong> inquiries
        </div>
      </div>

      {/* Filter panel */}
      <Card className="p-5 mb-6 border border-border/80 shadow-sm">
        <form method="GET" action="/admin/inquiries" className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search</label>
            <input
              type="text"
              name="search"
              placeholder="Search by name, phone, email, service, or message..."
              defaultValue={searchFilter}
              className="w-full text-sm border border-input rounded-md h-10 px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
            <Button type="submit" size="sm" className="h-10 font-bold px-5 shadow-sm">
              Filter
            </Button>
            {searchFilter && (
              <a href="/admin/inquiries" className="block">
                <Button type="button" variant="outline" size="sm" className="h-10 px-4">
                  Clear
                </Button>
              </a>
            )}
          </div>
        </form>
      </Card>

      {/* Inquiries Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Date &amp; Time</th>
                <th className="px-6 py-4 font-medium">Contact Details</th>
                <th className="px-6 py-4 font-medium">Requested Service</th>
                <th className="px-6 py-4 font-medium">Message</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {inquiries?.map((inquiry) => (
                <tr key={inquiry.id} className="hover:bg-muted/30">
                  {/* Date & Time */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>{new Date(inquiry.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(inquiry.created_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                    </div>
                  </td>

                  {/* Name & Contact */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{inquiry.name}</div>
                    <div className="text-xs text-muted-foreground flex flex-col gap-0.5 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {inquiry.phone}
                      </span>
                      {inquiry.email ? (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {inquiry.email}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No Email Provided</span>
                      )}
                    </div>
                  </td>

                  {/* Requested Service */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold 
                      ${inquiry.service_type ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                      <Flame className="w-3.5 h-3.5 shrink-0" />
                      {inquiry.service_type || 'General Inquiry'}
                    </span>
                  </td>

                  {/* Message */}
                  <td className="px-6 py-4 max-w-sm">
                    <div className="text-slate-700 leading-relaxed font-medium flex items-start gap-1.5">
                      <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="whitespace-pre-line">{inquiry.message}</p>
                    </div>
                  </td>

                  {/* WhatsApp Follow-up */}
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`https://wa.me/91${inquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hi ${inquiry.name}, this is Chimney Doctors. We received your contact message regarding ${inquiry.service_type || 'your inquiry'}: "${inquiry.message}". We are happy to help you!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02]"
                      title="Follow up with user on WhatsApp"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.416 1.46 5.515 0 10.002-4.484 10.005-9.998.002-2.67-1.037-5.18-2.92-7.067C17.265 1.662 14.755.626 12.01.626c-5.518 0-10.005 4.486-10.008 10c-.001 1.93.504 3.812 1.461 5.422L2.387 20.3l4.26-1.146zm11.233-5.321c-.3-.15-1.774-.875-2.049-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.89-1.687-1.493-1.49-1.668-1.79-.175-.3-.018-.462.13-.611.134-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52-.172-.007-.368-.009-.565-.009-.197 0-.517.074-.788.374-.27.3-1.03 1.007-1.03 2.456s1.056 2.846 1.203 3.045c.149.2 2.077 3.173 5.033 4.448.703.303 1.252.483 1.68.619.706.224 1.35.193 1.859.117.568-.085 1.774-.726 2.024-1.427.25-.7.25-1.3.175-1.427-.075-.125-.275-.2-.575-.35z" />
                      </svg>
                      WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
              {(!inquiries || inquiries.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="text-4xl mb-2">📋</div>
                    No inquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <Pagination
        page={page}
        totalCount={totalCount || 0}
        pageSize={PAGE_SIZE}
        baseUrl="/admin/inquiries"
        extraParams={{
          ...(searchFilter ? { search: searchFilter } : {}),
        }}
      />
    </div>
  )
}
