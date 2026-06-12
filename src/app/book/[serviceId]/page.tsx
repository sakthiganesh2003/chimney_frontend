import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, MapPin, Calendar, Home, Building2,
  Hash, Landmark, CheckCircle2, Phone, User, MessageSquare, Flame
} from 'lucide-react'
import { PhoneInput } from '@/components/ui/PhoneInput'

export default async function BookServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params
  const supabase = await createClient()

  // Auth is optional — guests can book without login
  const { data: { user } } = await supabase.auth.getUser()
  const profileResult = user
    ? await supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
    : { data: null }
  const profile = profileResult.data

  const { data: service } = await supabase.from('services').select('*').eq('id', serviceId).single()
  if (!service) redirect('/#services')

  async function createBooking(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const guestName    = formData.get('guest_name')  as string
    const guestPhone   = formData.get('guest_phone') as string
    const guestNotes   = formData.get('guest_notes') as string
    const scheduledDate = formData.get('scheduled_date') as string
    const address      = formData.get('address')     as string
    const city         = formData.get('city')        as string
    const pincode      = formData.get('pincode')     as string
    const landmark     = formData.get('landmark')    as string

    if (!guestName || !guestPhone || !scheduledDate || !address || !city || !pincode) return

    // Update saved phone for logged-in users
    if (user && guestPhone) {
      await supabase.from('profiles').update({ phone: guestPhone }).eq('id', user.id)
    }

    const { data: serviceData } = await supabase
      .from('services').select('name, price_estimate').eq('id', serviceId).single()

    const totalAmount = serviceData?.price_estimate
      ? parseInt(serviceData.price_estimate.replace(/[^0-9]/g, '')) : 0

    const bookingPayload: Record<string, unknown> = {
      service_id: serviceId,
      scheduled_date: new Date(scheduledDate).toISOString(),
      address,
      city,
      pincode,
      landmark: landmark || null,
      status: 'pending',
      total_amount: totalAmount,
      guest_name: guestName,
      guest_phone: guestPhone,
      guest_notes: guestNotes || null,
    }
    if (user) bookingPayload.customer_id = user.id

    const { error } = await supabase.from('bookings').insert(bookingPayload)
    if (error) return

    // ── WhatsApp Notification ──────────────────────────────────────────────
    try {
      const apiKey = process.env.CALLMEBOT_API_KEY
      if (apiKey) {
        const formattedDate = new Date(scheduledDate).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
        const lines = [
          `🔔 *New Booking — Chimney Doctors*`,
          ``,
          `👤 Name:    ${guestName}`,
          `📞 Phone:   ${guestPhone}`,
          `🛠 Service: ${serviceData?.name ?? 'N/A'}`,
          `📅 Date:    ${formattedDate}`,
          `📍 Address: ${address}, ${city} — ${pincode}`,
          landmark ? `🏛 Landmark: ${landmark}` : null,
          guestNotes ? `📝 Notes:   ${guestNotes}` : null,
          `💰 Amount:  ₹${totalAmount}`,
          `💬 Chat:    https://wa.me/91${guestPhone.replace(/[^0-9]/g, '')}`,
        ].filter(Boolean).join('\n')

        await fetch(
          `https://api.callmebot.com/whatsapp.php?phone=919361564650&text=${encodeURIComponent(lines)}&apikey=${apiKey}`
        )
      }
    } catch {
      // Never block a booking if WhatsApp fails
    }
    // ──────────────────────────────────────────────────────────────────────

    if (user) {
      redirect('/dashboard?message=Booking confirmed!')
    } else {
      redirect(
        `/book/success?name=${encodeURIComponent(guestName)}&service=${encodeURIComponent(serviceData?.name ?? '')}&phone=${encodeURIComponent(guestPhone)}`
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm px-4 py-4">
        <div className="container mx-auto flex items-center gap-4 max-w-6xl">
          <Link href={`/services/${serviceId}`} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/" className="flex items-center gap-2 mr-auto">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight">
              Chimney<span className="text-primary">Doctors</span>
            </span>
          </Link>
          {!user && (
            <Link href="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Already have an account? <span className="underline">Login</span>
            </Link>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* ─── Booking Form ─── */}
          <div className="lg:col-span-3 animate-fadeInUp">
            <form action={createBooking} className="space-y-6">

              {/* Customer Details */}
              <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Your Details</h3>
                    <p className="text-xs text-muted-foreground">We will contact you to confirm the booking</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="guest_name" className="text-sm font-medium">Full Name *</Label>
                    <Input
                      id="guest_name"
                      name="guest_name"
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      defaultValue={profile?.full_name || ''}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="guest_phone" className="text-sm font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Mobile Number *
                    </Label>
                    <PhoneInput
                      id="guest_phone"
                      name="guest_phone"
                      required
                      placeholder="10-digit mobile number"
                      defaultValue={profile?.phone || ''}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">Must be exactly 10 digits starting with 6, 7, 8 or 9</p>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Preferred Date &amp; Time</h3>
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

              {/* Address */}
              <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Address Details</h3>
                    <p className="text-xs text-muted-foreground">Where should our technician come?</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-muted-foreground" /> Full Address *
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
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> City *
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="e.g. Chennai"
                        required
                        pattern="[A-Za-z\s]+"
                        title="City name should only contain letters"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pincode" className="text-sm font-medium flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" /> Pincode *
                      </Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        placeholder="e.g. 600001"
                        required
                        pattern="^[1-9][0-9]{5}$"
                        title="Enter a valid 6-digit Indian Pincode"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="landmark" className="text-sm font-medium flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-muted-foreground" />
                      Landmark <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <Input id="landmark" name="landmark" placeholder="Near school, temple, etc." className="h-11" />
                  </div>
                </div>
              </div>

              {/* Service Notes */}
              <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Additional Notes <span className="text-muted-foreground font-normal text-sm">(Optional)</span></h3>
                    <p className="text-xs text-muted-foreground">Describe your chimney issue or any special request</p>
                  </div>
                </div>
                <textarea
                  id="guest_notes"
                  name="guest_notes"
                  placeholder="e.g. Chimney makes noise, heavy grease build-up, installed 2 years ago..."
                  className="flex min-h-[90px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-13 text-base rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-300"
              >
                Confirm Booking
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By confirming, you agree to our service terms. Payment is accepted after service completion only.
              </p>
            </form>
          </div>

          {/* ─── Service Summary ─── */}
          <div className="lg:col-span-2 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm sticky top-24">
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

                {/* Trust badges */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {['Certified Technicians', 'Same-Day Service', 'Service Warranty', 'Pay After Work'].map((t) => (
                    <div key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
