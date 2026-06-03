export default function ServiceLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 px-4 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <div className="h-10 w-10 bg-muted rounded-full"></div>
          <div className="h-6 w-32 bg-muted rounded-lg"></div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl bg-muted"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-muted"></div>
              ))}
            </div>
          </div>
          {/* Details skeleton */}
          <div className="flex flex-col gap-5">
            <div className="h-6 w-28 bg-muted rounded-full"></div>
            <div className="h-12 w-3/4 bg-muted rounded-lg"></div>
            <div className="h-8 w-32 bg-muted rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-4 w-5/6 bg-muted rounded"></div>
              <div className="h-4 w-4/6 bg-muted rounded"></div>
            </div>
            <div className="rounded-xl border p-6 space-y-3">
              <div className="h-5 w-44 bg-muted rounded"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-3 w-full bg-muted rounded"></div>
              ))}
            </div>
            <div className="mt-auto pt-8 border-t">
              <div className="h-14 w-full bg-muted rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
