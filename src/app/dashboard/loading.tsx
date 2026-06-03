export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-muted/20 animate-pulse">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 px-4 h-16 flex items-center justify-between">
        <div className="h-6 w-36 bg-muted rounded-lg"></div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-8 w-8 bg-muted rounded-full"></div>
        </div>
      </div>
      <main className="container mx-auto p-4 md:p-8 max-w-5xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="h-9 w-52 bg-muted rounded-lg mb-2"></div>
            <div className="h-4 w-72 bg-muted rounded"></div>
          </div>
          <div className="h-10 w-36 bg-muted rounded-lg"></div>
        </div>
        <div className="h-5 w-32 bg-muted rounded mb-4"></div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-3 flex justify-between items-center">
                <div className="h-4 w-40 bg-muted rounded"></div>
                <div className="h-5 w-20 bg-muted rounded-full"></div>
              </div>
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-3 w-16 bg-muted rounded"></div>
                    <div className="h-3 w-32 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
