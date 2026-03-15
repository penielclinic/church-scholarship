'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Scholarship {
  id: number
  name: string
  description: string | null
  amount_k12: number
  amount_univ: number
  amount_grad: number
  is_active: boolean
  created_at: string
}

interface SemesterAmount {
  id: number
  scholarship_id: number
  name: string
  amount_k12: number
  amount_univ: number
  amount_grad: number
}

const fmt = (n: number) => n > 0 ? n.toLocaleString() + '원' : '—'
const CURRENT_YEAR = new Date().getFullYear()

export function ScholarshipManager({ scholarships }: { scholarships: Scholarship[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<'programs' | 'amounts'>('programs')

  // ── 장학 프로그램 탭 ──────────────────────────────────────
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Scholarship | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [amountK12, setAmountK12] = useState('')
  const [amountUniv, setAmountUniv] = useState('')
  const [amountGrad, setAmountGrad] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const resetForm = () => {
    setName(''); setDescription('')
    setAmountK12(''); setAmountUniv(''); setAmountGrad('')
    setEditing(null); setShowForm(false); setFormError('')
  }

  const openEdit = (s: Scholarship) => {
    setEditing(s); setName(s.name); setDescription(s.description ?? '')
    setAmountK12(s.amount_k12 > 0 ? String(s.amount_k12) : '')
    setAmountUniv(s.amount_univ > 0 ? String(s.amount_univ) : '')
    setAmountGrad(s.amount_grad > 0 ? String(s.amount_grad) : '')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setFormError('')
    const body = {
      name, description,
      amount_k12: parseInt(amountK12) || 0,
      amount_univ: parseInt(amountUniv) || 0,
      amount_grad: parseInt(amountGrad) || 0,
      amount: parseInt(amountGrad) || parseInt(amountUniv) || parseInt(amountK12) || 0,
    }
    let res
    if (editing) {
      res = await fetch(`/api/scholarships/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      res = await fetch('/api/scholarships', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setLoading(false)
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setFormError(json.error ?? '저장 실패. Supabase에 컬럼이 추가되었는지 확인하세요.')
      return
    }
    resetForm(); router.refresh()
  }

  const handleDeactivate = async (id: number) => {
    if (!confirm('이 프로그램을 비활성화하시겠습니까?')) return
    await fetch(`/api/scholarships/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  // ── 학기별 금액 탭 ──────────────────────────────────────
  const [selYear, setSelYear] = useState(CURRENT_YEAR)
  const [selSemester, setSelSemester] = useState(1)
  const [semAmounts, setSemAmounts] = useState<SemesterAmount[]>([])
  const [semLoading, setSemLoading] = useState(false)
  const [semSaving, setSemSaving] = useState(false)
  const [semMsg, setSemMsg] = useState('')

  const loadSemesterAmounts = useCallback(async () => {
    setSemLoading(true); setSemMsg('')
    const res = await fetch(`/api/admin/scholarship-amounts?year=${selYear}&semester=${selSemester}`)
    const data = await res.json()
    setSemAmounts(Array.isArray(data) ? data : [])
    setSemLoading(false)
  }, [selYear, selSemester])

  useEffect(() => {
    if (tab === 'amounts') loadSemesterAmounts()
  }, [tab, loadSemesterAmounts])

  const updateSemAmount = (scholarshipId: number, field: 'amount_k12' | 'amount_univ' | 'amount_grad', value: string) => {
    setSemAmounts(prev => prev.map(a =>
      (a.id === scholarshipId || a.scholarship_id === scholarshipId)
        ? { ...a, [field]: parseInt(value) || 0 }
        : a
    ))
  }

  const saveSemesterAmounts = async () => {
    setSemSaving(true); setSemMsg('')
    const res = await fetch('/api/admin/scholarship-amounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: selYear,
        semester: selSemester,
        amounts: semAmounts.map(a => ({
          scholarship_id: a.scholarship_id ?? a.id,
          amount_k12: a.amount_k12,
          amount_univ: a.amount_univ,
          amount_grad: a.amount_grad,
        })),
      }),
    })
    setSemSaving(false)
    setSemMsg(res.ok ? '저장되었습니다.' : '저장 실패')
    setTimeout(() => setSemMsg(''), 2500)
  }

  const inputClass = "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const numInputClass = "w-full border rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div>
      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b">
        {[
          { key: 'programs', label: '장학 프로그램' },
          { key: 'amounts', label: '학기별 금액' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'programs' | 'amounts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 장학 프로그램 탭 ── */}
      {tab === 'programs' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              + 프로그램 추가
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl border p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">{editing ? '프로그램 수정' : '새 프로그램 추가'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">프로그램 이름</label>
                  <input value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className={inputClass} />
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-3">기본 장학금액 <span className="font-normal text-gray-400">(학기별 금액이 없을 때 사용)</span></p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">초·중·고 (원)</label>
                      <input type="number" value={amountK12} onChange={e => setAmountK12(e.target.value)} className={inputClass} placeholder="0" min="0" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">대학 (원)</label>
                      <input type="number" value={amountUniv} onChange={e => setAmountUniv(e.target.value)} className={inputClass} placeholder="0" min="0" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">대학원 (원)</label>
                      <input type="number" value={amountGrad} onChange={e => setAmountGrad(e.target.value)} className={inputClass} placeholder="0" min="0" />
                    </div>
                  </div>
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700" style={{ wordBreak: 'keep-all' }}>
                    {formError}
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                    {loading ? '저장 중...' : '저장'}
                  </button>
                  <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">취소</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">프로그램명</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">설명</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">초·중·고<br /><span className="text-xs font-normal text-gray-400">(기본)</span></th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">대학<br /><span className="text-xs font-normal text-gray-400">(기본)</span></th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">대학원<br /><span className="text-xs font-normal text-gray-400">(기본)</span></th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">상태</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {scholarships.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">등록된 프로그램이 없습니다.</td></tr>
                ) : (
                  scholarships.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{s.name}</td>
                      <td className="px-4 py-3 text-gray-600" style={{ wordBreak: 'keep-all' }}>{s.description ?? '—'}</td>
                      <td className="px-4 py-3 text-center text-gray-700 whitespace-nowrap">{fmt(s.amount_k12 ?? 0)}</td>
                      <td className="px-4 py-3 text-center text-gray-700 whitespace-nowrap">{fmt(s.amount_univ ?? 0)}</td>
                      <td className="px-4 py-3 text-center text-gray-700 whitespace-nowrap">{fmt(s.amount_grad ?? 0)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          {s.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800 text-xs font-medium whitespace-nowrap">수정</button>
                          {s.is_active && (
                            <button onClick={() => handleDeactivate(s.id)} className="text-red-500 hover:text-red-700 text-xs font-medium whitespace-nowrap">비활성화</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 학기별 금액 탭 ── */}
      {tab === 'amounts' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800" style={{ wordBreak: 'keep-all' }}>
            학기를 선택하고 금액을 입력한 뒤 저장하세요. 각 학기의 금액은 독립적으로 저장되므로 이전 학기 금액에 영향을 주지 않습니다.
          </div>

          {/* 학기 선택 */}
          <div className="bg-white rounded-xl border p-5 flex items-end gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">연도</label>
              <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 2 + i).map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">학기</label>
              <select value={selSemester} onChange={e => setSelSemester(Number(e.target.value))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={1}>1학기</option>
                <option value={2}>2학기</option>
              </select>
            </div>
            <button onClick={loadSemesterAmounts} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
              조회
            </button>
          </div>

          {/* 금액 입력 테이블 */}
          {semLoading ? (
            <div className="text-center py-10 text-gray-400 text-sm">불러오는 중...</div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-5 py-3 border-b bg-gray-50">
                <h3 className="font-medium text-gray-800">{selYear}년 {selSemester}학기 장학금액</h3>
              </div>
              {semAmounts.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">활성화된 장학 프로그램이 없습니다.</div>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">장학금 종류</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600 w-36">초·중·고 (원)</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600 w-36">대학 (원)</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600 w-36">대학원 (원)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {semAmounts.map(a => (
                        <tr key={a.scholarship_id ?? a.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{a.name}</td>
                          <td className="px-4 py-3">
                            <input type="number" value={a.amount_k12 || ''} placeholder="0" min="0"
                              onChange={e => updateSemAmount(a.scholarship_id ?? a.id, 'amount_k12', e.target.value)}
                              className={numInputClass} />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" value={a.amount_univ || ''} placeholder="0" min="0"
                              onChange={e => updateSemAmount(a.scholarship_id ?? a.id, 'amount_univ', e.target.value)}
                              className={numInputClass} />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" value={a.amount_grad || ''} placeholder="0" min="0"
                              onChange={e => updateSemAmount(a.scholarship_id ?? a.id, 'amount_grad', e.target.value)}
                              className={numInputClass} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-4 border-t flex items-center gap-3">
                    <button onClick={saveSemesterAmounts} disabled={semSaving}
                      className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {semSaving ? '저장 중...' : `${selYear}년 ${selSemester}학기 금액 저장`}
                    </button>
                    {semMsg && (
                      <span className={`text-sm ${semMsg.includes('실패') ? 'text-red-600' : 'text-green-600'}`}>{semMsg}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
