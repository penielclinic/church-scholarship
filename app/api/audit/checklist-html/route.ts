import { NextResponse } from 'next/server'

const CSS_VARS = `
:root {
  --color-background-primary: #ffffff;
  --color-background-secondary: #f9fafb;
  --color-background-tertiary: #f3f4f6;
  --color-border-tertiary: #e5e7eb;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
}
`

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>장학위원회 자체 감사 시스템</title>
<style>
${CSS_VARS}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Apple SD Gothic Neo','Noto Sans KR',sans-serif;}
.hdr{background:linear-gradient(135deg,#2c1654,#6c3483);padding:16px 20px;color:white;}
.hdr-sub{font-size:10px;opacity:.7;letter-spacing:2px;margin-bottom:4px;}
.hdr-title{font-size:17px;font-weight:500;margin-bottom:12px;}
.stat-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;}
.stat-box{background:rgba(255,255,255,.13);border-radius:8px;padding:7px 14px;min-width:70px;}
.stat-box .lbl{font-size:10px;opacity:.75;}
.stat-box .val{font-size:20px;font-weight:500;}
.prog-bg{background:rgba(255,255,255,.2);border-radius:99px;height:5px;}
.prog-fill{height:100%;background:#a569bd;border-radius:99px;transition:width .4s;}
.tabs{background:var(--color-background-primary);border-bottom:.5px solid var(--color-border-tertiary);display:flex;}
.tab-btn{border:none;background:none;padding:12px 18px;cursor:pointer;font-size:13px;font-family:inherit;color:var(--color-text-secondary);border-bottom:3px solid transparent;transition:all .2s;}
.tab-btn.active{color:#6c3483;border-bottom-color:#6c3483;font-weight:500;}
.layout{display:flex;min-height:400px;}
.sidebar{width:170px;background:var(--color-background-primary);border-right:.5px solid var(--color-border-tertiary);flex-shrink:0;}
.sec-btn{padding:12px 14px;cursor:pointer;border-left:4px solid transparent;transition:all .2s;}
.sec-btn:hover{background:var(--color-background-secondary);}
.content{flex:1;overflow-y:auto;padding:16px;}
.sec-stats{display:flex;gap:4px;margin-top:5px;flex-wrap:wrap;}
.badge{font-size:10px;border-radius:3px;padding:1px 5px;}
.q-card{background:var(--color-background-primary);border-radius:8px;padding:14px;margin-bottom:8px;border:.5px solid var(--color-border-tertiary);transition:border-color .2s;}
.q-card.good{border-color:#c8f0d8;}
.q-card.bad{border-color:#fcd0cc;}
.q-num{font-size:11px;color:var(--color-text-tertiary);min-width:20px;}
.q-text{font-size:13px;color:var(--color-text-primary);line-height:1.6;margin-bottom:8px;}
.btn-row{display:flex;gap:6px;flex-wrap:wrap;}
.chk-btn{border:none;border-radius:5px;padding:5px 12px;cursor:pointer;font-size:11px;font-family:inherit;transition:all .15s;}
.memo-inp{margin-top:7px;width:100%;border:.5px solid #f5a9a4;border-radius:5px;padding:7px 10px;font-size:12px;font-family:inherit;background:#fff8f7;color:#333;}
.ai-wrap{padding:16px;max-width:700px;}
.panel{background:var(--color-background-primary);border-radius:10px;padding:18px;margin-bottom:14px;border:.5px solid var(--color-border-tertiary);}
.panel-title{font-size:13px;font-weight:500;color:var(--color-text-primary);margin-bottom:10px;}
.drop-zone{border:1.5px dashed #d7bde2;border-radius:7px;padding:28px 16px;text-align:center;cursor:pointer;background:#f9f0ff;transition:all .2s;}
.drop-zone:hover{background:#f0e0ff;}
.file-tag{font-size:10px;border-radius:3px;padding:2px 7px;font-weight:500;}
.ai-btn{background:linear-gradient(135deg,#6c3483,#9b59b6);color:white;border:none;border-radius:7px;padding:11px 24px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;margin-bottom:16px;}
.ai-btn:disabled{background:#bbb;cursor:not-allowed;}
.ai-result{background:var(--color-background-primary);border-radius:10px;padding:18px;border:.5px solid #d7bde2;}
.preview-box{margin-top:10px;padding:9px 11px;background:var(--color-background-secondary);border-radius:5px;font-size:11px;color:var(--color-text-secondary);max-height:80px;overflow:auto;line-height:1.7;border:.5px solid var(--color-border-tertiary);}
.report-wrap{padding:16px;max-width:700px;}
.score-card{background:linear-gradient(135deg,#2c1654,#6c3483);border-radius:12px;padding:20px;color:white;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;}
.r-card{background:var(--color-background-primary);border-radius:10px;padding:16px;margin-bottom:10px;border:.5px solid var(--color-border-tertiary);}
.r-prog{background:var(--color-background-secondary);border-radius:99px;height:4px;margin:8px 0;}
.bad-item{font-size:12px;color:var(--color-text-secondary);padding:3px 0 3px 10px;border-left:2px solid #e74c3c;margin-bottom:3px;}
textarea{width:100%;height:120px;border:.5px solid var(--color-border-tertiary);border-radius:7px;padding:10px;font-size:13px;font-family:inherit;resize:vertical;background:var(--color-background-primary);color:var(--color-text-primary);}
</style>
</head>
<body>

<div class="hdr">
  <div class="hdr-sub">해운대순복음교회</div>
  <div class="hdr-title">🎓 장학위원회 감사 자체 감사시스템</div>
  <div class="stat-row" id="statRow"></div>
  <div class="prog-bg"><div class="prog-fill" id="progFill" style="width:0%"></div></div>
</div>
<div class="tabs">
  <button class="tab-btn active" onclick="showTab('checklist')">✅ 체크리스트</button>
  <button class="tab-btn" onclick="showTab('ai')">🤖 AI 분석</button>
  <button class="tab-btn" onclick="showTab('report')">📋 감사 보고</button>
</div>

<div id="tabChecklist">
  <div class="layout">
    <div class="sidebar" id="sidebar"></div>
    <div class="content" id="itemContent"></div>
  </div>
</div>

<div id="tabAi" style="display:none">
  <div class="ai-wrap">
    <div class="panel">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div class="panel-title" style="margin:0">📂 파일 업로드</div>
        <div style="display:flex;gap:5px;">
          <span class="file-tag" style="background:#fdecea;color:#c0392b;">PDF</span>
          <span class="file-tag" style="background:#e8f8f0;color:#1d6a4a;">CSV</span>
          <span class="file-tag" style="background:#f0f4f8;color:#555;">TXT</span>
        </div>
      </div>
      <div class="drop-zone" id="dropZone" onclick="document.getElementById('fileInput').click()" ondrop="handleDrop(event)" ondragover="event.preventDefault()">
        <div id="dropContent">
          <div style="font-size:28px;margin-bottom:6px;">📂</div>
          <div style="font-size:13px;color:#6c3483;font-weight:500;">클릭 또는 드래그&드롭으로 파일 업로드</div>
          <div style="font-size:11px;color:#888;margin-top:5px;">PDF (장학금 지급내역·회의록) · CSV · TXT</div>
        </div>
      </div>
      <input type="file" id="fileInput" accept=".pdf,.csv,.txt,.tsv" style="display:none" onchange="handleFile(this.files[0])">
      <div id="filePreview" style="display:none"></div>
    </div>
    <div class="panel">
      <div class="panel-title">✏️ 내용 직접 입력</div>
      <textarea id="memoInput" placeholder="장학금 지급 내역, 심사 결과, 감사 중 발견한 내용 등을 직접 붙여넣거나 입력하세요..."></textarea>
    </div>
    <button class="ai-btn" id="aiBtn" onclick="runAi()" disabled>🔍 AI 장학금 감사 분석 시작</button>
    <div id="aiResult" style="display:none" class="ai-result">
      <div style="font-size:14px;font-weight:500;color:#6c3483;margin-bottom:10px;">🤖 AI 분석 결과</div>
      <div id="aiText" style="font-size:13px;line-height:1.9;color:var(--color-text-primary);white-space:pre-wrap;"></div>
    </div>
  </div>
</div>

<div id="tabReport" style="display:none">
  <div class="report-wrap" id="reportContent"></div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
const SECTIONS=[
  {id:"qualify",icon:"📋",title:"신청 자격 심사",color:"#6c3483",items:[
    "장학금 신청자가 학적 요건(재학 증명)을 충족하였는가?",
    "신앙 요건(세례, 출석, 봉사 등)을 충족하였는가?",
    "추천서(담임목사 또는 지도교사)가 필수 첨부되어 있는가?",
    "신청서 및 제출 서류가 기한 내에 접수되었는가?",
    "신청 자격 미달 건에 대한 반려 처리가 적절히 이루어졌는가?",
  ]},
  {id:"review",icon:"⚖️",title:"심사 절차",color:"#1a5276",items:[
    "심사위원회가 규정된 인원으로 구성되어 심사를 진행하였는가?",
    "심사 기준(점수표, 평가항목)이 사전에 마련되어 있었는가?",
    "심사 결과(선발 명단, 점수, 의견)가 문서화되어 보관되고 있는가?",
    "심사위원 간 이해충돌(친인척 등) 여부를 사전에 확인하였는가?",
    "심사 회의록이 작성·서명되어 보관되고 있는가?",
  ]},
  {id:"payment",icon:"💰",title:"지급 관리",color:"#1d6a4a",items:[
    "동일 학기 내 동일인에게 중복 지급된 사례가 없는가?",
    "지급 금액이 예산 범위 내에서 집행되었는가?",
    "지급 방법(계좌이체 또는 현금)과 수령 확인이 기록되어 있는가?",
    "학기 단위 관리가 시스템(DB)에 정확히 반영되어 있는가?",
    "6개 장학금 유형(바나바·빌립·다비다·다니엘·여호수아·특별)별로 구분 관리되고 있는가?",
    "지급 내역이 재정 장부와 일치하는가?",
  ]},
  {id:"followup",icon:"📊",title:"사후 관리",color:"#935116",items:[
    "지급 후 학업 지속 여부(성적증명서 등) 사후 관리가 이루어지고 있는가?",
    "수혜자 명단 및 이력이 누락 없이 보관되고 있는가?",
    "특별장학금 지급 시 별도 결의(당회 또는 위원회)를 거쳤는가?",
    "장학금 예산 집행률이 연말 결산에 반영되었는가?",
    "다음 학기 장학금 계획 수립 시 이번 감사 결과가 반영될 예정인가?",
  ]},
];

const checks={};
SECTIONS.forEach(s=>{checks[s.id]={};s.items.forEach((_,i)=>{checks[s.id][i]={status:'none',memo:''};});});
let activeSection='qualify';
let fileContent='',fileName='',aiResultText='';

if(window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function getStats(sid){
  const it=checks[sid];
  const total=Object.keys(it).length;
  const good=Object.values(it).filter(v=>v.status==='good').length;
  const bad=Object.values(it).filter(v=>v.status==='bad').length;
  const na=Object.values(it).filter(v=>v.status==='na').length;
  return{total,good,bad,na,done:good+bad+na};
}
function getTotals(){
  let total=0,good=0,bad=0,na=0,done=0;
  SECTIONS.forEach(s=>{const st=getStats(s.id);total+=st.total;good+=st.good;bad+=st.bad;na+=st.na;done+=st.done;});
  return{total,good,bad,na,done};
}
function updateHeader(){
  const t=getTotals();
  const pct=t.total>0?Math.round(t.done/t.total*100):0;
  const score=t.done>0?Math.round((t.good+t.na)/t.done*100):0;
  const sc=score>=80?'#a569bd':score>=60?'#f39c12':'#e74c3c';
  document.getElementById('statRow').innerHTML=
    '<div class="stat-box"><div class="lbl">진행률</div><div class="val">'+pct+'%</div><div style="font-size:10px;opacity:.7">'+t.done+'/'+t.total+'항목</div></div>'+
    '<div class="stat-box"><div class="lbl">양호</div><div class="val" style="color:#a569bd">'+t.good+'</div></div>'+
    '<div class="stat-box"><div class="lbl">미흡</div><div class="val" style="color:#e74c3c">'+t.bad+'</div></div>'+
    '<div class="stat-box"><div class="lbl">해당없음</div><div class="val" style="color:#95a5a6">'+t.na+'</div></div>'+
    (t.done>0?'<div class="stat-box"><div class="lbl">적합도</div><div class="val" style="color:'+sc+'">'+score+'점</div></div>':'');
  document.getElementById('progFill').style.width=pct+'%';
}
function renderSidebar(){
  document.getElementById('sidebar').innerHTML=SECTIONS.map(s=>{
    const st=getStats(s.id);
    const active=activeSection===s.id;
    return '<div class="sec-btn" style="border-left-color:'+(active?s.color:'transparent')+';background:'+(active?s.color+'15':'transparent')+'" onclick="setSection(\''+s.id+'\')">'
      +'<div style="font-size:16px">'+s.icon+'</div>'
      +'<div style="font-size:12px;line-height:1.3;margin-top:2px;color:'+(active?s.color:'var(--color-text-primary)')+';font-weight:'+(active?500:400)+'">'+s.title+'</div>'
      +'<div class="sec-stats">'
      +'<span class="badge" style="background:#e8f8f0;color:#1d6a4a">✓'+st.good+'</span>'
      +(st.bad>0?'<span class="badge" style="background:#fdecea;color:#c0392b">✗'+st.bad+'</span>':'')
      +'<span style="font-size:10px;color:var(--color-text-tertiary)">'+st.done+'/'+st.total+'</span>'
      +'</div></div>';
  }).join('');
}
function renderItems(){
  const s=SECTIONS.find(x=>x.id===activeSection);
  document.getElementById('itemContent').innerHTML=
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><span style="font-size:22px">'+s.icon+'</span><div><div style="font-size:16px;font-weight:500;color:'+s.color+'">'+s.title+'</div><div style="font-size:11px;color:var(--color-text-tertiary)">총 '+s.items.length+'개 항목</div></div></div>'+
    s.items.map((item,idx)=>{
      const ch=checks[s.id][idx];
      return '<div class="q-card'+(ch.status==='good'?' good':ch.status==='bad'?' bad':'')+'">'
        +'<div style="display:flex;gap:8px;align-items:flex-start">'
        +'<span class="q-num">Q'+(idx+1)+'</span>'
        +'<div style="flex:1">'
        +'<div class="q-text">'+item+'</div>'
        +'<div class="btn-row">'
        +[['good','✅ 양호','#e8f8f0','#27ae60'],['bad','❌ 미흡','#fdecea','#e74c3c'],['na','➖ 해당없음','#f0f4f8','#95a5a6']].map(([st,lbl,bg,ac])=>
          '<button class="chk-btn" onclick="setStatus(\''+s.id+'\','+idx+',\''+st+'\')" style="background:'+(ch.status===st?ac:bg)+';color:'+(ch.status===st?'white':'#555')+';font-weight:'+(ch.status===st?500:400)+'">'+lbl+'</button>'
        ).join('')
        +'</div>'
        +(ch.status==='bad'?'<input class="memo-inp" value="'+ch.memo.replace(/"/g,'&quot;')+'" placeholder="미흡 사유 입력..." onchange="setMemo(\''+s.id+'\','+idx+',this.value)">':'')
        +'</div></div></div>';
    }).join('');
}
function setSection(sid){activeSection=sid;renderSidebar();renderItems();}
function setStatus(sid,idx,st){checks[sid][idx].status=checks[sid][idx].status===st?'none':st;updateHeader();renderSidebar();renderItems();}
function setMemo(sid,idx,val){checks[sid][idx].memo=val;}
function showTab(t){
  ['checklist','ai','report'].forEach(id=>{
    document.getElementById('tab'+id.charAt(0).toUpperCase()+id.slice(1)).style.display=id===t?'block':'none';
  });
  document.querySelectorAll('.tab-btn').forEach((btn,i)=>{btn.classList.toggle('active',['checklist','ai','report'][i]===t);});
  if(t==='report') renderReport();
}
async function extractPdf(file){
  if(!window.pdfjsLib) return 'PDF.js 로드 실패';
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const ab=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:ab}).promise;
  let txt='';
  for(let i=1;i<=pdf.numPages;i++){
    const pg=await pdf.getPage(i);
    const ct=await pg.getTextContent();
    txt+='['+i+'페이지]\n'+ct.items.map(x=>x.str).join(' ')+'\n\n';
  }
  return txt;
}
async function handleFile(file){
  if(!file)return;
  fileName=file.name;
  const ext=file.name.split('.').pop().toLowerCase();
  document.getElementById('dropContent').innerHTML='<div style="font-size:28px;margin-bottom:6px">⏳</div><div style="font-size:13px;color:#6c3483;font-weight:500">파일 처리 중...</div>';
  fileContent=ext==='pdf'?await extractPdf(file):await new Promise(res=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.readAsText(file,'utf-8');});
  const icons={pdf:'📕',csv:'📗',txt:'📄'};
  document.getElementById('dropContent').innerHTML='<div style="font-size:28px;margin-bottom:6px">'+(icons[ext]||'📄')+'</div><div style="font-size:13px;color:#6c3483;font-weight:500">'+fileName+'</div><div style="font-size:11px;color:#27ae60;margin-top:4px">✅ 로드 완료 · 클릭해서 교체</div>';
  const fp=document.getElementById('filePreview');
  fp.style.display='block';
  fp.innerHTML='<div style="font-size:11px;color:var(--color-text-tertiary);margin-bottom:3px;font-weight:500">추출 내용 미리보기 ('+fileContent.length.toLocaleString()+'자)</div><div class="preview-box">'+fileContent.slice(0,400).replace(/</g,'&lt;')+'...</div>';
  checkAiBtn();
}
function handleDrop(e){e.preventDefault();handleFile(e.dataTransfer.files[0]);}
function checkAiBtn(){document.getElementById('aiBtn').disabled=!fileContent&&!document.getElementById('memoInput').value;}
async function runAi(){
  const memo=document.getElementById('memoInput').value;
  if(!fileContent&&!memo)return;
  const btn=document.getElementById('aiBtn');
  btn.disabled=true;btn.textContent='⏳ AI 분석 중...';
  const prompt=fileContent
    ?'다음은 교회 장학금 관련 문서입니다. 장학금 감사 관점에서 이상 항목, 절차 미준수, 개선 권고사항을 한국어로 상세히 분석해주세요.\n\n파일명: '+fileName+'\n\n내용:\n'+fileContent.slice(0,8000)
    :'다음은 장학금 감사 관련 메모입니다. 문제점과 개선 권고사항을 한국어로 분석해주세요.\n\n'+memo;
  try{
    const res=await fetch('/api/audit/analyze',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt})});
    const data=await res.json();
    aiResultText=data.text||data.error||'결과를 가져오지 못했습니다.';
    document.getElementById('aiResult').style.display='block';
    document.getElementById('aiText').textContent=aiResultText;
  }catch(e){
    document.getElementById('aiResult').style.display='block';
    document.getElementById('aiText').textContent='오류: '+e.message;
  }
  btn.disabled=false;btn.textContent='🔍 AI 장학금 감사 분석 시작';
}
function renderReport(){
  const t=getTotals();
  const score=t.done>0?Math.round((t.good+t.na)/t.done*100):0;
  const sc=score>=80?'#a569bd':score>=60?'#f39c12':'#e74c3c';
  let html='<div class="score-card"><div><div style="font-size:12px;opacity:.8">해운대순복음교회 장학위원회</div><div style="font-size:22px;font-weight:500;margin-top:4px">자체 감사 종합 적합도</div><div style="font-size:12px;opacity:.7;margin-top:3px">체크 완료 '+t.done+'/'+t.total+' 항목</div></div><div style="text-align:center"><div style="font-size:52px;font-weight:500;color:'+sc+'">'+(t.done>0?score:'-')+'</div><div style="font-size:13px;opacity:.8">'+(t.done>0?'점':'체크 후 확인')+'</div></div></div>';
  SECTIONS.forEach(s=>{
    const st=getStats(s.id);
    const pct=st.done>0?Math.round((st.good+st.na)/st.done*100):0;
    const badItems=s.items.filter((_,i)=>checks[s.id][i].status==='bad');
    html+='<div class="r-card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
      +'<div style="display:flex;gap:7px;align-items:center"><span style="font-size:17px">'+s.icon+'</span><span style="font-weight:500;color:'+s.color+'">'+s.title+'</span></div>'
      +'<div style="display:flex;gap:5px">'
      +'<span class="badge" style="background:#e8f8f0;color:#1d6a4a">양호 '+st.good+'</span>'
      +'<span class="badge" style="background:#fdecea;color:#c0392b">미흡 '+st.bad+'</span>'
      +'<span class="badge" style="background:#f0f4f8;color:#555">해당없음 '+st.na+'</span>'
      +'</div></div>'
      +'<div class="r-prog"><div style="width:'+pct+'%;height:100%;background:'+s.color+';border-radius:99px"></div></div>';
    if(badItems.length){
      html+='<div style="margin-top:8px"><div style="font-size:11px;color:#e74c3c;font-weight:500;margin-bottom:4px">⚠️ 미흡 항목</div>';
      badItems.forEach(item=>{
        const ri=s.items.indexOf(item);
        const memo=checks[s.id][ri]?.memo;
        html+='<div class="bad-item">'+item+(memo?' <span style="color:#e74c3c">→ '+memo+'</span>':'')+'</div>';
      });
      html+='</div>';
    }
    html+='</div>';
  });
  if(aiResultText) html+='<div style="background:var(--color-background-secondary);border-radius:10px;padding:16px;border:.5px solid #d7bde2"><div style="font-size:13px;font-weight:500;color:#6c3483;margin-bottom:8px">🤖 AI 분석 의견</div><div style="font-size:12px;color:var(--color-text-primary);white-space:pre-wrap;line-height:1.8">'+aiResultText.slice(0,600)+(aiResultText.length>600?'...':'')+'</div></div>';
  html+='<div style="font-size:11px;color:var(--color-text-tertiary);text-align:center;margin-top:14px">해운대순복음교회 장학위원회 · '+new Date().toLocaleDateString('ko-KR')+' 기준</div>';
  document.getElementById('reportContent').innerHTML=html;
}
updateHeader();renderSidebar();renderItems();
document.getElementById('memoInput').addEventListener('input',checkAiBtn);
</script>
</body>
</html>`

export async function GET() {
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
