import Link from "next/link"
import { createClient } from '@/utils/supabase/server'
import { buttonVariants } from "@/components/ui/button"
import {
  CheckCircle2, Phone, Star, Clock, Shield, Flame,
  Wrench, Sparkles, MapPin, ArrowRight, ChevronRight,
  Award, HeartHandshake, BadgeCheck
} from "lucide-react"
import { HeroSlider } from "@/components/HeroSlider"
import { Navbar } from "@/components/Navbar"

interface Service {
  id: string
  name: string
  description?: string
  price_estimate?: string
  additional_info?: string
  images?: string[]
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: services } = await supabase.from('services').select('*').order('created_at', { ascending: true })

  const serviceIcons = [Flame, Sparkles, Wrench, Shield, Wrench, CheckCircle2]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <HeroSlider />

        {/* ── Quick Trust Bar ── */}
        <section className="bg-primary py-4">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-white/90">
              {[
                { icon: BadgeCheck, text: 'Certified Professionals' },
                { icon: Shield, text: 'Service Warranty' },
                { icon: Clock, text: 'Same-Day Availability' },
                { icon: HeartHandshake, text: 'Pay After Service' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-white/70" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services Section ── */}
        <section id="services" className="py-24 px-4 bg-slate-50">
          <div className="container mx-auto max-w-7xl">
            {/* Section heading */}
            <div className="text-center mb-14 animate-fadeInUp">
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                What We Offer
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Our Services
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg">
                Comprehensive chimney solutions with transparent pricing and guaranteed workmanship.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 animate-stagger">
              {services?.map((service: Service, i: number) => {
                const Icon = serviceIcons[i % serviceIcons.length]
                const imageUrl = service.images?.[0] ||
                  'https://images.unsplash.com/photo-1585058178121-654dbbdc45e5?q=80&w=600&auto=format&fit=crop'
                return (
                  <div
                    key={service.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1.5 transition-all duration-400 animate-fadeInUp"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                      <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm shadow flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-5">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="font-bold text-primary text-base">{service.price_estimate}</span>
                        <Link
                          href={`/services/${service.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/8 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200"
                        >
                          View Details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "5,000+", label: "Happy Customers", icon: HeartHandshake },
                { number: "10+", label: "Years Experience", icon: Award },
                { number: "98%", label: "Satisfaction Rate", icon: Star },
                { number: "50+", label: "Expert Technicians", icon: BadgeCheck },
              ].map((stat, i) => (
                <div key={i} className="animate-fadeInUp group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <stat.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">{stat.number}</div>
                  <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section id="about" className="py-24 px-4 bg-slate-50 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left */}
              <div className="animate-slideInLeft">
                <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                  Why Chimney Doctors
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-10">
                  The most trusted name in chimney services
                </h2>
                <div className="space-y-6">
                  {[
                    { title: "Certified & Verified Professionals", desc: "Every technician undergoes thorough background checks and technical certification before joining our team.", icon: BadgeCheck },
                    { title: "Fully Transparent Pricing", desc: "Zero hidden costs. You are told the exact price before work begins — no surprises.", icon: CheckCircle2 },
                    { title: "Pay Only After Completion", desc: "We accept Cash or UPI only once the job is done and you are 100% satisfied.", icon: HeartHandshake },
                    { title: "Service Warranty Included", desc: "Every repair and installation comes with a comprehensive warranty for your peace of mind.", icon: Shield },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-primary/20 shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:scale-110 transition-all duration-300">
                        <item.icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right image */}
              <div className="relative animate-slideInRight hidden lg:block">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] border-4 border-white">
                  <img
                    src="/service-pro.png"
                    alt="Professional Chimney Service"
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="font-medium text-sm text-white/90 leading-snug">&quot;Best chimney service I have ever experienced. Highly professional!&quot;</p>
                    <p className="text-xs text-white/60 mt-1.5">— Verified Customer</p>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-5 -left-5 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 ring-2 ring-primary/20">
                    <img
                      src="/response-badge.png"
                      alt="Fast technician"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Response Time</div>
                    <div className="font-bold text-sm text-slate-900">Under 30 mins</div>
                  </div>
                </div>
                <div className="absolute -bottom-5 -right-5 bg-primary rounded-2xl shadow-xl px-4 py-3 text-white">
                  <div className="text-2xl font-extrabold">10+</div>
                  <div className="text-xs text-white/80 font-medium">Years of Trust</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-24 px-4 bg-white">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-14 animate-fadeInUp">
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                Simple Process
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">How It Works</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Four simple steps to a cleaner, safer kitchen.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
              {[
                { title: "Choose a Service", icon: Sparkles, desc: "Browse our services and select what your chimney needs." },
                { title: "Book a Slot", icon: Clock, desc: "Pick a date & time that works for you — we confirm instantly." },
                { title: "Expert Arrives", icon: Wrench, desc: "Our certified technician arrives on time with all equipment." },
                { title: "Pay After Service", icon: HeartHandshake, desc: "Pay via Cash or UPI only after you are fully satisfied." },
              ].map((step, i) => (
                <div key={i} className="relative bg-slate-50 border border-slate-200 rounded-2xl p-7 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 animate-fadeInUp group">
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white text-sm font-extrabold flex items-center justify-center shadow-md">
                    {i + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <step.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="reviews" className="py-24 px-4 bg-primary">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-14 animate-fadeInUp">
              <span className="inline-block bg-white/15 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                Customer Reviews
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight text-white mb-3">What Our Customers Say</h2>
              <p className="text-white/70 text-lg">Trusted by thousands of households across India.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 animate-stagger">
              {[
                { name: "Priya Sharma", location: "Mumbai", text: "Excellent service! The technician was very professional and cleaned the chimney spotlessly. Highly recommend!", rating: 5 },
                { name: "Rahul Verma", location: "Delhi", text: "Very quick response and fair pricing. My chimney now works perfectly. Will definitely book again.", rating: 5 },
                { name: "Anita Patel", location: "Bangalore", text: "Great experience from booking to completion. Easy website and very reliable technicians.", rating: 5 },
              ].map((review, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-7 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 animate-fadeInUp">
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/85 text-sm leading-relaxed mb-6">&quot;{review.text}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{review.name}</div>
                      <div className="text-xs text-white/60">{review.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-24 px-4 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585058178121-654dbbdc45e5?q=80&w=2000&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="container mx-auto max-w-4xl relative z-10 text-center animate-fadeInUp">
            <span className="inline-block bg-white/10 border border-white/15 text-white/80 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              Get Started Today
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Ready for a cleaner,<br />safer kitchen?
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Book our expert chimney service today. Pay only after the work is completed to your satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#services"
                className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full bg-primary text-white font-bold text-lg shadow-2xl shadow-primary/30 hover:scale-105 hover:shadow-primary/50 transition-all duration-300"
              >
                View Services <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full border-2 border-white/25 text-white font-bold text-lg hover:bg-white/10 transition-all duration-300"
              >
                <Phone className="w-5 h-5" /> Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="container mx-auto max-w-7xl px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-primary p-2 rounded-xl shadow-md shadow-primary/30">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Chimney<span className="text-primary">Doctors</span>
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed text-sm mb-6">
              Professional chimney services at your doorstep. Certified, trusted, and always on time.
            </p>
            <div className="flex gap-2">
              {["Pay Cash", "Pay UPI"].map((t) => (
                <span key={t} className="text-xs border border-slate-700 rounded-full px-3 py-1 text-slate-500">{t}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 uppercase tracking-widest text-xs">Services</h4>
            <ul className="space-y-3 text-sm">
              {["Installation", "Deep Cleaning", "Repair & Maintenance", "Inspection", "Uninstallation"].map((s) => (
                <li key={s}><Link href="/#services" className="hover:text-primary transition-colors duration-200">{s}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 uppercase tracking-widest text-xs">Account</h4>
            <ul className="space-y-3 text-sm">
              {[{ label: "Login", href: "/login" }, { label: "Sign Up", href: "/signup" }, { label: "My Dashboard", href: "/dashboard" }].map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-primary transition-colors duration-200">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-3 text-sm">
              {["About Us", "FAQ", "Terms of Service", "Privacy Policy"].map((s) => (
                <li key={s}><Link href="#" className="hover:text-primary transition-colors duration-200">{s}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-6 text-center text-slate-600 text-sm">
          © {new Date().getFullYear()} Chimney Doctors. All rights reserved. Made with ❤️ in India.
        </div>
      </footer>
    </div>
  )
}
