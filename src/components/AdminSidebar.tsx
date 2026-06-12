'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, LayoutDashboard, ClipboardList, Wrench, Star, Users, LogOut, UserCog, Images } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
  { href: '/admin/technicians', label: 'Technicians', icon: UserCog },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
  { href: '/admin/feedback', label: 'Feedback', icon: Star },
  { href: '/admin/users', label: 'Users', icon: Users },
]

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col bg-slate-950 border-r border-slate-800 min-h-screen sticky top-0 h-screen">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Flame className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-extrabold text-white text-sm leading-none">Chimney Doctors</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Admin Console</div>
          </div>
        </Link>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${active
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <item.icon className={`w-4.5 h-4.5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
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
            {adminName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{adminName || 'Admin'}</div>
            <div className="text-xs text-slate-500">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
