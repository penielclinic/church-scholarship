'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Rule {
  id: number
  version_label: string
  version_date: string
  file_url: string
  notes: string
  is_current: boolean
  created_at: string
}

export function RulesManager({ rules }: { rules: Rule[] }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async () => {
    if (!file) { setError('PDF 파일을 선택해 주세요.'); return }
    setUploading(true)
    setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('notes', notes)
    fd.append('is_current', String(isCurrent))

    const res = await fetch('/api/admin/rules', { method: 'POST', body: fd })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? '업로드 실패')
      setUploading(false)
      return
    }

    setFile(null)
    setNotes('')
    setIsCurrent(false)
    // reset file input
    const input = document.getElementById('rules-file-input') as HTMLInputElement
    if (input) input.value = ''
    router.refresh()
    setUploading(false)
  }

  const activate = async (id: number) => {
    await fetch('/api/admin/rules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_current: true }),
    })
    router.refresh()
  }

  const deactivate = async (id: number) => {
    await fetch('/api/admin/rules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_current: false }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* 새 버전 업로드 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">새 규정 버전 등록</h2>
        <p className="text-xs text-gray-500 mb-4" style={{ wordBreak: 'keep-all' }}>
          PDF 파일을 업로드하면 오늘 날짜로 버전이 자동 기록됩니다.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">규정 PDF 파일 <span className="text-red-500">*</span></label>
            <input
              id="rules-file-input"
              type="file"
              accept="application/pdf"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <p className="mt-1 text-xs text-gray-500">{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">메모 (변경 내용 등)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="예: 바나바 장학금 지급액 수정"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={e => setIsCurrent(e.target.checked)}
              className="accent-blue-600"
            />
            <span className="text-sm text-gray-700">홈페이지에 이 버전 표시 (활성화)</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={upload}
            disabled={uploading}
            className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? '업로드 중...' : '업로드'}
          </button>
        </div>
      </div>

      {/* 버전 목록 */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="font-medium text-gray-800">버전 목록</h2>
          <span className="text-xs text-gray-400">총 {rules.length}개</span>
        </div>

        {rules.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">등록된 규정이 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">버전 (날짜)</th>
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">메모</th>
                <th className="px-4 py-2.5 text-left font-medium text-gray-600">상태</th>
                <th className="px-4 py-2.5 text-left font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rules.map(r => (
                <tr key={r.id} className={r.is_current ? 'bg-green-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap text-gray-800">
                    {r.version_label}
                  </td>
                  <td className="px-4 py-3 text-gray-600" style={{ wordBreak: 'keep-all' }}>
                    {r.notes || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {r.is_current ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                        홈페이지 표시 중
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 whitespace-nowrap">
                        비활성
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 items-center">
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                      >
                        보기
                      </a>
                      <a
                        href={r.file_url}
                        download={`장학금규정_${r.version_label}.pdf`}
                        className="text-xs text-gray-600 hover:underline whitespace-nowrap"
                      >
                        다운로드
                      </a>
                      {!r.is_current ? (
                        <button
                          onClick={() => activate(r.id)}
                          className="text-xs text-green-600 hover:underline whitespace-nowrap"
                        >
                          활성화
                        </button>
                      ) : (
                        <button
                          onClick={() => deactivate(r.id)}
                          className="text-xs text-gray-400 hover:underline whitespace-nowrap"
                        >
                          비활성화
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
