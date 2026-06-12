'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const serviceType = formData.get('service_type') as string
  const message = formData.get('message') as string

  if (!name || !phone || !message) {
    return { success: false, error: 'Name, Phone, and Message are required.' }
  }

  const supabase = await createClient()

  // Insert contact submission into database
  const { error } = await supabase.from('contact_submissions').insert({
    name,
    phone,
    email: email || null,
    service_type: serviceType || null,
    message
  })

  if (error) {
    console.error('submitContactForm error:', error)
    return { success: false, error: 'Failed to submit message. Please try again.' }
  }

  // Send WhatsApp notification to Admin using CallMeBot
  try {
    const apiKey = process.env.CALLMEBOT_API_KEY
    if (apiKey) {
      const adminPhone = '919361564650'
      const lines = [
        `📩 *New Contact Inquiry — Chimney Doctors*`,
        ``,
        `👤 Name:     ${name}`,
        `📞 Phone:    ${phone}`,
        `📧 Email:    ${email || 'N/A'}`,
        `🛠 Service:  ${serviceType || 'General Inquiry'}`,
        `💬 Message:  ${message}`,
        ``,
        `💬 Chat:     https://wa.me/91${phone.replace(/[^0-9]/g, '')}`
      ].join('\n')

      await fetch(
        `https://api.callmebot.com/whatsapp.php?phone=${adminPhone}&text=${encodeURIComponent(lines)}&apikey=${apiKey}`
      )
    }
  } catch (err) {
    console.error('WhatsApp notification error for contact form:', err)
  }

  return { success: true }
}
