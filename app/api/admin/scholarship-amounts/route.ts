import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET /api/admin/scholarship-amounts?year=2025&semester=1
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const year = searchParams.get('year')
  const semester = searchParams.get('semester')

  if (!year || !semester) return NextResponse.json({ error: 'year, semester 필요' }, { status: 400 })

  // 활성 장학 프로그램 목록
  const { data: programs } = await supabaseAdmin
    .from('scholarships')
    .select('id, name, amount_k12, amount_univ')
    .eq('is_active', true)
    .order('id')

  // 해당 학기에 설정된 금액
  const { data: amounts } = await supabaseAdmin
    .from('scholarship_semester_amounts')
    .select('*')
    .eq('year', year)
    .eq('semester', semester)

  // 프로그램 목록에 학기 금액 병합 (없으면 기본값 사용)
  const amountMap = Object.fromEntries((amounts ?? []).map(a => [a.scholarship_id, a]))
  const result = (programs ?? []).map(p => ({
    ...p,
    semester_amount_id: amountMap[p.id]?.id ?? null,
    amount_k12: amountMap[p.id]?.amount_k12 ?? p.amount_k12,
    amount_univ: amountMap[p.id]?.amount_univ ?? p.amount_univ,
    amount_grad: amountMap[p.id]?.amount_grad ?? p.amount_grad,
  }))

  return NextResponse.json(result)
}

// POST /api/admin/scholarship-amounts — 학기 금액 저장 (upsert)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { year, semester, amounts } = await req.json()
  // amounts: Array<{ scholarship_id, amount_k12, amount_univ }>

  if (!year || !semester || !Array.isArray(amounts)) {
    return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
  }

  const rows = amounts.map((a: { scholarship_id: number; amount_k12: number; amount_univ: number; amount_grad: number }) => ({
    scholarship_id: a.scholarship_id,
    year,
    semester,
    amount_k12: a.amount_k12 ?? 0,
    amount_univ: a.amount_univ ?? 0,
    amount_grad: a.amount_grad ?? 0,
  }))

  const { error } = await supabaseAdmin
    .from('scholarship_semester_amounts')
    .upsert(rows, { onConflict: 'scholarship_id,year,semester' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
