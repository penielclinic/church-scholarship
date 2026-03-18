'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MEMBERS = ['감사위원 직접 입력']

export default function NewAuditPage() {
  const router = useRouter()
  const [form, setForm] = useState({ year: new Date().getFullYear().toString(), semester: '1학기', auditor: '', audit_date: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const f = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '오류가 발생했습니다.'); return }
      router.push(`/admin/audit/${data.id}`)
    } catch {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400'
  const lbl = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/audit" className="text-gray-400 hover:text-gray-600 text-sm">← 목록</Link>
        <h1 className="text-xl font-bold text-gray-900">새 감사 시작</h1>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 text-sm text-purple-800">
        <strong>안내</strong> — 장학위원 5명 중 1명이 감사위원을 맡아 해당 학기 장학금 운영을 점검합니다.
      </div>

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>감사 연도 *</label>
            <input type="number" className={inp} placeholder="예) 2025" {...f('year')} required />
          </div>
          <div>
            <label className={lbl}>감사 학기 *</label>
            <select className={inp} {...f('semester')} required>
              <option>1학기</option>
              <option>2학기</option>
            </select>
          </div>
        </div>
        <div>
          <label className={lbl}>감사위원 성명 *</label>
          <input type="text" className={inp} placeholder="감사를 담당하는 장학위원 성명" {...f('auditor')} required />
        </div>
        <div>
          <label className={lbl}>감사 실시일</label>
          <input type="date" className={inp} {...f('audit_date')} />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Link href="/admin/audit" className="flex-1 text-center border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
            취소
          </Link>
          <button type="submit" disabled={loading}
            className="flex-2 flex-1 bg-purple-700 hover:bg-purple-800 disabled:bg-gray-300 text-white rounded-lg py-2 text-sm font-medium transition-colors">
            {loading ? '생성 중...' : '감사 시작 →'}
          </button>
        </div>
      </form>
    </div>
  )
}
