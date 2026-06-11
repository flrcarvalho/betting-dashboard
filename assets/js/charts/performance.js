// ── performance.js — Esportes, Casas, Tipsters, Resultados por Casa ──────────────

function renderSport(rows){
  const map={};rows.forEach(r=>{if(!map[r.esporte])map[r.esporte]={l:0,s:0,n:0,w:0,t:0};map[r.esporte].l+=r.lucro;map[r.esporte].s+=r.stake;map[r.esporte].n++;if(r.resultado!=='V'){map[r.esporte].t++;if(['W','HW'].includes(r.resultado))map[r.esporte].w++;}});
  const ents=Object.entries(map).filter(e=>e[0]&&e[0]!=='undefined').sort((a,b)=>b[1].l-a[1].l);

  // KPI cards sorted by turnover, 6/row
  const entsByTurnover = [...ents].sort((a,b)=>b[1].s-a[1].s);
  const sportCards = entsByTurnover.map(([sport,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0;
    const wr=d.t>0?(d.w/d.t*100):0;
    return mkOneStatCard(mkSpChip(sport), sport, d.l, roi, d.s, d.n, wr);
  });
  mkStatCards(sportCards, 'sportKpiCards');

  // Tabela ACIMA do gráfico
  document.getElementById('sportTable').innerHTML=buildSummaryTable('tblSport','Esporte',ents);
  setTimeout(()=>makeSortable('tblSport',[1,3,4,5]),100);
  // Gráfico vertical abaixo
  const wrap=document.querySelector('#chartSport')?.parentElement;
  if(wrap)wrap.style.height='300px';
  const topN=ents.slice(0,20);
  const valLabelPlugin={id:'valLabels',afterDatasetsDraw(chart){
    const{ctx,scales:{x,y}}=chart;
    ctx.save();
    chart.getDatasetMeta(0).data.forEach((bar,i)=>{
      const v=topN[i]?.[1]?.l||0;
      const roi=topN[i]?.[1]?.s>0?(topN[i][1].l/topN[i][1].s*100):0;
      const lbl=(v>=0?'+':'')+fmtK(v);
      ctx.font='bold 10px JetBrains Mono, monospace';
      ctx.fillStyle=isDark()?'rgba(255,255,255,.9)':'rgba(0,0,0,.85)';
      ctx.textAlign='center';
      ctx.textBaseline=v>=0?'bottom':'top';
      ctx.fillText(lbl,bar.x,v>=0?bar.y-3:bar.y+3);
    });
    ctx.restore();
  }};
  mkChart('chartSport',{type:'bar',data:{labels:topN.map(e=>sportEmoji(e[0])+' '+e[0]),datasets:[{data:topN.map(e=>parseFloat(e[1].l.toFixed(2))),backgroundColor:topN.map(e=>e[1].l>=0?'rgba(0,214,143,.75)':'rgba(240,80,110,.75)'),borderRadius:4,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,layout:{padding:{top:24,bottom:4}},plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{const e=topN[ctx.dataIndex];const roi=e[1].s>0?(e[1].l/e[1].s*100):0;return[fmtPL(e[1].l),`ROI: ${(roi>=0?'+':'')+roi.toFixed(1)}%`,`Apostas: ${e[1].n}`];}}}},scales:{x:{ticks:{color:tc(),font:{size:10},maxRotation:30},grid:{display:false},border:{display:false}},y:{ticks:{color:tc(),font:{size:10},callback:v=>fmtK(v)},grid:{color:gc()},border:{display:false}}}},plugins:[valLabelPlugin]});
}

