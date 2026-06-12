'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flame, Menu, X } from 'lucide-react'
import { buttonVariants } from './ui/button'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
        setProfile(data)
      }
    }
    fetchUser()
  }, [])

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/admin'
    if (profile?.role === 'technician') return '/technician'
    return '/dashboard'
  }

  const navLinks = [
    { label: 'Services', href: '/#services' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Reviews', href: '/#reviews' },
  ]

  return (
    <>
      <header className="sticky top-0 inset-x-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-8 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="bg-primary p-2 rounded-lg group-hover:scale-105 transition-transform shadow-md shadow-primary/20">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Chimney<span className="text-primary">Doctors</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                Hi, {profile?.full_name?.split(' ')[0] || 'User'}
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
              >
                Log in
              </Link>
            )}
            <Link
              href="/#services"
              className={cn(buttonVariants({ variant: 'default' }), 'rounded-full px-6 shadow-md shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5')}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-primary rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-5 pt-3 space-y-1 animate-fadeInUp">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  My Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 px-3 text-sm font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                >
                  Log in
                </Link>
              )}
              <Link
                href="/#services"
                onClick={() => setMobileOpen(false)}
                className={cn(buttonVariants({ variant: 'default' }), 'w-full rounded-xl justify-center')}
              >
                Book Now
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
