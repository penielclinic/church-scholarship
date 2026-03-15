import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: '권한 없음' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { meeting_date, title, attendees, content, decisions, other_matters } = body

  const { data, error } = await supabaseAdmin
    .from('meeting_minutes')
    .update({ meeting_date, title, attendees, content, decisions, other_matters, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: '권한 없음' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin.from('meeting_minutes').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
