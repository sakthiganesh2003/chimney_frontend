'use client'

import { Trash2 } from 'lucide-react'
import { deleteBooking } from '@/app/admin/actions'

export function DeleteBookingButton({
  bookingId,
  customerName,
}: {
  bookingId: string
  customerName: string
}) {
  return (
    <form action={deleteBooking}>
      <input type="hidden" name="booking_id" value={bookingId} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`Delete booking for "${customerName}"?\nThis cannot be undone.`)) {
            e.preventDefault()
          }
        }}
        className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-200"
        title="Delete this booking"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </form>
  )
}
