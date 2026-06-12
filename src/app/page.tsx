import Link from "next/link"
import { createClient } from '@/utils/supabase/server'
import { buttonVariants } from "@/components/ui/button"
import {
  CheckCircle2, Phone, Star, Clock, Shield, Flame,
  Wrench, Sparkles, MapPin, ArrowRight, ChevronRight,
  Award, HeartHandshake, BadgeCheck, Mail, Images
} from "lucide-react"
import { HeroSlider } from "@/components/HeroSlider"
import { Navbar } from "@/components/Navbar"
import { ContactForm } from "@/components/ContactForm"

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

  // Fetch gallery images from storage bucket
  const { data: galleryData } = await supabase.storage.from('gallery-images').list('', {
    limit: 6,
    sortBy: { column: 'created_at', order: 'desc' },
  })

  const uploadedImages = (galleryData || [])
    .filter((f) => f.name !== '.emptyFolderPlaceholder')
    .map((f) => ({
      name: f.name,
      publicUrl: supabase.storage.from('gallery-images').getPublicUrl(f.name).data.publicUrl,
    }))

  // High quality fallbacks if gallery has no uploads yet
  const fallbackImages = [
    { name: 'fb1', publicUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop' },
    { name: 'fb2', publicUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop' },
    { name: 'fb3', publicUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop' },
    { name: 'fb4', publicUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop' },
    { name: 'fb5', publicUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop' },
    { name: 'fb6', publicUrl: 'https://images.unsplash.com/photo-1585058178121-654dbbdc45e5?q=80&w=800&auto=format&fit=crop' },
  ]

  const galleryImages = uploadedImages.length > 0 ? uploadedImages : fallbackImages

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

        {/* ── Gallery Section ── */}
        <section id="gallery" className="py-24 px-4 bg-white border-t border-slate-100">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-14 animate-fadeInUp">
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                Our Work
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Recent Projects Gallery
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Real photos of our chimney cleaning, installation, and repair projects across Chennai.
              </p>
            </div>

            {/* Grid of images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
              {galleryImages.slice(0, 6).map((img, idx) => (
                <div 
                  key={img.name} 
                  className="relative aspect-video rounded-2xl overflow-hidden shadow-sm hover:shadow-xl group border border-slate-200 transition-all duration-300 hover:-translate-y-1"
                >
                  <img
                    src={img.publicUrl}
                    alt={`Chimney service project ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                    <div className="flex items-center gap-2 text-white">
                      <Images className="w-4 h-4 text-white/80" />
                      <span className="text-sm font-semibold tracking-wide">
                        Verified Project Completed
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 font-bold text-primary hover:text-primary/90 hover:underline group text-sm"
              >
                View Full Gallery Page <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
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

        {/* ── Contact Us & Map Section ── */}
        <section id="contact" className="py-24 px-4 bg-slate-50 border-t border-slate-100">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-14 animate-fadeInUp">
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                Get In Touch
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Contact Us
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg">
                Have questions about our service? Drop us a message, or find us on the map.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
              {/* Left: Contact Form & Info */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Send us a Message</h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Fill out the form below, and we will get back to you within 30 minutes.
                  </p>
                  <ContactForm services={services || []} />
                </div>

                {/* Quick Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-8 mt-8 text-left">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Call Us</h4>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">+91 93615 64650</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Us</h4>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">info@chimneydoc.in</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hours</h4>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">24/7 Available</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Map */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex-1 flex flex-col">
                  <div className="mb-4 text-left">
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" /> Our Location
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      17B, kennet cross road, Eliss nagar, Madurai-10 
                      Landmark: Opposite to Chitra parcel services
                    </p>
                  </div>
                  
                  {/* Google Map iframe */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-100 flex-1 min-h-[350px]">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.88653926563!2d80.11718712165039!3d13.047525316301389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1718105742111!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: '350px' }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Chimney Doctors Chennai Location"
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                </div>

                {/* Service Badge Area */}
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Express Doorstep Service</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                      Our certified service technicians are strategically located across Chennai to provide assistance within 30 minutes.
                    </p>
                  </div>
                </div>
              </div>
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

      {/* Floating WhatsApp and Phone Call buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/919361564650?text=Hi%20Chimney%20Doctors%2C%20I%20would%20like%20to%20book%20a%20service."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300 group relative animate-floating-active animate-sonar"
          aria-label="Chat on WhatsApp"
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.416 1.46 5.515 0 10.002-4.484 10.005-9.998.002-2.67-1.037-5.18-2.92-7.067C17.265 1.662 14.755.626 12.01.626c-5.518 0-10.005 4.486-10.008 10c-.001 1.93.504 3.812 1.461 5.422L2.387 20.3l4.26-1.146zm11.233-5.321c-.3-.15-1.774-.875-2.049-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.89-1.687-1.493-1.49-1.668-1.79-.175-.3-.018-.462.13-.611.134-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52-.172-.007-.368-.009-.565-.009-.197 0-.517.074-.788.374-.27.3-1.03 1.007-1.03 2.456s1.056 2.846 1.203 3.045c.149.2 2.077 3.173 5.033 4.448.703.303 1.252.483 1.68.619.706.224 1.35.193 1.859.117.568-.085 1.774-.726 2.024-1.427.25-.7.25-1.3.175-1.427-.075-.125-.275-.2-.575-.35z" />
          </svg>
          <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Chat on WhatsApp
          </span>
        </a>

        {/* Call Button */}
        <a
          href="tel:+919361564650"
          className="flex items-center justify-center w-14 h-14 bg-primary hover:bg-primary/95 text-white rounded-full shadow-xl hover:scale-110 transition-all duration-300 group relative animate-floating-active animate-sonar [animation-delay:1.5s]"
          aria-label="Call Us"
        >
          <Phone className="w-6 h-6" />
          <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Call Chimney Doctors
          </span>
        </a>
      </div>
    </div>
  )
}
