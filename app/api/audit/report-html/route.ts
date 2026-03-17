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
<title>장학위원회 자체 감사 보고서</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
${CSS_VARS}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Noto Sans KR',sans-serif;background:var(--color-background-tertiary);}
.app{max-width:780px;margin:0 auto;padding:20px 16px 80px;}
.page-header{background:linear-gradient(135deg,#2c1654,#6c3483);border-radius:14px;padding:24px 28px;color:white;margin-bottom:20px;}
.page-header h1{font-size:20px;font-weight:700;margin-bottom:4px;}
.page-header p{font-size:12px;opacity:.75;}
.progress-bar{background:rgba(255,255,255,.2);border-radius:99px;height:5px;margin-top:12px;}
.progress-fill{height:100%;background:rgba(255,255,255,.7);border-radius:99px;transition:width .4s;}
.section-card{background:var(--color-background-primary);border-radius:12px;border:.5px solid var(--color-border-tertiary);margin-bottom:14px;overflow:hidden;}
.section-head{padding:14px 18px;display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;}
.section-head:hover{background:var(--color-background-secondary);}
.section-title{font-size:14px;font-weight:500;color:var(--color-text-primary);flex:1;}
.section-badge{font-size:11px;border-radius:20px;padding:3px 10px;font-weight:500;}
.chevron{font-size:12px;color:var(--color-text-tertiary);transition:transform .2s;}
.chevron.open{transform:rotate(180deg);}
.section-body{padding:16px 18px;border-top:.5px solid var(--color-border-tertiary);}
.field-row{margin-bottom:14px;}
.field-label{font-size:11px;font-weight:500;color:var(--color-text-secondary);margin-bottom:5px;letter-spacing:.3px;}
.field-input{width:100%;border:.5px solid var(--color-border-tertiary);border-radius:7px;padding:9px 12px;font-size:13px;font-family:inherit;color:var(--color-text-primary);background:var(--color-background-primary);}
.field-input:focus{outline:none;border-color:#6c3483;}
.field-textarea{width:100%;border:.5px solid var(--color-border-tertiary);border-radius:7px;padding:9px 12px;font-size:13px;font-family:inherit;color:var(--color-text-primary);background:var(--color-background-primary);resize:vertical;min-height:75px;}
.field-textarea:focus{outline:none;border-color:#6c3483;}
.field-select{width:100%;border:.5px solid var(--color-border-tertiary);border-radius:7px;padding:9px 12px;font-size:13px;font-family:inherit;color:var(--color-text-primary);background:var(--color-background-primary);}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.radio-group{display:flex;gap:8px;flex-wrap:wrap;}
.radio-btn{padding:6px 14px;border-radius:20px;border:.5px solid var(--color-border-tertiary);font-size:12px;cursor:pointer;font-family:inherit;background:var(--color-background-primary);color:var(--color-text-secondary);transition:all .15s;}
.radio-btn.sel-good{background:#27ae60;color:white;border-color:#27ae60;font-weight:500;}
.radio-btn.sel-bad{background:#e74c3c;color:white;border-color:#e74c3c;font-weight:500;}
.radio-btn.sel-na{background:#95a5a6;color:white;border-color:#95a5a6;font-weight:500;}
.cat-header{font-size:11px;font-weight:700;letter-spacing:.5px;padding:10px 0 4px;border-bottom:.5px solid var(--color-border-tertiary);margin-bottom:2px;}
.checklist-item{padding:12px 0;border-bottom:.5px solid var(--color-border-tertiary);}
.checklist-item:last-child{border-bottom:none;}
.check-q{font-size:13px;color:var(--color-text-primary);line-height:1.6;margin-bottom:8px;}
.memo-inp{width:100%;border:.5px solid #f5a9a4;border-radius:5px;padding:6px 10px;font-size:12px;font-family:inherit;background:#fff8f7;color:#333;margin-top:6px;}
.btn-primary{flex:1;background:linear-gradient(135deg,#6c3483,#9b59b6);color:white;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;}
.btn-secondary{flex:1;background:var(--color-background-secondary);color:var(--color-text-primary);border:.5px solid var(--color-border-tertiary);border-radius:8px;padding:12px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;}
.toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#2c1654;color:white;padding:10px 22px;border-radius:20px;font-size:13px;font-weight:500;z-index:999;opacity:0;transition:opacity .3s;white-space:nowrap;}
.toast.show{opacity:1;}
</style>
</head>
<body>

<div class="app">
  <div class="page-header">
    <h1>🎓 장학위원회 자체 감사 보고서</h1>
    <p>해운대순복음교회 · 감사 결과 입력 후 HTML 보고서로 출력하세요</p>
    <div class="progress-bar"><div class="progress-fill" id="pFill" style="width:0%"></div></div>
  </div>

  <!-- 1. 기본정보 -->
  <div class="section-card">
    <div class="section-head" onclick="tog('s1')">
      <span>📌</span><span class="section-title">1. 감사 기본 정보</span>
      <span class="section-badge" id="b-s1" style="background:#f0f4f8;color:#555">미입력</span>
      <span class="chevron open" id="c-s1">▼</span>
    </div>
    <div class="section-body" id="bd-s1">
      <div class="two-col">
        <div class="field-row"><div class="field-label">감사 연도</div><input class="field-input" id="f_year" placeholder="예) 2025" oninput="upd()"></div>
        <div class="field-row"><div class="field-label">감사 학기</div>
          <select class="field-select" id="f_sem" onchange="upd()"><option value="">선택</option><option>1학기</option><option>2학기</option><option>연간</option></select>
        </div>
      </div>
      <div class="two-col">
        <div class="field-row"><div class="field-label">감사 실시일</div><input class="field-input" id="f_date" type="date" oninput="upd()"></div>
        <div class="field-row"><div class="field-label">감사 담당자</div><input class="field-input" id="f_auditor" placeholder="성명" oninput="upd()"></div>
      </div>
      <div class="two-col">
        <div class="field-row"><div class="field-label">감사 기간 (시작)</div><input class="field-input" id="f_from" type="date" oninput="upd()"></div>
        <div class="field-row"><div class="field-label">감사 기간 (종료)</div><input class="field-input" id="f_to" type="date" oninput="upd()"></div>
      </div>
    </div>
  </div>

  <!-- 2. 지급현황 -->
  <div class="section-card">
    <div class="section-head" onclick="tog('s2')">
      <span>💰</span><span class="section-title">2. 장학금 지급 현황</span>
      <span class="section-badge" id="b-s2" style="background:#f0f4f8;color:#555">미입력</span>
      <span class="chevron" id="c-s2">▼</span>
    </div>
    <div class="section-body" id="bd-s2" style="display:none">
      <div class="three-col">
        <div class="field-row"><div class="field-label">바나바</div><input class="field-input" id="f_barnabas" placeholder="인원" oninput="upd()"></div>
        <div class="field-row"><div class="field-label">빌립</div><input class="field-input" id="f_philip" placeholder="인원" oninput="upd()"></div>
        <div class="field-row"><div class="field-label">다비다/데보라</div><input class="field-input" id="f_deborah" placeholder="인원" oninput="upd()"></div>
      </div>
      <div class="three-col">
        <div class="field-row"><div class="field-label">다니엘</div><input class="field-input" id="f_daniel" placeholder="인원" oninput="upd()"></div>
        <div class="field-row"><div class="field-label">여호수아</div><input class="field-input" id="f_joshua" placeholder="인원" oninput="upd()"></div>
        <div class="field-row"><div class="field-label">특별</div><input class="field-input" id="f_special" placeholder="인원" oninput="upd()"></div>
      </div>
      <div class="two-col">
        <div class="field-row"><div class="field-label">총 지급 인원</div><input class="field-input" id="f_total_cnt" placeholder="명" oninput="upd()"></div>
        <div class="field-row"><div class="field-label">총 지급 금액</div><input class="field-input" id="f_total_amt" placeholder="원" oninput="upd()"></div>
      </div>
      <div class="field-row"><div class="field-label">예산 대비 집행률</div><input class="field-input" id="f_exec_rate" placeholder="예) 98.5%" oninput="upd()"></div>
    </div>
  </div>

  <!-- 3. 체크리스트 -->
  <div class="section-card">
    <div class="section-head" onclick="tog('s3')">
      <span>✅</span><span class="section-title">3. 감사 체크리스트</span>
      <span class="section-badge" id="b-s3" style="background:#f0f4f8;color:#555">0/21</span>
      <span class="chevron" id="c-s3">▼</span>
    </div>
    <div class="section-body" id="bd-s3" style="display:none">
      <div id="clItems"></div>
    </div>
  </div>

  <!-- 4. 지적사항 -->
  <div class="section-card">
    <div class="section-head" onclick="tog('s4')">
      <span>⚠️</span><span class="section-title">4. 주요 지적사항</span>
      <span class="section-badge" id="b-s4" style="background:#f0f4f8;color:#555">미입력</span>
      <span class="chevron" id="c-s4">▼</span>
    </div>
    <div class="section-body" id="bd-s4" style="display:none">
      <div class="field-row"><div class="field-label">경미한 지적사항</div><textarea class="field-textarea" id="f_minor" placeholder="없으면 '해당없음'" oninput="upd()"></textarea></div>
      <div class="field-row"><div class="field-label">중요 지적사항</div><textarea class="field-textarea" id="f_major" placeholder="없으면 '해당없음'" oninput="upd()"></textarea></div>
      <div class="field-row"><div class="field-label">시정 필요사항</div><textarea class="field-textarea" id="f_critical" placeholder="없으면 '해당없음'" oninput="upd()"></textarea></div>
    </div>
  </div>

  <!-- 5. 개선권고 -->
  <div class="section-card">
    <div class="section-head" onclick="tog('s5')">
      <span>💡</span><span class="section-title">5. 개선 권고사항</span>
      <span class="section-badge" id="b-s5" style="background:#f0f4f8;color:#555">미입력</span>
      <span class="chevron" id="c-s5">▼</span>
    </div>
    <div class="section-body" id="bd-s5" style="display:none">
      <div class="field-row"><div class="field-label">단기 개선사항 (즉시~1개월)</div><textarea class="field-textarea" id="f_short" placeholder="단기 개선사항을 입력하세요." oninput="upd()"></textarea></div>
      <div class="field-row"><div class="field-label">중장기 개선사항 (3개월 이상)</div><textarea class="field-textarea" id="f_long" placeholder="중장기 개선사항을 입력하세요." oninput="upd()"></textarea></div>
    </div>
  </div>

  <!-- 6. 종합의견 -->
  <div class="section-card">
    <div class="section-head" onclick="tog('s6')">
      <span>📝</span><span class="section-title">6. 종합 감사의견</span>
      <span class="section-badge" id="b-s6" style="background:#f0f4f8;color:#555">미입력</span>
      <span class="chevron" id="c-s6">▼</span>
    </div>
    <div class="section-body" id="bd-s6" style="display:none">
      <div class="field-row">
        <div class="field-label">종합 판정</div>
        <div class="radio-group">
          <button class="radio-btn" id="vp" onclick="setV('적정')">✅ 적정</button>
          <button class="radio-btn" id="vc" onclick="setV('조건부적정')">⚠️ 조건부 적정</button>
          <button class="radio-btn" id="vf" onclick="setV('부적정')">❌ 부적정</button>
        </div>
      </div>
      <div class="field-row" style="margin-top:12px"><div class="field-label">종합 의견</div><textarea class="field-textarea" id="f_opinion" style="min-height:90px" placeholder="전반적인 감사 의견을 작성하세요." oninput="upd()"></textarea></div>
      <div class="field-row"><div class="field-label">차기 감사 중점사항</div><textarea class="field-textarea" id="f_next" placeholder="다음 감사에서 중점적으로 볼 사항을 기록하세요." oninput="upd()"></textarea></div>
    </div>
  </div>
</div>

<div style="position:fixed;bottom:0;left:0;right:0;background:var(--color-background-primary);border-top:.5px solid var(--color-border-tertiary);padding:12px 16px;display:flex;gap:10px;z-index:50;">
  <button class="btn-secondary" onclick="preview()">👁 미리보기</button>
  <button class="btn-primary" onclick="dlHTML()">⬇ HTML 보고서 저장</button>
</div>

<!-- 미리보기 모달 -->
<div id="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100;overflow-y:auto;padding:16px;">
  <div style="max-width:720px;margin:0 auto;background:var(--color-background-primary);border-radius:14px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#2c1654,#6c3483);padding:16px 20px;color:white;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:15px;font-weight:500;">📋 감사 보고서 미리보기</span>
      <button onclick="document.getElementById('modal').style.display='none'" style="background:rgba(255,255,255,.2);border:none;color:white;border-radius:6px;padding:4px 12px;cursor:pointer;font-family:inherit">닫기</button>
    </div>
    <div id="modalBody" style="padding:22px;font-size:13px;line-height:1.8;color:var(--color-text-primary);"></div>
    <div style="padding:14px 20px;border-top:.5px solid var(--color-border-tertiary);display:flex;gap:10px;">
      <button class="btn-primary" onclick="dlHTML()">⬇ HTML 저장</button>
      <button class="btn-secondary" onclick="document.getElementById('modal').style.display='none'">닫기</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
const SECTIONS=[
  {id:"qualify", icon:"📋", title:"신청 자격 심사", color:"#6c3483", items:[
    "장학금 신청자가 학적 요건(재학 증명)을 충족하였는가?",
    "신앙 요건(세례, 출석, 봉사 등)을 충족하였는가?",
    "추천서(담임목사 또는 지도교사)가 필수 첨부되어 있는가?",
    "신청서 및 제출 서류가 기한 내에 접수되었는가?",
    "신청 자격 미달 건에 대한 반려 처리가 적절히 이루어졌는가?",
  ]},
  {id:"review", icon:"⚖️", title:"심사 절차", color:"#1a5276", items:[
    "심사위원회가 규정된 인원으로 구성되어 심사를 진행하였는가?",
    "심사 기준(점수표, 평가항목)이 사전에 마련되어 있었는가?",
    "심사 결과(선발 명단, 점수, 의견)가 문서화되어 보관되고 있는가?",
    "심사위원 간 이해충돌(친인척 등) 여부를 사전에 확인하였는가?",
    "심사 회의록이 작성·서명되어 보관되고 있는가?",
  ]},
  {id:"payment", icon:"💰", title:"지급 관리", color:"#1d6a4a", items:[
    "동일 학기 내 동일인에게 중복 지급된 사례가 없는가?",
    "지급 금액이 예산 범위 내에서 집행되었는가?",
    "지급 방법(계좌이체 또는 현금)과 수령 확인이 기록되어 있는가?",
    "학기 단위 관리가 시스템(DB)에 정확히 반영되어 있는가?",
    "6개 장학금 유형(바나바·빌립·다비다·다니엘·여호수아·특별)별로 구분 관리되고 있는가?",
    "지급 내역이 재정 장부와 일치하는가?",
  ]},
  {id:"followup", icon:"📊", title:"사후 관리", color:"#935116", items:[
    "지급 후 학업 지속 여부(성적증명서 등) 사후 관리가 이루어지고 있는가?",
    "수혜자 명단 및 이력이 누락 없이 보관되고 있는가?",
    "특별장학금 지급 시 별도 결의(당회 또는 위원회)를 거쳤는가?",
    "장학금 예산 집행률이 연말 결산에 반영되었는가?",
    "다음 학기 장학금 계획 수립 시 이번 감사 결과가 반영될 예정인가?",
  ]},
];

const cs={};
let verdict='';
const open={s1:true,s2:false,s3:false,s4:false,s5:false,s6:false};
const TOTAL=21;

function tog(id){
  open[id]=!open[id];
  document.getElementById('bd-'+id).style.display=open[id]?'block':'none';
  document.getElementById('c-'+id).classList.toggle('open',open[id]);
}

function renderCL(){
  let idx=0, html='';
  SECTIONS.forEach(s=>{
    html+='<div class="cat-header" style="color:'+s.color+'">'+s.icon+' '+s.title+'</div>';
    s.items.forEach(q=>{
      const i=idx, st=cs[i]||'none';
      html+='<div class="checklist-item">'
        +'<div class="check-q">Q'+(i+1)+'. '+q+'</div>'
        +'<div class="radio-group">'
        +'<button class="radio-btn'+(st==='good'?' sel-good':'')+'" onclick="setC('+i+',\'good\')">✅ 양호</button>'
        +'<button class="radio-btn'+(st==='bad'?' sel-bad':'')+'" onclick="setC('+i+',\'bad\')">❌ 미흡</button>'
        +'<button class="radio-btn'+(st==='na'?' sel-na':'')+'" onclick="setC('+i+',\'na\')">➖ 해당없음</button>'
        +'</div>'
        +(st==='bad'?'<input class="memo-inp" value="'+(cs['n_'+i]||'').replace(/"/g,'&quot;')+'" placeholder="미흡 사유 입력..." onchange="cs[\'n_\'+'+i+']=this.value">':'')
        +'</div>';
      idx++;
    });
  });
  document.getElementById('clItems').innerHTML=html;
  updBadge();
}

function setC(i,st){cs[i]=cs[i]===st?'none':st;renderCL();upd();}

function updBadge(){
  const done=Array.from({length:TOTAL},(_,i)=>cs[i]).filter(v=>v&&v!=='none').length;
  const bad=Array.from({length:TOTAL},(_,i)=>cs[i]).filter(v=>v==='bad').length;
  const b=document.getElementById('b-s3');
  b.textContent=done+'/'+TOTAL;
  b.style.background=done===TOTAL?'#e8f8f0':bad>0?'#fdecea':done>0?'#fef9e7':'#f0f4f8';
  b.style.color=done===TOTAL?'#1d6a4a':bad>0?'#c0392b':done>0?'#935116':'#555';
}

function setV(v){
  verdict=v;
  document.getElementById('vp').className='radio-btn'+(v==='적정'?' sel-good':'');
  document.getElementById('vc').className='radio-btn'+(v==='조건부적정'?' sel-na':'');
  document.getElementById('vf').className='radio-btn'+(v==='부적정'?' sel-bad':'');
  upd();
}

function gv(id){const el=document.getElementById(id);return el?el.value.trim():'';}

function upd(){
  const fids=['f_year','f_sem','f_date','f_auditor','f_from','f_to',
    'f_barnabas','f_philip','f_deborah','f_daniel','f_joshua','f_special',
    'f_total_cnt','f_total_amt','f_minor','f_major','f_opinion'];
  const filled=fids.filter(id=>gv(id)!='').length+(verdict?1:0);
  document.getElementById('pFill').style.width=Math.round(filled/(fids.length+1)*100)+'%';

  const sb=(id,fids2)=>{
    const any=fids2.some(f=>gv(f)!='');
    const b=document.getElementById('b-'+id);
    b.textContent=any?'입력됨':'미입력';
    b.style.background=any?'#e8f8f0':'#f0f4f8';
    b.style.color=any?'#1d6a4a':'#555';
  };
  sb('s1',['f_year','f_sem','f_date','f_auditor']);
  sb('s2',['f_barnabas','f_total_cnt','f_total_amt']);
  sb('s4',['f_minor','f_major','f_critical']);
  sb('s5',['f_short','f_long']);
  sb('s6',['f_opinion']);
  updBadge();
}

function buildHTML(){
  const good=Array.from({length:TOTAL},(_,i)=>cs[i]).filter(v=>v==='good').length;
  const bad=Array.from({length:TOTAL},(_,i)=>cs[i]).filter(v=>v==='bad').length;
  const na=Array.from({length:TOTAL},(_,i)=>cs[i]).filter(v=>v==='na').length;
  const done=good+bad+na;
  const score=done>0?Math.round((good+na)/done*100):0;
  const vc=verdict==='적정'?'#27ae60':verdict==='조건부적정'?'#f39c12':'#e74c3c';

  let clRows='', gi=0;
  SECTIONS.forEach(s=>{
    clRows+='<tr><td colspan="4" style="background:#f0e8f8;color:#2c1654;font-weight:700;font-size:12px;padding:7px 10px">'+s.icon+' '+s.title+'</td></tr>';
    s.items.forEach(q=>{
      const st=cs[gi]||'none';
      const stL=st==='good'?'양호':st==='bad'?'미흡':st==='na'?'해당없음':'-';
      const stC=st==='good'?'#27ae60':st==='bad'?'#e74c3c':st==='na'?'#95a5a6':'#888';
      const note=cs['n_'+gi]||'';
      clRows+='<tr><td style="text-align:center;font-size:11px;color:#888;white-space:nowrap">Q'+(gi+1)+'</td><td>'+q+'</td><td style="text-align:center;color:'+stC+';font-weight:600;white-space:nowrap">'+stL+'</td><td style="font-size:12px;color:#e74c3c">'+note+'</td></tr>';
      gi++;
    });
  });

  return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">'
    +'<meta name="viewport" content="width=device-width,initial-scale=1">'
    +'<title>장학위원회 자체 감사 보고서 '+gv('f_year')+' '+gv('f_sem')+'</title>'
    +'<style>'
    +'body{font-family:\'Apple SD Gothic Neo\',\'Noto Sans KR\',sans-serif;background:#f5f5f5;margin:0;padding:20px;}'
    +'.wrap{max-width:800px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,.08);}'
    +'.rh{background:linear-gradient(135deg,#2c1654,#6c3483);padding:30px 36px;color:white;}'
    +'.rh h1{font-size:22px;font-weight:700;margin-bottom:5px;}'
    +'.rh p{font-size:13px;opacity:.8;}'
    +'.rb{padding:28px 36px;}'
    +'.rs{margin-bottom:26px;}'
    +'.rs h2{font-size:15px;font-weight:700;color:#2c1654;border-bottom:2px solid #6c3483;padding-bottom:6px;margin-bottom:13px;}'
    +'table{width:100%;border-collapse:collapse;font-size:13px;}'
    +'th{background:#f0e8f8;color:#2c1654;padding:8px 11px;text-align:left;font-weight:600;border:.5px solid #ddd;}'
    +'td{padding:8px 11px;border:.5px solid #eee;vertical-align:top;}'
    +'tr:nth-child(even) td{background:#faf8fc;}'
    +'.sc-row{display:flex;gap:10px;margin-bottom:16px;}'
    +'.sc-item{flex:1;text-align:center;padding:12px 8px;border-radius:8px;}'
    +'.vd{text-align:center;padding:18px;background:#f9f0ff;border-radius:8px;border:1px solid #d7bde2;margin-bottom:16px;}'
    +'.sig{display:flex;gap:12px;margin-top:20px;}'
    +'.sig-box{flex:1;border:.5px solid #ddd;border-radius:6px;padding:10px;text-align:center;}'
    +'.sig-t{font-size:11px;color:#888;margin-bottom:22px;}'
    +'.sig-l{border-top:.5px solid #ccc;margin-top:6px;padding-top:5px;font-size:11px;color:#aaa;}'
    +'@media print{body{background:#fff;padding:0}.wrap{box-shadow:none;border-radius:0}}'
    +'</style></head><body><div class="wrap">'
    +'<div class="rh"><h1>🎓 장학위원회 자체 감사 보고서</h1>'
    +'<p>해운대순복음교회 | '+gv('f_year')+'년 '+gv('f_sem')+' | 감사일: '+gv('f_date')+' | 담당자: '+gv('f_auditor')+'</p></div>'
    +'<div class="rb">'
    +'<div class="rs"><h2>1. 감사 기본 정보</h2>'
    +'<table><tr><th style="width:30%">항목</th><th>내용</th></tr>'
    +'<tr><td>감사 대상 기간</td><td>'+gv('f_from')+' ~ '+gv('f_to')+'</td></tr>'
    +'<tr><td>감사 실시일</td><td>'+gv('f_date')+'</td></tr>'
    +'<tr><td>감사 담당자</td><td>'+gv('f_auditor')+'</td></tr>'
    +'<tr><td>감사 연도/학기</td><td>'+gv('f_year')+'년 '+gv('f_sem')+'</td></tr>'
    +'</table></div>'
    +'<div class="rs"><h2>2. 장학금 지급 현황</h2>'
    +'<table><tr><th>장학금 유형</th><th>지급 인원</th></tr>'
    +[['바나바','f_barnabas'],['빌립','f_philip'],['다비다/데보라','f_deborah'],['다니엘','f_daniel'],['여호수아','f_joshua'],['특별','f_special']].map(function(x){return '<tr><td>'+x[0]+'</td><td>'+(gv(x[1])||'-')+'</td></tr>';}).join('')
    +'<tr style="font-weight:600"><td>합계</td><td>'+(gv('f_total_cnt')||'-')+'명 / '+(gv('f_total_amt')||'-')+'원</td></tr>'
    +'<tr><td>예산 집행률</td><td>'+(gv('f_exec_rate')||'-')+'</td></tr>'
    +'</table></div>'
    +'<div class="rs"><h2>3. 감사 체크리스트 결과 (4개 영역 · 21개 항목)</h2>'
    +'<div class="sc-row">'
    +'<div class="sc-item" style="background:#e8f8f0"><div style="font-size:11px;color:#1d6a4a">양호</div><div style="font-size:26px;font-weight:700;color:#27ae60">'+good+'</div></div>'
    +'<div class="sc-item" style="background:#fdecea"><div style="font-size:11px;color:#c0392b">미흡</div><div style="font-size:26px;font-weight:700;color:#e74c3c">'+bad+'</div></div>'
    +'<div class="sc-item" style="background:#f0f4f8"><div style="font-size:11px;color:#555">해당없음</div><div style="font-size:26px;font-weight:700;color:#95a5a6">'+na+'</div></div>'
    +'<div class="sc-item" style="background:#f9f0ff"><div style="font-size:11px;color:#6c3483">적합도</div><div style="font-size:26px;font-weight:700;color:#6c3483">'+score+'점</div></div>'
    +'</div>'
    +'<table><tr><th style="width:40px;text-align:center">번호</th><th>점검 항목</th><th style="width:70px;text-align:center">결과</th><th style="width:130px">비고</th></tr>'
    +clRows
    +'</table></div>'
    +'<div class="rs"><h2>4. 주요 지적사항</h2>'
    +'<table><tr><th style="width:25%">구분</th><th>내용</th></tr>'
    +'<tr><td>경미한 지적사항</td><td>'+(gv('f_minor')||'해당없음')+'</td></tr>'
    +'<tr><td>중요 지적사항</td><td>'+(gv('f_major')||'해당없음')+'</td></tr>'
    +'<tr><td>시정 필요사항</td><td>'+(gv('f_critical')||'해당없음')+'</td></tr>'
    +'</table></div>'
    +'<div class="rs"><h2>5. 개선 권고사항</h2>'
    +'<table><tr><th style="width:30%">구분</th><th>내용</th></tr>'
    +'<tr><td>단기 개선사항</td><td>'+(gv('f_short')||'-')+'</td></tr>'
    +'<tr><td>중장기 개선사항</td><td>'+(gv('f_long')||'-')+'</td></tr>'
    +'</table></div>'
    +'<div class="rs"><h2>6. 종합 감사의견</h2>'
    +'<div class="vd"><div style="font-size:12px;color:#666;margin-bottom:5px">종합 판정</div>'
    +'<div style="font-size:26px;font-weight:700;color:'+vc+'">'+(verdict||'미입력')+'</div></div>'
    +'<table><tr><th style="width:30%">구분</th><th>내용</th></tr>'
    +'<tr><td>종합 의견</td><td>'+(gv('f_opinion')||'-')+'</td></tr>'
    +'<tr><td>차기 중점사항</td><td>'+(gv('f_next')||'-')+'</td></tr>'
    +'</table></div>'
    +'<div class="sig">'
    +['담당자','재정부장','감사위원','감사위원장','담임목사'].map(function(t){return '<div class="sig-box"><div class="sig-t">'+t+'</div><div class="sig-l">(인)</div></div>';}).join('')
    +'</div>'
    +'<p style="font-size:11px;color:#aaa;text-align:center;margin-top:18px">해운대순복음교회 장학위원회 · 생성일: '+new Date().toLocaleDateString('ko-KR')+'</p>'
    +'</div></div></body></html>';
}

function preview(){
  const html=buildHTML();
  const doc=new DOMParser().parseFromString(html,'text/html');
  const rb=doc.querySelector('.rb');
  document.getElementById('modalBody').innerHTML=rb?rb.innerHTML:'내용을 입력해 주세요.';
  document.getElementById('modal').style.display='block';
}

function dlHTML(){
  const blob=new Blob([buildHTML()],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='장학위원회_자체감사보고서_'+(gv('f_year')||'2025')+'_'+(gv('f_sem')||'1학기')+'.html';
  a.click();URL.revokeObjectURL(url);
  showToast('📥 보고서가 저장되었습니다!');
}

function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},2500);
}

renderCL();upd();
</script>
</body>
</html>`

export async function GET() {
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
