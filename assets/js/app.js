// ── Aparência system ──────────────────────────────────────────────────────────
const APARENCIA_DEFAULTS={titlePage:'gradient',kpiStyle:'azul',density:'compact',theme:'dark'};
let APARENCIA={...APARENCIA_DEFAULTS};
try{const s=localStorage.getItem('aparencia_v1');if(s)APARENCIA={...APARENCIA_DEFAULTS,...JSON.parse(s)};}catch(e){}

const APARENCIA_PAGE_CLASSES=['t-page-neutro','t-page-blue','t-page-gradient'];
const APARENCIA_KPI_CLASSES=['kpi-neutro','kpi-azul'];

function applyAparencia(){
  const h=document.documentElement;
  // theme
  h.setAttribute('data-theme',APARENCIA.theme);
  // density
  if(APARENCIA.density==='compact')h.setAttribute('data-density','compact');
  else h.removeAttribute('data-density');
  // page title
  APARENCIA_PAGE_CLASSES.forEach(c=>h.classList.remove(c));
  if(APARENCIA.titlePage==='blue')h.classList.add('t-page-blue');
  else if(APARENCIA.titlePage==='gradient')h.classList.add('t-page-gradient');
  // kpi style
  APARENCIA_KPI_CLASSES.forEach(c=>h.classList.remove(c));
  if(APARENCIA.kpiStyle==='azul')h.classList.add('kpi-azul');
  // sync button states in panel (if rendered)
  document.querySelectorAll('.ap-btn[data-ap-key]').forEach(btn=>{
    const key=btn.dataset.apKey,val=btn.dataset.apVal;
    btn.classList.toggle('active',APARENCIA[key]===val);
  });
  // sync logos
  const lbl=document.getElementById('themeLabel');if(lbl)lbl.textContent=APARENCIA.theme==='dark'?'Claro':'Escuro';
}

function setAparencia(key,val){
  APARENCIA[key]=val;
  localStorage.setItem('aparencia_v1',JSON.stringify(APARENCIA));
  applyAparencia();
  // re-render active page for theme change
  if(key==='theme'){const active=document.querySelector('.page.active')?.id?.replace('page-','');if(active)renderPage(active);}
}

function toggleAparenciaPanel(){
  const p=document.getElementById('aparenciaPanel');
  if(p)p.classList.toggle('open');
}

// close panel on outside click
document.addEventListener('click',e=>{
  const p=document.getElementById('aparenciaPanel');
  const w=document.getElementById('aparenciaWrap');
  if(p&&p.classList.contains('open')&&!w?.contains(e.target))p.classList.remove('open');
});

function toggleTheme(){const h=document.documentElement;const t=h.getAttribute('data-theme')==='dark'?'light':'dark';APARENCIA.theme=t;localStorage.setItem('aparencia_v1',JSON.stringify(APARENCIA));h.setAttribute('data-theme',t);const lbl=document.getElementById('themeLabel');if(lbl)lbl.textContent=t==='dark'?'Claro':'Escuro';const active=document.querySelector('.page.active')?.id?.replace('page-','');if(active)renderPage(active);}

