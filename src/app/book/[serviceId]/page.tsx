import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Calendar, Home, Building2, Hash, Landmark, CheckCircle2, IndianRupee, Phone } from 'lucide-react'

export default async function BookServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?message=Please log in to book a service`)

  const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single()

  const { data: service } = await supabase.from('services').select('*').eq('id', serviceId).single()
  if (!service) redirect('/#services')

  async function createBooking(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const scheduledDate = formData.get('scheduled_date') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const pincode = formData.get('pincode') as string
    const landmark = formData.get('landmark') as string
    const phone = formData.get('phone') as string

    // Update phone in customer profile
    if (phone) {
      await supabase.from('profiles').update({ phone }).eq('id', user.id)
    }

    const { data: serviceData } = await supabase.from('services').select('price_estimate').eq('id', serviceId).single()

    const { error } = await supabase.from('bookings').insert({
      customer_id: user.id,
      service_id: serviceId,
      scheduled_date: new Date(scheduledDate).toISOString(),
      address,
      city,
      pincode,
      landmark,
      status: 'pending',
      total_amount: serviceData?.price_estimate ? parseInt(serviceData.price_estimate.replace(/[^0-9]/g, '')) : 0
    })

    if (!error) redirect('/dashboard?message=Booking created successfully!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm px-4 py-4">
        <div className="container mx-auto flex items-center gap-4 max-w-6xl">
          <Link href={`/services/${serviceId}`} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg">Complete Your Booking</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* ─── Form (left) ─── */}
          <div className="lg:col-span-3 animate-fadeInUp">
            <form action={createBooking} className="space-y-7">

              {/* Date & Time */}
              <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Preferred Date & Time</h3>
                    <p className="text-xs text-muted-foreground">Select when you&apos;d like the service</p>
                  </div>
                </div>
                <Input
                  id="scheduled_date"
                  name="scheduled_date"
                  type="datetime-local"
                  required
                  className="h-11 text-sm"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Contact Information */}
              <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Phone className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Contact Information</h3>
                    <p className="text-xs text-muted-foreground">Technician will call this number before arrival</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">Mobile Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="Enter 10-digit mobile number"
                    pattern="[6-9][0-9]{9}"
                    title="Please enter a valid 10-digit Indian mobile number"
                    defaultValue={profile?.phone || ''}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Address Details</h3>
                    <p className="text-xs text-muted-foreground">Where should our technician come?</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-muted-foreground" /> Full Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Flat/House No., Street, Area"
                      required
                      minLength={5}
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-sm font-medium flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> City
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="e.g. Mumbai"
                        required
                        pattern="[A-Za-z\s]+"
                        title="City name should only contain letters"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="text-sm font-medium flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Pincode
                      </Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        placeholder="e.g. 400001"
                        required
                        pattern="^[1-9][0-9]{5}$"
                        title="Enter a valid 6-digit Indian Pincode"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="landmark" className="text-sm font-medium flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-muted-foreground" /> Landmark <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <Input id="landmark" name="landmark" placeholder="Near school, temple, etc." className="h-11" />
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full h-13 text-base rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-300">
                Confirm Booking
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By confirming, you agree to our service terms. Payment is accepted after service completion only.
              </p>
            </form>
          </div>

          {/* ─── Service Summary (right) ─── */}
          <div className="lg:col-span-2 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm sticky top-24">
              {/* Service image */}
              {service.images?.[0] && (
                <div className="aspect-video overflow-hidden">
                  <img src={service.images[0]} alt={service.name} className="w-full h-full object-cover" />
                </div>
              )}
              {!service.images?.[0] && (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                </div>
              )}

              <div className="p-6">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary mb-3">
                  Selected Service
                </span>
                <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{service.description}</p>

                <div className="border-t pt-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Price</span>
                    <span className="font-bold text-primary text-base">{service.price_estimate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium">Cash / UPI</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">When to Pay</span>
                    <span className="font-medium text-green-600">After Service</span>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 border border-green-200/50 dark:border-green-800/50">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
                    You only pay after the service is completed and you are satisfied. No upfront payment required.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
