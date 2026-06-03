'use client'

import { Trash2 } from 'lucide-react'
import { deleteService } from '@/app/admin/services/actions'

export function DeleteServiceButton({ serviceId }: { serviceId: string }) {
  return (
    <form action={deleteService}>
      <input type="hidden" name="id" value={serviceId} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm('Are you sure you want to delete this service?')) {
            e.preventDefault()
          }
        }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
      >
        <Trash2 className="w-3 h-3" /> Delete
      </button>
    </form>
  )
}