// Helpers
function fmt(v,d=2){return Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});}
function fmtPL(v){const cls=v>=0?'pos':'neg';return`<span class="money ${cls}"><span class="money-sign">${v>=0?'+':'-'}R$</span><span class="money-val">${fmt(Math.abs(v))}</span></span>`;}
function fmtR(v){return`<span class="money"><span class="money-sign">R$</span><span class="money-val">${fmt(v,0)}</span></span>`;}
function destroyChart(id){if(charts[id]){charts[id].destroy();delete charts[id];}}
function mkChart(id,cfg){destroyChart(id);if(!document.getElementById(id))return;charts[id]=new Chart(document.getElementById(id),cfg);}
function isDark(){return document.documentElement.getAttribute('data-theme')==='dark';}
function gc(){return isDark()?'rgba(255,255,255,.05)':'rgba(0,0,0,.06)';}
function tc(){return isDark()?'#505060':'#a0a0b8';}
// Favicon via Google S2 — para produção offline trocar por: assets/casas/NOME.png
function favicon(domain){return`https://www.google.com/s2/favicons?domain=${domain}&sz=64`;}
function _houseDomain(nome){
  if(!nome)return'';
  if(HOUSE_DOMAIN[nome])return HOUSE_DOMAIN[nome];
  const k=Object.keys(HOUSE_DOMAIN).find(k=>k.toLowerCase()===nome.toLowerCase());
  return k?HOUSE_DOMAIN[k]:'';
}
function mkSpChip(sport){
  let key=SPORT_KEY[sport];
  if(!key){const k=Object.keys(SPORT_KEY).find(k=>k.toLowerCase()===sport?.toLowerCase());key=k?SPORT_KEY[k]:null;}
  return`<span class="sp-chip">${SPORT_EMOJI[key]||'🏅'}</span>`;
}
// Fallback de favicon: substitui img por inicial mono quando imagem falha
document.addEventListener('error',e=>{
  const chip=e.target.closest?.('.house-chip');
  if(chip&&e.target.tagName==='IMG'){
    const init=chip.dataset.initial||'?';
    e.target.replaceWith(Object.assign(document.createElement('span'),{className:'chip-initial',textContent:init}));
  }
},true);
function mkHouseChip(nome){
  if(!nome)return`<span class="house-chip chip-initial">?</span>`;
  const domain=_houseDomain(nome);
  if(domain){
    const init=(nome[0]||'?').toUpperCase();
    const esc=nome.replace(/"/g,'&quot;');
    return`<span class="house-chip" data-initial="${init}"><img src="${favicon(domain)}" alt="${esc}" loading="lazy"></span>`;
  }
  return`<span class="house-chip chip-initial">${(nome[0]||'?').toUpperCase()}</span>`;
}
function casaCell(nome){
  return`<span style="display:inline-flex;align-items:center;gap:6px">${mkHouseChip(nome)}${nome||'—'}</span>`;
}
// Mantido para compatibilidade — use mkHouseChip para novas implementações
function casaImg(nome,size=14){
  const domain=_houseDomain(nome);
  if(!domain)return'';
  return`<img src="${favicon(domain)}" width="${size}" height="${size}" style="border-radius:3px;vertical-align:middle;margin-right:4px;flex-shrink:0" onerror="this.style.display='none'" loading="lazy">`;
}
function auditCasas(dados){
  const known=new Set(Object.keys(HOUSE_DOMAIN).map(k=>k.toLowerCase()));
  const reais=[...new Set(dados.map(r=>r.casa).filter(Boolean))];
  reais.forEach(c=>{if(!known.has(c.toLowerCase()))console.warn(`[audit-casas] "${c}" — sem domínio em HOUSE_DOMAIN`);});
}
// ── Normalização de nomes (evita duplicatas como "Faz1Bet" vs "Faz1bet") ────
function normalizeName(name){
  if(!name)return'';
  return name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ');
}
function getMostFrequentName(names){
  const freq={};names.forEach(n=>{if(n)freq[n]=(freq[n]||0)+1;});
  const ents=Object.entries(freq);if(!ents.length)return'';
  return ents.sort((a,b)=>b[1]-a[1])[0][0];
}
function normalizeDados(dados){
  const fields=['tipster','casa','esporte'];
  const canonical={};
  fields.forEach(f=>{
    const groups={};
    dados.forEach(r=>{if(!r[f])return;const key=normalizeName(r[f]);if(!groups[key])groups[key]=[];groups[key].push(r[f]);});
    canonical[f]={};
    Object.entries(groups).forEach(([key,names])=>{canonical[f][key]=getMostFrequentName(names);});
  });
  return dados.map(r=>{
    const nr={...r};
    fields.forEach(f=>{if(nr[f])nr[f]=canonical[f][normalizeName(nr[f])]||nr[f];});
    return nr;
  });
}
function normalCDF(z){const t=1/(1+.2316419*Math.abs(z)),d=.3989423*Math.exp(-z*z/2);const p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p;}
function calcROI(rows){const s=rows.reduce((a,r)=>a+r.stake,0),l=rows.reduce((a,r)=>a+r.lucro,0);return s>0?(l/s)*100:0;}
function calcWR(rows){const v=rows.filter(r=>['W','HW'].includes(r.resultado));const t=rows.filter(r=>r.resultado!=='V');return t.length>0?(v.length/t.length)*100:0;}
function calcAvgOdd(rows){const real=rows.filter(r=>r.odd>0&&r.stake>0);const ss=real.reduce((a,r)=>a+r.stake,0);return ss>0?real.reduce((a,r)=>a+r.odd*r.stake,0)/ss:0;}
function calcMDDreais(rows){let cum=0,peak=0,mdd=0;for(const r of rows){cum+=r.lucro;if(cum>peak)peak=cum;const dd=peak-cum;if(dd>mdd)mdd=dd;}return mdd;}
function calcMDDpct(rows){let bank=BASE_BANK,peak=BASE_BANK,mdd=0;for(const r of rows){bank+=r.lucro;if(bank>peak)peak=bank;const dd=(peak-bank)/peak*100;if(dd>mdd)mdd=dd;}return mdd;}
function calcXMDD(rows,sims=250){const settled=rows.filter(r=>r.resultado!=='V');if(settled.length<5)return 0;const n=settled.length,wr=calcWR(rows)/100;const avgOdd=settled.reduce((a,r)=>a+r.odd,0)/settled.length;const avgStake=rows.reduce((a,r)=>a+r.stake,0)/rows.length;let total=0;for(let s=0;s<sims;s++){let cum=0,peak=0,mdd=0;for(let i=0;i<n;i++){const win=Math.random()<wr;cum+=win?avgStake*(avgOdd-1):-avgStake;if(cum>peak)peak=cum;const dd=peak-cum;if(dd>mdd)mdd=dd;}total+=mdd;}return total/sims;}
function calcPValue(rows){const settled=rows.filter(r=>r.resultado!=='V');const wins=settled.filter(r=>['W','HW'].includes(r.resultado)).length;const n=settled.length;if(n<5)return 1;const avgOdd=settled.reduce((a,r)=>a+r.odd,0)/n;const z=(wins/n-1/avgOdd)/Math.sqrt((1/avgOdd)*(1-1/avgOdd)/n);return Math.max(0.001,Math.min(0.999,1-normalCDF(z)));}


// Formatação de eixos com ponto como separador de milhar
function fmtK(v){
  const abs=Math.abs(Math.round(v));
  const s=abs.toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0});
  return(v<0?'-':'')+'R$ '+s;
}
const sortState={};
function parseNum(raw){
  // Remove R$, spaces, %, +, then handle Brazilian number format (dot=thousand, comma=decimal)
  const s=raw.replace(/R\$\s*/g,'').replace(/[+\s%]/g,'').trim();
  // Remove thousand separators (dots before groups of 3 digits) then replace comma with dot
  const n=parseFloat(s.replace(/\.(?=\d{3}[,\.])/g,'').replace(',','.'));
  return isNaN(n)?0:n;
}
function sortTable(tableId,colIdx,numeric){
  if(!sortState[tableId])sortState[tableId]={col:-1,asc:true};
  const st=sortState[tableId];
  st.asc=st.col===colIdx?!st.asc:true;
  st.col=colIdx;
  const table=document.getElementById(tableId);
  if(!table)return;
  const tbody=table.querySelector('tbody');
  const rows=[...tbody.querySelectorAll('tr:not(.total-row)')];
  rows.sort((a,b)=>{
    const at=a.cells[colIdx]?.textContent||'';
    const bt=b.cells[colIdx]?.textContent||'';
    const res=numeric?(parseNum(at)-parseNum(bt)):(at.trim().localeCompare(bt.trim()));
    return st.asc?res:-res;
  });
  const totalRow=tbody.querySelector('.total-row');
  rows.forEach(r=>tbody.appendChild(r));
  if(totalRow)tbody.appendChild(totalRow);
  table.querySelectorAll('th').forEach((th,i)=>{
    th.className=i===colIdx?(st.asc?'sort-asc':'sort-desc'):'';
    if(!th.querySelector('.sort-icon')){const si=document.createElement('span');si.className='sort-icon';th.appendChild(si);}
  });
}
function makeSortable(tableId,numericCols=[]){
  const table=document.getElementById(tableId);
  if(!table)return;
  table.querySelectorAll('th').forEach((th,i)=>{
    const si=document.createElement('span');si.className='sort-icon';th.appendChild(si);
    th.style.cursor='pointer';
    th.onclick=()=>sortTable(tableId,i,numericCols.includes(i));
    addColResizer(th,tableId,i);
  });
}

