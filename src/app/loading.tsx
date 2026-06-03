export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-slow">
            <svg
              className="w-10 h-10 text-primary animate-spin-slow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2C8 2 5 5 5 9c0 2.5 1.5 5 3.5 6.5L8 22h8l-.5-6.5C17.5 14 19 11.5 19 9c0-4-3-7-7-7z" />
            </svg>
          </div>
          {/* Orbiting dot */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"></div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">ChimneyCare</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading your experience...</p>
        </div>

        {/* Animated progress bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  )
}
