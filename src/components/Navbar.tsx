'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from './ui/button'
import { createClient } from '@/utils/supabase/client'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single()
        setProfile(profileData)
      }
    }
    fetchUser()
  }, [])

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/admin'
    if (profile?.role === 'technician') return '/technician'
    return '/dashboard'
  }

  return (
    <header 
      className={cn(
        "fixed top-0 inset-x-0 z-50 w-full transition-all duration-300",
        scrolled 
          ? "bg-background/95 backdrop-blur-md shadow-sm py-3 border-b border-border/50" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg group-hover:scale-105 transition-transform">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className={cn(
            "text-xl font-extrabold tracking-tight transition-colors",
            scrolled ? "text-foreground" : "text-white drop-shadow-md"
          )}>
            ChimneyCare
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {['Services', 'How It Works', 'Reviews'].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
              className={cn(
                "text-sm font-semibold tracking-wide hover:text-primary transition-colors",
                scrolled ? "text-muted-foreground" : "text-white/90 drop-shadow-sm"
              )}
            >
              {item}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              href={getDashboardLink()}
              className={cn(
                "text-sm font-semibold hover:text-primary transition-colors flex items-center gap-2",
                scrolled ? "text-foreground" : "text-white drop-shadow-sm"
              )}
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span>Hi, {profile?.full_name?.split(' ')[0] || 'User'}</span>
            </Link>
          ) : (
            <Link 
              href="/login" 
              className={cn(
                "text-sm font-semibold hover:text-primary transition-colors",
                scrolled ? "text-foreground" : "text-white drop-shadow-sm"
              )}
            >
              Log in
            </Link>
          )}
          <Link 
            href="/#services" 
            className={cn(
              buttonVariants({ variant: scrolled ? "default" : "secondary" }), 
              "shadow-lg hover:scale-105 transition-transform"
            )}
          >
            Book Now
          </Link>
        </div>
      </div>
    </header>
  )
}
