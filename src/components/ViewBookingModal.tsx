'use client'

import { useState } from 'react'
import { 
  X, User, Phone, MapPin, Calendar, Clock, 
  UserCog, MessageSquare, ExternalLink, ShieldAlert, FileText 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BookingDetail {
  id: string
  created_at: string
  scheduled_date: string
  status: string
  address: string
  landmark: string | null
  city: string
  pincode: string
  guest_name: string | null
  guest_phone: string | null
  guest_notes: string | null
  customer_id: string | null
  services: { name: string } | null
  customer: { full_name: string | null; phone: string | null } | null
  technician: { id: string; name: string; phone: string | null } | null
}

interface ViewBookingModalProps {
  booking: BookingDetail
}

export function ViewBookingModal({ booking }: ViewBookingModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const customerName = booking.customer?.full_name || booking.guest_name || 'Guest'
  const customerPhone = booking.customer?.phone || booking.guest_phone || ''
  const isGuest = !booking.customer_id

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'pending': return '🟡'
      case 'confirmed': return '🔵'
      case 'in_progress': return '🟣'
      case 'completed': return '🟢'
      case 'cancelled': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/15 px-2.5 py-1.5 rounded-lg border border-primary/20"
      >
        <FileText className="w-3.5 h-3.5" />
        View Details
      </button>

      {/* Modal Backdrop & Content */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-background rounded-2xl shadow-2xl border border-border w-full max-w-lg overflow-hidden transform transition-all z-10 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Booking Details</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {booking.id.substring(0, 8)}...</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Status Row */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(booking.status)}`}>
                  {getStatusEmoji(booking.status)} {booking.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Customer Info Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Customer Information
                </h4>
                <div className="bg-card border rounded-xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-800 text-base flex items-center gap-2">
                        {customerName}
                        {isGuest ? (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            Guest Checkout
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                            Registered Member
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {customerPhone && (
                    <div className="flex items-center justify-between pt-2 border-t border-dashed">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{customerPhone}</span>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={`tel:${customerPhone}`}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1"
                        >
                          Call Client
                        </a>
                        <a 
                          href={`https://wa.me/91${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hi ${customerName}, this is Chimney Doctors. Regarding your chimney service booking...`
                          )}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs bg-green-500 hover:bg-green-600 text-white px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 shadow-sm"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Service & Time Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Service & Appointment
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border rounded-xl p-3.5 shadow-sm">
                    <div className="text-xs text-muted-foreground">Service</div>
                    <div className="font-semibold text-slate-800 text-sm mt-1">
                      {booking.services?.name || 'Chimney Service'}
                    </div>
                  </div>
                  <div className="bg-card border rounded-xl p-3.5 shadow-sm">
                    <div className="text-xs text-muted-foreground">Scheduled Time</div>
                    <div className="font-semibold text-slate-800 text-sm mt-1 flex flex-col">
                      <span>{new Date(booking.scheduled_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                      <span className="text-xs text-muted-foreground font-normal mt-0.5">
                        {new Date(booking.scheduled_date).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Service Address
                </h4>
                <div className="bg-card border rounded-xl p-4 space-y-2.5 shadow-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Address</div>
                    <div className="text-sm font-medium text-slate-800 mt-0.5 leading-relaxed">{booking.address}</div>
                  </div>
                  {booking.landmark && (
                    <div className="grid grid-cols-1 pt-2 border-t border-dashed">
                      <div className="text-xs text-muted-foreground">Landmark</div>
                      <div className="text-sm font-medium text-slate-700 mt-0.5">{booking.landmark}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed">
                    <div>
                      <div className="text-xs text-muted-foreground">City</div>
                      <div className="text-sm font-medium text-slate-700 mt-0.5">{booking.city}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Pincode</div>
                      <div className="text-sm font-medium text-slate-700 mt-0.5">{booking.pincode}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technician Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCog className="w-3.5 h-3.5" /> Assigned Technician
                </h4>
                <div className="bg-card border rounded-xl p-4 shadow-sm">
                  {booking.technician ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-blue-700 text-sm">{booking.technician.name}</div>
                        {booking.technician.phone && (
                          <div className="text-xs text-muted-foreground mt-0.5">{booking.technician.phone}</div>
                        )}
                      </div>
                      {booking.technician.phone && (
                        <a 
                          href={`tel:${booking.technician.phone}`}
                          className="text-xs border border-slate-200 hover:bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1"
                        >
                          Call Tech
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="text-amber-600 text-xs font-semibold italic flex items-center gap-1 py-1">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      No technician has been assigned to this booking yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {booking.guest_notes && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Customer Notes
                  </h4>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm text-sm text-amber-900 font-medium leading-relaxed">
                    {booking.guest_notes}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-slate-50 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="font-bold text-slate-700"
              >
                Close Window
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
