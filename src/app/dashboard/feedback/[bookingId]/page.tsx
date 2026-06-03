import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'

export default async function FeedbackPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if booking belongs to user
  const { data: booking } = await supabase.from('bookings').select('*, services(name)').eq('id', bookingId).single()
  
  if (!booking || booking.customer_id !== user.id) {
    redirect('/dashboard')
  }

  // Check if feedback already exists
  const { data: existingReview } = await supabase.from('reviews').select('*').eq('booking_id', bookingId).single()

  if (existingReview) {
    return (
      <div className="min-h-screen py-12 px-4 bg-muted/20">
        <div className="container mx-auto max-w-lg text-center mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Already Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Thank you! You have already submitted feedback for this service.</p>
              <div className="mt-6">
                <Link href="/dashboard" className={buttonVariants({ variant: 'default', className: 'h-11 px-6 rounded-xl font-semibold' })}>
                  Back to Dashboard
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  async function submitFeedback(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const rating = formData.get('rating') as string
    const feedbackText = formData.get('feedback') as string

    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      customer_id: user.id,
      rating: parseInt(rating),
      feedback: feedbackText
    })

    if (!error) {
      redirect('/dashboard?message=Feedback submitted successfully')
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-muted/20">
      <div className="container mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Rate Your Service</CardTitle>
            <CardDescription>
              Please rate the completed service for <strong>{booking.services?.name}</strong>.
            </CardDescription>
          </CardHeader>
          <form action={submitFeedback}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1 to 5)</Label>
                <select 
                  id="rating" 
                  name="rating" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback">Write your feedback</Label>
                <textarea 
                  id="feedback" 
                  name="feedback" 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Tell us about your experience..."
                  required
                ></textarea>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6 bg-muted/10 rounded-b-lg">
              <Link href="/dashboard" className={buttonVariants({ variant: 'outline', className: 'h-10 px-4 rounded-xl font-semibold' })}>
                Cancel
              </Link>
              <Button type="submit" className="h-10 px-5 rounded-xl font-semibold">Submit Feedback</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
