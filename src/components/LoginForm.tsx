'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CardContent, CardFooter } from '@/components/ui/card'
import { login } from '@/app/auth/actions'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (message) {
      toast.error(message)
      
      // Clean up the URL query parameter to avoid duplicate toasts
      const params = new URLSearchParams(window.location.search)
      params.delete('message')
      const newQuery = params.toString() ? `?${params.toString()}` : ''
      router.replace(`/login${newQuery}`)
    }
  }, [message, router])

  return (
    <form action={login}>
      <CardContent className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              name="password" 
              type={showPassword ? 'text' : 'password'} 
              className="pr-10"
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4.5 h-4.5" />
              ) : (
                <Eye className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Button type="submit" className="w-full h-12 text-base font-bold">Sign In</Button>
        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
        </div>
      </CardFooter>
    </form>
  )
}
