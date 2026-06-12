'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

function ToastNotificationHandlerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const successMsg = searchParams.get('success')
    const errorMsg = searchParams.get('error')
    const infoMsg = searchParams.get('message')

    if (successMsg || errorMsg || infoMsg) {
      if (successMsg) {
        toast.success(decodeURIComponent(successMsg))
      } else if (errorMsg) {
        toast.error(decodeURIComponent(errorMsg))
      } else if (infoMsg) {
        // Distinguish between error looking messages and actual info
        const lowerMsg = infoMsg.toLowerCase()
        if (lowerMsg.includes('fail') || lowerMsg.includes('error') || lowerMsg.includes('invalid') || lowerMsg.includes('wrong')) {
          toast.error(decodeURIComponent(infoMsg))
        } else {
          toast.success(decodeURIComponent(infoMsg))
        }
      }

      // Clean up the URL query parameters
      const params = new URLSearchParams(window.location.search)
      params.delete('success')
      params.delete('error')
      params.delete('message')
      
      const newQuery = params.toString() ? `?${params.toString()}` : ''
      const cleanUrl = `${window.location.pathname}${newQuery}`
      
      router.replace(cleanUrl)
    }
  }, [searchParams, router])

  return null
}

export function ToastNotificationHandler() {
  return (
    <Suspense fallback={null}>
      <ToastNotificationHandlerContent />
    </Suspense>
  )
}
