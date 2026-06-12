'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface FilterFormProps {
  technicians: { id: string; name: string }[] | null
  searchFilter: string
  technicianFilter: string
  dateFilter: string
  statusFilter: string
  hasFilters: boolean
}

export function FilterForm({
  technicians,
  searchFilter,
  technicianFilter,
  dateFilter,
  statusFilter,
  hasFilters,
}: FilterFormProps) {
  const router = useRouter()

  const [search, setSearch] = useState(searchFilter)
  const [technician, setTechnician] = useState(technicianFilter)

  // Sync state if search params change externally (like clicking "Clear All" or other badges)
  useEffect(() => {
    setSearch(searchFilter)
    setTechnician(technicianFilter)
  }, [searchFilter, technicianFilter])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    
    if (dateFilter) params.set('date', dateFilter)
    if (statusFilter) params.set('status', statusFilter)
    if (search.trim()) params.set('search', search.trim())
    if (technician) params.set('technician', technician)
    
    router.push(`/admin/bookings?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-3 items-end w-full">
      {/* Search */}
      <div className="flex-1 w-full space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Search className="w-3.5 h-3.5" /> Search
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, phone, address, pincode, service..."
          className="w-full text-sm border border-input rounded-md h-10 px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Technician */}
      <div className="w-full lg:w-56 space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Technician
        </label>
        <select
          value={technician}
          onChange={(e) => setTechnician(e.target.value)}
          className="w-full text-sm border border-input rounded-md h-10 px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring font-medium"
        >
          <option value="">All Technicians</option>
          <option value="unassigned">⚠️ Unassigned</option>
          {technicians?.map((tech) => (
            <option key={tech.id} value={tech.id}>
              👤 {tech.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 w-full lg:w-auto shrink-0 justify-end">
        <Button type="submit" size="sm" className="h-10 font-bold px-5 shadow-sm">
          Filter
        </Button>
        {hasFilters && (
          <Link href="/admin/bookings">
            <Button type="button" variant="outline" size="sm" className="h-10 px-4">
              Clear All
            </Button>
          </Link>
        )}
      </div>
    </form>
  )
}
