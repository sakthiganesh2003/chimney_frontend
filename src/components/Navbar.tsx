'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
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

    // Listen for auth changes
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
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  return (
    <>
      <header className="sticky top-0 inset-x-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
        {/* Increased navbar height from h-16 to h-20 */}
        <div className="container mx-auto flex items-center justify-between px-4 md:px-8 h-20">
          
          {/* Logo and Brand Name - Larger logo and better positioning */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4 group shrink-0">
            <div className="relative">
              {/* Increased logo size from h-9/h-11 to h-12/h-14 */}
              <Image 
                src="/logo2.png" 
                alt="Chimney Doctors" 
                width={56}
                height={56}
                className="h-12 sm:h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                priority
              />
              {/* Accent dot - larger and better positioned */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Brand name with increased size */}
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl text-slate-800 leading-tight group-hover:text-primary transition-colors">
                Chimney <span className="text-primary">Doctors</span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 leading-tight hidden xs:block font-medium">
                Professional Chimney Services
              </span>
            </div>
          </Link>

          {/* Desktop navigation - increased gap for better spacing */}
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

          {/* Desktop CTA buttons */}
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

          {/* Mobile menu button - larger for better touch target */}
          <button
            className="md:hidden p-2.5 text-slate-600 hover:text-primary rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-5 pt-3 space-y-1 animate-fadeInUp">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 px-3 text-base font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {!isLoading && (
                <>
                  {user ? (
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-3 px-3 text-base font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {getUserInitial()}
                      </div>
                      My Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 px-3 text-base font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                    >
                      Log in
                    </Link>
                  )}
                </>
              )}
              <Link
                href="/#services"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: 'default' }), 
                  'w-full rounded-xl justify-center py-2.5 text-base'
                )}
              >
                Book Now
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.2s ease-out;
        }
      `}</style>
    </>
  )
}