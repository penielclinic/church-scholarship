import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: '권한 없음' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('audit_sessions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: '권한 없음' }, { status: 401 })

  const { year, semester, auditor, audit_date } = await req.json()
  if (!year || !semester || !auditor)
    return NextResponse.json({ error: '연도, 학기, 감사위원은 필수입니다.' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('audit_sessions')
    .insert({ year: Number(year), semester, auditor, audit_date: audit_date || null, status: 'in_progress', verdict: '', opinion: '', score: 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
