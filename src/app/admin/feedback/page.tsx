import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'

export default async function AdminFeedback() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:profiles!customer_id ( full_name ),
      booking:bookings!booking_id ( services ( name ) )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Customer Feedback</h1>
        <p className="text-muted-foreground mt-1">View ratings and reviews from customers.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reviews?.map((review) => (
          <Card key={review.id} className="flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold">{review.customer?.full_name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{review.booking?.services?.name}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground/30'}`} 
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
              <p className="text-sm italic text-muted-foreground">"{review.feedback}"</p>
              <div className="mt-6 text-xs text-slate-400">
                {new Date(review.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
        {(!reviews || reviews.length === 0) && (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-muted-foreground mb-2">No feedback has been submitted yet.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
