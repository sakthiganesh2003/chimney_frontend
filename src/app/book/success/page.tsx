import Link from 'next/link'
import { CheckCircle2, Phone, Clock, Flame, ArrowRight } from 'lucide-react'

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; service?: string; phone?: string }>
}) {
  const params = await searchParams
  const name    = params.name    ? decodeURIComponent(params.name)    : 'Customer'
  const service = params.service ? decodeURIComponent(params.service) : 'Chimney Service'
  const phone   = params.phone   ? decodeURIComponent(params.phone)   : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary/5 flex flex-col">

      {/* Navbar */}
      <header className="w-full border-b bg-background/90 backdrop-blur-sm px-4 py-4">
        <div className="container mx-auto max-w-5xl flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight">
            Chimney<span className="text-primary">Doctors</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center animate-fadeInUp">

          {/* Success Icon */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />
            <div className="relative w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-slate-500 text-lg mb-8">
            Thank you, <strong className="text-slate-800">{name}</strong>!<br />
            Your request for <strong className="text-primary">{service}</strong> has been received.
          </p>

          {/* Info Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
            <div className="bg-white border border-border/60 rounded-2xl p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-1">We Will Call You</h3>
              <p className="text-xs text-slate-500">
                Our team will call {phone ? <strong>{phone}</strong> : 'your mobile number'} within <strong>30 minutes</strong> to confirm the appointment.
              </p>
            </div>

            <div className="bg-white border border-border/60 rounded-2xl p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 mb-1">Same Day Service</h3>
              <p className="text-xs text-slate-500">
                Our certified technician will arrive at your address at your preferred time. Payment only after completion.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white border border-border/60 rounded-2xl p-6 shadow-sm mb-8 text-left">
            <h3 className="font-bold text-slate-800 mb-4">What Happens Next?</h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Confirmation Call', desc: 'We call you within 30 minutes to confirm the booking details.' },
                { step: '2', title: 'Technician Assigned', desc: 'A certified technician near your area is assigned to your job.' },
                { step: '3', title: 'Service Completed', desc: 'Technician arrives, completes the job to your satisfaction.' },
                { step: '4', title: 'Pay After Service', desc: 'Pay via Cash or UPI only after you are 100% satisfied.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/#services"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all"
            >
              Book Another Service <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-border text-slate-600 font-semibold text-sm hover:bg-muted transition-colors"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
