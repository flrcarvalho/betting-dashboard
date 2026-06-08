// ── shared.js — Helpers e constantes compartilhados ──────────────────────────

// ── Calendar Heatmap Helper ─────────────────────────────────────────────────
function mkCalendarHeatmap(selMonth, allDados, opts){
  // opts: {showNav, onPrev, onNext, onSelect, compact}
  opts = opts || {};
  const months = [...new Set(allDados.map(r=>r.data.slice(0,7)))].sort().reverse();
  if(!months.length) return '<p style="color:var(--text3);padding:1rem">Sem dados.</p>';
  const cur = selMonth || months[0];
  const [yr, mo] = cur.split('-');
  const moLabel = MESES[parseInt(mo)-1] + ' ' + yr;

  // Build day→{pl,n} map
  const dayMap = {};
  allDados.filter(r=>r.data.slice(0,7)===cur).forEach(r=>{
    const d = r.data.slice(0,10);
    if(!dayMap[d]) dayMap[d]={pl:0,n:0};
    dayMap[d].pl+=r.lucro; dayMap[d].n++;
  });

  // Month stats
  const mRows = allDados.filter(r=>r.data.slice(0,7)===cur);
  const mPL = mRows.reduce((a,r)=>a+r.lucro,0);
  const mN = mRows.length;
  const mTurnover = mRows.reduce((a,r)=>a+(r.stake||0),0);
  const mROI = mTurnover>0 ? mPL/mTurnover*100 : 0;
  const mSettled = mRows.filter(r=>r.resultado!=='V');
  const mWins = mSettled.filter(r=>['W','HW'].includes(r.resultado)).length;
  const mWR = mSettled.length>0 ? mWins/mSettled.length*100 : 0;
  const mWCount = mRows.filter(r=>r.resultado==='W').length;
  const mHWCount = mRows.filter(r=>r.resultado==='HW').length;
  const mLCount = mRows.filter(r=>r.resultado==='L').length;
  const mHLCount = mRows.filter(r=>r.resultado==='HL').length;
  const mSumOddStake = mRows.reduce((a,r)=>a+((r.odd||0)*(r.stake||0)),0);
  const mAvgOdd = mTurnover>0 ? mSumOddStake/mTurnover : 0;
  const mAvgStake = mN>0 ? mTurnover/mN : 0;
  const plColor = mPL>=0?'var(--green)':'var(--red)';
  const roiColor = mROI>=0?'var(--green)':'var(--red)';
  const wrColor = 'var(--ink-soft)';

  // Calendar grid
  const firstDay = new Date(parseInt(yr), parseInt(mo)-1, 1);
  const lastDay = new Date(parseInt(yr), parseInt(mo), 0);
  const daysInMonth = lastDay.getDate();
  let startDow = firstDay.getDay();
  startDow = (startDow + 6) % 7; // 0=Mon

  // Proportional opacity: intensity ∝ |P/L| relative to month max
  const maxAbs=Math.max(...Object.values(dayMap).map(d=>Math.abs(d.pl)),1);
  const cellStyle=(d)=>{
    const key=`${yr}-${mo}-${String(d).padStart(2,'0')}`;
    const data=dayMap[key];
    if(!data) return {bg:'var(--bg4)',border:'var(--border)',clr:'var(--text3)',pl:null,n:0};
    const pl=data.pl;
    const intensity=Math.min(Math.abs(pl)/maxAbs,1)*0.78+0.15;
    const a=intensity.toFixed(2),ab=(intensity*0.6).toFixed(2);
    let bg,border,clr='#fff';
    if(pl>=0){bg=`rgba(43,192,126,${a})`;border=`rgba(43,192,126,${ab})`;}
    else     {bg=`rgba(229,82,75,${a})`;  border=`rgba(229,82,75,${ab})`;}
    return{bg,border,clr,pl,n:data.n};
  };

  const compact = opts.compact;
  const cellH = compact ? '58px' : '76px';
  const cellFS = compact ? '13px' : '15px';
  const subFS = compact ? '9px' : '10px';

  const DAYS_SHORT = ['S','T','Q','Q','S','S','D'];

  let cells = '';
  for(let i=0;i<startDow;i++) cells+=`<div style="background:var(--bg2);border-radius:8px;opacity:.3"></div>`;
  const today = new Date();
  for(let d=1;d<=daysInMonth;d++){
    const s=cellStyle(d);
    const key=`${yr}-${mo}-${String(d).padStart(2,'0')}`;
    const isToday=(today.getFullYear()===parseInt(yr)&&today.getMonth()===parseInt(mo)-1&&today.getDate()===d);
    const todayBorder=isToday?'2px solid var(--blue)':'1px solid '+s.border;
    const plTxt=s.pl!=null?`<div style="font-weight:700;font-size:${cellFS};color:${s.clr};font-variant-numeric:tabular-nums;text-align:right;line-height:1.15;font-family:'JetBrains Mono',monospace">${s.pl>=0?'+':''}${fmtK(s.pl)}</div>`:'';
    const nTxt=s.n>0?`<div style="font-size:${subFS};color:${s.clr};opacity:.7;text-align:right;line-height:1;font-family:'JetBrains Mono',monospace">${s.n}b</div>`:'';
    cells+=`<div style="background:${s.bg};border:${todayBorder};border-radius:8px;padding:5px 6px;cursor:${s.n?'pointer':'default'};display:flex;flex-direction:column;justify-content:space-between;min-height:${cellH};position:relative;transition:opacity .1s" ${s.n?`onclick="if(window._calHeatCb)window._calHeatCb('${key}')" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'"`:''}>
      <div style="font-size:${subFS};color:${s.pl!=null?s.clr:'var(--text3)'};font-family:'JetBrains Mono',monospace;font-weight:${isToday?700:500}">${d}</div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px">${plTxt}${nTxt}</div>
    </div>`;
  }

  // Nav
  const idxCur=months.indexOf(cur);
  const navHTML=opts.showNav?`
    <div style="display:flex;align-items:center;gap:10px">
      <button onclick="${opts.onPrev||''}" style="padding:4px 10px;background:var(--bg4);border:1px solid var(--border2);color:var(--text2);border-radius:5px;cursor:pointer;font-size:13px" ${idxCur>=months.length-1?'disabled':''}>‹</button>
      <select onchange="${opts.onSelect||''}" style="font-size:13px;font-weight:700;padding:5px 10px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:5px;font-family:'Manrope',sans-serif">
        ${months.map(m=>{const[y2,m2]=m.split('-');return`<option value="${m}"${m===cur?' selected':''}>${MESES[parseInt(m2)-1]} ${y2}</option>`;}).join('')}
      </select>
      <button onclick="${opts.onNext||''}" style="padding:4px 10px;background:var(--bg4);border:1px solid var(--border2);color:var(--text2);border-radius:5px;cursor:pointer;font-size:13px" ${idxCur<=0?'disabled':''}>›</button>
    </div>
  `:'<div style="font-size:15px;font-weight:700;color:var(--text)">' + moLabel + '</div>';

  // Mini-cards row
  const mkMini=(label,val,valColor,sub)=>`<div class="kpi" style="padding:.6rem .75rem">
    <div class="kpi-label" style="font-size:9px">${label}</div>
    <div class="kpi-val" style="font-size:${compact?'13px':'15px'};color:${valColor||'var(--text)'}">${val}</div>
    ${sub?`<div class="kpi-sub" style="font-size:8px;line-height:1.3">${sub}</div>`:''}
  </div>`;

  const miniCardsHTML=mN>0?`
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:2px">
      ${mkMini('P/L',fmtPL(mPL),plColor,'')}
      ${mkMini('Turnover',fmtR(mTurnover),'var(--text)','')}
      ${mkMini('ROI',(mROI>=0?'+':'')+mROI.toFixed(2)+'%',roiColor,'')}
      ${mkMini('Apostas',mN,'var(--text)',`WR: <span style="color:${wrColor}">${mWR.toFixed(1)}%</span> · <span class="res-w">W:${mWCount}</span> <span class="res-hw">HW:${mHWCount}</span> <span class="res-l">L:${mLCount}</span> <span class="res-hl">HL:${mHLCount}</span>`)}
      ${mkMini('Odd Média Pond.',mAvgOdd>0?mAvgOdd.toFixed(2):'—','var(--text)','')}
      ${mkMini('Stake Média',mAvgStake>0?fmtR(mAvgStake):'—','var(--text)','')}
    </div>
  `:'';

  return`<div style="display:flex;flex-direction:column;gap:10px;height:100%">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      ${navHTML}
    </div>
    ${miniCardsHTML}
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;flex:1">
      ${DAYS_SHORT.map(d=>`<div style="text-align:center;font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;font-weight:700;padding-bottom:2px">${d}</div>`).join('')}
      ${cells}
    </div>
  </div>`;
}

// ── Shared KPI grid builder (2 rows × 4) ────────────────────────────────────
function mkKpiGrid(rows,{plLabel,contextLabel,contextVal,contextSub}){
  const pl=rows.reduce((a,r)=>a+r.lucro,0);
  const stake=rows.reduce((a,r)=>a+r.stake,0);
  const roi=stake>0?(pl/stake*100):0;
  const n=rows.length;
  const W=rows.filter(r=>r.resultado==='W').length;
  const HW=rows.filter(r=>r.resultado==='HW').length;
  const L=rows.filter(r=>r.resultado==='L').length;
  const HL=rows.filter(r=>r.resultado==='HL').length;
  const V=rows.filter(r=>r.resultado==='V').length;
  const settled=W+HW+L+HL;
  const wr=settled>0?((W+HW)/settled*100):0;
  const avgOdd=calcAvgOdd(rows);
  const avgStake=n>0?stake/n:0;
  const betsBreak=[W?`<span class="res-w">W:${W}</span>`:'',HW?`<span class="res-hw">HW:${HW}</span>`:'',L?`<span class="res-l">L:${L}</span>`:'',HL?`<span class="res-hl">HL:${HL}</span>`:'',V?`<span class="res-v">V:${V}</span>`:''].filter(Boolean).join(' ');
  const mkK=(l,v,c,s,subFlex)=>`<div class="kpi"><div class="kpi-label">${l}</div><div class="kpi-val ${c}">${v}</div><div class="kpi-sub"${subFlex?' style="display:flex;flex-wrap:wrap;gap:2px 5px"':''}>${s}</div></div>`;
  const row1=[
    mkK(plLabel,fmtPL(pl),pl>=0?'pos':'neg','Turnover: '+fmtR(stake)),
    mkK('Turnover',fmtR(stake),'neu',n+' apostas'),
    mkK('ROI',(roi>=0?'+':'')+roi.toFixed(2)+'%',roi>=0?'pos':'neg',(settled)+' encerradas'),
    mkK('Apostas',n.toLocaleString('pt-BR'),'neu',betsBreak,true),
  ].join('');
  const row2=[
    mkK('Win Rate',wr.toFixed(1)+'%','neu',settled+' encerradas'),
    mkK('Odd Média Pond.',avgOdd.toFixed(2),'neu','Σ(odd×stake)/Σ(stake)'),
    mkK('Stake Média',fmtR(avgStake),'neu','por aposta'),
    mkK(contextLabel,contextVal,'neu',contextSub),
  ].join('');
  return`<div class="kpi-grid" style="margin-bottom:.5rem">${row1}</div><div class="kpi-grid" style="margin-bottom:1.25rem">${row2}</div>`;
}


function toggleBlock(key){
  const body=document.getElementById('mbody_'+key);
  const tog=document.getElementById('mtog_'+key);
  if(!body)return;
  const isOpen=body.classList.contains('open');
  if(!isOpen){body.classList.add('open');if(tog)tog.style.transform='rotate(180deg)';}
  else{body.classList.remove('open');if(tog)tog.style.transform='';}
}

// Win Rate bar component (número + barra azul proporcional)
function mkWRC(wr){
  const pct=Math.min(100,Math.max(0,wr));
  return `<div class="wrc"><span class="num">${wr.toFixed(1)}%</span><div class="t"><div class="f" style="width:${pct.toFixed(1)}%"></div></div></div>`;
}

// Sports & Casas
function buildSummaryTable(tableId,label,ents,isCasa=false){
  const rows=ents.map(([nome,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0,wr=d.t>0?(d.w/d.t*100):0;
    const lc=d.l>=0?'color:var(--green)':'color:var(--red)';
    const rc=roi>=0?'color:var(--green)':'color:var(--red)';
    const label_cell=isCasa?casaCell(nome):sportCell(nome);
    return`<tr><td style="font-weight:600;color:var(--text)">${label_cell}</td><td>${d.n}</td><td class="td-num">${mkWRC(wr)}</td><td>${fmtR(d.s)}</td><td style="${lc}">${fmtPL(d.l)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td></tr>`;
  }).join('');
  const tot=ents.reduce((a,[,d])=>({n:a.n+d.n,w:a.w+d.w,t:a.t+d.t,s:a.s+d.s,l:a.l+d.l}),{n:0,w:0,t:0,s:0,l:0});
  const tRoi=tot.s>0?(tot.l/tot.s*100):0,tWr=tot.t>0?(tot.w/tot.t*100):0;
  const tlc=tot.l>=0?'color:var(--green)':'color:var(--red)';const trc=tRoi>=0?'color:var(--green)':'color:var(--red)';
  return`<div class="tbl-wrap" style="margin-top:.75rem"><table class="tbl" id="${tableId}"><thead><tr><th>${label}<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Win Rate%<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>P/L<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th></tr></thead><tbody>${rows}<tr class="total-row"><td>Total</td><td>${tot.n}</td><td class="td-num">${mkWRC(tWr)}</td><td>${fmtR(tot.s)}</td><td style="${tlc}">${fmtPL(tot.l)}</td><td style="${trc}">${(tRoi>=0?'+':'')+tRoi.toFixed(2)}%</td></tr></tbody></table></div>`;
}


// ── Shared stat card builder (6-per-row grids) ──────────────────────────────
function mkStatCards(items, containerId){
  const el = document.getElementById(containerId);
  if(!el) return;
  // Single flat grid — 6 equal columns always — browser handles wrapping
  // Placeholder divs on last row keep all cards the same size
  const COLS = 6;
  const remainder = items.length % COLS;
  const placeholders = remainder === 0 ? 0 : COLS - remainder;
  let html = items.join('');
  for(let i=0;i<placeholders;i++){
    // Invisible placeholder — same structure as a card but transparent
    html += `<div style="height:130px;box-sizing:border-box;visibility:hidden"></div>`;
  }
  el.style.display = 'grid';
  el.style.gridTemplateColumns = 'repeat(6,1fr)';
  el.style.gap = '10px';
  el.innerHTML = html;
}

function mkOneStatCard(icon, name, pl, roi, turnover, bets, extra){
  const plColor = pl>=0 ? 'var(--green)' : 'var(--red)';
  const roiColor = roi>=0 ? 'var(--green)' : 'var(--red)';
  const roiStr = (roi>=0?'+':'')+roi.toFixed(1)+'%';
  return `<div style="background:var(--bg4);border:1px solid var(--border);border-radius:10px;padding:14px 16px;height:130px;box-sizing:border-box;display:flex;flex-direction:column;gap:0;overflow:hidden">
    <div style="display:flex;align-items:center;gap:7px;margin-bottom:8px;overflow:hidden;flex-shrink:0">
      ${icon}
      <span style="font-size:12px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</span>
    </div>
    <div style="font-size:20px;font-weight:700;color:${plColor};font-variant-numeric:tabular-nums;line-height:1.15;margin-bottom:6px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${fmtPL(pl)}</div>
    <div style="font-size:10px;font-family:'JetBrains Mono',monospace;display:flex;flex-direction:column;gap:2px;flex:1">
      <div style="white-space:nowrap">ROI &nbsp;<span style="color:${roiColor}">${roiStr}</span></div>
      <div style="white-space:nowrap">Turnover &nbsp;<span style="color:var(--text2)">${fmtR(turnover)}</span></div>
      <div style="white-space:nowrap">${bets}b${extra?` &nbsp;<span style="color:var(--text3)">${extra}</span>`:''}</div>
    </div>
  </div>`;
}

// Apostas — constantes globais (devem vir antes do buildHTML)
// ── Sparkline ────────────────────────────────────────────────────────────────
function mkSparkline(data,w=88,h=28){
  if(!data||data.length<2)return'';
  const min=Math.min(...data),max=Math.max(...data);
  const range=max-min||1;
  const pad=2;
  const pts=data.map((v,i)=>{
    const x=pad+(i/(data.length-1))*(w-pad*2);
    const y=h-pad-(v-min)/range*(h-pad*2);
    return`${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last=data[data.length-1];
  const lx=parseFloat(pts.split(' ').pop().split(',')[0]);
  const ly=parseFloat(pts.split(' ').pop().split(',')[1]);
  return`<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible"><polyline points="${pts}" fill="none" stroke="var(--ink-soft,#95A1B0)" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="2.5" fill="var(--accent,#2E8BFF)" stroke="var(--bg,#0A0D12)" stroke-width="1.5"/></svg>`;
}

const APOSTAS_COLS=['data','esporte','tipster','casa','parceiro','aposta','descricao','stake','odd','resultado','lucro'];
const APOSTAS_HDRS=['Data','Esporte','Tipster','Casa','Parceiro','Aposta','Descrição','Stake','Odd','Resultado','P/L'];
const APOSTAS_NUM=[7,8,10];
const ROW_H=34;
const CARD_H=76; // card height in px for virtual scroll
