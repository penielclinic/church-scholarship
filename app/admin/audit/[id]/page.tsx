'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'

const SECTIONS = [
  { id: 'qualify', icon: '📋', title: '신청 자격 심사', color: '#6c3483', items: [
    '장학금 신청자가 학적 요건(재학 증명)을 충족하였는가?',
    '신앙 요건(세례, 출석, 봉사 등)을 충족하였는가?',
    '추천서(담임목사 또는 지도교사)가 필수 첨부되어 있는가?',
    '신청서 및 제출 서류가 기한 내에 접수되었는가?',
    '신청 자격 미달 건에 대한 반려 처리가 적절히 이루어졌는가?',
  ]},
  { id: 'review', icon: '⚖️', title: '심사 절차', color: '#1a5276', items: [
    '심사위원회가 규정된 인원으로 구성되어 심사를 진행하였는가?',
    '심사 기준(점수표, 평가항목)이 사전에 마련되어 있었는가?',
    '심사 결과(선발 명단, 점수, 의견)가 문서화되어 보관되고 있는가?',
    '심사위원 간 이해충돌(친인척 등) 여부를 사전에 확인하였는가?',
    '심사 회의록이 작성·서명되어 보관되고 있는가?',
  ]},
  { id: 'payment', icon: '💰', title: '지급 관리', color: '#1d6a4a', items: [
    '동일 학기 내 동일인에게 중복 지급된 사례가 없는가?',
    '지급 금액이 예산 범위 내에서 집행되었는가?',
    '지급 방법(계좌이체 또는 현금)과 수령 확인이 기록되어 있는가?',
    '학기 단위 관리가 시스템(DB)에 정확히 반영되어 있는가?',
    '6개 장학금 유형(바나바·빌립·다비다·다니엘·여호수아·특별)별로 구분 관리되고 있는가?',
    '지급 내역이 재정 장부와 일치하는가?',
  ]},
  { id: 'followup', icon: '📊', title: '사후 관리', color: '#935116', items: [
    '지급 후 학업 지속 여부(성적증명서 등) 사후 관리가 이루어지고 있는가?',
    '수혜자 명단 및 이력이 누락 없이 보관되고 있는가?',
    '특별장학금 지급 시 별도 결의(당회 또는 위원회)를 거쳤는가?',
    '장학금 예산 집행률이 연말 결산에 반영되었는가?',
    '다음 학기 장학금 계획 수립 시 이번 감사 결과가 반영될 예정인가?',
  ]},
]

type Status = 'none' | 'good' | 'bad' | 'na'
type CheckMap = Record<string, Record<number, { status: Status; memo: string }>>
type Session = { id: string; year: number; semester: string; auditor: string; audit_date: string | null; status: string; verdict: string; opinion: string; score: number }

function initChecks(): CheckMap {
  const c: CheckMap = {}
  SECTIONS.forEach(s => {
    c[s.id] = {}
    s.items.forEach((_, i) => { c[s.id][i] = { status: 'none', memo: '' } })
  })
  return c
}

function checksToFlat(map: CheckMap) {
  const rows: { section_id: string; item_index: number; status: string; memo: string }[] = []
  SECTIONS.forEach(s => {
    s.items.forEach((_, i) => {
      rows.push({ section_id: s.id, item_index: i, status: map[s.id][i].status, memo: map[s.id][i].memo })
    })
  })
  return rows
}

