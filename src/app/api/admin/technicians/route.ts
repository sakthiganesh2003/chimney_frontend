import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Try to get service-role admin client
function tryGetAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey && serviceKey !== 'your_supabase_service_role_key_here' && serviceKey.trim().length > 10) {
    return createSupabaseClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  }
  return null
}

// ─── POST: Add New Technician ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const body = await req.json()
    const { name, phone, email, password } = body

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const adminSupabase = tryGetAdminSupabase()

    if (adminSupabase) {
      // ── WITH service role key: full admin user creation ──
      const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
        user_metadata: { full_name: name.trim() }
      })

      if (createError || !newUser?.user) {
        return NextResponse.json({ error: createError?.message || 'Failed to create user' }, { status: 500 })
      }

      // Upsert profile with technician role
      const { error: profileError } = await adminSupabase.from('profiles').upsert({
        id: newUser.user.id,
        full_name: name.trim(),
        phone: phone?.trim() || null,
        role: 'technician'
      }, { onConflict: 'id' })

      if (profileError) {
        await adminSupabase.auth.admin.deleteUser(newUser.user.id)
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, id: newUser.user.id })

    } else {
      // ── WITHOUT service role key: use signUp + direct profile insert ──
      // We use a separate no-session client so admin session is NOT replaced
      const anonClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
            storage: {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {}
            }
          }
        }
      )

      const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } }
      })

      if (signUpError) {
        return NextResponse.json({ error: signUpError.message }, { status: 500 })
      }

      if (!signUpData?.user) {
        return NextResponse.json({ error: 'Account creation failed — user not returned' }, { status: 500 })
      }

      const newUserId = signUpData.user.id

      // Wait briefly for the trigger to create the profile row
      await new Promise(resolve => setTimeout(resolve, 800))

      // Now update the profile using the ADMIN user's session (which has admin role)
      // This only works if "Admins can manage all profiles" policy exists in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: name.trim(), phone: phone?.trim() || null, role: 'technician' })
        .eq('id', newUserId)

      if (updateError) {
        // Try upsert as backup
        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: newUserId,
          full_name: name.trim(),
          phone: phone?.trim() || null,
          role: 'technician'
        }, { onConflict: 'id' })

        if (upsertError) {
          return NextResponse.json({
            error: `Account created but role assignment failed. Run this SQL in Supabase: CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));`
          }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true, id: newUserId })
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('POST /api/admin/technicians error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── DELETE: Remove Technician ───────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const { technicianId } = await req.json()
    if (!technicianId) return NextResponse.json({ error: 'technicianId required' }, { status: 400 })

    // Unassign from all bookings first
    await supabase.from('bookings').update({ technician_id: null }).eq('technician_id', technicianId)

    const adminSupabase = tryGetAdminSupabase()

    if (adminSupabase) {
      // Full permanent delete
      await adminSupabase.from('profiles').delete().eq('id', technicianId)
      await adminSupabase.auth.admin.deleteUser(technicianId)
    } else {
      // Soft delete: change role to customer so they can't log in as technician
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'customer', full_name: '[Removed Technician]' })
        .eq('id', technicianId)

      if (error) {
        return NextResponse.json({ error: 'Delete failed: ' + error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── PATCH: Update Technician Info ──────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const { technicianId, name, phone } = await req.json()
    if (!technicianId) return NextResponse.json({ error: 'technicianId required' }, { status: 400 })

    const adminSupabase = tryGetAdminSupabase()
    const db = adminSupabase || supabase

    const { error } = await db.from('profiles').update({
      full_name: name?.trim() || null,
      phone: phone?.trim() || null,
    }).eq('id', technicianId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
