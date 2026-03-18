import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 0

const SQL = `-- Supabase SQL Editor에서 실행
CREATE TABLE IF NOT EXISTS audit_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INT NOT NULL,
  semester TEXT NOT NULL,
  auditor TEXT NOT NULL,
  audit_date DATE,
  status TEXT DEFAULT 'in_progress',
  verdict TEXT DEFAULT '',
  opinion TEXT DEFAULT '',
  score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES audit_sessions(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  item_index INT NOT NULL,
  status TEXT DEFAULT 'none',
  memo TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, section_id, item_index)
);`

export default async function AuditListPage() {
  const { data, error } = await supabaseAdmin
    .from('audit_sessions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error?.code === '42P01') {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-bold text-gray-900 mb-4">자체감사</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="font-semibold text-amber-800 mb-3">Supabase에서 아래 SQL을 실행해 주세요.</p>
          <pre className="bg-white border rounded-lg p-4 text-xs overflow-x-auto text-gray-700">{SQL}</pre>
        </div>
      </div>
    )
  }

  const sessions = data ?? []

  return (
    <div className="max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">자체감사</h1>
          <p className="text-sm text-gray-500 mt-1">학기별 장학위원회 자체감사 기록</p>
        </div>
        <Link
          href="/admin/audit/new"
          className="bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          + 새 감사 시작
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500 text-sm">아직 감사 기록이 없습니다.</p>
          <Link href="/admin/audit/new" className="mt-4 inline-block text-sm text-purple-700 hover:underline">
            첫 감사를 시작해보세요 →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">감사 기간</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">감사위원</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">감사일</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">적합도</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">판정</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">상태</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((s: any) => {
                const scoreColor = s.score >= 80 ? 'text-green-600' : s.score >= 60 ? 'text-amber-600' : s.score > 0 ? 'text-red-600' : 'text-gray-400'
                const verdictStyle = s.verdict === '적정'
                  ? 'bg-green-100 text-green-700'
                  : s.verdict === '조건부적정'
                  ? 'bg-amber-100 text-amber-700'
                  : s.verdict === '부적정'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-500'
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {s.year}년 {s.semester}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{s.auditor}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {s.audit_date ? new Date(s.audit_date).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className={`px-4 py-3 text-center font-bold ${scoreColor}`}>
                      {s.score > 0 ? `${s.score}점` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.verdict ? (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${verdictStyle}`}>
                          {s.verdict}
                        </span>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {s.status === 'completed' ? '완료' : '진행중'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/admin/audit/${s.id}`}
                        className="text-xs text-purple-700 hover:text-purple-900 font-medium hover:underline"
                      >
                        보기 →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
