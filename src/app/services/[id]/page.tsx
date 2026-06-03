import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch service details
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (!service) {
    notFound()
  }

  // Use a fallback image if no images exist
  const images = service.images?.length > 0 ? service.images : [
    'https://images.unsplash.com/photo-1585058178121-654dbbdc45e5?q=80&w=1200&auto=format&fit=crop'
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4 py-4 flex items-center">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/#services" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <span className="font-bold text-xl">Service Details</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border">
              <img 
                src={images[0]} 
                alt={service.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(1, 5).map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm border">
                    <img 
                      src={img} 
                      alt={`${service.name} - image ${i + 2}`} 
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-4 w-fit">
              Premium Service
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">{service.name}</h1>
            <p className="text-2xl font-semibold text-primary mb-6">{service.price_estimate}</p>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {service.description}
            </p>

            {service.additional_info && (
              <Card className="mb-8 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> Additional Information
                  </h3>
                  <div className="text-muted-foreground text-sm space-y-2 whitespace-pre-wrap">
                    {service.additional_info}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-auto pt-8 border-t">
              <Link 
                href={`/book/${service.id}`} 
                className={buttonVariants({ size: "lg", className: "w-full text-lg h-14 rounded-xl shadow-xl" })}
              >
                Book Now
              </Link>
              <p className="text-center text-xs text-muted-foreground mt-4">
                You will only pay after the service is completely finished. Cash / UPI accepted.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
