'use client'

import { useState } from 'react'

export function RecommendLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/recommend/${token}`
    : `/recommend/${token}`

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-4 border-t pt-4">
      <p className="text-xs font-semibold text-gray-600 mb-2">추천서 링크</p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 border rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-gray-50 focus:outline-none"
        />
        <button
          onClick={copy}
          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
            copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {copied ? '복사됨 ✓' : '링크 복사'}
        </button>
        <a
          href={`/recommend/${token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 whitespace-nowrap"
        >
          열기
        </a>
      </div>
      <p className="text-xs text-gray-400 mt-1" style={{ wordBreak: 'keep-all' }}>
        이 링크를 추천인에게 공유하면 추천서를 온라인으로 작성할 수 있습니다.
      </p>
    </div>
  )
}