function renderCasa(rows){
  const map={};rows.forEach(r=>{if(!map[r.casa])map[r.casa]={l:0,s:0,n:0,w:0,t:0,wt:0,stk:0};map[r.casa].l+=r.lucro;map[r.casa].s+=r.stake;map[r.casa].n++;if(r.resultado!=='V'){map[r.casa].t++;if(['W','HW'].includes(r.resultado))map[r.casa].w++;}if(r.odd>0&&r.stake>0){map[r.casa].wt+=r.odd*r.stake;map[r.casa].stk+=r.stake;}});
  const ents=Object.entries(map).filter(e=>e[0]&&e[0]!=='undefined').sort((a,b)=>(b[1].s>0?b[1].l/b[1].s:0)-(a[1].s>0?a[1].l/a[1].s:0));

  // KPI cards — all casas sorted by turnover, 6/row
  const casaByTurnover = [...ents].sort((a,b)=>b[1].s-a[1].s);
  const casaCards = casaByTurnover.map(([casa,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0;
    const wr=d.t>0?(d.w/d.t*100):0;
    return mkOneStatCard(mkHouseChip(casa), casa, d.l, roi, d.s, d.n, wr);
  });
  mkStatCards(casaCards, 'casaKpiCards');

  // Tabela ACIMA
  const casaTableEl=document.getElementById('casaTable');
  if(casaTableEl){casaTableEl.innerHTML=buildSummaryTable('tblCasa','Casa',ents,true);setTimeout(()=>makeSortable('tblCasa',[1,3,4,5]),100);}
  // Gráfico em HTML — barras inline horizontal ROI
  const vals=ents.map(e=>e[1].s>0?parseFloat((e[1].l/e[1].s*100).toFixed(2)):0);
  const maxAbs=Math.max(...vals.map(Math.abs),1);
  const rows2=ents.map((e,i)=>{
    const v=vals[i];const n=e[1].n;
    const barW=Math.abs(v)/maxAbs*48;
    const color=v>=0?'var(--green)':'var(--red)';
    const lc=v>=0?'color:var(--green)':'color:var(--red)';
    return`<div style="display:grid;grid-template-columns:160px 1fr 110px;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:12px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${casaCell(e[0])}</div>
      <div style="position:relative;height:14px;background:var(--bg5);border-radius:3px;overflow:hidden">
        <div style="position:absolute;left:50%;top:0;height:100%;width:1px;background:var(--border2);z-index:1"></div>
        <div style="position:absolute;${v>=0?'left:50%':'right:'+((100-barW)/2)+'%'};width:${barW}%;height:100%;background:${color};border-radius:3px;opacity:.8"></div>
      </div>
      <div style="display:flex;justify-content:flex-end;align-items:baseline;gap:0;font-family:'JetBrains Mono',monospace;white-space:nowrap"><span style="font-size:11px;${lc};min-width:72px;text-align:right">${(v>=0?'+':'')+v.toFixed(2)}%</span><span style="font-size:10px;color:var(--text3);min-width:60px;text-align:right">(${n})</span></div>
    </div>`;
  }).join('');
  const wrap=document.getElementById('chartCasa');
  if(wrap){wrap.innerHTML=`<div style="padding:.25rem 0">${rows2}</div>`;}
}

// ── tcard helpers (T-1) ─────────────────────────────────────────────────────
let _tipsterEnts=null,_tipsterDays=null,_tipsterAllDays=null;
let _tipsterSort={k:'pl',dir:1};

function _tipSparkSVG(dayMap,allDays){
  let cum=0;
  const vals=allDays.map(d=>{cum+=(dayMap[d]||0);return cum;});
  if(vals.length<2)return'<svg class="tcard__spark" viewBox="0 0 240 30" preserveAspectRatio="none"></svg>';
  const min=Math.min(...vals),max=Math.max(...vals),rng=max-min||1;
  const W=240,H=30,pad=2;
  const ptStr=vals.map((v,i)=>{
    const x=pad+(i/(vals.length-1))*(W-pad*2);
    const y=H-pad-((v-min)/rng)*(H-pad*2);
    return x.toFixed(1)+','+y.toFixed(1);
  }).join(' ');
  const last=ptStr.split(' ').pop().split(',');
  return`<svg class="tcard__spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`
    +`<polyline points="${ptStr}" fill="none" stroke="var(--ink-mute)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.75" vector-effect="non-scaling-stroke"/>`
    +`<circle cx="${last[0]}" cy="${last[1]}" r="2.6" fill="var(--accent)" vector-effect="non-scaling-stroke"/>`
    +`</svg>`;
}

function _mkTipCard(name,pl,roi,stake,wr,bets,sparkSVG,avgStake,avgOdd){
  const plSign=pl>=0?'+':'−';
  const plCls=pl>=0?'pos':'neg';
  const roiSign=roi>=0?'+':'';
  const roiCls=roi>=0?'pos':'neg';
  const plAmt=Math.abs(pl).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const stakeInt=Math.round(stake).toLocaleString('pt-BR');
  const avgStakeStr=Math.round(avgStake||0).toLocaleString('pt-BR');
  const avgOddStr=(avgOdd||0).toFixed(2).replace('.',',');
  const betsStr=bets.toLocaleString('pt-BR');
  const roiStr=roiSign+roi.toFixed(1).replace('.',',')+'%';
  const wrStr=wr.toFixed(1).replace('.',',')+'%';
  const wrPct=Math.min(wr,100).toFixed(1);
  const esc=name.replace(/"/g,'&quot;');
  return`<div class="tcard" data-name="${esc}">`
    +`<div class="tcard__top"><span class="nametag"><span class="nametag__nm" title="${esc}">${name}</span></span><span class="tcard__vol"><b>${betsStr}</b>apostas</span></div>`
    +`<div class="tcard__hero"><span class="tcard__pl ${plCls}"><span class="tcard__cur">${plSign} R$</span>${plAmt}</span><div class="tcard__roi"><span class="tcard__roi-lbl">ROI</span><span class="tcard__roi-val ${roiCls}">${roiStr}</span></div></div>`
    +sparkSVG
    +`<div class="tcard__foot">`
      +`<div class="tcard__stat"><div class="tcard__stat-lbl">Turnover</div><div class="tcard__stat-val"><span class="tcard__cur--sm">R$</span>${stakeInt}</div></div>`
      +`<div class="tcard__stat"><div class="tcard__stat-lbl">Stake Média</div><div class="tcard__stat-val"><span class="tcard__cur--sm">R$</span>${avgStakeStr}</div></div>`
      +`<div class="tcard__stat"><div class="tcard__stat-lbl">Odd Média</div><div class="tcard__stat-val">${avgOddStr}</div></div>`
      +`<div class="tcard__stat"><div class="tcard__stat-lbl">Win Rate</div><div class="tcard__stat-val">${wrStr}</div><div class="tcard__wrbar"><div class="tcard__wrfill" style="width:${wrPct}%"></div></div></div>`
    +`</div>`
    +`</div>`;
}

function _renderTipCards(){
  const el=document.getElementById('tipsterKpiCards');
  if(!el||!_tipsterEnts)return;
  if(!_tipsterEnts.length){el.innerHTML=mkEmpty('Nenhum tipster no período');return;}
  const {k,dir}=_tipsterSort;
  const fns={pl:([,d])=>d.l,roi:([,d])=>d.s>0?d.l/d.s*100:0,to:([,d])=>d.s,wr:([,d])=>d.t>0?d.w/d.t*100:0,vol:([,d])=>d.n};
  const fn=fns[k]||fns.pl;
  const sorted=[..._tipsterEnts].sort((a,b)=>dir*(fn(b)-fn(a)));
  el.innerHTML=sorted.map(([t,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0,wr=d.t>0?(d.w/d.t*100):0;
    const avgStake=d.n>0?d.s/d.n:0,avgOdd=d.stk>0?d.wt/d.stk:0;
    return _mkTipCard(t,d.l,roi,d.s,wr,d.n,_tipSparkSVG(_tipsterDays[t]||{},_tipsterAllDays),avgStake,avgOdd);
  }).join('');
  el.onclick=function(e){const card=e.target.closest('.tcard');if(card&&card.dataset.name)openTipsterDrill(card.dataset.name);};
  document.querySelectorAll('#tipsterSeg button').forEach(btn=>btn.classList.toggle('active',btn.dataset.k===k));
  const dirBtn=document.getElementById('tipsterDir');
  if(dirBtn)dirBtn.textContent=dir<0?'↓':'↑';
}
window.tipsterSortBy=function(k){_tipsterSort.k=k;_tipsterSort.dir=-1;_renderTipCards();};
window.tipsterSortDir=function(){_tipsterSort.dir*=-1;_renderTipCards();};

// ── T-6: drill-down popup ────────────────────────────────────────────────────
let _drillEscHandler=null;
let _drillBaseName=null,_drillBaseRows=[],_drillPeriodSt={qd:0,qt:''};

function _sliceDrillRows(){
  const st=_drillPeriodSt;
  if(!st.qd&&!st.qt)return _drillBaseRows;
  const today=new Date().toISOString().slice(0,10);
  let df='',dt='';
  if(st.qt==='hoje'){df=dt=today;}
  else if(st.qt==='wtd'){df=_wtdStart();dt=today;}
  else if(st.qt==='mtd'){df=_mtdStart();dt=today;}
  else if(st.qt==='ytd'){df=new Date().getFullYear()+'-01-01';dt=today;}
  else if(st.qd>0){df=new Date(Date.now()-st.qd*864e5).toISOString().slice(0,10);}
  return _drillBaseRows.filter(r=>{
    if(df&&r.data<df)return false;
    if(dt&&r.data>dt)return false;
    return true;
  });
}

function _updateDrillChips(){
  const st=_drillPeriodSt;
  const bar=document.getElementById('tipsterDrillPeriodBar');
  if(!bar)return;
  bar.querySelectorAll('.qbtn').forEach(b=>{
    let a=false;
    if(b.dataset.all)a=(st.qd===0&&!st.qt);
    else if(b.dataset.days)a=(st.qd===parseInt(b.dataset.days));
    else if(b.dataset.qt)a=(st.qt===b.dataset.qt);
    b.classList.toggle('active',a);
  });
}

function renderTipsterDrill(rows){
  const nome=_drillBaseName;
  const pl=rows.reduce((a,r)=>a+r.lucro,0);
  const s=rows.reduce((a,r)=>a+r.stake,0);
  const roi=s>0?pl/s*100:0;
  const settled=rows.filter(r=>r.resultado!=='V');
  const wins=settled.filter(r=>['W','HW'].includes(r.resultado)).length;
  const wr=settled.length>0?wins/settled.length*100:0;
  const wt=rows.reduce((a,r)=>r.odd>0&&r.stake>0?a+r.odd*r.stake:a,0);
  const stk=rows.reduce((a,r)=>r.odd>0&&r.stake>0?a+r.stake:a,0);
  const avgOdd=stk>0?wt/stk:0;
  const plCls=pl>=0?'pos':'neg';
  const roiCls=roi>=0?'pos':'neg';

  // Sequências & Topo Histórico — lógica idêntica ao renderOvStreaks
  const byDayS={};rows.forEach(r=>{const k=r.data.slice(0,10);if(!byDayS[k])byDayS[k]=0;byDayS[k]+=r.lucro;});
  const daysS=Object.keys(byDayS).sort();
  let cumS=0,peakVal=0,peakDate='';
  daysS.forEach(d=>{cumS+=byDayS[d];if(cumS>peakVal){peakVal=cumS;peakDate=d;}});
  let posStreak=0,posVal=0,negStreak=0,negVal=0;
  for(let i=daysS.length-1;i>=0;i--){if(byDayS[daysS[i]]>0){posStreak++;posVal+=byDayS[daysS[i]];}else break;}
  for(let i=daysS.length-1;i>=0;i--){if(byDayS[daysS[i]]<0){negStreak++;negVal+=byDayS[daysS[i]];}else break;}
  const pd=peakDate?peakDate.split('-'):[];
  const peakDateFmt=pd.length===3?`${pd[2]}/${pd[1]}/${pd[0].slice(2)}`:'-';
  const lastDayS=daysS[daysS.length-1];
  const isPosCurrent=posStreak>0&&!!lastDayS&&byDayS[lastDayS]>0;
  const isNegCurrent=negStreak>0&&!!lastDayS&&byDayS[lastDayS]<0;

  const body=document.getElementById('tipsterDrillBody');
  if(!body)return;

  // KPIs — 5 cards simétricos (1 row, repeat 5, font-xl para caber)
  const avgStake=rows.length?s/rows.length:0;
  const kS='display:flex;flex-direction:column;min-width:0;overflow:hidden';
  const sbS='margin-top:auto;padding-top:6px';
  const vS='font-size:var(--text-lg)';

  body.innerHTML=
    `<div class="analise-popup-section">`+
      `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;align-items:stretch;width:100%">`+
        `<div class="kpi" style="${kS}"><div class="kpi-label"><span class="kpi-pipe"></span>P/L</div><div class="kpi-val ${plCls}" style="${vS}">${fmtPL(pl)}</div><div class="kpi-sub" style="${sbS}">${rows.length.toLocaleString('pt-BR')} apostas</div></div>`+
        `<div class="kpi" style="${kS}"><div class="kpi-label"><span class="kpi-pipe"></span>ROI</div><div class="kpi-val ${roiCls}" style="${vS}">${(roi>=0?'+':'')+roi.toFixed(2)}%</div><div class="kpi-sub" style="${sbS}">Σ(P/L)/Σ(turnover)</div></div>`+
        `<div class="kpi" style="${kS}"><div class="kpi-label"><span class="kpi-pipe"></span>Stake Média</div><div class="kpi-val neu" style="${vS}">${fmtR(avgStake)}</div><div class="kpi-sub" style="${sbS}">por aposta</div></div>`+
        `<div class="kpi" style="${kS}"><div class="kpi-label"><span class="kpi-pipe"></span>Odd Média</div><div class="kpi-val neu" style="${vS}">${avgOdd.toFixed(2)}</div><div class="kpi-sub" style="${sbS}">ponderada</div></div>`+
        `<div class="kpi" style="${kS}"><div class="kpi-label"><span class="kpi-pipe"></span>Win Rate</div><div class="kpi-val neu" style="${vS}">${wr.toFixed(1)}%</div><div style="width:100%;height:5px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden;margin-top:6px"><div style="height:100%;background:var(--accent-2);border-radius:3px;width:${Math.min(100,Math.max(0,wr)).toFixed(1)}%"></div></div><div class="kpi-sub" style="${sbS}">taxa de acerto</div></div>`+
      `</div>`+
    `</div>`+
    `<div class="analise-popup-section">`+
      `<div class="analise-popup-section-title">Resultado Geral</div>`+
      `<div class="chart-wrap" style="height:220px"><canvas id="tipsterDrillLine"></canvas></div>`+
    `</div>`+
    `<div class="analise-popup-section">`+
      `<div class="analise-popup-section-title" style="border-left:3px solid var(--accent);padding-left:8px">Sequências &amp; Topo Histórico</div>`+
      `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:.75rem">`+
        `<div class="kpi" style="display:flex;flex-direction:column;gap:4px">`+
          `<div class="kpi-label"><span class="kpi-pipe"></span>Sequência Positiva</div>`+
          `<div class="kpi-val ${isPosCurrent?'pos':'neu'}" style="font-size:var(--text-xl)">${isPosCurrent?posStreak:0} dias</div>`+
          `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:auto;padding-top:4px">`+
            `<span class="kpi-sub">melhor: ${posStreak} dias</span>`+
            `<span class="kpi-sub">${posStreak?fmtPL(posVal):fmtR(0)}</span>`+
          `</div>`+
        `</div>`+
        `<div class="kpi" style="display:flex;flex-direction:column;gap:4px">`+
          `<div class="kpi-label"><span class="kpi-pipe"></span>Drawdown Atual</div>`+
          `<div class="kpi-val ${isNegCurrent?'neg':'neu'}" style="font-size:var(--text-xl)">${isNegCurrent?negStreak:0} dias</div>`+
          `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:auto;padding-top:4px">`+
            `<span class="kpi-sub">pior: ${negStreak} dias</span>`+
            `<span class="kpi-sub">${negStreak?fmtPL(negVal):fmtR(0)}</span>`+
          `</div>`+
        `</div>`+
        `<div class="kpi" style="display:flex;flex-direction:column;gap:4px">`+
          `<div class="kpi-label"><span class="kpi-pipe"></span>Topo Histórico</div>`+
          `<div class="kpi-val pos">${fmtPL(peakVal)}</div>`+
          `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:auto;padding-top:4px">`+
            `<span class="kpi-sub">atingido em ${peakDateFmt}</span>`+
            `<span class="kpi-sub" style="color:var(--pos)">pico</span>`+
          `</div>`+
        `</div>`+
        `<div class="kpi" style="display:flex;flex-direction:column;gap:4px">`+
          `<div class="kpi-label"><span class="kpi-pipe"></span>Distância do Topo</div>`+
          `<div class="kpi-val ${cumS<peakVal?'neg':'pos'}">${cumS<peakVal?fmtPL(cumS-peakVal):fmtPL(0)}</div>`+
          `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:auto;padding-top:4px">`+
            `<span class="kpi-sub">do pico · ${peakDateFmt}</span>`+
            `<span class="kpi-sub" style="${cumS<peakVal?'color:var(--neg)':''}">${peakVal>0?(((cumS-peakVal)/peakVal*100).toFixed(1)+'%'):'—'}</span>`+
          `</div>`+
        `</div>`+
      `</div>`+
    `</div>`+
    `<div class="analise-popup-section">`+
      `<div class="analise-popup-section-title">Análise Mensal</div>`+
      `<div class="tbl-wrap drill-tbl"><table class="tbl"><thead><tr><th style="text-align:left">Mês</th><th>Bets</th><th>P/L</th><th>Turnover</th><th>ROI</th><th>Win Rate%</th><th>Stake Média</th><th>Odd Média Pond.</th></tr></thead><tbody>${_tipMonthTbody(rows)}</tbody></table></div>`+
    `</div>`+
    `<div class="analise-popup-section">`+
      `<div class="analise-popup-section-title">Por Casa</div>`+
      `<div class="tbl-wrap drill-tbl">${_tipBreakdownTbl(rows,'casa',casaCell)}</div>`+
    `</div>`+
    `<div class="analise-popup-section">`+
      `<div class="analise-popup-section-title">Por Esporte</div>`+
      `<div class="tbl-wrap drill-tbl">${_tipBreakdownTbl(rows,'esporte',sportCell)}</div>`+
    `</div>`;

  // Gráfico Resultado Geral — clone do renderBankroll, scoped ao tipster
  const byDayCh={};rows.forEach(r=>{const k=r.data.slice(0,10);byDayCh[k]=(byDayCh[k]||0)+r.lucro;});
  const daysCh=Object.keys(byDayCh).sort();
  if(daysCh.length>=2){
    const dpL=daysCh.map(k=>byDayCh[k]);
    let cum=0;const cumPLCh=dpL.map(v=>{cum+=v;return parseFloat(cum.toFixed(2));});
    const labelStep=Math.max(1,Math.floor(daysCh.length/14));
    const lbl=daysCh.map((d,i)=>{if(i%labelStep!==0&&i!==daysCh.length-1)return'';const p=d.split('-');return p[2]+'/'+p[1];});
    const ptR=cumPLCh.map((_,i)=>i===cumPLCh.length-1?5:0);
    mkChart('tipsterDrillLine',{type:'bar',data:{labels:lbl,datasets:[
      {type:'line',data:cumPLCh,
       borderColor:'#2E8BFF',
       backgroundColor:(ctx)=>{const c=ctx.chart,{ctx:cx,chartArea:ca}=c;if(!ca)return'rgba(46,139,255,0)';const g=cx.createLinearGradient(0,ca.top,0,ca.bottom);g.addColorStop(0,'rgba(46,139,255,.16)');g.addColorStop(1,'rgba(46,139,255,0)');return g;},
       tension:.4,fill:true,borderWidth:2,
       pointRadius:ptR,pointBackgroundColor:'#2E8BFF',pointBorderColor:isDark()?'#12161D':'#ffffff',pointBorderWidth:2,
       yAxisID:'y1',label:'P/L acumulado'},
      {type:'bar',data:dpL,
       backgroundColor:dpL.map(v=>v>=0?'rgba(43,192,126,.55)':'rgba(229,82,75,.55)'),
       hoverBackgroundColor:dpL.map(v=>v>=0?'rgba(43,192,126,.8)':'rgba(229,82,75,.8)'),
       borderRadius:1,yAxisID:'y',label:'P/L diário',barPercentage:0.9,categoryPercentage:1.0}
    ]},options:{responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:true,position:'bottom',align:'center',
          labels:{color:isDark()?'#AEB7C2':'#666E7A',font:{family:'JetBrains Mono, monospace',size:11},boxWidth:12,padding:16,
            generateLabels:()=>{const lc=isDark()?'#AEB7C2':'#666E7A';return[
              {text:'P/L acumulado',strokeStyle:'#2E8BFF',fillStyle:'#2E8BFF',lineWidth:2,pointStyle:'line',hidden:false,datasetIndex:0,fontColor:lc},
              {text:'Dia positivo',strokeStyle:'rgba(43,192,126,.8)',fillStyle:'rgba(43,192,126,.8)',lineWidth:0,pointStyle:'rect',hidden:false,datasetIndex:1,fontColor:lc},
              {text:'Dia negativo',strokeStyle:'rgba(229,82,75,.8)',fillStyle:'rgba(229,82,75,.8)',lineWidth:0,pointStyle:'rect',hidden:false,datasetIndex:1,fontColor:lc}
            ];}}},
        tooltip:{callbacks:{label:ctx=>(ctx.dataset.label||'')+': '+fmtK(ctx.raw),title:ctx=>{const i=ctx[0].dataIndex;return daysCh[i]?.split('-').reverse().join('/')||'';},}}},
      scales:{
        x:{display:false},
        y:{ticks:{color:tc(),font:{size:10},callback:v=>fmtK(v)},grid:{color:gc()},border:{display:false},position:'left'},
        y1:{ticks:{color:tc(),font:{size:10},callback:v=>fmtK(v)},grid:{display:false},border:{display:false},position:'right'}
      }}});
  }
}

function openTipsterDrill(nome){
  const overlay=document.getElementById('tipsterDrillOverlay');
  if(!overlay)return;
  const nameEl=document.getElementById('tipsterDrillName');
  if(nameEl)nameEl.textContent=nome;

  // Base: respeita esporte/casa mas ignora período global
  const sp=msGet('sp_tipsters'),ca=msGet('ca_tipsters');
  _drillBaseName=nome;
  _drillBaseRows=DADOS.filter(r=>{
    if(r.tipster!==nome)return false;
    if(sp.size>0&&!sp.has(r.esporte))return false;
    if(ca.size>0&&!ca.has(r.casa))return false;
    return true;
  });
  _drillPeriodSt={qd:0,qt:''};
  _updateDrillChips();

  overlay.style.display='flex';
  document.body.style.overflow='hidden';
  const modal=document.getElementById('tipsterDrillModal');
  if(modal)modal.scrollTop=0;

  renderTipsterDrill(_sliceDrillRows());

  if(_drillEscHandler)document.removeEventListener('keydown',_drillEscHandler);
  _drillEscHandler=function(e){if(e.key==='Escape')closeTipsterDrill();};
  document.addEventListener('keydown',_drillEscHandler);
}
window.openTipsterDrill=openTipsterDrill;

window.setDrillQuick=function(days){_drillPeriodSt={qd:days,qt:''};_updateDrillChips();renderTipsterDrill(_sliceDrillRows());};
window.setDrillType=function(qt){_drillPeriodSt={qd:0,qt:qt};_updateDrillChips();renderTipsterDrill(_sliceDrillRows());};
window.setDrillAll=function(){_drillPeriodSt={qd:0,qt:''};_updateDrillChips();renderTipsterDrill(_sliceDrillRows());};

function closeTipsterDrill(e){
  if(e&&e.target!==document.getElementById('tipsterDrillOverlay'))return;
  const overlay=document.getElementById('tipsterDrillOverlay');
  if(overlay)overlay.style.display='none';
  document.body.style.overflow='';
  if(_drillEscHandler){document.removeEventListener('keydown',_drillEscHandler);_drillEscHandler=null;}
}
window.closeTipsterDrill=closeTipsterDrill;

// Renderiza emoji em canvas 24×24 e retorna data URL grayscale
async function _emojiToGrayDataUrl(emoji){
  const s=24,c=document.createElement('canvas');
  c.width=c.height=s;
  const cx=c.getContext('2d');
  cx.font=`${Math.round(s*0.72)}px serif`;
  cx.textAlign='center';cx.textBaseline='middle';
  cx.fillText(emoji,s/2,s/2);
  const id=cx.getImageData(0,0,s,s),d=id.data;
  for(let i=0;i<d.length;i+=4){const g=Math.round(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]);d[i]=d[i+1]=d[i+2]=g;}
  cx.putImageData(id,0,0);
  return c.toDataURL('image/png');
}

