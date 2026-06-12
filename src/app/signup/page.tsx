import Link from 'next/link'
import { Suspense } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame } from 'lucide-react'
import { SignupForm } from '@/components/SignupForm'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2">
        <Flame className="h-6 w-6 text-primary" />
        <span className="font-bold text-xl">Chimney Doctors</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <Suspense fallback={<div className="p-6 text-center text-sm text-slate-500">Loading...</div>}>
          <SignupForm />
        </Suspense>
      </Card>
    </div>
  )
}
