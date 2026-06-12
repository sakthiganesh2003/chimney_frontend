import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalCount: number
  pageSize?: number
  baseUrl: string
  /** Extra query params to preserve (e.g. status, search) */
  extraParams?: Record<string, string>
}

export function Pagination({
  page,
  totalCount,
  pageSize = 10,
  baseUrl,
  extraParams = {},
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize)
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  const buildUrl = (p: number) => {
    const params = new URLSearchParams({ ...extraParams, page: String(p) })
    return `${baseUrl}?${params.toString()}`
  }

  // Generate page number range (show up to 5 pages around current)
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
      {/* Summary */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{from}–{to}</span> of{' '}
        <span className="font-semibold text-foreground">{totalCount}</span> results
      </p>

      {/* Controls */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* Previous */}
        {page > 1 ? (
          <Link
            href={buildUrl(page - 1)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-input bg-background text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-input bg-muted text-muted-foreground opacity-40 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
          </span>
        )}

        {/* Page numbers */}
        {pages.map((p, idx) =>
          p === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex items-center justify-center h-9 w-9 text-sm text-muted-foreground select-none"
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildUrl(p)}
              className={`inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-semibold transition-colors border shadow-sm ${
                p === page
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25'
                  : 'border-input bg-background text-slate-700 hover:bg-primary/10 hover:text-primary hover:border-primary/30'
              }`}
            >
              {p}
            </Link>
          )
        )}

        {/* Next */}
        {page < totalPages ? (
          <Link
            href={buildUrl(page + 1)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-input bg-background text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-input bg-muted text-muted-foreground opacity-40 cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </nav>
    </div>
  )
}
