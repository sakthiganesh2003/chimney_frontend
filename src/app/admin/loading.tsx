export default function AdminLoading() {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-9 w-64 bg-muted rounded-lg mb-3"></div>
        <div className="h-4 w-48 bg-muted rounded-lg"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-28 bg-muted rounded"></div>
              <div className="h-5 w-5 bg-muted rounded-full"></div>
            </div>
            <div className="h-8 w-24 bg-muted rounded-lg"></div>
            <div className="h-3 w-36 bg-muted rounded"></div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="border-b p-4 bg-muted/30">
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-muted rounded"></div>
            ))}
          </div>
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-b last:border-0 p-4">
            <div className="grid grid-cols-5 gap-4 items-center">
              {[...Array(5)].map((_, j) => (
                <div key={j} className={`h-4 bg-muted rounded ${j === 0 ? 'w-3/4' : 'w-full'}`}></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
