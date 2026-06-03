import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { logout } from '../auth/actions'
import { AdminLayoutWrapper } from '@/components/AdminLayoutWrapper'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const adminName = profile?.full_name || 'Admin'
  const avatarInitial = adminName.charAt(0).toUpperCase()

  return (
    <AdminLayoutWrapper
      adminName={adminName}
      avatarInitial={avatarInitial}
      logoutAction={logout}
    >
      {children}
    </AdminLayoutWrapper>
  )
}
