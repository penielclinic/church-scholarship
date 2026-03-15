'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeleteButton({ id }: { id: number }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`신청서 #${id}를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return
    setDeleting(true)
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/applications')
    } else {
      alert('삭제 실패')
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
    >
      {deleting ? '삭제 중...' : '삭제'}
    </button>
  )
}