// Prepara o modal para captura com html2canvas; retorna {canvas} ou {canvas:null} em erro
async function _buildDrillCanvas(modal){
  const logoEl=modal.querySelector('.drill-brand-logo');
  let origLogoSrc=null;
  if(logoEl){
    origLogoSrc=logoEl.getAttribute('src');
    try{const r=await fetch(origLogoSrc);const svg=await r.text();logoEl.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)));}catch(e){}
  }
  // Casas: converte favicons para blob URLs same-origin (html2canvas não lê cross-origin sem CORS)
  const houseChips=[...modal.querySelectorAll('.house-chip')];
  const _houseRestoreData=[];
  for(const span of houseChips){
    const img=span.querySelector('img');
    const casaNome=span.dataset.casa||(img?.getAttribute('alt')||'');
    const origSrc=img?img.getAttribute('src'):(casaNome&&_houseDomain(casaNome)?favicon(_houseDomain(casaNome)):'');
    let blobUrl=null;
    if(origSrc){try{const r=await fetch(origSrc,{mode:'no-cors'});const blob=await r.blob();if(blob.size>0)blobUrl=URL.createObjectURL(blob);}catch(e){}}
    if(blobUrl){
      if(img){img.src=blobUrl;_houseRestoreData.push({img,origSrc,blobUrl,tempImg:false,initEl:null,restoredChipInit:null});}
      else{const chipInit=span.querySelector('.chip-initial');if(chipInit)chipInit.style.display='none';const newImg=document.createElement('img');newImg.style.cssText='width:18px;height:18px;border-radius:3px;display:block';newImg.src=blobUrl;span.insertBefore(newImg,span.firstChild);_houseRestoreData.push({img:newImg,origSrc:null,blobUrl,tempImg:true,initEl:null,restoredChipInit:chipInit||null});}
    }else if(img){
      img.style.display='none';
      const init=span.dataset.initial||(img.getAttribute('alt')?.[0]?.toUpperCase()??'?');
      const initEl=Object.assign(document.createElement('span'),{textContent:init,className:'chip-initial'});
      span.appendChild(initEl);
      _houseRestoreData.push({img,origSrc,blobUrl:null,tempImg:false,initEl,restoredChipInit:null});
    }else{_houseRestoreData.push({img:null,origSrc:null,blobUrl:null,tempImg:false,initEl:null,restoredChipInit:null});}
  }
  // Esportes: html2canvas não suporta CSS filter em emoji — converte via canvas grayscale
  const spChips=[...modal.querySelectorAll('.sp-chip')];
  const _spRestoreData=[];
  for(const el of spChips){
    const emoji=el.textContent.trim();
    const dataUrl=await _emojiToGrayDataUrl(emoji);
    const origHTML=el.innerHTML;
    const origStyle=el.getAttribute('style');
    const img=Object.assign(document.createElement('img'),{src:dataUrl});
    img.style.cssText='width:14px;height:14px;display:block';
    el.innerHTML='';el.appendChild(img);
    el.style.removeProperty('filter');
    _spRestoreData.push({el,origHTML,origStyle});
  }
  const prevMaxH=modal.style.maxHeight;modal.style.maxHeight='none';
  const prevOv=modal.style.overflowY;modal.style.overflowY='visible';
  const _restore=()=>{
    modal.style.maxHeight=prevMaxH;modal.style.overflowY=prevOv;
    if(logoEl&&origLogoSrc)logoEl.src=origLogoSrc;
    _houseRestoreData.forEach(({img,origSrc,blobUrl,tempImg,initEl,restoredChipInit})=>{if(tempImg&&img)img.remove();if(restoredChipInit)restoredChipInit.style.display='';if(!tempImg&&img&&origSrc)img.src=origSrc;if(!tempImg&&img)img.style.display='';if(initEl)initEl.remove();if(blobUrl)URL.revokeObjectURL(blobUrl);});
    _spRestoreData.forEach(({el,origHTML,origStyle})=>{el.innerHTML=origHTML;if(origStyle!==null)el.setAttribute('style',origStyle);else el.removeAttribute('style');});
  };
  try{
    const canvas=await html2canvas(modal,{scale:2,useCORS:true,
      ignoreElements:el=>el.classList&&el.classList.contains('no-export')});
    _restore();
    return{canvas};
  }catch(e){
    _restore();
    console.error('_buildDrillCanvas error:',e);
    return{canvas:null};
  }
}

