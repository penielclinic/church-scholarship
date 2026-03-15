import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: '권한 없음' }, { status: 401 })

  const body = await request.json()

  // 새 컬럼(amount_k12 등)으로 먼저 시도, 실패 시 기본 필드만
  let { data, error } = await supabaseAdmin.from('scholarships').insert(body).select().single()

  if (error) {
    const fallback = { name: body.name, description: body.description ?? null, amount: body.amount ?? 0 }
    const result = await supabaseAdmin.from('scholarships').insert(fallback).select().single()
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
    data = result.data
  }

  return NextResponse.json(data, { status: 201 })
}
