import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('scholarship_rules')
    .select('*')
    .order('version_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const notes = (formData.get('notes') as string) ?? ''
  const is_current = formData.get('is_current') === 'true'

  if (!file) return NextResponse.json({ error: '파일을 선택해 주세요.' }, { status: 400 })

  const today = new Date().toISOString().split('T')[0]
  const fileName = `rules/규정_${today}_${Date.now()}.pdf`

  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await supabaseAdmin.storage
    .from('attachments')
    .upload(fileName, Buffer.from(bytes), { contentType: 'application/pdf', upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: urlData } = supabaseAdmin.storage.from('attachments').getPublicUrl(fileName)
  const file_url = urlData.publicUrl

  if (is_current) {
    await supabaseAdmin.from('scholarship_rules').update({ is_current: false }).neq('id', 0)
  }

  const { data, error } = await supabaseAdmin
    .from('scholarship_rules')
    .insert({ version_label: today, version_date: today, file_url, notes, is_current })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, is_current, notes } = body

  if (is_current) {
    await supabaseAdmin.from('scholarship_rules').update({ is_current: false }).neq('id', id)
  }

  const updates: Record<string, unknown> = {}
  if (is_current !== undefined) updates.is_current = is_current
  if (notes !== undefined) updates.notes = notes

  const { data, error } = await supabaseAdmin
    .from('scholarship_rules')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