function _waitH2C(ms=8000){
  if(typeof html2canvas!=='undefined')return Promise.resolve(true);
  return new Promise(r=>{const t=Date.now();const c=()=>{if(typeof html2canvas!=='undefined')r(true);else if(Date.now()-t<ms)setTimeout(c,150);else r(false);};setTimeout(c,150);});
}

window.copyDrill=async function(){
  const modal=document.getElementById('tipsterDrillModal');
  if(!modal)return;
  const btn=modal.querySelector('.copy-drill-btn');
  const btnOrig=btn?btn.innerHTML:null;
  if(btn){btn.disabled=true;btn.innerHTML='…';}
  const ok=await _waitH2C();
  if(!ok){if(btn){btn.disabled=false;btn.innerHTML=btnOrig;}return;}
  const{canvas}=await _buildDrillCanvas(modal);
  if(!canvas){if(btn){btn.disabled=false;btn.innerHTML=btnOrig;}return;}
  canvas.toBlob(async blob=>{
    try{
      await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
      if(btn){btn.innerHTML='✓';setTimeout(()=>{btn.disabled=false;btn.innerHTML=btnOrig;},2000);}
    }catch(e){
      if(btn){btn.innerHTML='✗';setTimeout(()=>{btn.disabled=false;btn.innerHTML=btnOrig;},1500);}
      console.error('copyDrill clipboard error:',e);
    }
  },'image/png');
};

