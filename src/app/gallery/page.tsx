import { createClient } from '@/utils/supabase/server'
import { Images, Camera } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery | Chimney Doctors',
  description: 'View our work — browse photos of chimney cleaning, repair, and installation projects by Chimney Doctors.',
}

const BUCKET = 'gallery-images'

export default async function GalleryPage() {
  const supabase = await createClient()

  const { data: files } = await supabase.storage.from(BUCKET).list('', {
    limit: 200,
    sortBy: { column: 'created_at', order: 'desc' },
  })

  const images = (files || [])
    .filter((f) => f.name !== '.emptyFolderPlaceholder')
    .map((f) => ({
      name: f.name,
      publicUrl: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
    }))

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 80%, white 1px, transparent 1px)', backgroundSize: '48px 48px' }}
          />
          <div className="relative container mx-auto px-4 py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-6 ring-1 ring-white/20">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Our Work Gallery
            </h1>
            <p className="text-lg text-white/75 max-w-xl mx-auto">
              Browse real photos from chimney cleaning, repair, and installation projects by our certified technicians.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm font-medium text-white/80 ring-1 ring-white/20">
              <Images className="w-4 h-4" />
              {images.length} photo{images.length !== 1 ? 's' : ''} in gallery
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="container mx-auto px-4 py-14">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-200 flex items-center justify-center mb-5">
                <Images className="w-9 h-9 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">No photos yet</h2>
              <p className="text-slate-500 max-w-sm">
                Our gallery is being updated. Check back soon to see our latest work!
              </p>
            </div>
          ) : (
            <>
              {/* Masonry-style responsive grid */}
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {images.map((img, idx) => (
                  <GalleryCard key={img.name} img={img} idx={idx} />
                ))}
              </div>
            </>
          )}
        </section>

      </main>
    </>
  )
}

function GalleryCard({ img, idx }: { img: { name: string; publicUrl: string }; idx: number }) {
  // Vary heights for masonry effect using aspect ratio classes
  const aspectClasses = [
    'aspect-square',
    'aspect-[4/5]',
    'aspect-[3/4]',
    'aspect-[4/3]',
    'aspect-video',
    'aspect-square',
    'aspect-[3/4]',
  ]
  const aspect = aspectClasses[idx % aspectClasses.length]

  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden rounded-2xl shadow-md hover:shadow-xl group cursor-zoom-in break-inside-avoid mb-4 border border-white/50`}
    >
      <img
        src={img.publicUrl}
        alt={`Chimney work photo ${idx + 1}`}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading={idx < 8 ? 'eager' : 'lazy'}
      />
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}
