import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'

const PAGE_SIZE = 10

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  // Count total users
  const { count: totalCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Fetch paginated users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(start, end)

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground mt-1">View all registered customers, technicians, and admins.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg shrink-0">
          Total: <strong>{totalCount || 0}</strong> users
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {profiles?.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{p.full_name || 'Anonymous'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${p.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        p.role === 'technician' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                      {p.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">{p.phone || 'N/A'}</td>
                  <td className="px-6 py-4">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!profiles || profiles.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="text-4xl mb-2">👤</div>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <Pagination
        page={page}
        totalCount={totalCount || 0}
        pageSize={PAGE_SIZE}
        baseUrl="/admin/users"
      />
    </div>
  )
}
