import { supabaseAdmin } from '@/lib/supabase'
import { MinutesManager } from './minutes-manager'

export const revalidate = 0

export default async function MinutesPage() {
  const { data, error } = await supabaseAdmin
    .from('meeting_minutes')
    .select('*')
    .order('meeting_date', { ascending: false })

  if (error?.code === '42P01') {
    // 테이블 미존재 시 SQL 안내
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold text-gray-900 mb-4">장학위원회 회의록</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="font-semibold text-amber-800 mb-3">Supabase에서 아래 SQL을 실행해 주세요.</p>
          <pre className="bg-white border rounded-lg p-4 text-xs overflow-x-auto text-gray-700">{`CREATE TABLE IF NOT EXISTS meeting_minutes (
  id SERIAL PRIMARY KEY,
  meeting_date DATE NOT NULL,
  title TEXT NOT NULL,
  attendees TEXT,
  content TEXT,
  decisions TEXT,
  other_matters TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
        </div>
      </div>
    )
  }

  return <MinutesManager minutes={data ?? []} />
}