window.saveDrill=async function(){
  const modal=document.getElementById('tipsterDrillModal');
  if(!modal)return;
  const btn=modal.querySelector('.save-drill-btn');
  const btnOrig=btn?btn.innerHTML:null;
  if(btn){btn.disabled=true;btn.innerHTML='…';}
  const ok=await _waitH2C();
  if(!ok){if(btn){btn.disabled=false;btn.innerHTML=btnOrig;}return;}
  const{canvas}=await _buildDrillCanvas(modal);
  if(!canvas){if(btn){btn.disabled=false;btn.innerHTML=btnOrig;}return;}
  canvas.toBlob(blob=>{
    const url=URL.createObjectURL(blob);
    const a=Object.assign(document.createElement('a'),{href:url,download:'tipster-'+((_drillBaseName||'drill').replace(/\s+/g,'_'))+'.png'});
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
    if(btn){btn.innerHTML='✓';setTimeout(()=>{btn.disabled=false;btn.innerHTML=btnOrig;},2000);}
  },'image/png');
};

// ── Helpers extraídos para reuso no popup ───────────────────────────────────
function _tipMonthTbody(rows){
  const byM={};
  rows.forEach(r=>{const d=new Date(r.data+'T12:00:00'),k=`${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`;if(!byM[k])byM[k]={bets:0,pl:0,s:0,w:0,t:0,wt:0,stk:0,ano:d.getFullYear(),mes:d.getMonth()};byM[k].bets++;byM[k].pl+=r.lucro;byM[k].s+=r.stake;if(r.resultado!=='V'){byM[k].t++;if(['W','HW'].includes(r.resultado))byM[k].w++;}if(r.odd>0&&r.stake>0){byM[k].wt+=r.odd*r.stake;byM[k].stk+=r.stake;}});
  let totPL=0,totS=0,totB=0,totW=0,totT=0;
  const mHTML=Object.keys(byM).sort().map(k=>{
    const v=byM[k];const roi=v.s>0?(v.pl/v.s*100):0,wr=v.t>0?(v.w/v.t*100):0;
    const avgOdd=v.stk>0?v.wt/v.stk:0,avgStake=v.bets>0?v.s/v.bets:0;
    totPL+=v.pl;totS+=v.s;totB+=v.bets;totW+=v.w;totT+=v.t;
    const pc=v.pl>=0?'color:var(--green)':'color:var(--red)';
    const rc=roi>=0?'color:var(--green)':'color:var(--red)';
    return`<tr><td>${MESES[v.mes]} ${v.ano}</td><td>${v.bets}</td><td style="${pc}">${fmtPL(v.pl)}</td><td>${fmtR(v.s)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td class="td-num">${mkWRC(wr)}</td><td>${fmtR(avgStake)}</td><td>${avgOdd.toFixed(2)}</td></tr>`;
  }).join('');
  const tRoi=totS>0?(totPL/totS*100):0,tWr=totT>0?(totW/totT*100):0;
  const tc2=totPL>=0?'color:var(--green)':'color:var(--red)';const rc2=tRoi>=0?'color:var(--green)':'color:var(--red)';
  return mHTML+`<tr class="total-row"><td>Total</td><td>${totB}</td><td style="${tc2}">${fmtPL(totPL)}</td><td>${fmtR(totS)}</td><td style="${rc2}">${(tRoi>=0?'+':'')+tRoi.toFixed(2)}%</td><td class="td-num">${mkWRC(tWr)}</td><td>${totB>0?fmtR(totS/totB):'—'}</td><td>—</td></tr>`;
}

