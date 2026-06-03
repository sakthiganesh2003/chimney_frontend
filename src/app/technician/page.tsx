import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logout } from '../auth/actions'
import { Flame, LogOut, CheckCircle2, MapPin, Calendar, Wrench } from 'lucide-react'
import { updateBookingStatus } from './actions'

export default async function TechnicianDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'technician') redirect('/dashboard')

  // Fetch assigned jobs that are not cancelled
  const { data: jobs } = await supabase
    .from('bookings')
    .select(`
      *,
      services ( name ),
      customer:profiles!customer_id ( full_name, phone )
    `)
    .eq('technician_id', user.id)
    .neq('status', 'cancelled')
    .order('scheduled_date', { ascending: true })

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Tech Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{profile?.full_name}</span>
          <form action={logout}>
            <button type="submit" className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Assigned Jobs</h1>
          <p className="text-muted-foreground mt-1">Manage your active service requests.</p>
        </div>

        <div className="grid gap-6">
          {(!jobs || jobs.length === 0) ? (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
                You have no assigned jobs at the moment.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {jobs.map((job) => (
                <Card key={job.id} className={job.status === 'completed' ? 'opacity-70' : ''}>
                  <CardHeader className="pb-3 border-b bg-muted/10">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{job.services?.name}</CardTitle>
                      {job.status === 'completed' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1"/> Done</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Active</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Scheduled For</p>
                        <p className="text-sm text-muted-foreground">{new Date(job.scheduled_date).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{job.address}</p>
                      </div>
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-xs text-muted-foreground mb-1">Customer Details</p>
                      <p className="text-sm font-medium">{job.customer?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{job.customer?.phone || 'No phone provided'}</p>
                    </div>
                    {job.notes && (
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-xs font-medium mb-1">Notes</p>
                        <p className="text-sm">{job.notes}</p>
                      </div>
                    )}
                    {job.status !== 'completed' && (
                      <form action={updateBookingStatus} className="pt-4 border-t">
                        <input type="hidden" name="booking_id" value={job.id} />
                        <input type="hidden" name="status" value="completed" />
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Completed
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