// Column resize
const colWidths={};
function addColResizer(th,tableId,colIdx){
  th.style.position='relative';
  const rsz=document.createElement('div');
  rsz.className='col-rsz';
  rsz.addEventListener('mousedown',e=>{
    e.stopPropagation();e.preventDefault();
    rsz.classList.add('active');
    const startX=e.clientX,startW=th.offsetWidth;
    const key=tableId+'_'+colIdx;
    function onMove(ev){
      const nw=Math.max(40,startW+ev.clientX-startX);
      th.style.width=nw+'px';th.style.minWidth=nw+'px';
      colWidths[key]=nw;
      // Apply to td cells too
      const tbl=document.getElementById(tableId);
      if(tbl){tbl.querySelectorAll('tbody tr').forEach(tr=>{const td=tr.cells[colIdx];if(td){td.style.width=nw+'px';td.style.maxWidth=nw+'px';}});}
    }
    function onUp(){rsz.classList.remove('active');document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);}
    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onUp);
  });
  th.appendChild(rsz);
}

// Result coloring helper
function resClass(r){
  if(r==='W')return'res-w';
  if(r==='HW')return'res-hw';
  if(r==='L')return'res-l';
  if(r==='HL')return'res-hl';
  return'res-v';
}
function resColor(r){
  const m={'W':'var(--green)','HW':'var(--hw)','L':'var(--red)','HL':'var(--hl)','V':'var(--text3)'};
  return m[r]||'var(--text2)';
}

// Card collapse
const CARD_STATE_KEY='dash_cards_v1';
let cardStates={};
(()=>{try{cardStates=JSON.parse(localStorage.getItem(CARD_STATE_KEY)||'{}')}catch(e){}})();
function toggleCard(id){
  const el=document.getElementById('card-'+id);
  if(!el)return;
  const c=el.classList.toggle('collapsed');
  cardStates[id]=c;
  try{localStorage.setItem(CARD_STATE_KEY,JSON.stringify(cardStates));}catch(e){}
  // resize charts inside on open
  if(!c){setTimeout(()=>{Object.values(charts).forEach(ch=>{try{ch.resize();}catch(e){}});},50);}
}
function mkCard(id,title,bodyHTML,extraHdrHTML=''){
  const collapsed=cardStates[id]?'collapsed':'';
  return`<div class="card ${collapsed}" id="card-${id}">
    <div class="card-hdr" onclick="toggleCard('${id}')">
      <div class="card-title">${title}</div>
      ${extraHdrHTML}
      <div class="card-tog">▼</div>
    </div>
    <div class="card-body">${bodyHTML}</div>
  </div>`;
}

// Nav
const PAGE_META={
  'overview':       ['Visão Geral',              'performance consolidada'],
  'sports':         ['Esportes',                 'performance por modalidade esportiva'],
  'casas':          ['Bookies',                  'performance e ROI por bookmaker'],
  'apostas':        ['Apostas',                  'espelho completo da base de dados'],
  'tipsters':       ['Tipsters',                 'análise comparativa e individual'],
  'consolidado':    ['Consolidado',              'resumo anual e evolução mensal'],
  'mensal':         ['Mensal',                   'análise detalhada do mês selecionado'],
  'diario':         ['Diário',                   'análise detalhada do dia selecionado'],
  'semana':         ['Semana',                   'análise da semana selecionada'],
  'resultados_casa':['Por Casa',                 'performance por bookmaker'],
  'parceiros':      ['Fornecedores & Parceiros', 'turnover, lucro e período por conta'],
  'custos':         ['Custos de Contas',         'custo de aquisição por conta e fornecedor'],
  'custos_tipster': ['Custo de Tipsters',        'assinaturas, serviços e pagamentos'],
  'metrics':        ['Métricas',                 'base de conhecimento e valores atuais'],
};
function updateTopbarTitle(id){
  const meta=PAGE_META[id]||[id,''];
  const t=document.getElementById('topbarTitle');
  const s=document.getElementById('topbarSub');
  if(t)t.textContent=meta[0];
  if(s)s.textContent=meta[1];
}
let _lastPage='',_lastPageSig='';
function _pageSig(id){return JSON.stringify(gfs(id))+'|'+[...msGet('sp_'+id)].sort().join(',')+'|'+[...msGet('ca_'+id)].sort().join(',')+'|'+[...msGet('ti_'+id)].sort().join(',');}
function showPage(id){
  updateTopbarTitle(id);
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+id)?.classList.add('active');
  document.getElementById('nav-'+id)?.classList.add('active');
  const sig=_pageSig(id);
  if(id===_lastPage&&sig===_lastPageSig)return;
  _lastPage=id;_lastPageSig=sig;
  renderPage(id);
}
function renderPage(id){
  _filterCache={};_lastPage=id;_lastPageSig=_pageSig(id);
  const rows=filtrarPagina(id);
  if(id==='overview'){renderKPI(rows);renderBankroll(rows);renderROIMonthly(rows);renderOddsDist(rows);renderOvCusto();renderOvStreaks(rows);renderOvHeatmap();}
  else if(id==='daily'||id==='consolidado'){renderConsolidado();}
  else if(id==='sports'){renderSport(rows);}
  else if(id==='casas'){renderCasa(rows);}
  else if(id==='tipsters'){renderTipsters();}
  else if(id==='apostas'){renderApostas();}
  else if(id==='parceiros'){renderParceiros(rows);}
  else if(id==='custos'){renderCustos(rows);}
  else if(id==='custos_tipster'){renderCustoTipster();}
  else if(id==='metrics'){renderMetrics(filtrarPagina('metrics'));}
  else if(id==='mensal'){renderMensal();}
  else if(id==='diario'){renderDiario();}
  else if(id==='semana'){renderSemana();}
  else if(id==='resultados_casa'){renderResultadosCasa();}
}

