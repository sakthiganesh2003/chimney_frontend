'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronRight } from 'lucide-react'
import { buttonVariants } from './ui/button'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js'

interface Profile {
  full_name: string
  role: 'admin' | 'technician' | 'customer'
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single()
        setProfile(data)
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

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

  const getUserInitial = () => {
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name.split(' ')[0]
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const close = () => setMobileOpen(false)

  return (
    <>
      <header className="sticky top-0 inset-x-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-8 h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4 group shrink-0">
            <div className="relative">
              <Image
                src="/chimney_icon.png"
                alt="Chimney Doctors"
                width={56}
                height={56}
                className="h-12 sm:h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                priority
              />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl text-slate-800 leading-tight group-hover:text-primary transition-colors">
                Chimney <span className="text-primary">Doctors</span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 leading-tight hidden xs:block font-medium">
                Professional Chimney Services
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
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
          <div className="hidden md:flex items-center gap-4">
            {!isLoading && (
              <>
                {user ? (
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                      {getUserInitial()}
                    </div>
                    Hi, {getUserDisplayName()}
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
                  >
                    Log in
                  </Link>
                )}
              </>
            )}
            <Link
              href="/#services"
              className={cn(
                buttonVariants({ variant: 'default' }),
                'rounded-full px-7 py-2.5 shadow-md shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 text-base'
              )}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2.5 text-slate-600 hover:text-primary rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ── Right-side slide drawer ── */}

      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-[70] w-[78vw] max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
          <Link href="/" onClick={close} className="flex items-center gap-2.5">
            <Image
              src="/chimney_icon.png"
              alt="Chimney Doctors"
              width={36}
              height={36}
              className="h-9 w-auto object-contain"
            />
            <span className="font-bold text-base text-slate-800">
              Chimney <span className="text-primary">Doctors</span>
            </span>
          </Link>
          <button
            onClick={close}
            aria-label="Close menu"
            className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navLinks.map((l, i) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={close}
              className="flex items-center justify-between py-3.5 px-4 text-base font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 group"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {l.label}
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-4 pb-6 pt-4 border-t border-slate-100 space-y-3">
          {!isLoading && (
            <>
              {user ? (
                <Link
                  href={getDashboardLink()}
                  onClick={close}
                  className="flex items-center gap-3 py-3 px-4 text-base font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shrink-0">
                    {getUserInitial()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-xs text-slate-500">My Dashboard</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 ml-auto shrink-0" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={close}
                  className="flex items-center justify-between py-3 px-4 text-base font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                >
                  Log in
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              )}
            </>
          )}
          <Link
            href="/#services"
            onClick={close}
            className={cn(
              buttonVariants({ variant: 'default' }),
              'w-full rounded-xl justify-center py-3 text-base font-bold shadow-lg shadow-primary/20'
            )}
          >
            Book Now
          </Link>
        </div>
      </div>
    </>
  )
}