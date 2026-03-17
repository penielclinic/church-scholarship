'use client'

import { useState, useRef } from 'react'

declare global { interface Window { pdfjsLib: any } }

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
type CheckItem = { status: Status; memo: string }
type Checks = Record<string, Record<number, CheckItem>>

function initChecks(): Checks {
  const c: Checks = {}
  SECTIONS.forEach(s => {
    c[s.id] = {}
    s.items.forEach((_, i) => { c[s.id][i] = { status: 'none', memo: '' } })
  })
  return c
}

export default function AuditPage() {
  const [checks, setChecks] = useState<Checks>(initChecks)
  const [activeSection, setActiveSection] = useState('qualify')
  const [activeTab, setActiveTab] = useState<'checklist' | 'ai' | 'report'>('checklist')
  const [fileContent, setFileContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [memoInput, setMemoInput] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function setStatus(sid: string, idx: number, st: Status) {
    setChecks(prev => ({
      ...prev,
      [sid]: { ...prev[sid], [idx]: { ...prev[sid][idx], status: prev[sid][idx].status === st ? 'none' : st } },
    }))
  }

  function setMemo(sid: string, idx: number, val: string) {
    setChecks(prev => ({
      ...prev,
      [sid]: { ...prev[sid], [idx]: { ...prev[sid][idx], memo: val } },
    }))
  }

  async function handleFile(file: File) {
    setFileName(file.name)
    setFileLoading(true)
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') {
      if (!window.pdfjsLib) {
        await new Promise<void>(resolve => {
          const sc = document.createElement('script')
          sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
          sc.onload = () => resolve()
          document.head.appendChild(sc)
        })
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      const ab = await file.arrayBuffer()
      const pdf = await window.pdfjsLib.getDocument({ data: ab }).promise
      let txt = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const pg = await pdf.getPage(i)
        const ct = await pg.getTextContent()
        txt += `[${i}페이지]\n` + ct.items.map((x: any) => x.str).join(' ') + '\n\n'
      }
      setFileContent(txt)
    } else {
      setFileContent(await file.text())
    }
    setFileLoading(false)
  }

  async function runAi() {
    const prompt = fileContent
      ? `다음은 교회 장학금 관련 문서입니다. 장학금 감사 관점에서 이상 항목, 절차 미준수, 개선 권고사항을 한국어로 상세히 분석해주세요.\n\n파일명: ${fileName}\n\n내용:\n${fileContent.slice(0, 8000)}`
      : `다음은 장학금 감사 관련 메모입니다. 문제점과 개선 권고사항을 한국어로 분석해주세요.\n\n${memoInput}`
    setAiLoading(true)
    try {
      const res = await fetch('/api/audit/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const data = await res.json()
      setAiResult(data.text || data.error || '결과를 가져오지 못했습니다.')
    } catch (e: any) {
      setAiResult('오류: ' + e.message)
    }
    setAiLoading(false)
  }

  const totals = getTotals()
  const pct = totals.total > 0 ? Math.round(totals.done / totals.total * 100) : 0
  const score = totals.done > 0 ? Math.round((totals.good + totals.na) / totals.done * 100) : 0
  const scoreColor = score >= 80 ? '#a569bd' : score >= 60 ? '#f39c12' : '#e74c3c'
  const activeS = SECTIONS.find(s => s.id === activeSection)!

  return (
    <div style={{ margin: '-32px -16px 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 57px)' }}>
      {/* 헤더 */}
      <div style={{ background: 'linear-gradient(135deg,#2c1654,#6c3483)', padding: '16px 20px', color: 'white', flexShrink: 0 }}>
        <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: 2, marginBottom: 4 }}>해운대순복음교회</div>
        <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 12 }}>🎓 장학위원회 자체 감사시스템</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          {[
            { label: '진행률', val: `${pct}%`, sub: `${totals.done}/${totals.total}항목` },
            { label: '양호', val: String(totals.good), color: '#a569bd' },
            { label: '미흡', val: String(totals.bad), color: '#e74c3c' },
            { label: '해당없음', val: String(totals.na), color: '#95a5a6' },
            ...(totals.done > 0 ? [{ label: '적합도', val: `${score}점`, color: scoreColor }] : []),
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,.13)', borderRadius: 8, padding: '7px 14px', minWidth: 70 }}>
              <div style={{ fontSize: 10, opacity: 0.75 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: s.color }}>{s.val}</div>
              {s.sub && <div style={{ fontSize: 10, opacity: 0.7 }}>{s.sub}</div>}
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 99, height: 5 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#a569bd', borderRadius: 99, transition: 'width .4s' }} />
        </div>
      </div>

      {/* 탭 */}
      <div style={{ borderBottom: '1px solid #e5e7eb', display: 'flex', background: '#fff', flexShrink: 0 }}>
        {(['checklist', 'ai', 'report'] as const).map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            border: 'none', background: 'none', padding: '12px 18px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
            color: activeTab === tab ? '#6c3483' : '#6b7280',
            borderBottom: `3px solid ${activeTab === tab ? '#6c3483' : 'transparent'}`,
            fontWeight: activeTab === tab ? 500 : 400,
          }}>
            {['✅ 체크리스트', '🤖 AI 분석', '📋 감사 보고'][i]}
          </button>
        ))}
      </div>

      {/* 콘텐츠 영역 */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* 체크리스트 탭 */}
        <div style={{ display: activeTab === 'checklist' ? 'flex' : 'none', height: '100%' }}>
          {/* 사이드바 */}
          <div style={{ width: 170, borderRight: '1px solid #e5e7eb', overflowY: 'auto', background: '#fff', flexShrink: 0 }}>
            {SECTIONS.map(sec => {
              const st = getStats(sec.id)
              const active = activeSection === sec.id
              return (
                <div key={sec.id} onClick={() => setActiveSection(sec.id)} style={{
                  padding: '12px 14px', cursor: 'pointer',
                  borderLeft: `4px solid ${active ? sec.color : 'transparent'}`,
                  background: active ? sec.color + '18' : 'transparent',
                }}>
                  <div style={{ fontSize: 16 }}>{sec.icon}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.3, marginTop: 2, color: active ? sec.color : '#111827', fontWeight: active ? 500 : 400 }}>{sec.title}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, borderRadius: 3, padding: '1px 5px', background: '#e8f8f0', color: '#1d6a4a' }}>✓{st.good}</span>
                    {st.bad > 0 && <span style={{ fontSize: 10, borderRadius: 3, padding: '1px 5px', background: '#fdecea', color: '#c0392b' }}>✗{st.bad}</span>}
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>{st.done}/{st.total}</span>
                  </div>
                </div>
              )
            })}
          </div>
          {/* 항목 목록 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f9fafb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{activeS.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: activeS.color }}>{activeS.title}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>총 {activeS.items.length}개 항목</div>
              </div>
            </div>
            {activeS.items.map((item, idx) => {
              const ch = checks[activeS.id][idx]
              return (
                <div key={idx} style={{
                  background: '#fff', borderRadius: 8, padding: 14, marginBottom: 8,
                  border: `1px solid ${ch.status === 'good' ? '#c8f0d8' : ch.status === 'bad' ? '#fcd0cc' : '#e5e7eb'}`,
                }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af', minWidth: 24, paddingTop: 2 }}>Q{idx + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#111827', lineHeight: 1.6, marginBottom: 8 }}>{item}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {([['good', '✅ 양호', '#e8f8f0', '#27ae60'], ['bad', '❌ 미흡', '#fdecea', '#e74c3c'], ['na', '➖ 해당없음', '#f0f4f8', '#95a5a6']] as const).map(([st, lbl, bg, ac]) => (
                          <button key={st} onClick={() => setStatus(activeS.id, idx, st)} style={{
                            border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
                            background: ch.status === st ? ac : bg, color: ch.status === st ? 'white' : '#555', fontWeight: ch.status === st ? 500 : 400,
                          }}>{lbl}</button>
                        ))}
                      </div>
                      {ch.status === 'bad' && (
                        <input value={ch.memo} onChange={e => setMemo(activeS.id, idx, e.target.value)}
                          placeholder="미흡 사유 입력..."
                          style={{ marginTop: 7, width: '100%', border: '1px solid #f5a9a4', borderRadius: 5, padding: '7px 10px', fontSize: 12, fontFamily: 'inherit', background: '#fff8f7', boxSizing: 'border-box' }} />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI 분석 탭 */}
        <div style={{ display: activeTab === 'ai' ? 'block' : 'none', height: '100%', overflowY: 'auto', padding: 16 }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: 18, marginBottom: 14, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>📂 파일 업로드</div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[['PDF','#fdecea','#c0392b'],['CSV','#e8f8f0','#1d6a4a'],['TXT','#f0f4f8','#555']].map(([t,bg,c]) => (
                    <span key={t} style={{ fontSize: 10, borderRadius: 3, padding: '2px 7px', fontWeight: 500, background: bg, color: c }}>{t}</span>
                  ))}
                </div>
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]) }}
                onDragOver={e => e.preventDefault()}
                style={{ border: '1.5px dashed #d7bde2', borderRadius: 7, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', background: '#f9f0ff' }}>
                {fileLoading ? (
                  <><div style={{ fontSize: 28, marginBottom: 6 }}>⏳</div><div style={{ fontSize: 13, color: '#6c3483', fontWeight: 500 }}>처리 중...</div></>
                ) : fileName ? (
                  <><div style={{ fontSize: 28, marginBottom: 6 }}>📄</div><div style={{ fontSize: 13, color: '#6c3483', fontWeight: 500 }}>{fileName}</div><div style={{ fontSize: 11, color: '#27ae60', marginTop: 4 }}>✅ 로드 완료 · 클릭해서 교체</div></>
                ) : (
                  <><div style={{ fontSize: 28, marginBottom: 6 }}>📂</div><div style={{ fontSize: 13, color: '#6c3483', fontWeight: 500 }}>클릭 또는 드래그&드롭으로 파일 업로드</div><div style={{ fontSize: 11, color: '#888', marginTop: 5 }}>PDF · CSV · TXT</div></>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.csv,.txt,.tsv" style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {fileContent && (
                <div style={{ marginTop: 10, padding: '9px 11px', background: '#f9fafb', borderRadius: 5, fontSize: 11, color: '#6b7280', maxHeight: 80, overflow: 'auto', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 500, marginBottom: 3 }}>미리보기 ({fileContent.length.toLocaleString()}자)</div>
                  {fileContent.slice(0, 400)}...
                </div>
              )}
            </div>
            <div style={{ background: '#fff', borderRadius: 10, padding: 18, marginBottom: 14, border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>✏️ 내용 직접 입력</div>
              <textarea value={memoInput} onChange={e => setMemoInput(e.target.value)}
                placeholder="장학금 지급 내역, 심사 결과, 감사 중 발견한 내용 등을 직접 입력하세요..."
                style={{ width: '100%', height: 120, border: '1px solid #e5e7eb', borderRadius: 7, padding: 10, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <button onClick={runAi} disabled={aiLoading || (!fileContent && !memoInput)} style={{
              background: (aiLoading || (!fileContent && !memoInput)) ? '#bbb' : 'linear-gradient(135deg,#6c3483,#9b59b6)',
              color: 'white', border: 'none', borderRadius: 7, padding: '11px 24px', fontSize: 14, fontWeight: 500,
              cursor: (aiLoading || (!fileContent && !memoInput)) ? 'not-allowed' : 'pointer', marginBottom: 16, fontFamily: 'inherit',
            }}>{aiLoading ? '⏳ AI 분석 중...' : '🔍 AI 장학금 감사 분석 시작'}</button>
            {aiResult && (
              <div style={{ background: '#fff', borderRadius: 10, padding: 18, border: '1px solid #d7bde2' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#6c3483', marginBottom: 10 }}>🤖 AI 분석 결과</div>
                <div style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{aiResult}</div>
              </div>
            )}
          </div>
        </div>

        {/* 감사 보고 탭 */}
        <div style={{ display: activeTab === 'report' ? 'block' : 'none', height: '100%', overflowY: 'auto', padding: 16 }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ background: 'linear-gradient(135deg,#2c1654,#6c3483)', borderRadius: 12, padding: 20, color: 'white', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>해운대순복음교회 장학위원회</div>
                <div style={{ fontSize: 20, fontWeight: 500, marginTop: 4 }}>자체 감사 종합 적합도</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 3 }}>체크 완료 {totals.done}/{totals.total} 항목</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 52, fontWeight: 500, color: scoreColor }}>{totals.done > 0 ? score : '-'}</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{totals.done > 0 ? '점' : '체크 후 확인'}</div>
              </div>
            </div>
            {SECTIONS.map(sec => {
              const st = getStats(sec.id)
              const secPct = st.done > 0 ? Math.round((st.good + st.na) / st.done * 100) : 0
              const badItems = sec.items.filter((_, i) => checks[sec.id][i].status === 'bad')
              return (
                <div key={sec.id} style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                      <span style={{ fontSize: 17 }}>{sec.icon}</span>
                      <span style={{ fontWeight: 500, color: sec.color }}>{sec.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {[['#e8f8f0','#1d6a4a',`양호 ${st.good}`],['#fdecea','#c0392b',`미흡 ${st.bad}`],['#f0f4f8','#555',`해당없음 ${st.na}`]].map(([bg,c,txt]) => (
                        <span key={txt} style={{ fontSize: 10, borderRadius: 3, padding: '1px 5px', background: bg, color: c }}>{txt}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: 99, height: 4, margin: '8px 0' }}>
                    <div style={{ width: `${secPct}%`, height: '100%', background: sec.color, borderRadius: 99 }} />
                  </div>
                  {badItems.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: '#e74c3c', fontWeight: 500, marginBottom: 4 }}>⚠️ 미흡 항목</div>
                      {badItems.map((item, i) => {
                        const ri = sec.items.indexOf(item)
                        const memo = checks[sec.id][ri]?.memo
                        return (
                          <div key={i} style={{ fontSize: 12, color: '#6b7280', padding: '3px 0 3px 10px', borderLeft: '2px solid #e74c3c', marginBottom: 3 }}>
                            {item}{memo && <span style={{ color: '#e74c3c' }}> → {memo}</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            {aiResult && (
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16, border: '1px solid #d7bde2', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#6c3483', marginBottom: 8 }}>🤖 AI 분석 의견</div>
                <div style={{ fontSize: 12, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{aiResult.slice(0, 600)}{aiResult.length > 600 ? '...' : ''}</div>
              </div>
            )}
            <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 14 }}>
              해운대순복음교회 장학위원회 · {new Date().toLocaleDateString('ko-KR')} 기준
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