function _tipBreakdownTbl(rows,dimKey,labelFn){
  const map={};
  rows.forEach(r=>{
    const k=r[dimKey];if(!k)return;
    if(!map[k])map[k]={l:0,s:0,n:0,w:0,t:0,wt:0,stk:0};
    map[k].l+=r.lucro;map[k].s+=r.stake;map[k].n++;
    if(r.resultado!=='V'){map[k].t++;if(['W','HW'].includes(r.resultado))map[k].w++;}
    if(r.odd>0&&r.stake>0){map[k].wt+=r.odd*r.stake;map[k].stk+=r.stake;}
  });
  const ents=Object.entries(map).sort((a,b)=>b[1].l-a[1].l);
  if(!ents.length)return mkEmpty('Sem dados no período');
  const tRows=ents.map(([k,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0,wr=d.t>0?(d.w/d.t*100):0;
    const avgOdd=d.stk>0?d.wt/d.stk:0;
    const lc=d.l>=0?'color:var(--green)':'color:var(--red)';
    const rc=roi>=0?'color:var(--green)':'color:var(--red)';
    return`<tr><td>${labelFn(k)}</td><td style="text-align:right">${d.n}</td><td class="td-num">${mkWRC(wr)}</td><td style="text-align:right">${fmtR(d.s)}</td><td style="${lc};text-align:right">${fmtPL(d.l)}</td><td style="${rc};text-align:right">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td style="text-align:right">${avgOdd.toFixed(2)}</td></tr>`;
  }).join('');
  const th=dimKey==='casa'?'Casa':'Esporte';
  return`<table class="tbl"><thead><tr><th style="text-align:left">${th}</th><th>Bets</th><th>Win Rate%</th><th>Turnover</th><th>P/L</th><th>ROI</th><th>Odd Média Pond.</th></tr></thead><tbody>${tRows}</tbody></table>`;
}

// Tipsters
function renderTipsters(){
  const selT=msGet('tipsters');
  const baseRows=filtrarPagina('tipsters');
  const allT=[...new Set(DADOS.map(r=>r.tipster).filter(Boolean))].sort();
  const activeT=selT.size>0?[...selT]:allT;
  // Tipster KPI cards — .tcard design (T-1)
  {
    const tipMap={},tipDays={};
    baseRows.filter(r=>activeT.includes(r.tipster)).forEach(r=>{
      if(!tipMap[r.tipster])tipMap[r.tipster]={l:0,s:0,n:0,w:0,t:0,wt:0,stk:0};
      tipMap[r.tipster].l+=r.lucro;tipMap[r.tipster].s+=r.stake;tipMap[r.tipster].n++;
      if(r.resultado!=='V'){tipMap[r.tipster].t++;if(['W','HW'].includes(r.resultado))tipMap[r.tipster].w++;}
      if(r.odd>0&&r.stake>0){tipMap[r.tipster].wt+=r.odd*r.stake;tipMap[r.tipster].stk+=r.stake;}
      const dk=r.data.slice(0,10);
      if(!tipDays[r.tipster])tipDays[r.tipster]={};
      tipDays[r.tipster][dk]=(tipDays[r.tipster][dk]||0)+r.lucro;
    });
    _tipsterEnts=Object.entries(tipMap);
    _tipsterDays=tipDays;
    _tipsterAllDays=[...new Set(baseRows.map(r=>r.data.slice(0,10)))].sort();
    // T-5: Portfolio KPIs
    {
      const kpiRows=baseRows.filter(r=>activeT.includes(r.tipster));
      const portPL=kpiRows.reduce((a,r)=>a+r.lucro,0);
      const portROI=calcROI(kpiRows);
      const portStake=kpiRows.reduce((a,r)=>a+r.stake,0);
      const portN=kpiRows.length;
      const posCount=_tipsterEnts.filter(([,d])=>d.l>0).length;
      const negCount=_tipsterEnts.filter(([,d])=>d.l<0).length;
      const totalT=_tipsterEnts.length;
      // Sparkline acumulado diário do conjunto
      const portDayMap={};
      kpiRows.forEach(r=>{const dk=r.data.slice(0,10);portDayMap[dk]=(portDayMap[dk]||0)+r.lucro;});
      const portDays=Object.keys(portDayMap).sort();
      let pCum=0;const portVals=portDays.map(d=>{pCum+=portDayMap[d];return parseFloat(pCum.toFixed(2));});
      const portSpark=portVals.length>=2?mkSparkline(portVals,96,26):'';
      const plCls=portPL>=0?'pos':'neg';
      const roiCls=portROI>=0?'pos':'neg';
      const roiStr=(portROI>=0?'+':'')+portROI.toFixed(2)+'%';
      const el=document.getElementById('tipsterPortfolioKPIs');
      if(el){
        el.innerHTML=
          `<div class="kpi" style="position:relative">`+
            `<div class="kpi-label"><span class="kpi-pipe"></span> P/L Carteira</div>`+
            `<div class="kpi-val ${plCls}">${fmtPL(portPL)}</div>`+
            `<div class="kpi-sub">resultado do conjunto</div>`+
            (portSpark?`<div class="kpi-sparkline">${portSpark}</div>`:'')+
          `</div>`+
          `<div class="kpi">`+
            `<div class="kpi-label"><span class="kpi-pipe"></span> ROI Ponderado</div>`+
            `<div class="kpi-val ${roiCls}">${roiStr}</div>`+
            `<div class="kpi-sub">Σ(P/L) / Σ(turnover)</div>`+
          `</div>`+
          `<div class="kpi">`+
            `<div class="kpi-label"><span class="kpi-pipe"></span> Tipsters Positivos</div>`+
            `<div class="kpi-val neu">${posCount} / ${totalT}</div>`+
            `<div class="kpi-sub">▲ ${posCount} · ▼ ${negCount} no vermelho</div>`+
          `</div>`+
          `<div class="kpi">`+
            `<div class="kpi-label"><span class="kpi-pipe"></span> Turnover Total</div>`+
            `<div class="kpi-val neu">${fmtR(portStake)}</div>`+
            `<div class="kpi-sub">${portN.toLocaleString('pt-BR')} apostas</div>`+
          `</div>`;
      }
    }
    _renderTipCards();
  }

  // Comparison chart
  const byTDay={};activeT.forEach(t=>{byTDay[t]={};});
  baseRows.filter(r=>activeT.includes(r.tipster)).forEach(r=>{if(!byTDay[r.tipster])byTDay[r.tipster]={};const k=r.data.slice(0,10);if(!byTDay[r.tipster][k])byTDay[r.tipster][k]=0;byTDay[r.tipster][k]+=r.lucro;});
  const allDays=[...new Set(baseRows.map(r=>r.data.slice(0,10)))].sort();
  const step=Math.max(1,Math.floor(allDays.length/20));
  const lbl=allDays.filter((_,i)=>i%step===0||i===allDays.length-1).map(d=>{const p=d.split('-');return p[2]+'/'+p[1];});
  const datasets=activeT.slice(0,15).map((t,i)=>{let cum=0;const data=allDays.map(d=>{cum+=byTDay[t]?.[d]||0;return parseFloat(cum.toFixed(2));}).filter((_,i)=>i%step===0||i===allDays.length-1);return{label:t,data,borderColor:TC_COLORS[i%TC_COLORS.length],backgroundColor:(ctx)=>{const c=ctx.chart,{ctx:cx,chartArea:ca}=c;if(!ca)return'rgba(46,139,255,0)';const g=cx.createLinearGradient(0,ca.top,0,ca.bottom);g.addColorStop(0,'rgba(46,139,255,.16)');g.addColorStop(1,'rgba(46,139,255,0)');return g;},fill:true,tension:.4,pointRadius:0,borderWidth:2};});
  mkChart('chartTipsterLines',{type:'line',data:{labels:lbl,datasets},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:true,position:'top',labels:{color:tc(),font:{size:10},boxWidth:10,padding:12}}},scales:{x:{ticks:{color:tc(),font:{size:10},maxRotation:0,autoSkip:true,maxTicksLimit:10},grid:{display:false},border:{display:false}},y:{ticks:{color:tc(),font:{size:10},callback:v=>'R$'+Math.round(v)},grid:{color:gc()},border:{display:false}}}}});

  // ── Resultados por Tipster (stacked horizontal) ──
  const tipsterMap={};
  baseRows.filter(r=>activeT.includes(r.tipster)).forEach(r=>{
    if(!tipsterMap[r.tipster])tipsterMap[r.tipster]={W:0,HW:0,L:0,HL:0,V:0};
    tipsterMap[r.tipster][r.resultado]=(tipsterMap[r.tipster][r.resultado]||0)+1;
  });
  const tipEnts=Object.entries(tipsterMap).sort((a,b)=>(b[1].W+b[1].HW)-(a[1].W+a[1].HW));
  const tipLabels=tipEnts.map(e=>e[0]);
  const resH=Math.max(180,tipEnts.length*36+60);
  const wrap=document.getElementById('chartTipsterResultsWrap');
  if(wrap)wrap.style.height=resH+'px';
  mkChart('chartTipsterResults',{type:'bar',data:{labels:tipLabels,datasets:[
    {label:'W',data:tipEnts.map(e=>e[1].W||0),backgroundColor:'rgba(0,214,143,.8)',borderRadius:2,stack:'s'},
    {label:'HW',data:tipEnts.map(e=>e[1].HW||0),backgroundColor:'rgba(52,211,153,.7)',borderRadius:2,stack:'s'},
    {label:'HL',data:tipEnts.map(e=>e[1].HL||0),backgroundColor:'rgba(248,113,113,.7)',borderRadius:2,stack:'s'},
    {label:'L',data:tipEnts.map(e=>e[1].L||0),backgroundColor:'rgba(240,80,110,.8)',borderRadius:2,stack:'s'},
    {label:'V',data:tipEnts.map(e=>e[1].V||0),backgroundColor:'rgba(128,128,160,.4)',borderRadius:2,stack:'s'},
  ]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:true,position:'top',labels:{color:tc(),font:{size:11},boxWidth:12,padding:12}},
      tooltip:{callbacks:{label:ctx=>ctx.dataset.label+': '+ctx.raw}}},
    scales:{
      x:{stacked:true,ticks:{color:tc(),font:{size:10}},grid:{color:gc()},border:{display:false}},
      y:{stacked:true,ticks:{color:tc(),font:{size:12,weight:'600'}},grid:{display:false},border:{display:false}}
    }}});
  // Comparison table
  const map={};
  baseRows.filter(r=>activeT.includes(r.tipster)).forEach(r=>{if(!map[r.tipster])map[r.tipster]={l:0,s:0,n:0,w:0,t:0,wt:0,stk:0};map[r.tipster].l+=r.lucro;map[r.tipster].s+=r.stake;map[r.tipster].n++;if(r.resultado!=='V'){map[r.tipster].t++;if(['W','HW'].includes(r.resultado))map[r.tipster].w++;}if(r.odd>0&&r.stake>0){map[r.tipster].wt+=r.odd*r.stake;map[r.tipster].stk+=r.stake;}});
  const ents=Object.entries(map).sort((a,b)=>b[1].l-a[1].l);
  const compRows=ents.map(([t,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0,wr=d.t>0?(d.w/d.t*100):0;
    const avgOdd=d.stk>0?d.wt/d.stk:0,avgStake=d.n>0?d.s/d.n:0;
    const lc=d.l>=0?'color:var(--green)':'color:var(--red)';
    const rc=roi>=0?'color:var(--green)':'color:var(--red)';
    return`<tr><td style="font-weight:700;color:var(--text)">${t}</td><td>${d.n}</td><td class="td-num">${mkWRC(wr)}</td><td>${fmtR(d.s)}</td><td style="${lc}">${fmtPL(d.l)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td>${avgOdd.toFixed(2)}</td><td>${fmtR(avgStake)}</td></tr>`;
  }).join('');
  document.getElementById('tipsterCompTable').innerHTML=`<table class="tbl" id="tblTipComp"><thead><tr><th>Tipster<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Win Rate%<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>P/L<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>Odd Média Pond.<span class="sort-icon"></span></th><th>Stake Média<span class="sort-icon"></span></th></tr></thead><tbody>${compRows}</tbody></table>`;
  setTimeout(()=>makeSortable('tblTipComp',[1,3,4,5,6,7]),100);

  // ── Tabela Tipsters × Casa ──
  const casaMap={};
  baseRows.filter(r=>activeT.includes(r.tipster)&&r.casa).forEach(r=>{
    const key=r.tipster+'||'+r.casa;
    if(!casaMap[key])casaMap[key]={tipster:r.tipster,casa:r.casa,l:0,s:0,n:0,w:0,t:0,wt:0,stk:0};
    casaMap[key].l+=r.lucro;casaMap[key].s+=r.stake;casaMap[key].n++;
    if(r.resultado!=='V'){casaMap[key].t++;if(['W','HW'].includes(r.resultado))casaMap[key].w++;}
    if(r.odd>0&&r.stake>0){casaMap[key].wt+=r.odd*r.stake;casaMap[key].stk+=r.stake;}
  });
  const casaRows2=Object.values(casaMap).sort((a,b)=>b.l-a.l).map(d=>{
    const roi=d.s>0?(d.l/d.s*100):0,wr=d.t>0?(d.w/d.t*100):0;
    const avgOdd=d.stk>0?d.wt/d.stk:0;
    const lc=d.l>=0?'color:var(--green)':'color:var(--red)';
    const rc=roi>=0?'color:var(--green)':'color:var(--red)';
    return`<tr><td style="font-weight:700;color:var(--text)">${d.tipster}</td><td>${casaCell(d.casa)}</td><td>${d.n}</td><td class="td-num">${mkWRC(wr)}</td><td>${fmtR(d.s)}</td><td style="${lc}">${fmtPL(d.l)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td>${avgOdd.toFixed(2)}</td></tr>`;
  }).join('');
  document.getElementById('tipsterCasaTable').innerHTML=`<table class="tbl" id="tblTipCasa"><thead><tr><th>Tipster<span class="sort-icon"></span></th><th>Casa<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Win Rate%<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>P/L<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>Odd Média Pond.<span class="sort-icon"></span></th></tr></thead><tbody>${casaRows2}</tbody></table>`;
  setTimeout(()=>makeSortable('tblTipCasa',[2,4,5,6,7]),100);
  const singleT=selT.size===1?[...selT][0]:'all';
  const trows=singleT==='all'?baseRows:baseRows.filter(r=>r.tipster===singleT);
  document.querySelector('#tipsterMonthTable tbody').innerHTML=_tipMonthTbody(trows);
  setTimeout(()=>makeSortable('tipsterMonthTable',[1,2,3,4,5,6,7]),100);
}