// KPI
function buildHTML(){
  const tipsters=[...new Set(DADOS.map(r=>r.tipster).filter(Boolean))].sort();
  const sports=[...new Set(DADOS.map(r=>r.esporte).filter(Boolean))].sort();
  const casas=[...new Set(DADOS.map(r=>r.casa).filter(Boolean))].sort();
  ['overview','analise','daily','sports','casas','apostas','tipsters','parceiros','custos','metrics','consolidado','mensal','diario','semana','resultados_casa'].forEach(p=>{msInit('sp_'+p);msInit('ca_'+p);msInit('ti_'+p);});
  msInit('tipsters');

  document.getElementById('root').innerHTML=`
  <div class="topbar">
    <div class="topbar-left">
      <div class="page-title" id="topbarTitle">Visão Geral</div>
      <div class="page-sub" id="topbarSub">performance consolidada</div>
    </div>
    <div class="aparencia-wrap" id="aparenciaWrap">
      <div class="aparencia-trigger" onclick="toggleAparenciaPanel()">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>
        Aparência
      </div>
      <div class="aparencia-panel" id="aparenciaPanel">
        <div class="ap-section">
          <div class="ap-label">Título da Página</div>
          <div class="ap-btns">
            <button class="ap-btn" data-ap-key="titlePage" data-ap-val="neutro"   onclick="setAparencia('titlePage','neutro')">Neutro</button>
            <button class="ap-btn" data-ap-key="titlePage" data-ap-val="blue"     onclick="setAparencia('titlePage','blue')">Azul</button>
            <button class="ap-btn" data-ap-key="titlePage" data-ap-val="gradient" onclick="setAparencia('titlePage','gradient')">Gradiente</button>
          </div>
        </div>
        <div class="ap-divider"></div>
        <div class="ap-section">
          <div class="ap-label">Cards (KPI)</div>
          <div class="ap-btns">
            <button class="ap-btn" data-ap-key="kpiStyle" data-ap-val="neutro" onclick="setAparencia('kpiStyle','neutro')">Sem destaque</button>
            <button class="ap-btn" data-ap-key="kpiStyle" data-ap-val="azul"   onclick="setAparencia('kpiStyle','azul')">| azul</button>
          </div>
        </div>
        <div class="ap-divider"></div>
        <div class="ap-section">
          <div class="ap-label">Densidade</div>
          <div class="ap-btns">
            <button class="ap-btn" data-ap-key="density" data-ap-val="comfortable" onclick="setAparencia('density','comfortable')">Confortável</button>
            <button class="ap-btn" data-ap-key="density" data-ap-val="compact"     onclick="setAparencia('density','compact')">Compacto</button>
          </div>
        </div>
        <div class="ap-divider"></div>
        <div class="ap-section">
          <div class="ap-label">Tema</div>
          <div class="ap-btns">
            <button class="ap-btn" data-ap-key="theme" data-ap-val="dark"  onclick="setAparencia('theme','dark')">Escuro</button>
            <button class="ap-btn" data-ap-key="theme" data-ap-val="light" onclick="setAparencia('theme','light')">Claro</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-logo"><img src="brand/fdc-logo-vertical-dark.svg" class="logo-dark" alt="FDC Capital" draggable="false" style="width:202px;margin:0 auto;"><img src="brand/fdc-logo-vertical-light.svg" class="logo-light" alt="FDC Capital" draggable="false" style="width:202px;margin:0 auto;"></div>
      <nav class="sidebar-nav">
        <div class="nav-group">Análise</div>
        ${[
          ['overview','Visão Geral','<rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>'],
          ['sports','Esportes','<path d="M2 12l4-4 3 3 5-6"/>'],
          ['casas','Bookies','<rect x="1" y="3" width="14" height="10" rx="1"/><path d="M1 8h14M5 3v10"/>'],
          ['apostas','Apostas','<path d="M2 4h12M2 8h12M2 12h8"/><rect x="1" y="2" width="14" height="12" rx="1"/>'],
          ['tipsters','Tipsters','<circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.5 2.2-4 5-4s5 1.5 5 4"/><circle cx="12" cy="5" r="2"/><path d="M12 9c1.5.3 3 1.2 3 4"/>'],
        ].map(([id,label,icon])=>`<div class="nav-item" id="nav-${id}" onclick="showPage('${id}')"><svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6">${icon}</svg>${label}</div>`).join('')}
        <div class="nav-group">Resultados</div>
        ${[
          ['consolidado','Consolidado','<path d="M1 4h14M1 8h14M1 12h8"/><rect x="1" y="2" width="14" height="12" rx="1"/>'],
          ['mensal','Mensal','<rect x="1" y="3" width="14" height="11" rx="1"/><path d="M5 1v4M11 1v4M1 7h14"/>'],
          ['diario','Diário','<circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/>'],
          ['semana','Semana','<rect x="1" y="3" width="14" height="11" rx="1"/><path d="M1 7h14M5 1v4M11 1v4M4 11h2M7 11h2M10 11h2"/>'],
          ['resultados_casa','Por Casa','<path d="M1 4h14M1 8h14M1 12h8"/><circle cx="12" cy="12" r="3"/>'],
        ].map(([id,label,icon])=>`<div class="nav-item" id="nav-${id}" onclick="showPage('${id}')"><svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6">${icon}</svg>${label}</div>`).join('')}
        <div class="nav-group">Gestão</div>
        ${[
          ['parceiros','Fornecedores & Parceiros','<rect x="2" y="4" width="12" height="9" rx="1"/><path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1"/>'],
          ['custos','Custos de Contas','<path d="M8 2v12M5 5h4.5a2 2 0 010 4H5m0 0h5a2 2 0 010 4H5"/>'],
          ['custos_tipster','Custo de Tipsters','<circle cx="6" cy="5" r="2.5"/><path d="M1 13.5C1 11 3 10 6 10s5 1 5 3.5"/><circle cx="12" cy="5" r="2"/><path d="M10 13.2c.6-.5 2-.7 2-.7"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="10" y1="10" x2="14" y2="10"/>'],
          ['metrics','Métricas','<path d="M8 2v2M8 12v2M2 8h2m8 0h2"/><circle cx="8" cy="8" r="3"/>'],
        ].map(([id,label,icon])=>`<div class="nav-item" id="nav-${id}" onclick="showPage('${id}')"><svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6">${icon}</svg>${label}</div>`).join('')}
      </nav>
      <div class="sidebar-bottom">
        <button class="update-btn" onclick="loadData()">↻ Atualizar dados</button>
        <div class="last-update" id="lastUpdate"><span class="pulse-dot"></span><span id="lastUpdateText">${new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span></div>
      </div>
    </aside>
    <main class="main"><div class="main-content">

      <!-- VISÃO GERAL -->
      <div class="page" id="page-overview">
        ${buildFilters('overview',sports,casas,tipsters)}
        <div class="kpi-grid" id="kpiGrid"></div>
        ${mkCard('bankroll','Resultado Geral','<div class="chart-wrap" style="min-height:380px"><canvas id="chartBankroll" role="img" aria-label="P/L"></canvas></div>','<span style="margin-left:auto;margin-right:8px;font-family:JetBrains Mono,monospace;font-size:9px;text-transform:uppercase;letter-spacing:.18em;color:var(--text2);opacity:.7">P/L diário · evolução acumulada</span>')}
        ${mkCard('ov_streaks','Sequências & Topo Histórico','<div id="ovStreaksContent"></div>')}
        ${mkCard('roi_monthly','ROI Mensal (%)','<div class="chart-wrap" style="min-height:220px"><canvas id="chartROI" role="img" aria-label="ROI mensal"></canvas></div>')}
        ${mkCard('odds_dist','Distribuição de Odds — Apostas, Win Rate e ROI por faixa','<div class="chart-wrap" style="height:240px"><canvas id="chartOddsDist" role="img" aria-label="Odds dist"></canvas></div>')}
        ${mkCard('ov_custo','Custo de Contas — Resumo','<div id="ovCustoContent"></div>')}
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.25rem" id="ovHeatmapCard">
          <div style="font-size:11px;color:var(--accent-2);font-weight:700;letter-spacing:.05em;text-transform:uppercase;margin-bottom:.75rem">Calendário</div>
          <div id="ovHeatmapContent"></div>
        </div>
      </div>

      <!-- CONSOLIDADO -->
      <div class="page" id="page-consolidado">
        ${buildFilters('consolidado',sports,casas)}
        <div id="consolidadoContent"></div>
      </div>

      <!-- DIÁRIO (legado, mantido para compatibilidade) -->
      <div class="page" id="page-daily" style="display:none">
        ${buildFilters('daily',sports,casas)}
        <div id="dailyContent"></div>
      </div>

      <!-- ESPORTES -->
      <div class="page" id="page-sports">
        ${buildFilters('sports',sports,casas)}
        ${mkCard('sport_kpi','Resumo por Esporte','<div id="sportKpiCards" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:.5rem"></div>')}
        ${mkCard('sport_chart','P/L por Esporte','<div id="sportTable"></div><div class="chart-wrap" style="min-height:300px;margin-top:.75rem"><canvas id="chartSport" role="img" aria-label="Esportes"></canvas></div>')}
      </div>

      <!-- CASAS DE APOSTAS -->
      <div class="page" id="page-casas">
        ${buildFilters('casas',sports,casas)}
        ${mkCard('casa_kpi','Resumo por Casa','<div id="casaKpiCards" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:.5rem"></div>')}
        ${mkCard('casa_chart','ROI% por Casa — Barras Horizontais','<div id="casaTable"></div><div id="chartCasa" style="margin-top:.75rem"></div>')}
      </div>

      <!-- APOSTAS -->
      <div class="page" id="page-apostas">
        ${buildFilters('apostas',sports,casas,tipsters)}
        <div id="apostasKPI" style="margin-bottom:1rem"></div>
        <!-- Filter + sort bar -->
        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:.75rem;flex-wrap:wrap;padding:.75rem 1rem;background:var(--bg3);border:1px solid var(--border);border-radius:8px">
          <div style="display:flex;gap:6px;flex-wrap:wrap;flex:1">
            ${[['Data',0],['Esporte',1],['Tipster',2],['Casa',3],['Parceiro',4],['Aposta',5],['Descrição',6]].map(([lbl,i])=>`<input class="apostas-filter-inp acf" type="text" placeholder="${lbl}..." oninput="apostasFilter(${i},this.value)">`).join('')}
          </div>
          <button onclick="clearApostasFilters()" style="font-size:10px;padding:5px 10px;background:transparent;border:1px solid var(--border2);color:var(--text3);border-radius:5px;cursor:pointer;font-family:'JetBrains Mono',monospace;white-space:nowrap;flex-shrink:0">✕ Limpar</button>
        </div>
        <!-- Sort bar -->
        <div style="display:flex;gap:5px;align-items:center;margin-bottom:.75rem;flex-wrap:wrap">
          <span style="font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.1em;margin-right:4px">Ordenar:</span>
          ${[['Data',0],['Odd',8],['Stake',7],['P/L',10],['Resultado',9],['Tipster',2],['Casa',3]].map(([lbl,i])=>`<button class="apostas-sort-btn" data-col="${i}" onclick="apostasSort(${i})">${lbl} <span class="sort-arrow"></span></button>`).join('')}
        </div>
        <!-- Cards container -->
        <div class="apostas-cont" id="apostasCont" style="height:calc(100vh - 380px)">
          <div id="apostasCardWrap"></div>
        </div>
      </div>

      <!-- TIPSTERS -->
      <div class="page" id="page-tipsters">
        ${buildFilters('tipsters',sports,casas,tipsters)}
        ${mkCard('tipster_kpi','Tipsters — Visão Geral','<div id="tipsterPortfolioKPIs" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:.75rem;margin-bottom:.75rem"></div><div class="tcard-sort"><span class="tcard-sort__lbl">Ordenar</span><div class="tcard-seg" id="tipsterSeg"><button data-k="pl" class="active" onclick="tipsterSortBy(this.dataset.k)">P/L</button><button data-k="roi" onclick="tipsterSortBy(this.dataset.k)">ROI</button><button data-k="to" onclick="tipsterSortBy(this.dataset.k)">Turnover</button><button data-k="wr" onclick="tipsterSortBy(this.dataset.k)">Win Rate</button><button data-k="vol" onclick="tipsterSortBy(this.dataset.k)">Volume</button></div><button class="tcard-dir" id="tipsterDir" onclick="tipsterSortDir()">↓</button></div><div class="tcard-grid" id="tipsterKpiCards"></div>')}
        ${mkCard('tipster_lines','P/L Acumulado por Tipster','<div class="chart-wrap" style="height:240px"><canvas id="chartTipsterLines" role="img" aria-label="Tipster lines"></canvas></div>')}
        ${mkCard('tipster_results','Resultados por Tipster','<div class="chart-wrap" id="chartTipsterResultsWrap" style="min-height:200px"><canvas id="chartTipsterResults" role="img" aria-label="Resultados tipster"></canvas></div>')}
        ${mkCard('tipster_comp','Comparativo Geral','<div class="tbl-wrap" id="tipsterCompTable"></div>')}
        ${mkCard('tipster_casa','Tipsters por Casa','<div class="tbl-wrap" id="tipsterCasaTable"></div>')}
        ${mkCard('tipster_month','Análise Mensal','<div class="tbl-wrap"><table class="tbl" id="tipsterMonthTable"><thead><tr><th>Mês<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>P/L<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>Win Rate%<span class="sort-icon"></span></th><th>Stake Média<span class="sort-icon"></span></th><th>Odd Média Pond.<span class="sort-icon"></span></th></tr></thead><tbody></tbody></table></div>')}
      </div>

      <!-- RESULTADOS POR CASA -->
      <div class="page" id="page-resultados_casa">
        ${buildFilters('resultados_casa',sports,casas,tipsters)}
        <div class="kpi-grid" id="resultadosCasaKPI"></div>
        ${mkCard('res_casa_bars','ROI por Casa','<div id="resultadosCasaBars" style="padding:.25rem 0"></div>')}
        ${mkCard('res_casa_table','Detalhamento por Casa','<div class="tbl-wrap" id="resultadosCasaTable"></div>')}
      </div>

      <!-- FORNECEDORES & PARCEIROS -->
      <div class="page" id="page-parceiros">
        ${buildFilters('parceiros',sports,casas)}
        ${mkCard('forn_custo_cards','Custo de Contas por Fornecedor','<div id="fornCustoCards"></div>')}
        <div class="row2">
          ${mkCard('forn_chart','Lucro por Fornecedor','<div class="chart-wrap" style="min-height:220px"><canvas id="chartForn" role="img" aria-label="Fornecedores"></canvas></div>')}
          ${mkCard('forn_table','Resumo por Fornecedor','<div class="tbl-wrap" id="fornTable"></div>')}
        </div>
        ${mkCard('cross_table','Contas por Casa × Fornecedor','<div id="crossTable"></div>')}
        ${mkCard('parc_table','Contas Individuais','<div class="tbl-wrap" id="parcTable"></div>')}
      </div>

      <!-- CUSTOS DE CONTAS -->
      <div class="page" id="page-custos">
        <div id="custosContent">
          ${mkCard('custos_table','Tabela de Custos por Casa × Fornecedor',`
            <p style="font-size:11px;color:var(--text3);margin-bottom:.75rem;font-family:var(--font-sans)">💡 Insira o custo de cada conta por fornecedor/casa. O total é calculado pelo nº de contas. Valores salvos permanentemente no navegador.</p>
            <div id="costTableWrap"></div>`)}
        </div>
      </div>

      <!-- MENSAL -->
      <div class="page" id="page-mensal">
        <div id="mensalContent"></div>
      </div>

      <!-- DIÁRIO (nova aba) -->
      <div class="page" id="page-diario">
        <div id="diarioContent"></div>
      </div>

      <!-- SEMANA -->
      <div class="page" id="page-semana">
        <div id="semanaContent"></div>
      </div>

      <!-- CUSTO DE TIPSTERS -->
      <div class="page" id="page-custos_tipster">
        <div id="custoTipsterContent"></div>
      </div>

      <!-- MÉTRICAS -->
      <div class="page" id="page-metrics">
        ${buildFilters('metrics',sports,casas)}
        <div class="kpi-grid" id="metricsKPI"></div>

        ${mkCard('m_roi','ROI — Return on Investment',`
          <div class="metric-desc">Mede o retorno percentual sobre o total apostado. É a métrica mais importante para avaliar a rentabilidade de uma estratégia de longo prazo.</div>
          <div class="metric-formula">ROI (%) = (Lucro Total / Turnover) × 100</div>
          <div class="metric-example">Exemplo: Se você apostou R$ 10.000 e teve lucro de R$ 500, seu ROI é +5,00%</div>
          <div class="metric-warn">Atenção: Um ROI positivo no curto prazo pode ser sorte. Use o P-Value para validar a significância estatística.</div>`)}

        ${mkCard('m_wr','Win Rate',`
          <div class="metric-desc">Percentual de apostas ganhas sobre o total de apostas encerradas (exclui Void). Um Win Rate alto não garante lucro — depende da odd média.</div>
          <div class="metric-formula">Win Rate (%) = (W + HW) / (Total − V) × 100</div>
          <div class="metric-example">Apostas contabilizadas: W (Win), L (Loss), HW (Half Win), HL (Half Loss). Void (V) é excluído pois a stake é devolvida.</div>`)}

        ${mkCard('m_odd','Odd Média Pond.',`
          <div class="metric-desc">Odd média ponderada pela stake apostada em cada evento. É mais precisa que a média simples porque dá mais peso às apostas com maior valor.</div>
          <div class="metric-formula">Odd Média Pond. = Σ(odd × stake) / Σ(stake)</div>
          <div class="metric-example">Exemplo: R$ 1.000 em odd 2.0 e R$ 100 em odd 50.0 → Odd Média Pond. = (2.000 + 5.000) / 1.100 = 6,36 (não 26,0)</div>`)}

        ${mkCard('m_mdd','MDD — Maximum Drawdown',`
          <div class="metric-desc">Maior queda acumulada do seu P/L a partir de um pico. Mede o pior momento vivido até determinado ponto da operação.</div>
          <div class="metric-formula">MDD (R$) = max(pico_acumulado − valor_atual) em todo o histórico</div>
          <div class="metric-example">Exemplo: Se seu P/L chegou a +R$ 50.000 e depois caiu para +R$ 30.000, seu MDD é R$ 20.000 (40% do pico)</div>
          <div class="metric-warn">Um MDD elevado indica volatilidade alta. Mesmo com ROI positivo, um MDD grande pode levar ao abandono psicológico da estratégia.</div>`)}

        ${mkCard('m_emdd','EMDD — Expected Maximum Drawdown',`
          <div class="metric-desc">Drawdown médio esperado com base nas suas métricas atuais (ROI, odd média, número de apostas). Calculado pela fórmula de movimento browniano com drift — a mesma usada pelo WinnerOdds.</div>
          <div class="metric-formula">EMDD = σ² / (2μ) × [1 − e^(−2μN/σ²)]</div>
          <div class="metric-desc" style="margin-top:.5rem">Onde μ = lucro médio por aposta, σ = desvio padrão dos resultados, N = número de apostas.</div>
          <div class="metric-warn">Se MDD real &gt; EMDD: você sofreu mais drawdown que o esperado. Se MDD real &lt;&lt; EMDD: resultados podem ter sido preparados ou selecionados.</div>`)}

        ${mkCard('m_xmdd','XMDD — Monte Carlo Maximum Drawdown',`
          <div class="metric-desc">Calculado por simulação: o sistema simula centenas de sequências aleatórias com as mesmas métricas (Win Rate, odd média, stake média) e calcula o drawdown médio. É mais preciso que o EMDD analítico mas varia levemente a cada recálculo.</div>
          <div class="metric-formula">XMDD = média dos MDD de 250 simulações Monte Carlo</div>`)}

        ${mkCard('m_pval','P-Value',`
          <div class="metric-desc">Probabilidade de que seus resultados sejam fruto do acaso (sorte), assumindo que você não tem vantagem real. Quanto menor o P-Value, mais improvável é que seus resultados sejam aleatórios.</div>
          <div class="metric-formula">P-Value = P(WR ≥ WR_observado | sem habilidade)</div>
          <div class="term-grid">
            <div class="term-card"><div class="term-name">&lt; 5% (0.05)</div><div class="term-def">Estatisticamente significativo. Seus resultados provavelmente não são acaso.</div></div>
            <div class="term-card"><div class="term-name">&lt; 1% (0.01)</div><div class="term-def">Altamente significativo. Evidência forte de edge real.</div></div>
            <div class="term-card"><div class="term-name">&lt; 0.1% (0.001)</div><div class="term-def">Nível exigido por pesquisadores rigorosos para confirmar edge.</div></div>
            <div class="term-card"><div class="term-name">&gt; 5%</div><div class="term-def">Não significativo. Mais apostas necessárias para confirmar o edge.</div></div>
          </div>`)}

        ${mkCard('m_pemdd','Profit / EMDD',`
          <div class="metric-desc">Ratio entre o lucro total e o drawdown esperado. Mede a eficiência da estratégia: quanto lucro você gera para cada unidade de risco.</div>
          <div class="metric-formula">Profit/EMDD = Lucro Total / EMDD</div>
          <div class="term-grid">
            <div class="term-card"><div class="term-name">&gt; 5</div><div class="term-def">Método excelente. Alto retorno para o risco tomado.</div></div>
            <div class="term-card"><div class="term-name">2 – 5</div><div class="term-def">Método bom. Adequado para operação profissional.</div></div>
            <div class="term-card"><div class="term-name">&lt; 2</div><div class="term-def">Método marginal. Risco elevado em relação ao retorno.</div></div>
            <div class="term-card"><div class="term-name">&lt; 1</div><div class="term-def">Risco maior que retorno. Revisar estratégia.</div></div>
          </div>`)}

        ${mkCard('m_gloss','Glossário de Resultados',`
          <div class="term-grid">
            <div class="term-card"><div class="term-name">W — Win</div><div class="term-def">Aposta totalmente ganha. Retorno = stake × odd.</div></div>
            <div class="term-card"><div class="term-name">L — Loss</div><div class="term-def">Aposta totalmente perdida. Retorno = 0. Lucro = −stake.</div></div>
            <div class="term-card"><div class="term-name">HW — Half Win</div><div class="term-def">Metade da stake ganha, metade devolvida. Ocorre em handicap asiático. Retorno = (stake/2)×odd + stake/2.</div></div>
            <div class="term-card"><div class="term-name">HL — Half Loss</div><div class="term-def">Metade da stake perdida, metade devolvida. Retorno = stake/2. Lucro = −stake/2.</div></div>
            <div class="term-card"><div class="term-name">V — Void</div><div class="term-def">Aposta anulada. Stake devolvida integralmente. Não conta no Win Rate.</div></div>
            <div class="term-card"><div class="term-name">Turnover</div><div class="term-def">Soma total de todas as stakes apostadas. Também chamado de Volume apostado.</div></div>
            <div class="term-card"><div class="term-name">Edge / Value</div><div class="term-def">Vantagem real sobre a casa. Existe quando a odd oferecida é maior que a probabilidade real do evento.</div></div>
            <div class="term-card"><div class="term-name">Bankroll</div><div class="term-def">Capital total disponível para apostas. O gerenciamento do bankroll define o tamanho das stakes e controla o risco de ruína.</div></div>
          </div>`)}
      </div>

    </div></main>

    <!-- Tipster drill-down popup (T-6) -->
    <div class="analise-popup-overlay" id="tipsterDrillOverlay" onclick="closeTipsterDrill(event)">
      <div class="analise-popup-modal" id="tipsterDrillModal" onclick="event.stopPropagation()">
        <div class="analise-popup-hdr">
          <img src="brand/fdc-logo-horizontal-dark.svg" height="33" alt="FDC Capital" class="drill-brand-logo" style="flex-shrink:0;opacity:1" crossorigin="anonymous">
          <div style="flex:1;min-width:0;display:flex;align-items:center;gap:10px;overflow:hidden">
            <span class="nametag" style="flex-shrink:1;min-width:0"><span id="tipsterDrillName" class="nametag__nm" style="font-size:15px"></span></span>
            <span style="font-size:10px;color:var(--ink-mute);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.12em;white-space:nowrap;flex-shrink:0">drill-down</span>
          </div>
          <button class="no-export export-drill-btn" onclick="exportDrill()" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:transparent;border:1px solid var(--line);color:var(--ink-soft);border-radius:6px;cursor:pointer;font-size:13px;flex-shrink:0" title="Copiar como imagem">⎘</button>
          <button class="no-export" onclick="closeTipsterDrill()" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:transparent;border:1px solid var(--line);color:var(--ink-soft);border-radius:6px;cursor:pointer;font-size:14px;flex-shrink:0">✕</button>
        </div>
        <div id="tipsterDrillPeriodBar" class="no-export" style="padding:.6rem 1.5rem;border-bottom:1px solid var(--border);display:flex;flex-wrap:wrap;gap:6px;align-items:center">
          <button class="qbtn" data-qt="hoje" onclick="setDrillType('hoje')">Hoje</button>
          <button class="qbtn" data-qt="wtd" onclick="setDrillType('wtd')">WTD</button>
          <button class="qbtn" data-qt="mtd" onclick="setDrillType('mtd')">MTD</button>
          <button class="qbtn" data-qt="ytd" onclick="setDrillType('ytd')">YTD</button>
          <button class="qbtn" data-days="7" onclick="setDrillQuick(7)">7d</button>
          <button class="qbtn" data-days="30" onclick="setDrillQuick(30)">30d</button>
          <button class="qbtn" data-days="90" onclick="setDrillQuick(90)">90d</button>
          <button class="qbtn" data-all="1" onclick="setDrillAll()">Tudo</button>
        </div>
        <div id="tipsterDrillBody"></div>
      </div>
    </div>
  </div>`;

  showPage('overview');
}


// ── CUSTO DE TIPSTERS ───────────────────────────────────────────────────────
const CT_KEY='custoTipsterData'; // {tipster: {YYYY-MM: value}, ...}
const CG_KEY='custoGeralData';   // [{id, tipo, values: {YYYY-MM: value}}, ...]
let ctData={}, cgData=[];

function ctLoad(){
  try{ctData=JSON.parse(localStorage.getItem(CT_KEY)||'{}');}catch(e){ctData={};}
  try{cgData=JSON.parse(localStorage.getItem(CG_KEY)||'[]');}catch(e){cgData=[];}
}
function ctSave(){localStorage.setItem(CT_KEY,JSON.stringify(ctData));localStorage.setItem(CG_KEY,JSON.stringify(cgData));}

function ctGetMonths(){
  // Last 6 months ending current month
  const months=[];const now=new Date();
  for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);}
  return months;
}
function ctFmtMonth(ym){const[y,m]=ym.split('-');return MESES_CURTOS[parseInt(m)-1]+'/'+y.slice(2);}

window.saveCT=function(el){
  const t=el.dataset.ct, m=el.dataset.ctm, v=el.value.trim();
  if(!ctData[t])ctData[t]={};
  if(v)ctData[t][m]=v; else delete ctData[t][m];
  ctSave(); renderCustoTipster();
};
window.saveCG=function(el){
  const idx=parseInt(el.dataset.cgidx), m=el.dataset.cgm, v=el.value.trim();
  if(!cgData[idx])return;
  if(!cgData[idx].values)cgData[idx].values={};
  if(v)cgData[idx].values[m]=v; else delete cgData[idx].values[m];
  ctSave(); renderCustoTipster();
};
window.saveCGTipo=function(el){
  const idx=parseInt(el.dataset.cgidx);
  if(!cgData[idx])return;
  cgData[idx].tipo=el.value.trim();
  ctSave();
};
window.addCG=function(){
  cgData.push({id:Date.now(),tipo:'',values:{}});
  ctSave(); renderCustoTipster();
};
window.deleteCG=function(idx){
  cgData.splice(idx,1);
  ctSave(); renderCustoTipster();
};

async function loadData(){
  document.getElementById('root').innerHTML=`<div class="loader" id="loaderEl"><div class="loader-content"><img src="brand/fdc-logo-horizontal-dark.svg" alt="FDC Capital" style="width:676px;max-width:88vw;display:block;object-fit:contain;opacity:.97" draggable="false"><div class="loader-bottom"><div class="loader-bar-wrap"><div class="loader-bar-fill p1" id="loaderBar"></div></div><div class="loader-pct" id="loaderPct">0%</div></div></div></div>`;
  // Fase 1: animação CSS 0→70% em 2s — contador JS sincronizado
  let _pctRAF;const _pctT0=Date.now();
  (function _tick(){const pEl=document.getElementById('loaderPct');if(!pEl)return;const t=Math.min((Date.now()-_pctT0)/90000,1);const e=1-Math.pow(1-t,3);pEl.textContent=Math.round(e*90)+'%';if(t<1)_pctRAF=requestAnimationFrame(_tick);})();
  let _fetchErr=null;
  try{
    const res=await fetch(APPS_SCRIPT_URL);
    const json=await res.json();
    if(!json.ok)throw new Error(json.error||'Erro desconhecido');
    DADOS=normalizeDados(json.data);
    auditCasas(DADOS);
  }catch(err){
    _fetchErr=err.message||'Falha na conexão';
    DADOS=[];
  }
  // Fase 2: fetch retornou → completa barra em 0.3s, depois fade out
  const bar=document.getElementById('loaderBar');
  const loader=document.getElementById('loaderEl');
  const pctEl=document.getElementById('loaderPct');
  if(pctEl)pctEl.textContent='100%';
  if(bar){bar.classList.remove('p1');bar.style.width='100%';}
  await new Promise(r=>setTimeout(r,320));
  if(loader){loader.style.opacity='0';}
  await new Promise(r=>setTimeout(r,360));
  buildHTML();
  applyAparencia();
  if(_fetchErr){
    const banner=document.createElement('div');
    banner.style.cssText='position:fixed;top:44px;left:220px;right:0;z-index:9998;background:rgba(229,82,75,0.12);border-bottom:1px solid rgba(229,82,75,0.3);padding:8px 20px;display:flex;align-items:center;gap:10px;font-size:12px;font-family:var(--font-mono);color:#E5524B';
    banner.innerHTML=`<span>⚠ Não foi possível carregar os dados — ${_fetchErr}</span><button onclick="loadData()" style="margin-left:auto;padding:4px 12px;background:transparent;border:1px solid rgba(229,82,75,0.4);color:#E5524B;border-radius:4px;cursor:pointer;font-size:11px;font-family:var(--font-mono)">↻ Tentar novamente</button><button onclick="this.parentElement.remove()" style="padding:2px 8px;background:transparent;border:none;color:#E5524B;cursor:pointer;font-size:14px">×</button>`;
    document.body.appendChild(banner);
  }else{
    const lu=document.getElementById('lastUpdateText');
    if(lu)lu.textContent=new Date().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  }
}
// Apply persisted Aparência before first render (theme, density, etc.)
applyAparencia();
loadData();

