// ── performance.js — Esportes, Casas, Tipsters, Resultados por Casa ──────────────

function renderSport(rows){
  const map={};rows.forEach(r=>{if(!map[r.esporte])map[r.esporte]={l:0,s:0,n:0,w:0,t:0};map[r.esporte].l+=r.lucro;map[r.esporte].s+=r.stake;map[r.esporte].n++;if(r.resultado!=='V'){map[r.esporte].t++;if(['W','HW'].includes(r.resultado))map[r.esporte].w++;}});
  const ents=Object.entries(map).filter(e=>e[0]&&e[0]!=='undefined').sort((a,b)=>b[1].l-a[1].l);

  // KPI cards sorted by turnover, 6/row
  const entsByTurnover = [...ents].sort((a,b)=>b[1].s-a[1].s);
  const sportCards = entsByTurnover.map(([sport,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0;
    const wr=d.t>0?(d.w/d.t*100):0;
    const iconHtml=`<span class="sport-emoji" style="font-size:16px">${sportEmoji(sport)}</span>`;
    return mkOneStatCard(iconHtml, sport, d.l, roi, d.s, d.n, wr);
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
    const iconSrc=CASA_ICONS[casa]||'';
    const iconHtml=iconSrc
      ? `<img src="${iconSrc}" style="width:18px;height:18px;border-radius:3px;object-fit:contain;flex-shrink:0" onerror="this.style.display='none'">`
      : `<span style="width:18px;height:18px;background:var(--bg5);border-radius:3px;display:inline-block;flex-shrink:0"></span>`;
    const wr=d.t>0?(d.w/d.t*100):0;
    return mkOneStatCard(iconHtml, casa, d.l, roi, d.s, d.n, wr);
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

// Tipsters
function renderTipsters(){
  const selT=msGet('tipsters');
  const baseRows=filtrarPagina('tipsters');
  const allT=[...new Set(DADOS.map(r=>r.tipster).filter(Boolean))].sort();
  const activeT=selT.size>0?[...selT]:allT;
  // Tipster KPI cards (sorted by turnover, 6/row)
  {
    const tipMap={};
    baseRows.filter(r=>activeT.includes(r.tipster)).forEach(r=>{
      if(!tipMap[r.tipster])tipMap[r.tipster]={l:0,s:0,n:0,w:0,t:0,wt:0,stk:0};
      tipMap[r.tipster].l+=r.lucro;tipMap[r.tipster].s+=r.stake;tipMap[r.tipster].n++;
      if(r.resultado!=='V'){tipMap[r.tipster].t++;if(['W','HW'].includes(r.resultado))tipMap[r.tipster].w++;}
      if(r.odd>0&&r.stake>0){tipMap[r.tipster].wt+=r.odd*r.stake;tipMap[r.tipster].stk+=r.stake;}
    });
    const tipEntsK=Object.entries(tipMap).sort((a,b)=>b[1].s-a[1].s);
    const tipCards=tipEntsK.map(([t,d])=>{
      const roi=d.s>0?(d.l/d.s*100):0;
      const wr=d.t>0?(d.w/d.t*100):0;
      const initials=t.split(/\s+/).map(w=>w[0]).join('').toUpperCase().slice(0,2);
      const hue=Math.abs(t.split('').reduce((a,c)=>a+c.charCodeAt(0),0))%360;
      const iconHtml=`<div style="width:20px;height:20px;border-radius:50%;background:hsl(${hue},55%,38%);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff;flex-shrink:0">${initials}</div>`;
      return mkOneStatCard(iconHtml, t, d.l, roi, d.s, d.n, wr);
    });
    mkStatCards(tipCards, 'tipsterKpiCards');
  }

  // Comparison chart
  const byTDay={};activeT.forEach(t=>{byTDay[t]={};});
  baseRows.filter(r=>activeT.includes(r.tipster)).forEach(r=>{if(!byTDay[r.tipster])byTDay[r.tipster]={};const k=r.data.slice(0,10);if(!byTDay[r.tipster][k])byTDay[r.tipster][k]=0;byTDay[r.tipster][k]+=r.lucro;});
  const allDays=[...new Set(baseRows.map(r=>r.data.slice(0,10)))].sort();
  const step=Math.max(1,Math.floor(allDays.length/20));
  const lbl=allDays.filter((_,i)=>i%step===0||i===allDays.length-1).map(d=>{const p=d.split('-');return p[2]+'/'+p[1];});
  const datasets=activeT.slice(0,15).map((t,i)=>{let cum=0;const data=allDays.map(d=>{cum+=byTDay[t]?.[d]||0;return parseFloat(cum.toFixed(2));}).filter((_,i)=>i%step===0||i===allDays.length-1);return{label:t,data,borderColor:TC_COLORS[i%TC_COLORS.length],backgroundColor:'transparent',tension:.4,pointRadius:0,borderWidth:2};});
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
  document.getElementById('tipsterCompTable').innerHTML=`<table class="tbl" id="tblTipComp"><thead><tr><th>Tipster<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Win Rate%<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>Profit<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>Odd Média Pond.<span class="sort-icon"></span></th><th>Stake Média<span class="sort-icon"></span></th></tr></thead><tbody>${compRows}</tbody></table>`;
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
  document.getElementById('tipsterCasaTable').innerHTML=`<table class="tbl" id="tblTipCasa"><thead><tr><th>Tipster<span class="sort-icon"></span></th><th>Casa<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Win Rate%<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>Profit<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>Odd Média Pond.<span class="sort-icon"></span></th></tr></thead><tbody>${casaRows2}</tbody></table>`;
  setTimeout(()=>makeSortable('tblTipCasa',[2,4,5,6,7]),100);
  const singleT=selT.size===1?[...selT][0]:'all';
  const trows=singleT==='all'?baseRows:baseRows.filter(r=>r.tipster===singleT);
  const byM={};
  trows.forEach(r=>{const d=new Date(r.data+'T12:00:00'),k=`${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`;if(!byM[k])byM[k]={bets:0,pl:0,s:0,w:0,t:0,wt:0,stk:0,ano:d.getFullYear(),mes:d.getMonth()};byM[k].bets++;byM[k].pl+=r.lucro;byM[k].s+=r.stake;if(r.resultado!=='V'){byM[k].t++;if(['W','HW'].includes(r.resultado))byM[k].w++;}if(r.odd>0&&r.stake>0){byM[k].wt+=r.odd*r.stake;byM[k].stk+=r.stake;}});
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
  document.querySelector('#tipsterMonthTable tbody').innerHTML=mHTML+`<tr class="total-row"><td>Total</td><td>${totB}</td><td style="${tc2}">${fmtPL(totPL)}</td><td>${fmtR(totS)}</td><td style="${rc2}">${(tRoi>=0?'+':'')+tRoi.toFixed(2)}%</td><td class="td-num">${mkWRC(tWr)}</td><td>${totB>0?fmtR(totS/totB):'—'}</td><td>—</td></tr>`;
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
