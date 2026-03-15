'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  app: {
    id: number
    student_name: string
    birth_date: string
    school: string
    school_level: string
    grade: number
    contact: string
    reason: string
    scholarship_id: number
  }
  scholarships: { id: number; name: string }[]
}

const LEVEL_OPTIONS = [
  { value: 'primary', label: '초등' },
  { value: 'middle', label: '중학' },
  { value: 'high', label: '고등' },
  { value: 'university', label: '대학' },
  { value: 'graduate', label: '대학원' },
]

export function ApplicationEditForm({ app, scholarships }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    student_name: app.student_name,
    birth_date: app.birth_date,
    school: app.school,
    school_level: app.school_level,
    grade: String(app.grade),
    contact: app.contact,
    reason: app.reason,
    scholarship_id: app.scholarship_id,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const save = async () => {
    setSaving(true); setError('')
    const res = await fetch(`/api/applications/${app.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, grade: parseInt(form.grade) || 1 }),
    })
    setSaving(false)
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? '저장 실패')
      return
    }
    setOpen(false)
    router.refresh()
  }

  const inputClass = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-blue-600 hover:underline"
      >
        신청서 수정
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl border p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">신청서 수정</h2>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm">닫기</button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">이름</label>
            <input value={form.student_name} onChange={set('student_name')} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">생년월일</label>
            <input type="date" value={form.birth_date} onChange={set('birth_date')} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">학교명</label>
            <input value={form.school} onChange={set('school')} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">연락처</label>
            <input value={form.contact} onChange={set('contact')} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">학교 구분</label>
            <select value={form.school_level} onChange={set('school_level')} className={inputClass}>
              {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">학년</label>
            <input type="number" min="1" max="12" value={form.grade} onChange={set('grade')} className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">장학 프로그램</label>
            <select value={form.scholarship_id} onChange={set('scholarship_id')} className={inputClass}>
              {scholarships.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">신청 이유</label>
          <textarea value={form.reason} onChange={set('reason')} rows={5} className={inputClass} style={{ wordBreak: 'keep-all' }} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? '저장 중...' : '저장'}
          </button>
          <button onClick={() => setOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">취소</button>
        </div>
      </div>
    </div>
  )
}
