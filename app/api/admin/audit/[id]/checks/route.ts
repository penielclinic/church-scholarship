import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: '권한 없음' }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('audit_checks')
    .select('*')
    .eq('session_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: '권한 없음' }, { status: 401 })

  const { id } = await params
  const checks: Array<{ section_id: string; item_index: number; status: string; memo: string }> = await req.json()

  const rows = checks.map(c => ({
    session_id: id,
    section_id: c.section_id,
    item_index: c.item_index,
    status: c.status,
    memo: c.memo,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabaseAdmin
    .from('audit_checks')
    .upsert(rows, { onConflict: 'session_id,section_id,item_index' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
