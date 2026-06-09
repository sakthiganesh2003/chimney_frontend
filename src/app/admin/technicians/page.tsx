import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { UserCog, Phone, Mail, Trash2, PlusCircle, Wrench, Calendar, FileText, CheckCircle2, ClipboardList } from 'lucide-react'
import { addTechnician, deleteTechnician, updateTechnician } from './actions'

export default async function AdminTechniciansPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; edit?: string; search?: string }>
}) {
  const { error: pageError, edit: editId, search: searchFilter } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all technicians
  let { data: technicians } = await supabase
    .from('technicians')
    .select('*')
    .order('created_at', { ascending: false })

  // Search filter
  if (searchFilter && technicians) {
    const searchLower = searchFilter.toLowerCase()
    technicians = technicians.filter(tech =>
      tech.name.toLowerCase().includes(searchLower) ||
      tech.phone?.toLowerCase().includes(searchLower) ||
      tech.email?.toLowerCase().includes(searchLower) ||
      tech.notes?.toLowerCase().includes(searchLower)
    )
  }

  const { data: bookingCounts } = await supabase
    .from('bookings')
    .select('technician_ref_id, status')
    .not('technician_ref_id', 'is', null)

  const getStats = (techId: string) => {
    const tb = bookingCounts?.filter(b => b.technician_ref_id === techId) || []
    return {
      active: tb.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length,
      completed: tb.filter(b => b.status === 'completed').length,
      total: tb.length,
    }
  }

  // Find technician being edited (if edit param set)
  const editingTech = editId ? technicians?.find(t => t.id === editId) : null

  return (
    <div className="p-4 md:p-8">

      {/* Error toast */}
      {pageError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
          ⚠ {decodeURIComponent(pageError)}
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Technicians</h1>
          <p className="text-muted-foreground mt-1">Add and manage field technicians. No login required.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
          <Wrench className="w-4 h-4" />
          <span><strong>{technicians?.length || 0}</strong> technician{(technicians?.length || 0) !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">

        {/* ── ADD FORM ── */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-24">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primary" />
                Add New Technician
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={addTechnician} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <Input id="name" name="name" placeholder="e.g. Ravi Kumar" required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" className="pl-9 h-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" placeholder="tech@example.com" className="pl-9 h-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <textarea
                      id="notes" name="notes"
                      placeholder="Skills, area, etc."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-10 gap-2">
                  <PlusCircle className="w-4 h-4" /> Add Technician
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* ── TECHNICIAN CARDS ── */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 border shadow-sm">
            <form method="GET" action="/admin/technicians" className="flex gap-2">
              <input
                type="text"
                name="search"
                placeholder="🔍 Search technician by name, phone, email, notes..."
                defaultValue={searchFilter || ''}
                className="flex-1 text-sm border border-input rounded-md h-9 px-3 bg-background focus:outline-none focus:ring-1 focus:ring-ring font-medium"
              />
              <Button type="submit" size="sm" className="h-9 px-4 font-semibold">Search</Button>
              {searchFilter && (
                <a href="/admin/technicians">
                  <Button type="button" variant="outline" size="sm" className="h-9 font-semibold">Clear</Button>
                </a>
              )}
            </form>
          </Card>

          {(!technicians || technicians.length === 0) ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <UserCog className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-1">No technicians yet</h3>
                <p className="text-muted-foreground text-sm">Add your first technician using the form on the left.</p>
              </CardContent>
            </Card>
          ) : (
            technicians.map((tech) => {
              const stats = getStats(tech.id)
              const isEditing = editingTech?.id === tech.id

              return (
                <Card key={tech.id} className={`overflow-hidden transition-shadow ${isEditing ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
                  <CardContent className="p-0">

                    {isEditing ? (
                      /* ── EDIT MODE ── */
                      <div className="p-5 bg-blue-50/60 dark:bg-blue-900/10">
                        <p className="text-sm font-semibold text-blue-700 mb-4">✏ Editing: {tech.name}</p>
                        <form action={updateTechnician} className="space-y-3">
                          <input type="hidden" name="id" value={tech.id} />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Full Name *</Label>
                              <Input name="name" defaultValue={tech.name} required className="h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Phone</Label>
                              <Input name="phone" defaultValue={tech.phone || ''} className="h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Email</Label>
                              <Input name="email" type="email" defaultValue={tech.email || ''} className="h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Notes</Label>
                              <Input name="notes" defaultValue={tech.notes || ''} className="h-9 text-sm" />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <a href="/admin/technicians">
                              <Button type="button" variant="outline" size="sm">Cancel</Button>
                            </a>
                            <Button type="submit" size="sm" className="gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Save Changes
                            </Button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* ── VIEW MODE ── */
                      <div className="flex items-start gap-4 p-5">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                          {tech.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h3 className="font-bold text-base leading-tight">{tech.name}</h3>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                                TECHNICIAN
                              </span>
                            </div>
                            {/* Action buttons */}
                            <div className="flex gap-1 shrink-0">
                              <a href={`/admin/technicians?edit=${tech.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-xs gap-1">
                                  ✏ Edit
                                </Button>
                              </a>
                              <form action={deleteTechnician}>
                                <input type="hidden" name="id" value={tech.id} />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                  title="Delete technician"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </form>
                            </div>
                          </div>

                          {/* Contact info */}
                          <div className="mt-3 space-y-1.5">
                            {tech.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3.5 h-3.5 shrink-0" /> {tech.phone}
                              </div>
                            )}
                            {tech.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3.5 h-3.5 shrink-0" /> {tech.email}
                              </div>
                            )}
                            {tech.notes && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FileText className="w-3.5 h-3.5 shrink-0" /> {tech.notes}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              Joined {new Date(tech.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="mt-4 flex gap-3">
                            <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5 text-center">
                              <div className="text-lg font-bold text-blue-700">{stats.active}</div>
                              <div className="text-xs text-blue-600 flex items-center justify-center gap-1">
                                <ClipboardList className="w-3 h-3" /> Active
                              </div>
                            </div>
                            <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 text-center">
                              <div className="text-lg font-bold text-green-700">{stats.completed}</div>
                              <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Done
                              </div>
                            </div>
                            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center">
                              <div className="text-lg font-bold text-slate-700">{stats.total}</div>
                              <div className="text-xs text-slate-500">Total</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
