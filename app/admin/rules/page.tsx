import { supabaseAdmin } from '@/lib/supabase'
import { RulesManager } from './rules-manager'

const CREATE_SQL = `CREATE TABLE IF NOT EXISTS scholarship_rules (
  id SERIAL PRIMARY KEY,
  version_label TEXT NOT NULL,
  version_date DATE NOT NULL DEFAULT CURRENT_DATE,
  file_url TEXT NOT NULL DEFAULT '',
  notes TEXT DEFAULT '',
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`

export default async function RulesPage() {
  const { data, error } = await supabaseAdmin
    .from('scholarship_rules')
    .select('*')
    .order('version_date', { ascending: false })

  const tableNotFound =
    error?.message?.includes('schema cache') ||
    error?.message?.includes('does not exist') ||
    error?.code === '42P01'

  if (tableNotFound) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">장학금 규정 관리</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6">
          <p className="font-semibold text-yellow-800 mb-2">⚠️ 테이블 생성이 필요합니다</p>
          <p className="text-sm text-yellow-700 mb-4" style={{ wordBreak: 'keep-all' }}>
            Supabase SQL Editor에서 아래 SQL을 실행한 후 페이지를 새로고침하세요.
          </p>
          <pre className="bg-white border border-yellow-200 rounded-lg p-4 text-xs text-gray-800 overflow-auto whitespace-pre-wrap">
            {CREATE_SQL}
          </pre>
          <p className="text-xs text-yellow-600 mt-3">
            Supabase 대시보드 → SQL Editor → New query → 위 내용 붙여넣기 → Run
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">장학금 규정 관리</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          오류: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">장학금 규정 관리</h1>
        <p className="text-sm text-gray-500 mt-1">PDF를 업로드하면 날짜별로 버전이 기록됩니다. 활성화된 버전이 홈페이지에 표시됩니다.</p>
      </div>
      <RulesManager rules={data ?? []} />
    </div>
  )
}
