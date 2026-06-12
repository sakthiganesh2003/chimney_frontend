'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, LayoutDashboard, ClipboardList, Wrench, Star, Users, LogOut, Menu, X, UserCog, Mail, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
  { href: '/admin/inquiries', label: 'Inquiries', icon: Mail },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/admin/technicians', label: 'Technicians', icon: UserCog },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/feedback', label: 'Feedback', icon: Star },
  { href: '/admin/users', label: 'Users', icon: Users },
]

export function AdminLayoutWrapper({
  adminName,
  avatarInitial,
  logoutAction,
  children,
}: {
  adminName: string
  avatarInitial: string
  logoutAction: () => void
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const renderSidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <img 
            src="/chimney_icon.png" 
            alt="Chimney Doctors" 
            className="w-9 h-9 object-contain rounded-xl group-hover:scale-115 transition-transform duration-300 bg-white p-1"
          />
          <div>
            <div className="font-extrabold text-white text-sm leading-none">Chimney Doctors</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Admin Console</div>
          </div>
        </Link>
        {/* Close button on mobile */}
        <button 
          className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">Main Menu</p>
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className={cn("w-4.5 h-4.5 transition-transform duration-200", active ? 'scale-110' : 'group-hover:scale-110')} />
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/70" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom user card */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {avatarInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{adminName}</div>
            <div className="text-xs text-slate-500">Administrator</div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex w-full relative">
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 hidden md:flex flex-col bg-slate-950 border-r border-slate-800 min-h-screen sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div className={cn(
        "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
        mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {/* Backdrop overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
        
        {/* Sidebar container */}
        <aside className={cn(
          "absolute top-0 bottom-0 left-0 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {renderSidebarContent()}
        </aside>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden w-full">
        {/* Top bar */}
        <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 md:px-6 h-16 flex items-center justify-between shadow-sm">
          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-2.5 md:hidden">
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <img 
              src="/chimney_icon.png" 
              alt="Chimney Doctors" 
              className="w-8 h-8 object-contain rounded-lg bg-white p-0.5"
            />
            <span className="font-bold text-base">Admin</span>
          </div>
          <div className="hidden md:block" />

          {/* User Profile + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold leading-none">{adminName}</span>
              <span className="text-xs text-muted-foreground mt-0.5">Administrator</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {avatarInitial}
            </div>
            <form action={logoutAction}>
              <button type="submit" className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
