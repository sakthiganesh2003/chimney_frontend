'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Phone, User, Mail, MessageSquare, Flame } from 'lucide-react'
import { submitContactForm } from '@/app/actions'
import { PhoneInput } from '@/components/ui/PhoneInput'

interface Service {
  id: string
  name: string
}

interface ContactFormProps {
  services?: Service[]
}

export function ContactForm({ services = [] }: ContactFormProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    try {
      const result = await submitContactForm(formData)
      if (result.success) {
        toast.success('Inquiry submitted successfully! We will contact you shortly.', {
          description: 'A WhatsApp notification has been sent to our administrator.',
          duration: 5000,
        })
        form.reset()
      } else {
        toast.error(result.error || 'Failed to submit inquiry. Please try again.')
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-muted-foreground" /> Full Name *
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Ramesh Kumar"
            className="h-10 bg-background"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Mobile Number *
          </Label>
          <PhoneInput
            id="phone"
            name="phone"
            required
            placeholder="10-digit mobile number"
            className="h-10 bg-background"
          />
          <p className="text-xs text-muted-foreground">10 digits only, starting with 6/7/8/9</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="e.g. ramesh@example.com"
            className="h-10 bg-background"
          />
        </div>

        {/* Service Type */}
        <div className="space-y-1.5">
          <Label htmlFor="service_type" className="text-sm font-medium flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-muted-foreground" /> Select Service
          </Label>
          <select
            id="service_type"
            name="service_type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue=""
          >
            <option value="">General Inquiry</option>
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-sm font-medium flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" /> Your Message *
        </Label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="How can we help you? Describe your chimney brand/issue..."
          className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 text-base font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
      >
        {loading ? 'Submitting Inquiry...' : 'Send Message'}
      </Button>
    </form>
  )
}