// ── Resultados por Casa ──
function renderResultadosCasa(){
  const rows=filtrarPagina('resultados_casa');
  const byC={};
  rows.forEach(r=>{
    if(!r.casa)return;
    if(!byC[r.casa])byC[r.casa]={l:0,s:0,n:0,w:0,hw:0,l2:0,hl:0,v:0,t:0,wt:0,stk:0};
    const d=byC[r.casa];d.l+=r.lucro;d.s+=r.stake;d.n++;
    if(r.resultado==='W')d.w++;else if(r.resultado==='HW')d.hw++;
    else if(r.resultado==='L')d.l2++;else if(r.resultado==='HL')d.hl++;
    else if(r.resultado==='V')d.v++;
    if(r.resultado!=='V')d.t++;
    if(r.odd>0&&r.stake>0){d.wt+=r.odd*r.stake;d.stk+=r.stake;}
  });
  const ents=Object.entries(byC).sort((a,b)=>b[1].l-a[1].l);
  // KPI total
  const totPL=rows.reduce((a,r)=>a+r.lucro,0);
  const totS=rows.reduce((a,r)=>a+r.stake,0);
  const totROI=totS>0?(totPL/totS*100):0;
  const totW=ents.reduce((a,[,d])=>a+d.w+d.hw,0),totT=ents.reduce((a,[,d])=>a+d.t,0);
  const totWR=totT>0?(totW/totT*100):0;
  const kpiEl=document.getElementById('resultadosCasaKPI');
  if(kpiEl)kpiEl.innerHTML=[
    {l:'P/L Total',v:fmtPL(totPL),c:totPL>=0?'pos':'neg',s:'Turnover: '+fmtR(totS)},
    {l:'ROI',v:(totROI>=0?'+':'')+totROI.toFixed(2)+'%',c:totROI>=0?'pos':'neg',s:rows.length+' apostas'},
    {l:'Win Rate',v:totWR.toFixed(1)+'%',c:'neu',s:`${ents.length} casas`,bar:totWR},
    {l:'Odd Média Pond.',v:calcAvgOdd(rows).toFixed(2),c:'neu',s:'Σ(odd×stake)/Σ(stake)'},
  ].map(k=>`<div class="kpi"><div class="kpi-label">${k.l}</div><div class="kpi-val ${k.c}">${k.v}</div>${k.bar!==undefined?`<div class="wrc"><div class="t"><div class="f" style="width:${Math.min(100,Math.max(0,k.bar)).toFixed(1)}%"></div></div></div>`:''}<div class="kpi-sub">${k.s}</div></div>`).join('');
  // Gráfico barras ROI por casa
  const vals=ents.map(([,d])=>d.s>0?parseFloat((d.l/d.s*100).toFixed(2)):0);
  const maxAbs=Math.max(...vals.map(Math.abs),1);
  const barRows=ents.map(([c,d],i)=>{
    const v=vals[i];const barW=Math.abs(v)/maxAbs*48;
    const color=v>=0?'var(--green)':'var(--red)';const lc=v>=0?'color:var(--green)':'color:var(--red)';
    const wr=d.t>0?((d.w+d.hw)/d.t*100):0;
    return`<div style="display:grid;grid-template-columns:160px 1fr 120px;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:12px;font-weight:600;color:var(--text)">${casaCell(c)}</div>
      <div style="position:relative;height:14px;background:var(--bg5);border-radius:3px;overflow:hidden">
        <div style="position:absolute;left:50%;top:0;height:100%;width:1px;background:var(--border2);z-index:1"></div>
        <div style="position:absolute;${v>=0?'left:50%':'right:'+((100-barW)/2)+'%'};width:${barW}%;height:100%;background:${color};border-radius:3px;opacity:.8"></div>
      </div>
      <div style="text-align:right;font-size:11px;font-family:'JetBrains Mono',monospace;white-space:nowrap;${lc}"><span style="display:inline-block;min-width:64px;text-align:right">${(v>=0?'+':'')+v.toFixed(2)}%</span><span style="display:inline-block;min-width:52px;text-align:right;color:var(--text3);font-size:10px">(${d.n})</span></div>
    </div>`;
  }).join('');
  const barEl=document.getElementById('resultadosCasaBars');
  if(barEl)barEl.innerHTML=barRows||mkEmpty('Sem dados para este período');
  // Tabela detalhada
  const tblRows=ents.map(([c,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0,wr=d.t>0?((d.w+d.hw)/d.t*100):0;
    const avgOdd=d.stk>0?d.wt/d.stk:0;
    const lc=d.l>=0?'color:var(--green)':'color:var(--red)';const rc=roi>=0?'color:var(--green)':'color:var(--red)';
    return`<tr><td style="font-weight:600">${casaCell(c)}</td><td>${d.n}</td><td><span style="color:var(--green)">W:${d.w}</span> <span style="color:var(--hw)">HW:${d.hw}</span> <span style="color:var(--hl)">HL:${d.hl}</span> <span style="color:var(--red)">L:${d.l2}</span> <span style="color:var(--text3)">V:${d.v}</span></td><td class="td-num">${mkWRC(wr)}</td><td>${fmtR(d.s)}</td><td style="${lc};font-weight:600">${fmtPL(d.l)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td>${avgOdd.toFixed(2)}</td></tr>`;
  }).join('');
  const tblEl=document.getElementById('resultadosCasaTable');
  if(tblEl)tblEl.innerHTML=`<table class="tbl" id="tblResCasa"><thead><tr><th>Casa<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Resultados</th><th>Win Rate%<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>P/L<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>Odd Média Pond.<span class="sort-icon"></span></th></tr></thead><tbody>${tblRows}</tbody></table>`;
  setTimeout(()=>makeSortable('tblResCasa',[1,3,4,5,6,7]),100);
}
