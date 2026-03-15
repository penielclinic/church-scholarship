'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Minute {
  id: number
  meeting_date: string
  title: string
  attendees: string | null
  content: string | null
  decisions: string | null
  other_matters: string | null
  created_at: string
}

const EMPTY_FORM = {
  meeting_date: '',
  title: '',
  attendees: '',
  content: '',
  decisions: '',
  other_matters: '',
}

export function MinutesManager({ minutes }: { minutes: Minute[] }) {
  const router = useRouter()
  const [view, setView] = useState<'list' | 'new' | 'edit' | 'detail'>('list')
  const [selected, setSelected] = useState<Minute | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const openNew = () => {
    setForm(EMPTY_FORM)
    setError('')
    setView('new')
  }

  const openEdit = (m: Minute) => {
    setSelected(m)
    setForm({
      meeting_date: m.meeting_date,
      title: m.title,
      attendees: m.attendees ?? '',
      content: m.content ?? '',
      decisions: m.decisions ?? '',
      other_matters: m.other_matters ?? '',
    })
    setError('')
    setView('edit')
  }

  const openDetail = (m: Minute) => {
    setSelected(m)
    setView('detail')
  }

  const save = async () => {
    if (!form.meeting_date || !form.title) { setError('날짜와 제목은 필수입니다.'); return }
    setSaving(true); setError('')

    const isEdit = view === 'edit'
    const url = isEdit ? `/api/admin/minutes/${selected!.id}` : '/api/admin/minutes'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? '저장 실패')
      return
    }
    setView('list')
    router.refresh()
  }

  const remove = async (m: Minute) => {
    if (!confirm(`"${m.title}" 회의록을 삭제하시겠습니까?`)) return
    const res = await fetch(`/api/admin/minutes/${m.id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  const inputClass = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"
  const taClass = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"

  // 목록
  if (view === 'list') return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">장학위원회 회의록</h1>
        <button onClick={openNew} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          + 새 회의록
        </button>
      </div>

      {minutes.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-400 text-sm">
          등록된 회의록이 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {minutes.map(m => (
            <div key={m.id} className="bg-white rounded-xl border px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <button className="flex-1 text-left" onClick={() => openDetail(m)}>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 whitespace-nowrap">{m.meeting_date}</span>
                  <span className="font-medium text-gray-900 text-sm">{m.title}</span>
                </div>
                {m.decisions && (
                  <p className="text-xs text-gray-500 mt-1 truncate" style={{ wordBreak: 'keep-all' }}>
                    결정: {m.decisions.slice(0, 60)}{m.decisions.length > 60 ? '...' : ''}
                  </p>
                )}
              </button>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <button onClick={() => openEdit(m)} className="text-xs text-blue-600 hover:underline">수정</button>
                <button onClick={() => remove(m)} className="text-xs text-red-500 hover:underline">삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // 상세 보기
  if (view === 'detail' && selected) return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setView('list')} className="text-sm text-gray-500 hover:text-gray-700">← 목록으로</button>
        <div className="flex gap-2">
          <button onClick={() => openEdit(selected)} className="text-sm text-blue-600 hover:underline">수정</button>
          <button onClick={() => { remove(selected); setView('list') }} className="text-sm text-red-500 hover:underline">삭제</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border p-6 space-y-5">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{selected.meeting_date}</p>
          <h2 className="text-lg font-bold text-gray-900">{selected.title}</h2>
        </div>
        {selected.attendees && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">참석자</p>
            <p className="text-sm text-gray-800" style={{ wordBreak: 'keep-all' }}>{selected.attendees}</p>
          </div>
        )}
        {selected.content && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">회의 내용</p>
            <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap" style={{ wordBreak: 'keep-all' }}>{selected.content}</p>
          </div>
        )}
        {selected.decisions && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">결정사항</p>
            <p className="text-sm text-gray-800 bg-blue-50 rounded-lg p-3 whitespace-pre-wrap" style={{ wordBreak: 'keep-all' }}>{selected.decisions}</p>
          </div>
        )}
        {selected.other_matters && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">기타사항</p>
            <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap" style={{ wordBreak: 'keep-all' }}>{selected.other_matters}</p>
          </div>
        )}
      </div>
    </div>
  )

  // 작성 / 수정 폼
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900">{view === 'new' ? '새 회의록 작성' : '회의록 수정'}</h2>
        <button onClick={() => setView('list')} className="text-sm text-gray-400 hover:text-gray-600">취소</button>
      </div>
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>회의 날짜 <span className="text-red-500">*</span></label>
            <input type="date" value={form.meeting_date} onChange={set('meeting_date')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>제목 <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={set('title')} className={inputClass} placeholder="예: 2026년 1학기 장학위원회" />
          </div>
        </div>
        <div>
          <label className={labelClass}>참석자</label>
          <input value={form.attendees} onChange={set('attendees')} className={inputClass} placeholder="예: 홍길동 위원장, 김철수 위원, 이영희 간사" />
        </div>
        <div>
          <label className={labelClass}>회의 내용</label>
          <textarea value={form.content} onChange={set('content')} rows={6} className={taClass} placeholder="회의에서 논의된 내용을 입력하세요." style={{ wordBreak: 'keep-all' }} />
        </div>
        <div>
          <label className={labelClass}>결정사항</label>
          <textarea value={form.decisions} onChange={set('decisions')} rows={4} className={taClass} placeholder="회의에서 결정된 사항을 입력하세요." style={{ wordBreak: 'keep-all' }} />
        </div>
        <div>
          <label className={labelClass}>기타사항</label>
          <textarea value={form.other_matters} onChange={set('other_matters')} rows={3} className={taClass} placeholder="기타 전달사항 등을 입력하세요." style={{ wordBreak: 'keep-all' }} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? '저장 중...' : '저장'}
          </button>
          <button onClick={() => setView('list')} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">취소</button>
        </div>
      </div>
    </div>
  )
}
