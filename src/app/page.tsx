import Link from "next/link"
import { createClient } from '@/utils/supabase/server'
import { buttonVariants } from "@/components/ui/button"
import { CheckCircle2, Phone, Star, Clock, Shield, Flame, Wrench, Sparkles, MapPin, ArrowRight, ChevronRight } from "lucide-react"
import { HeroSlider } from "@/components/HeroSlider"
import { Navbar } from "@/components/Navbar"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: services } = await supabase.from('services').select('*').order('created_at', { ascending: true })

  const serviceIcons = [Flame, Sparkles, Wrench, Shield, Wrench, CheckCircle2]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1">
        <HeroSlider />

        {/* ── Services Section ── */}
        <section id="services" className="py-24 md:py-32 px-4 relative z-10 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16 animate-fadeInUp">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
                <Flame className="w-3.5 h-3.5" /> Premium Solutions
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">Our Services</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                Comprehensive, highly-rated solutions for all your chimney needs. Transparent pricing and guaranteed satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
              {services?.map((service: any, i: number) => {
                const Icon = serviceIcons[i % serviceIcons.length]
                const imageUrl = service.images?.[0] || 'https://images.unsplash.com/photo-1585058178121-654dbbdc45e5?q=80&w=600&auto=format&fit=crop'
                return (
                  <div
                    key={service.id}
                    className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500 animate-fadeInUp"
                  >
                    {/* Image Header */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Icon overlay */}
                      <div className="absolute top-4 left-4 h-10 w-10 rounded-xl bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{service.name}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-5">{service.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <span className="font-bold text-lg text-primary">{service.price_estimate}</span>
                        <Link
                          href={`/services/${service.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-3 transition-all duration-300"
                        >
                          View Details <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="py-14 bg-primary">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-primary-foreground">
              {[
                { number: "5000+", label: "Happy Customers" },
                { number: "10+", label: "Years Experience" },
                { number: "98%", label: "Satisfaction Rate" },
                { number: "50+", label: "Expert Technicians" },
              ].map((stat, i) => (
                <div key={i} className="animate-fadeInUp">
                  <div className="text-4xl font-extrabold mb-1">{stat.number}</div>
                  <div className="text-primary-foreground/75 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="py-24 md:py-32 px-4 bg-muted/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-slideInLeft">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
                  The ChimneyCare Difference
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-10">Why Choose Us?</h2>
                <div className="space-y-7">
                  {[
                    { title: "Verified Professionals", desc: "Our technicians undergo rigorous background checks and continuous training to ensure top-quality service.", icon: Shield },
                    { title: "Transparent Pricing", desc: "No hidden fees or surprise charges. You pay only for what you agreed to beforehand.", icon: CheckCircle2 },
                    { title: "Pay After Service", desc: "We accept Cash or UPI only after the job is completed and you are 100% satisfied.", icon: Wrench },
                    { title: "Warranty Assured", desc: "We provide a comprehensive service warranty on all our repairs for your peace of mind.", icon: Star },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5 group animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-background border border-primary/20 shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:scale-110 transition-all duration-300">
                        <item.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1.5">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative animate-fadeInUp">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] border-4 border-background transform rotate-1 hover:rotate-0 transition-transform duration-700">
                  <img
                    src="https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=1200&auto=format&fit=crop"
                    alt="Professional Chimney Service"
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-8 left-7 right-7 text-white">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                    </div>
                    <p className="font-medium leading-snug text-white/90 text-sm">"The best chimney service I've ever experienced. Highly professional and spotless clean."</p>
                    <p className="text-xs text-white/60 mt-2">— Verified Customer</p>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -left-4 bg-background border border-border shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Response Time</div>
                    <div className="font-bold text-sm">Under 30 mins</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-24 md:py-32 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16 animate-fadeInUp">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
                Simple Process
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">How It Works</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">Four simple steps to a cleaner, safer, and more efficient kitchen.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center animate-stagger">
              {[
                { title: "Book Online", icon: Clock, desc: "Choose your service and preferred time slot from our easy booking form." },
                { title: "Confirm Address", icon: MapPin, desc: "Provide your full address, city, pincode and landmark details." },
                { title: "Service Delivered", icon: Wrench, desc: "Our expert technician arrives on time and completes the job." },
                { title: "Pay After Service", icon: Shield, desc: "Pay via Cash or UPI only after you are 100% satisfied." },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center group animate-fadeInUp">
                  <div className="relative h-28 w-28 rounded-full bg-muted flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:bg-primary group-hover:shadow-primary/30 group-hover:shadow-2xl transition-all duration-500">
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold shadow-md">
                      {i + 1}
                    </span>
                    <step.icon className="h-10 w-10 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[180px]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-14 animate-fadeInUp">
              <h2 className="text-4xl font-extrabold tracking-tight mb-3">What Customers Say</h2>
              <p className="text-muted-foreground">Trusted by thousands of happy households.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 animate-stagger">
              {[
                { name: "Priya Sharma", location: "Mumbai", text: "Excellent service! The technician was very professional and cleaned the chimney spotlessly. Highly recommend!", rating: 5 },
                { name: "Rahul Verma", location: "Delhi", text: "Very quick response and fair pricing. My chimney now works perfectly. Will definitely book again.", rating: 5 },
                { name: "Anita Patel", location: "Bangalore", text: "Great experience from booking to service completion. Easy to use website and very reliable technicians.", rating: 5 },
              ].map((review, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-2xl p-7 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 animate-fadeInUp">
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed italic mb-6">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{review.name}</div>
                      <div className="text-xs text-muted-foreground">{review.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative py-28 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-amber-600 z-0" />
          <div className="absolute inset-0 opacity-10 z-0"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585058178121-654dbbdc45e5?q=80&w=2000&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-black/10 blur-3xl" />

          <div className="container mx-auto max-w-4xl relative z-10 text-center animate-fadeInUp">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-primary-foreground mb-6 border border-white/20">
              Book Today
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Ready to revive<br/>your chimney?
            </h2>
            <p className="text-xl text-white/80 font-medium mb-10 max-w-2xl mx-auto">
              Book our expert service today and breathe clean air in your kitchen again. Pay only after completion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#services"
                className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full bg-white text-primary font-bold text-lg shadow-2xl hover:scale-105 hover:shadow-white/30 transition-all duration-300"
              >
                View Services <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full border-2 border-white/40 text-white font-bold text-lg hover:bg-white/10 transition-all duration-300"
              >
                <Phone className="w-5 h-5" /> Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t bg-slate-950 text-slate-400">
        <div className="container mx-auto max-w-7xl px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-primary p-2 rounded-xl">
                <Flame className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">ChimneyCare</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-sm">
              Professional Chimney Services at Your Doorstep. We ensure your kitchen is clean, safe, and efficient.
            </p>
            <div className="flex gap-3 mt-6">
              {["Pay Cash", "Pay UPI"].map((t) => (
                <span key={t} className="text-xs border border-slate-700 rounded-full px-3 py-1 text-slate-400">{t}</span>
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
            <h4 className="font-bold text-white mb-5 uppercase tracking-widest text-xs">Info</h4>
            <ul className="space-y-3 text-sm">
              {["About Us", "FAQ", "Terms of Service", "Privacy Policy"].map((s) => (
                <li key={s}><Link href="#" className="hover:text-primary transition-colors duration-200">{s}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-6 text-center text-slate-600 text-sm">
          © {new Date().getFullYear()} ChimneyCare. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
