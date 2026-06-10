import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default async function AdminFeedback({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string; search?: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const params = await searchParams
  const ratingFilter = params.rating || ''
  const searchFilter = params.search || ''

  // Fetch all reviews
  let query = supabase
    .from('reviews')
    .select(`
      *,
      customer:profiles!customer_id ( full_name ),
      booking:bookings!booking_id ( services ( name ) )
    `)

  if (ratingFilter) {
    query = query.eq('rating', parseInt(ratingFilter))
  }

  let { data: reviews } = await query.order('created_at', { ascending: false })

  if (searchFilter && reviews) {
    const searchLower = searchFilter.toLowerCase()
    reviews = reviews.filter(review =>
      review.customer?.full_name?.toLowerCase().includes(searchLower) ||
      review.feedback?.toLowerCase().includes(searchLower) ||
      review.booking?.services?.name?.toLowerCase().includes(searchLower)
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Feedback</h1>
          <p className="text-muted-foreground mt-1">View ratings and reviews from customers.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg shrink-0">
          Total: <strong>{reviews?.length || 0}</strong> reviews
        </div>
      </div>

      {/* Filter panel */}
      <Card className="p-4 mb-6 border shadow-sm">
        <form method="GET" action="/admin/feedback" className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Feedback</label>
            <input
              type="text"
              name="search"
              placeholder="Search by customer name, feedback text, service..."
              defaultValue={searchFilter}
              className="w-full text-sm border border-input rounded-md h-9 px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring font-medium"
            />
          </div>
          
          <div className="w-full sm:w-44 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</label>
            <select
              name="rating"
              defaultValue={ratingFilter}
              className="w-full text-sm border border-input rounded-md h-9 px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring font-semibold"
            >
              <option value="">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
              <option value="2">⭐⭐ 2 Stars</option>
              <option value="1">⭐ 1 Star</option>
            </select>
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
            <Button type="submit" size="sm" className="h-9 font-bold px-4">
              Filter
            </Button>
            {(ratingFilter || searchFilter) && (
              <a href="/admin/feedback" className="block">
                <Button type="button" variant="outline" size="sm" className="h-9 px-3">
                  Clear
                </Button>
              </a>
            )}
          </div>
        </form>
      </Card>

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
              <p className="text-sm italic text-muted-foreground">&quot;{review.feedback}&quot;</p>
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
