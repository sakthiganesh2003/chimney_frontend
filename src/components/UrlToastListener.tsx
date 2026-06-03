'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function UrlToastListener() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    const error = searchParams.get('error')
    if (message) toast.success(message)
    if (error) toast.error(error)
  }, [searchParams])

  return null
}
