import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: '권한 없음' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('meeting_minutes')
    .select('*')
    .order('meeting_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: '권한 없음' }, { status: 401 })

  const body = await req.json()
  const { meeting_date, title, attendees, content, decisions, other_matters } = body

  if (!meeting_date || !title) {
    return NextResponse.json({ error: '날짜와 제목은 필수입니다.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('meeting_minutes')
    .insert({ meeting_date, title, attendees, content, decisions, other_matters })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
