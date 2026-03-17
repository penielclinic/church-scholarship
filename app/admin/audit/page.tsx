'use client'
import { useEffect, useRef } from 'react'

export default function AuditPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    function resize() {
      if (iframeRef.current) {
        iframeRef.current.style.height = (window.innerHeight - 73) + 'px'
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return (
    <div style={{ margin: '-32px -16px 0' }}>
      <iframe
        ref={iframeRef}
        src="/api/audit/checklist-html"
        style={{ width: '100%', border: 'none', display: 'block' }}
        title="장학위원회 자체 감사 시스템"
      />
    </div>
  )
}