function flatToMap(rows: any[]): CheckMap {
  const map = initChecks()
  rows.forEach(r => {
    if (map[r.section_id]) {
      map[r.section_id][r.item_index] = { status: r.status, memo: r.memo }
    }
  })
  return map
}

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [session, setSession] = useState<Session | null>(null)
  const [checks, setChecks] = useState<CheckMap>(initChecks)
  const [activeSection, setActiveSection] = useState('qualify')
  const [activeTab, setActiveTab] = useState<'checklist' | 'report' | 'pdf' | 'list'>('checklist')
  const [sessions, setSessions] = useState<any[]>([])
  const [verdict, setVerdict] = useState<string>('')
  const [opinion, setOpinion] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [loading, setLoading] = useState(true)

  // 데이터 로드
  useEffect(() => {
    async function load() {
      const [sRes, cRes] = await Promise.all([
        fetch(`/api/admin/audit/${id}`),
        fetch(`/api/admin/audit/${id}/checks`),
      ])
      if (!sRes.ok) { router.push('/admin/audit'); return }
      const s = await sRes.json()
      const c = await cRes.json()
      setSession(s)
      setVerdict(s.verdict || '')
      setOpinion(s.opinion || '')
      if (Array.isArray(c) && c.length > 0) setChecks(flatToMap(c))
      setLoading(false)
    }
    load()
  }, [id, router])

  function getStats(sid: string) {
    const vals = Object.values(checks[sid])
    return {
      total: vals.length,
      good: vals.filter(v => v.status === 'good').length,
      bad: vals.filter(v => v.status === 'bad').length,
      na: vals.filter(v => v.status === 'na').length,
      done: vals.filter(v => v.status !== 'none').length,
    }
  }

  function getTotals() {
    return SECTIONS.reduce((acc, s) => {
      const st = getStats(s.id)
      return { total: acc.total + st.total, good: acc.good + st.good, bad: acc.bad + st.bad, na: acc.na + st.na, done: acc.done + st.done }
    }, { total: 0, good: 0, bad: 0, na: 0, done: 0 })
  }

  function calcScore(t: ReturnType<typeof getTotals>) {
    return t.done > 0 ? Math.round((t.good + t.na) / t.done * 100) : 0
  }

  async function saveChecks() {
    setSaving(true)
    const totals = getTotals()
    const score = calcScore(totals)
    await Promise.all([
      fetch(`/api/admin/audit/${id}/checks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checksToFlat(checks)),
      }),
      fetch(`/api/admin/audit/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      }),
    ])
    setSession(prev => prev ? { ...prev, score } : prev)
    setSaving(false)
    setSavedMsg('저장됨 ✓')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  async function saveReport() {
    setSaving(true)
    const totals = getTotals()
    const score = calcScore(totals)
    const res = await fetch(`/api/admin/audit/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verdict, opinion, score, status: verdict ? 'completed' : 'in_progress' }),
    })
    const data = await res.json()
    setSession(data)
    setSaving(false)
    setSavedMsg('저장됨 ✓')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  async function deleteSession() {
    if (!confirm('이 감사 기록을 삭제하시겠습니까?')) return
    await fetch(`/api/admin/audit/${id}`, { method: 'DELETE' })
    router.push('/admin/audit')
  }

  function buildPDFHtml() {
    const totals = getTotals()
    const score = calcScore(totals)
    const level = score >= 90 ? '우수' : score >= 80 ? '양호' : score >= 60 ? '보통' : '개선필요'
    const lc = score >= 80 ? '#27ae60' : score >= 60 ? '#f39c12' : '#e74c3c'
    const vc = verdict === '적정' ? '#27ae60' : verdict === '조건부적정' ? '#f39c12' : '#e74c3c'

    let secRows = ''
    SECTIONS.forEach(s => {
      const st = getStats(s.id)
      const ss = st.done > 0 ? Math.round((st.good + st.na) / st.done * 100) : 0
      secRows += `<tr><td>${s.icon} ${s.title}</td><td style="text-align:center">${st.done}/${st.total}</td><td style="text-align:center;color:#27ae60;font-weight:600">${st.good}</td><td style="text-align:center;color:#e74c3c;font-weight:600">${st.bad}</td><td style="text-align:center;color:#95a5a6">${st.na}</td><td style="text-align:center;font-weight:700;color:${ss>=80?'#27ae60':ss>=60?'#f39c12':'#e74c3c'}">${ss}점</td></tr>`
    })

    let clRows = ''
    SECTIONS.forEach(s => {
      clRows += `<tr><td colspan="4" style="background:#f0e8f8;color:#2c1654;font-weight:700;padding:7px 10px;font-size:12px">${s.icon} ${s.title}</td></tr>`
      let gi = 0
      s.items.forEach((q, i) => {
        const ch = checks[s.id][i]
        const stL = ch.status === 'good' ? '양호' : ch.status === 'bad' ? '미흡' : ch.status === 'na' ? '해당없음' : '-'
        const stC = ch.status === 'good' ? '#27ae60' : ch.status === 'bad' ? '#e74c3c' : '#95a5a6'
        clRows += `<tr><td style="color:#888;white-space:nowrap;font-size:11px;text-align:center">Q${i+1}</td><td style="font-size:12px">${q}</td><td style="color:${stC};font-weight:600;white-space:nowrap;font-size:12px;text-align:center">${stL}</td><td style="font-size:11px;color:#e74c3c">${ch.memo || ''}</td></tr>`
      })
    })

    const auditDate = session?.audit_date ? new Date(session.audit_date).toLocaleDateString('ko-KR') : '미입력'

    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<title>자체감사 보고서 - ${session?.year}년 ${session?.semester}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:#f5f5f5;padding:20px;}
.wrap{max-width:800px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,.1);}
.hd{background:linear-gradient(135deg,#2c1654,#6c3483);padding:28px 36px;color:white;}
.hd h1{font-size:21px;font-weight:700;margin-bottom:4px;}
.hd p{font-size:12px;opacity:.8;}
.bd{padding:28px 36px;}
.sec{margin-bottom:22px;}
.sec h2{font-size:13px;font-weight:700;color:#2c1654;border-bottom:2px solid #6c3483;padding-bottom:5px;margin-bottom:10px;}
table{width:100%;border-collapse:collapse;font-size:13px;}
th{background:#f0e8f8;color:#2c1654;padding:7px 10px;text-align:left;font-weight:600;border:.5px solid #ddd;}
td{padding:7px 10px;border:.5px solid #eee;vertical-align:top;}
tr:nth-child(even) td{background:#faf8fc;}
.score-box{text-align:center;padding:18px;background:#f9f0ff;border-radius:10px;margin-bottom:18px;border:1px solid #d7bde2;}
.vd-box{text-align:center;padding:14px;background:#f9f9f9;border-radius:8px;border:1px solid #ddd;margin-bottom:14px;}
.sig{display:flex;gap:10px;margin-top:22px;}
.sig-b{flex:1;border:1px solid #ddd;border-radius:6px;padding:10px;text-align:center;}
.sig-t{font-size:11px;color:#888;margin-bottom:20px;}
.sig-l{border-top:1px solid #ccc;padding-top:5px;font-size:11px;color:#aaa;}
@media print{body{background:#fff;padding:0;}.wrap{box-shadow:none;border-radius:0;}@page{margin:1.5cm;size:A4;}}
</style></head><body><div class="wrap">
<div class="hd">
<h1>🎓 장학위원회 자체 감사 보고서</h1>
<p>해운대순복음교회 | ${session?.year}년 ${session?.semester} | 감사일: ${auditDate} | 감사위원: ${session?.auditor}</p>
</div>
<div class="bd">
<div class="score-box">
<div style="font-size:11px;color:#6c3483;margin-bottom:4px">종합 감사 적합도</div>
<div style="font-size:46px;font-weight:700;color:${lc}">${totals.done>0?score:'-'}점</div>
<div style="font-size:13px;color:${lc};margin-top:3px;font-weight:500">${totals.done>0?level:'미점검'}</div>
<div style="font-size:11px;color:#888;margin-top:6px">점검 ${totals.done}/${totals.total}개 항목 · 양호 ${totals.good} · 미흡 ${totals.bad} · 해당없음 ${totals.na}</div>
</div>

<div class="sec"><h2>1. 기본 정보</h2>
<table><tr><th style="width:30%">항목</th><th>내용</th></tr>
<tr><td>감사 대상 학기</td><td>${session?.year}년 ${session?.semester}</td></tr>
<tr><td>감사 실시일</td><td>${auditDate}</td></tr>
<tr><td>감사위원</td><td>${session?.auditor}</td></tr>
<tr><td>감사 상태</td><td>${session?.status === 'completed' ? '완료' : '진행중'}</td></tr>
</table></div>

<div class="sec"><h2>2. 영역별 감사 결과</h2>
<table><tr><th>영역</th><th style="text-align:center;width:55px">점검</th><th style="text-align:center;width:45px">양호</th><th style="text-align:center;width:45px">미흡</th><th style="text-align:center;width:60px">해당없음</th><th style="text-align:center;width:55px">적합도</th></tr>
${secRows}</table></div>

<div class="sec"><h2>3. 점검 항목 상세</h2>
<table><tr><th style="width:40px;text-align:center">번호</th><th>점검 항목</th><th style="width:70px;text-align:center">결과</th><th style="width:130px">특이사항</th></tr>
${clRows}</table></div>

${verdict ? `<div class="sec"><h2>4. 종합 판정</h2>
<div class="vd-box"><div style="font-size:11px;color:#666;margin-bottom:4px">감사 판정</div>
<div style="font-size:28px;font-weight:700;color:${vc}">${verdict}</div></div>
</div>` : ''}

${opinion ? `<div class="sec"><h2>${verdict?'5':'4'}. 종합 감사의견</h2>
<div style="font-size:13px;line-height:2;color:#333;padding:14px;background:#f9f9f9;border-radius:6px;border-left:3px solid #6c3483;word-break:keep-all">${opinion.replace(/\n/g,'<br>')}</div>
</div>` : ''}

<div class="sig">
${['감사위원','재정부장','장학위원장','부목사','담임목사'].map(t=>`<div class="sig-b"><div class="sig-t">${t}</div><div class="sig-l">(서명)</div></div>`).join('')}
</div>
<p style="font-size:11px;color:#aaa;text-align:center;margin-top:14px">해운대순복음교회 장학위원회 · 작성일: ${new Date().toLocaleDateString('ko-KR')}</p>
</div></div></body></html>`
  }

  function printPDF() {
    const win = window.open('', '_blank', 'width=900,height=1100')
    if (!win) { alert('팝업이 차단되었습니다. 허용 후 다시 시도해 주세요.'); return }
    win.document.write(buildPDFHtml())
    win.document.close()
    setTimeout(() => win.print(), 800)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">로딩 중...</div>
  if (!session) return null

  const totals = getTotals()
  const score = calcScore(totals)
  const pct = totals.total > 0 ? Math.round(totals.done / totals.total * 100) : 0
  const scoreColor = score >= 80 ? '#6c3483' : score >= 60 ? '#f39c12' : '#e74c3c'
  const activeS = SECTIONS.find(s => s.id === activeSection)!

  return (
    <div style={{ margin: '-32px -16px 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 57px)' }}>
      {/* 헤더 */}
      <div style={{ background: 'linear-gradient(135deg,#2c1654,#6c3483)', padding: '12px 20px', color: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/admin/audit" style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, textDecoration: 'none' }}>← 목록</a>
            <div>
              <span style={{ fontSize: 15, fontWeight: 600 }}>🎓 자체감사 — {session.year}년 {session.semester}</span>
              <span style={{ fontSize: 11, opacity: 0.75, marginLeft: 10 }}>감사위원: {session.auditor}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {savedMsg && <span style={{ fontSize: 11, opacity: 0.8, color: '#a8f0c6' }}>{savedMsg}</span>}
            <span style={{ fontSize: 11, opacity: 0.7 }}>{session.status === 'completed' ? '✅ 완료' : '🔵 진행중'}</span>
            <button onClick={deleteSession} style={{ background: 'rgba(255,80,80,.25)', border: 'none', color: 'white', borderRadius: 5, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>삭제</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: '진행률', val: `${pct}%`, sub: `${totals.done}/${totals.total}` },
            { label: '양호', val: String(totals.good) },
            { label: '미흡', val: String(totals.bad), color: totals.bad > 0 ? '#ff8a8a' : undefined },
            { label: '해당없음', val: String(totals.na) },
            ...(totals.done > 0 ? [{ label: '적합도', val: `${score}점` }] : []),
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,.13)', borderRadius: 7, padding: '4px 11px' }}>
              <div style={{ fontSize: 9, opacity: 0.75 }}>{s.label}</div>
              <div style={{ fontSize: 17, fontWeight: 500, color: s.color }}>{s.val}</div>
              {s.sub && <div style={{ fontSize: 9, opacity: 0.65 }}>{s.sub}</div>}
            </div>
          ))}
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 99, height: 4 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#a569bd', borderRadius: 99, transition: 'width .4s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ borderBottom: '1px solid #e5e7eb', display: 'flex', background: '#fff', flexShrink: 0 }}>
        {([
          ['checklist', '✅ 체크리스트'],
          ['report', '📋 감사 의견'],
          ['pdf', '📄 PDF 보고서'],
          ['list', '📂 목록보기'],
        ] as const).map(([tab, label]) => (
          <button key={tab} onClick={async () => {
            setActiveTab(tab)
            if (tab === 'list' && sessions.length === 0) {
              const res = await fetch('/api/admin/audit')
              if (res.ok) setSessions(await res.json())
            }
          }} style={{
            border: 'none', background: 'none', padding: '11px 18px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
            color: activeTab === tab ? '#6c3483' : '#6b7280',
            borderBottom: `3px solid ${activeTab === tab ? '#6c3483' : 'transparent'}`,
            fontWeight: activeTab === tab ? 600 : 400,
          }}>{label}</button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>

        {/* ── 체크리스트 탭 ── */}
        <div style={{ display: activeTab === 'checklist' ? 'flex' : 'none', height: '100%' }}>
          {/* 사이드바 */}
          <div style={{ width: 170, borderRight: '1px solid #e5e7eb', overflowY: 'auto', background: '#fff', flexShrink: 0 }}>
            {SECTIONS.map(sec => {
              const st = getStats(sec.id)
              const active = activeSection === sec.id
              return (
                <div key={sec.id} onClick={() => setActiveSection(sec.id)} style={{
                  padding: '11px 12px', cursor: 'pointer',
                  borderLeft: `4px solid ${active ? sec.color : 'transparent'}`,
                  background: active ? sec.color + '15' : 'transparent',
                }}>
                  <div style={{ fontSize: 15 }}>{sec.icon}</div>
                  <div style={{ fontSize: 11, lineHeight: 1.3, marginTop: 2, color: active ? sec.color : '#111827', fontWeight: active ? 600 : 400 }}>{sec.title}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, borderRadius: 3, padding: '1px 4px', background: '#e8f8f0', color: '#1d6a4a' }}>✓{st.good}</span>
                    {st.bad > 0 && <span style={{ fontSize: 9, borderRadius: 3, padding: '1px 4px', background: '#fdecea', color: '#c0392b' }}>✗{st.bad}</span>}
                    <span style={{ fontSize: 9, color: '#9ca3af' }}>{st.done}/{st.total}</span>
                  </div>
                </div>
              )
            })}
            <div style={{ padding: 12, borderTop: '1px solid #f0f0f0' }}>
              <button onClick={saveChecks} disabled={saving} style={{
                width: '100%', background: saving ? '#bbb' : '#6c3483', color: 'white', border: 'none',
                borderRadius: 7, padding: '8px 0', fontSize: 12, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}>{saving ? '저장 중...' : '💾 저장'}</button>
            </div>
          </div>

          {/* 항목 목록 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#f9fafb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>{activeS.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: activeS.color }}>{activeS.title}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>{activeS.items.length}개 항목</div>
              </div>
            </div>
            {activeS.items.map((item, idx) => {
              const ch = checks[activeS.id][idx]
              return (
                <div key={idx} style={{
                  background: '#fff', borderRadius: 8, padding: 12, marginBottom: 8,
                  border: `1px solid ${ch.status === 'good' ? '#c8f0d8' : ch.status === 'bad' ? '#fcd0cc' : '#e5e7eb'}`,
                }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#9ca3af', minWidth: 22, paddingTop: 2 }}>Q{idx + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#111827', lineHeight: 1.6, marginBottom: 7, wordBreak: 'keep-all' }}>{item}</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {([['good', '✅ 양호', '#e8f8f0', '#27ae60'], ['bad', '❌ 미흡', '#fdecea', '#e74c3c'], ['na', '➖ 해당없음', '#f0f4f8', '#95a5a6']] as const).map(([st, lbl, bg, ac]) => (
                          <button key={st} onClick={() => setChecks(prev => ({
                            ...prev,
                            [activeS.id]: { ...prev[activeS.id], [idx]: { ...prev[activeS.id][idx], status: prev[activeS.id][idx].status === st ? 'none' : st } }
                          }))} style={{
                            border: 'none', borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
                            background: ch.status === st ? ac : bg, color: ch.status === st ? 'white' : '#555', fontWeight: ch.status === st ? 600 : 400,
                          }}>{lbl}</button>
                        ))}
                      </div>
                      {ch.status === 'bad' && (
                        <input value={ch.memo} onChange={e => setChecks(prev => ({
                          ...prev,
                          [activeS.id]: { ...prev[activeS.id], [idx]: { ...prev[activeS.id][idx], memo: e.target.value } }
                        }))} placeholder="미흡 사유 입력..."
                          style={{ marginTop: 6, width: '100%', border: '1px solid #f5a9a4', borderRadius: 5, padding: '6px 9px', fontSize: 12, fontFamily: 'inherit', background: '#fff8f7', boxSizing: 'border-box' }} />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── 감사 의견 탭 ── */}
        <div style={{ display: activeTab === 'report' ? 'block' : 'none', height: '100%', overflowY: 'auto', padding: 16 }}>
          <div style={{ maxWidth: 660 }}>
            {/* 영역별 요약 */}
            <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#374151' }}>📊 영역별 감사 결과</div>
              {SECTIONS.map(sec => {
                const st = getStats(sec.id)
                const ss = st.done > 0 ? Math.round((st.good + st.na) / st.done * 100) : 0
                const badItems = sec.items.filter((_, i) => checks[sec.id][i]?.status === 'bad')
                return (
                  <div key={sec.id} style={{ padding: '9px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: sec.color, fontWeight: 500 }}>{sec.icon} {sec.title}</span>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, background: '#e8f8f0', color: '#1d6a4a', borderRadius: 3, padding: '1px 5px' }}>양호 {st.good}</span>
                        {st.bad > 0 && <span style={{ fontSize: 10, background: '#fdecea', color: '#c0392b', borderRadius: 3, padding: '1px 5px' }}>미흡 {st.bad}</span>}
                        <span style={{ fontSize: 12, fontWeight: 700, color: ss >= 80 ? '#27ae60' : ss >= 60 ? '#f39c12' : '#e74c3c', minWidth: 38, textAlign: 'right' }}>{st.done > 0 ? ss + '점' : '-'}</span>
                      </div>
                    </div>
                    <div style={{ background: '#f3f4f6', borderRadius: 99, height: 3 }}>
                      <div style={{ width: `${ss}%`, height: '100%', background: sec.color, borderRadius: 99 }} />
                    </div>
                    {badItems.length > 0 && (
                      <div style={{ marginTop: 5 }}>
                        {badItems.map((item, i) => {
                          const ri = sec.items.indexOf(item)
                          return (
                            <div key={i} style={{ fontSize: 11, color: '#6b7280', padding: '2px 0 2px 8px', borderLeft: '2px solid #e74c3c', marginTop: 2 }}>
                              {item}{checks[sec.id][ri]?.memo && <span style={{ color: '#e74c3c' }}> → {checks[sec.id][ri].memo}</span>}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
              <div style={{ marginTop: 10, padding: '10px 12px', background: '#f9f0ff', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#6c3483' }}>종합 적합도</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: scoreColor }}>{totals.done > 0 ? score + '점' : '-'}</span>
              </div>
            </div>

            {/* 종합 판정 */}
            <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#374151' }}>⚖️ 종합 판정</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['적정', '조건부적정', '부적정'] as const).map((v) => {
                  const bg = v === '적정' ? '#27ae60' : v === '조건부적정' ? '#f39c12' : '#e74c3c'
                  return (
                    <button key={v} onClick={() => setVerdict(prev => prev === v ? '' : v)} style={{
                      flex: 1, border: verdict === v ? 'none' : '1px solid #e5e7eb', borderRadius: 8, padding: '10px 0',
                      cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                      background: verdict === v ? bg : '#f9fafb', color: verdict === v ? 'white' : '#6b7280',
                    }}>{v}</button>
                  )
                })}
              </div>
            </div>

            {/* 감사의견 */}
            <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>📝 종합 감사의견</div>
              <textarea value={opinion} onChange={e => setOpinion(e.target.value)}
                placeholder="이번 학기 장학금 운영에 대한 전반적인 감사 의견, 미흡사항, 개선 권고사항 등을 작성하세요."
                style={{ width: '100%', minHeight: 140, border: '1px solid #e5e7eb', borderRadius: 7, padding: 10, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.8 }} />
            </div>

            <button onClick={saveReport} disabled={saving} style={{
              width: '100%', background: saving ? '#bbb' : 'linear-gradient(135deg,#2c1654,#6c3483)', color: 'white',
              border: 'none', borderRadius: 8, padding: 12, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}>{saving ? '저장 중...' : '💾 감사 의견 저장'}</button>
            {verdict && (
              <p style={{ fontSize: 11, color: '#27ae60', textAlign: 'center', marginTop: 6 }}>
                ✅ 판정 "{verdict}" — 저장 시 감사 상태가 "완료"로 변경됩니다.
              </p>
            )}
          </div>
        </div>

        {/* ── PDF 보고서 탭 ── */}
        <div style={{ display: activeTab === 'pdf' ? 'block' : 'none', height: '100%', overflowY: 'auto', padding: 16 }}>
          <div style={{ maxWidth: 660 }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e5e7eb', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>📄 감사 보고서 PDF</div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6, wordBreak: 'keep-all' }}>
                체크리스트와 감사 의견을 바탕으로 공식 보고서를 생성합니다.<br />
                새 창에서 열린 후 <strong>인쇄 → PDF로 저장</strong>을 선택하세요.
              </p>

              {/* 보고서 요약 미리보기 */}
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: 14, marginBottom: 16, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  {[
                    ['감사 기간', `${session.year}년 ${session.semester}`],
                    ['감사위원', session.auditor],
                    ['감사일', session.audit_date ? new Date(session.audit_date).toLocaleDateString('ko-KR') : '미입력'],
                    ['적합도', totals.done > 0 ? `${score}점` : '미점검'],
                    ['종합 판정', verdict || '미입력'],
                    ['점검 완료', `${totals.done}/${totals.total}개`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ fontSize: 12 }}>
                      <span style={{ color: '#9ca3af' }}>{k}: </span>
                      <span style={{ color: '#111827', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
                {opinion && (
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, borderTop: '1px solid #e5e7eb', paddingTop: 10, wordBreak: 'keep-all' }}>
                    {opinion.slice(0, 100)}{opinion.length > 100 ? '...' : ''}
                  </div>
                )}
              </div>

              <button onClick={printPDF} style={{
                width: '100%', background: 'linear-gradient(135deg,#2c1654,#6c3483)', color: 'white',
                border: 'none', borderRadius: 8, padding: '13px 0', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>🖨 PDF 보고서 출력</button>
              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
                새 창 → 인쇄(Ctrl+P) → 대상: PDF로 저장
              </p>
            </div>
          </div>
        </div>
        {/* ── 목록보기 탭 ── */}
        <div style={{ display: activeTab === 'list' ? 'block' : 'none', height: '100%', overflowY: 'auto', padding: 16 }}>
          <div style={{ maxWidth: 800 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>📂 감사 기록 목록</div>
              <a href="/admin/audit/new" style={{
                background: '#6c3483', color: 'white', textDecoration: 'none',
                borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 500,
              }}>+ 새 감사 시작</a>
            </div>
            {sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af', fontSize: 13 }}>로딩 중...</div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['감사 기간', '감사위원', '감사일', '적합도', '판정', '상태', ''].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: h === '적합도' || h === '판정' || h === '상태' || h === '' ? 'center' : 'left', fontWeight: 600, color: '#6b7280', fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s: any) => {
                      const isCurrent = s.id === id
                      const scoreColor = s.score >= 80 ? '#27ae60' : s.score >= 60 ? '#f39c12' : s.score > 0 ? '#e74c3c' : '#9ca3af'
                      const verdictBg = s.verdict === '적정' ? '#e8f8f0' : s.verdict === '조건부적정' ? '#fef9e7' : s.verdict === '부적정' ? '#fdecea' : '#f3f4f6'
                      const verdictColor = s.verdict === '적정' ? '#1d6a4a' : s.verdict === '조건부적정' ? '#935116' : s.verdict === '부적정' ? '#c0392b' : '#9ca3af'
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6', background: isCurrent ? '#f9f0ff' : 'white' }}>
                          <td style={{ padding: '10px 12px', fontWeight: isCurrent ? 700 : 400, color: isCurrent ? '#6c3483' : '#111827', whiteSpace: 'nowrap' }}>
                            {isCurrent && <span style={{ fontSize: 10, background: '#6c3483', color: 'white', borderRadius: 3, padding: '1px 5px', marginRight: 5 }}>현재</span>}
                            {s.year}년 {s.semester}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#374151', whiteSpace: 'nowrap' }}>{s.auditor}</td>
                          <td style={{ padding: '10px 12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{s.audit_date ? new Date(s.audit_date).toLocaleDateString('ko-KR') : '-'}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: scoreColor }}>{s.score > 0 ? `${s.score}점` : '-'}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            {s.verdict ? <span style={{ fontSize: 11, background: verdictBg, color: verdictColor, borderRadius: 99, padding: '2px 8px', fontWeight: 500 }}>{s.verdict}</span> : <span style={{ color: '#d1d5db' }}>-</span>}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ fontSize: 11, background: s.status === 'completed' ? '#e8f8f0' : '#eff6ff', color: s.status === 'completed' ? '#1d6a4a' : '#1d4ed8', borderRadius: 99, padding: '2px 8px', fontWeight: 500 }}>
                              {s.status === 'completed' ? '완료' : '진행중'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            {isCurrent ? (
                              <span style={{ fontSize: 11, color: '#9ca3af' }}>현재</span>
                            ) : (
                              <a href={`/admin/audit/${s.id}`} style={{ fontSize: 11, color: '#6c3483', textDecoration: 'none', fontWeight: 500 }}>보기 →</a>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
