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

  // Month summary
  const mRows = allDados.filter(r=>r.data.slice(0,7)===cur);
  const mPL = mRows.reduce((a,r)=>a+r.lucro,0);
  const mN = mRows.length;
  const plColor = mPL>=0?'var(--green)':'var(--red)';

  // Calendar grid
  const firstDay = new Date(parseInt(yr), parseInt(mo)-1, 1);
  const lastDay = new Date(parseInt(yr), parseInt(mo), 0);
  const daysInMonth = lastDay.getDate();
  // 0=Sun, adjust to start on Mon
  let startDow = firstDay.getDay(); // 0=Sun
  startDow = (startDow + 6) % 7; // 0=Mon

  const cellStyle=(d)=>{
    const key=`${yr}-${mo}-${String(d).padStart(2,'0')}`;
    const data=dayMap[key];
    if(!data) return {bg:'var(--bg4)',border:'var(--border)',clr:'var(--text3)',pl:null,n:0};
    const pl=data.pl;
    let bg,border,clr='#fff';
    if(pl>5000)      {bg='#00C896';border='rgba(0,200,150,.5)';}
    else if(pl>1000) {bg='#00a876';border='rgba(0,168,118,.5)';}
    else if(pl>=0)   {bg='#4db896';border='rgba(77,184,150,.5)';}
    else if(pl>=-1000){bg='#ff8a94';border='rgba(255,138,148,.5)';}
    else if(pl>=-5000){bg='#FF4757';border='rgba(255,71,87,.5)';}
    else              {bg='#cc1a2a';border='rgba(204,26,42,.5)';}
    return{bg,border,clr,pl,n:data.n};
  };

  const compact = opts.compact;
  const cellH = compact ? '52px' : '68px';
  const cellFS = compact ? '12px' : '14px';
  const subFS = compact ? '9px' : '10px';

  const DAYS_SHORT = ['S','T','Q','Q','S','S','D'];

  let cells = '';
  // Blank cells before first day
  for(let i=0;i<startDow;i++) cells+=`<div style="background:var(--bg2);border-radius:6px;opacity:.3"></div>`;
  // Day cells
  const today = new Date();
  for(let d=1;d<=daysInMonth;d++){
    const s=cellStyle(d);
    const key=`${yr}-${mo}-${String(d).padStart(2,'0')}`;
    const isToday=(today.getFullYear()===parseInt(yr)&&today.getMonth()===parseInt(mo)-1&&today.getDate()===d);
    const todayBorder=isToday?'2px solid var(--blue)':'1px solid '+s.border;
    const plTxt=s.pl!=null?`<div style="font-weight:700;font-size:${cellFS};color:${s.clr};font-variant-numeric:tabular-nums;line-height:1.1">${s.pl>=0?'+':''}${s.pl>=1000||s.pl<=-1000?fmtK(s.pl):Math.round(s.pl)}</div>`:'';
    const nTxt=s.n>0?`<div style="font-size:${subFS};color:${s.clr};opacity:.7;line-height:1">${s.n}b</div>`:'';
    cells+=`<div style="background:${s.bg};border:${todayBorder};border-radius:6px;padding:4px 5px;cursor:${s.n?'pointer':'default'};display:flex;flex-direction:column;justify-content:space-between;min-height:${cellH};position:relative;transition:opacity .1s" ${s.n?`onclick="if(window._calHeatCb)window._calHeatCb('${key}')" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'"`:''}>
      <div style="font-size:${subFS};color:${s.pl!=null?s.clr:'var(--text3)'};font-family:'JetBrains Mono',monospace;font-weight:${isToday?700:500}">${d}</div>
      <div>${plTxt}${nTxt}</div>
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

  const summaryHTML=`<div style="display:flex;align-items:baseline;gap:16px;flex-wrap:wrap">
    <div style="font-size:${compact?'20px':'24px'};font-weight:700;color:${plColor};font-variant-numeric:tabular-nums;font-family:'JetBrains Mono',monospace">${fmtPL(mPL)}</div>
    <div style="font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace">${mN} apostas</div>
  </div>`;

  return`<div style="display:flex;flex-direction:column;gap:12px;height:100%">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      ${navHTML}
      ${summaryHTML}
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;flex:1">
      ${DAYS_SHORT.map(d=>`<div style="text-align:center;font-size:9px;color:var(--text3);font-family:'JetBrains Mono',monospace;font-weight:700;padding-bottom:2px">${d}</div>`).join('')}
      ${cells}
    </div>
  </div>`;
}

function renderKPI(rows){
  const lucro=rows.reduce((a,r)=>a+r.lucro,0),stake=rows.reduce((a,r)=>a+r.stake,0);
  const roi=calcROI(rows),n=rows.length;
  const W=rows.filter(r=>r.resultado==='W').length;
  const L=rows.filter(r=>r.resultado==='L').length;
  const HW=rows.filter(r=>r.resultado==='HW').length;
  const HL=rows.filter(r=>r.resultado==='HL').length;
  const V=rows.filter(r=>r.resultado==='V').length;
  const settled=rows.filter(r=>r.resultado!=='V').length;
  const wins=W+HW;
  const wr=settled>0?(wins/settled*100):0;
  const{allForns:cF,allCasas:cA,contaCount:cC}=_costState.allForns&&_costState.allForns.length?_costState:buildCostState(DADOS);
  const costConta=Object.values(Object.fromEntries(cF.map(f=>[f,cA.reduce((a,c)=>{const k=f+'||'+c;return a+(custoData[k]||0)*(cC[k]||0);},0)]))).reduce((a,v)=>a+v,0);
  // Custo de tipster — soma todos os valores mensais de ctData
  ctLoad();
  const costTipster=Object.values(ctData).reduce((total,monthsObj)=>{
    return total+Object.values(monthsObj||{}).reduce((a,v)=>{
      return a+(parseFloat((v||'').toString().replace(',','.'))||0);
    },0);
  },0);
  const totalCost=costConta+costTipster;
  const lucroLiq=lucro-totalCost;
  // ── Andar 1: P/L Bruto → Custo Conta → Custo Tipster → P/L Líquido ────────
  const row1=[
    {l:'P/L Bruto',v:fmtPL(lucro),c:lucro>=0?'pos':'neg',s:'antes de custos',accent:''},
    {l:'Custo de Contas',v:costConta>0?'- R$ '+fmt(costConta,0):'R$ 0',c:costConta>0?'neg':'neu',s:'total aquisição',accent:''},
    {l:'Custo de Tipsters',v:costTipster>0?'- R$ '+fmt(costTipster,0):'R$ 0',c:costTipster>0?'neg':'neu',s:'assinaturas / serviços',accent:''},
    {l:'P/L Líquido',v:fmtPL(lucroLiq),c:lucroLiq>=0?'pos':'neg',s:'resultado final',accent:'border-top:2px solid var(--green);'},
  ];
  // ── Andar 2: Turnover → ROI → Odd Média → Win Rate ──────────────────────
  const row2=[
    {l:'Turnover',v:fmtR(stake),c:'neu',s:'volume apostado'},
    {l:'ROI',v:(roi>=0?'+':'')+roi.toFixed(2)+'%',c:roi>=0?'pos':'neg',s:n+' apostas'},
    {l:'Odd Média Pond.',v:calcAvgOdd(rows).toFixed(2),c:'neu',s:'Σ(odd×stake)/Σ(stake)'},
    {l:'Win Rate',v:wr.toFixed(1)+'%',c:wr>=50?'pos':'neg',s:`<span class="res-w">W:${W}</span> <span class="res-hw">HW:${HW}</span> <span class="res-l">L:${L}</span> <span class="res-hl">HL:${HL}</span> <span class="res-v">V:${V}</span>`},
  ];
  const kpiCard=(k)=>`<div class="kpi" style="${k.accent||''}">${
    k.accent?`<div style="position:absolute;top:0;left:0;right:0;height:2px;background:var(--green);border-radius:8px 8px 0 0;opacity:.7"></div>`:''}
    <div class="kpi-label">${k.l}</div><div class="kpi-val ${k.c}">${k.v}</div><div class="kpi-sub">${k.s}</div></div>`;
  const divider=`<div style="grid-column:1/-1;height:1px;background:var(--border);margin:2px 0;opacity:.6"></div>`;
  document.getElementById('kpiGrid').innerHTML=
    `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:.5rem">${row1.map(k=>`<div class="kpi" style="position:relative;${k.accent||''}">${k.accent?`<div style="position:absolute;top:0;left:0;right:0;height:2px;background:var(--green);border-radius:8px 8px 0 0;opacity:.7"></div>`:''}<div class="kpi-label">${k.l}</div><div class="kpi-val ${k.c}">${k.v}</div><div class="kpi-sub">${k.s}</div></div>`).join('')}</div>`+
    `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:1.25rem">${row2.map(k=>`<div class="kpi"><div class="kpi-label">${k.l}</div><div class="kpi-val ${k.c}">${k.v}</div><div class="kpi-sub">${k.s}</div></div>`).join('')}</div>`;
}

function renderBankroll(rows){
  const byDay={};rows.forEach(r=>{const k=r.data.slice(0,10);if(!byDay[k])byDay[k]=0;byDay[k]+=r.lucro;});
  const days=Object.keys(byDay).sort();
  const dpL=days.map(k=>byDay[k]);
  let cum=0;const cumPL=dpL.map(v=>{cum+=v;return parseFloat(cum.toFixed(2));});
  // Labels every ~30 days to avoid clutter, shown vertically
  const labelStep=Math.max(1,Math.floor(days.length/14));
  const lbl=days.map((d,i)=>{
    if(i%labelStep!==0&&i!==days.length-1)return'';
    const p=d.split('-');return p[2]+'/'+p[1];
  });
  mkChart('chartBankroll',{type:'bar',data:{labels:lbl,datasets:[
    {type:'line',data:cumPL,borderColor:'#00C896',tension:.4,pointRadius:0,fill:false,borderWidth:2,yAxisID:'y1',label:'Acumulado'},
    {type:'bar',data:dpL,backgroundColor:dpL.map(v=>v>=0?'rgba(0,214,143,.6)':'rgba(240,80,110,.6)'),borderRadius:1,yAxisID:'y',label:'Diário',barPercentage:0.9,categoryPercentage:1.0}
  ]},options:{responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>(ctx.dataset.label||'')+': '+fmtK(ctx.raw),title:ctx=>{const i=ctx[0].dataIndex;return days[i]?.split('-').reverse().join('/')||'';},}}},
    scales:{
      x:{ticks:{color:tc(),font:{size:9},maxRotation:90,minRotation:90,autoSkip:false,callback:(v,i)=>lbl[i]||null},grid:{display:false},border:{display:false}},
      y:{ticks:{color:tc(),font:{size:10},callback:v=>fmtK(v)},grid:{color:gc()},border:{display:false},position:'left'},
      y1:{ticks:{color:tc(),font:{size:10},callback:v=>fmtK(v)},grid:{display:false},border:{display:false},position:'right'}
    }}});
}

function renderROIMonthly(rows){
  const byM={};rows.forEach(r=>{const d=new Date(r.data+'T12:00:00');const k=`${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`;if(!byM[k])byM[k]={pl:0,s:0,mes:d.getMonth(),ano:d.getFullYear()};byM[k].pl+=r.lucro;byM[k].s+=r.stake;});
  const mks=Object.keys(byM).sort();
  const lbl=mks.map(k=>{const v=byM[k];return MESES_CURTOS[v.mes]+' '+String(v.ano).slice(2);});
  const vals=mks.map(k=>byM[k].s>0?parseFloat((byM[k].pl/byM[k].s*100).toFixed(2)):0);
  function roiColor(v){
    if(v<=-10)return'rgba(180,20,40,.9)';
    if(v<-3)return'rgba(240,80,110,.75)';
    if(v<0)return'rgba(240,80,110,.45)';
    if(v<3)return'rgba(0,214,143,.4)';
    if(v<8)return'rgba(0,214,143,.65)';
    return'rgba(0,214,143,.9)';
  }
  // Use afterDraw plugin to draw labels directly on bars
  const roiLabelPlugin={id:'roiLabels',afterDatasetsDraw(chart){
    const{ctx,data,scales:{x,y}}=chart;
    ctx.save();
    data.datasets[0].data.forEach((val,i)=>{
      const bar=chart.getDatasetMeta(0).data[i];
      if(!bar)return;
      ctx.font='bold 10px JetBrains Mono, monospace';
      ctx.fillStyle=isDark()?'rgba(255,255,255,.85)':'rgba(0,0,0,.75)';
      ctx.textAlign='center';
      ctx.textBaseline=val>=0?'bottom':'top';
      const yPos=val>=0?bar.y-3:bar.y+3;
      ctx.fillText((val>=0?'+':'')+val.toFixed(2)+'%',bar.x,yPos);
    });
    ctx.restore();
  }};
  mkChart('chartROI',{type:'bar',data:{labels:lbl,datasets:[{data:vals,backgroundColor:vals.map(roiColor),borderRadius:3,label:'ROI%'}]},options:{responsive:true,maintainAspectRatio:false,layout:{padding:{top:18,bottom:4}},plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.raw.toFixed(2)+'%'}}},scales:{x:{ticks:{color:tc(),font:{size:10},maxRotation:30},grid:{display:false},border:{display:false}},y:{ticks:{color:tc(),font:{size:10},callback:v=>v.toFixed(1)+'%'},grid:{color:gc()},border:{display:false}}}},plugins:[roiLabelPlugin]});
}

function renderOddsDist(rows){
  const bins=[1,1.5,2.0,2.5,3.0,4.0,6.0,10.0,30.0,100.0,Infinity];
  const lbls=['1.0–1.5','1.5–2.0','2.0–2.5','2.5–3.0','3.0–4.0','4.0–6.0','6.0–10','10–30','30–100','100+'];
  const bdata=lbls.map(()=>({n:0,w:0,pl:0,s:0}));
  rows.filter(r=>r.resultado!=='V').forEach(r=>{
    for(let i=0;i<bins.length-1;i++){
      if(r.odd>=bins[i]&&r.odd<bins[i+1]){bdata[i].n++;bdata[i].pl+=r.lucro;bdata[i].s+=r.stake;if(['W','HW'].includes(r.resultado))bdata[i].w++;break;}
    }
  });
  const counts=bdata.map(b=>b.n);
  const wrs=bdata.map(b=>b.n>0?parseFloat((b.w/b.n*100).toFixed(1)):null);
  const rois=bdata.map(b=>b.s>0?parseFloat((b.pl/b.s*100).toFixed(2)):null);
  mkChart('chartOddsDist',{type:'bar',data:{labels:lbls,datasets:[
    {type:'bar',data:counts,backgroundColor:'rgba(91,156,246,.55)',borderRadius:3,label:'Apostas',yAxisID:'y'},
    {type:'line',data:wrs,borderColor:'#00C896',backgroundColor:'transparent',tension:.3,pointRadius:5,pointBackgroundColor:'#00C896',borderWidth:2,label:'Win Rate %',yAxisID:'y1',spanGaps:false},
    {type:'line',data:rois,borderColor:'#F5A623',backgroundColor:'transparent',tension:.3,pointRadius:5,pointBackgroundColor:'#F5A623',borderWidth:2,label:'ROI %',yAxisID:'y2',borderDash:[4,3],spanGaps:false}
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
    plugins:{legend:{display:true,position:'top',labels:{color:tc(),font:{size:11},boxWidth:12,padding:16}},
      tooltip:{callbacks:{label:ctx=>{if(ctx.datasetIndex===0)return'Apostas: '+ctx.raw;if(ctx.datasetIndex===1)return'Win Rate: '+(ctx.raw?.toFixed(1)||'—')+'%';return'ROI: '+(ctx.raw?.toFixed(2)||'—')+'%';}}}},
    scales:{
      x:{ticks:{color:tc(),font:{size:10}},grid:{display:false},border:{display:false}},
      y:{ticks:{color:tc(),font:{size:10}},grid:{color:gc()},border:{display:false},position:'left'},
      y1:{ticks:{color:'#00C896',font:{size:10},callback:v=>v+'%'},grid:{display:false},border:{display:false},position:'right'},
      y2:{ticks:{color:'#F5A623',font:{size:10},callback:v=>v+'%'},grid:{display:false},border:{display:false},position:'right',offset:true}
    }}});
}

function renderHeatmap(rows){
  const byM={};rows.forEach(r=>{const d=new Date(r.data+'T12:00:00');const k=d.getFullYear()+'-'+d.getMonth();if(!byM[k])byM[k]={l:0,s:0,mes:d.getMonth(),ano:d.getFullYear()};byM[k].l+=r.lucro;byM[k].s+=r.stake;});
  const anos=[...new Set(Object.values(byM).map(v=>v.ano))].sort();
  const vals=Object.values(byM).map(v=>v.l);
  const maxAbs=Math.max(...vals.map(Math.abs),1);
  // Same color logic as daily heatmap
  function heatBg(v){const a=0.12+Math.min(1,Math.abs(v)/maxAbs)*0.82;return v>0?`rgba(0,160,100,${a})`:v<0?`rgba(200,40,60,${a})`:'transparent';}
  function heatTxt(v){
    if(v===0)return'var(--text3)';
    const a=0.12+Math.min(1,Math.abs(v)/maxAbs)*0.82;
    return a>0.5?(v>0?'#d0fff0':'#ffe0e5'):(v>0?'var(--green)':'var(--red)');
  }
  let html=`<table class="heatmap-table"><thead><tr><th></th>${MESES.map(m=>`<th style="text-align:center">${m}</th>`).join('')}</tr></thead><tbody>`;
  anos.forEach(ano=>{
    html+=`<tr><th style="text-align:right;padding-right:8px;color:var(--text3);font-size:10px;white-space:nowrap">${ano}</th>`;
    for(let m=0;m<12;m++){
      const k=ano+'-'+m;
      if(byM[k]){
        const v=byM[k].l;
        const roi=byM[k].s>0?(v/byM[k].s*100).toFixed(2):'0.00';
        html+=`<td class="heat-cell" style="background:${heatBg(v)};color:${heatTxt(v)}" title="${MESES_CURTOS[m]}/${ano}: ${fmtPL(v)} (ROI ${roi}%)">${roi}%</td>`;
      } else html+=`<td class="heat-empty"></td>`;
    }
    html+='</tr>';
  });
  html+='</tbody></table>';
  document.getElementById('heatmapWrap').innerHTML=html;
}

function renderOvTipsters(rows){
  const map={};
  rows.forEach(r=>{
    if(!r.tipster)return;
    if(!map[r.tipster])map[r.tipster]={pl:0,s:0,n:0,w:0,t:0};
    map[r.tipster].pl+=r.lucro;map[r.tipster].s+=r.stake;map[r.tipster].n++;
    if(r.resultado!=='V'){map[r.tipster].t++;if(['W','HW'].includes(r.resultado))map[r.tipster].w++;}
  });
  const ents=Object.entries(map).sort((a,b)=>b[1].pl-a[1].pl);
  const labels=ents.map(e=>e[0]);
  const pls=ents.map(e=>parseFloat(e[1].pl.toFixed(2)));
  const rois=ents.map(e=>e[1].s>0?parseFloat((e[1].pl/e[1].s*100).toFixed(2)):0);
  const wrs=ents.map(e=>e[1].t>0?parseFloat((e[1].w/e[1].t*100).toFixed(1)):0);

  // Bar chart: P/L bars only com ROI label inline — altura dinâmica
  const h=Math.max(400,ents.length*28+80);
  const barWrap=document.querySelector('#chartOvTipsterBar')?.parentElement;
  if(barWrap)barWrap.style.height=h+'px';
  // Plugin: ROI label inside bar
  const roiLabelPlugin={id:'roiLabels',afterDatasetsDraw(chart){
    const{ctx}=chart;
    chart.getDatasetMeta(0).data.forEach((bar,i)=>{
      const roi=rois[i];const pl=pls[i];
      if(Math.abs(pl)<1)return;
      ctx.save();
      ctx.font='bold 10px JetBrains Mono, monospace';
      ctx.fillStyle='rgba(255,255,255,.9)';
      ctx.textAlign=pl>=0?'left':'right';
      ctx.textBaseline='middle';
      const x=pl>=0?bar.x+5:bar.x-5;
      ctx.fillText(`${(roi>=0?'+':'')+roi.toFixed(1)}%`,x,bar.y);
      ctx.restore();
    });
  }};
  mkChart('chartOvTipsterBar',{type:'bar',data:{labels,datasets:[
    {type:'bar',data:pls,backgroundColor:pls.map(v=>v>=0?'rgba(0,214,143,.75)':'rgba(240,80,110,.75)'),borderRadius:3,label:'P/L (R$)',yAxisID:'y'},
  ]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false},
      tooltip:{callbacks:{label:ctx=>`P/L: ${fmtPL(ctx.raw)}  ROI: ${(rois[ctx.dataIndex]>=0?'+':'')+rois[ctx.dataIndex].toFixed(2)}%`}}},
    scales:{
      x:{ticks:{color:tc(),font:{size:10},callback:v=>fmtK(v)},grid:{color:gc()},border:{display:false}},
      y:{ticks:{color:tc(),font:{size:11}},grid:{display:false},border:{display:false}},
    }},plugins:[roiLabelPlugin]});;

  // Donut chart: participation in positive P/L
  const winners=ents.filter(e=>e[1].pl>0);
  const totalPos=winners.reduce((a,e)=>a+e[1].pl,0);
  const PIE_COLORS=['#00C896','#1E90FF','#F5A623','#a78bfa','#2dd4bf','#f87171','#34d399','#fbbf24','#60a5fa','#c084fc','#fb923c','#ffd700','#ff8c69','#dda0dd','#87ceeb'];
  mkChart('chartOvTipsterPie',{type:'doughnut',
    data:{labels:winners.map(e=>e[0]),datasets:[{
      data:winners.map(e=>parseFloat(e[1].pl.toFixed(2))),
      backgroundColor:PIE_COLORS.slice(0,winners.length),
      borderWidth:2,borderColor:isDark()?'#081320':'#fff'
    }]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{display:true,position:'right',labels:{color:isDark()?'#eeedf0':'#0f0f18',font:{size:11},boxWidth:12,padding:8,
          generateLabels(chart){
            const ds=chart.data.datasets[0];
            const txtColor=isDark()?'#eeedf0':'#0f0f18';
            return chart.data.labels.map((lbl,i)=>{
              const v=ds.data[i];const pct=totalPos>0?(v/totalPos*100).toFixed(1):'0';
              return{text:`${lbl}  ${pct}%`,fillStyle:ds.backgroundColor[i],strokeStyle:ds.backgroundColor[i],fontColor:txtColor,hidden:false,index:i};
            });
          }}},
        tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${fmtPL(ctx.raw)} (${totalPos>0?(ctx.raw/totalPos*100).toFixed(1):'0'}%)`}}
      }}});
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
    mkK('Win Rate',wr.toFixed(1)+'%',wr>=50?'pos':'neg',settled+' encerradas'),
    mkK('Odd Média Pond.',avgOdd.toFixed(2),'neu','Σ(odd×stake)/Σ(stake)'),
    mkK('Stake Média',fmtR(avgStake),'neu','por aposta'),
    mkK(contextLabel,contextVal,'neu',contextSub),
  ].join('');
  return`<div class="kpi-grid" style="margin-bottom:.5rem">${row1}</div><div class="kpi-grid" style="margin-bottom:1.25rem">${row2}</div>`;
}

// ── Overview Heatmap Calendar ─────────────────────────────────────────────────
function renderOvHeatmap(){
  const cont=document.getElementById('ovHeatmapContent');if(!cont)return;
  if(!DADOS||!DADOS.length){cont.innerHTML='<p style="color:var(--text3)">Sem dados.</p>';return;}
  if(!window._ovHeatMonth){
    const months=[...new Set(DADOS.map(r=>r.data.slice(0,7)))].sort().reverse();
    window._ovHeatMonth=months[0]||'';
  }
  window._calHeatCb=null; // no click action on overview
  cont.innerHTML=mkCalendarHeatmap(window._ovHeatMonth,DADOS,{
    showNav:true,
    onPrev:"window._ovHeatMonth=(function(){const m=[...new Set(DADOS.map(r=>r.data.slice(0,7)))].sort().reverse();const i=m.indexOf(window._ovHeatMonth);return i<m.length-1?m[i+1]:window._ovHeatMonth;})();renderOvHeatmap()",
    onNext:"window._ovHeatMonth=(function(){const m=[...new Set(DADOS.map(r=>r.data.slice(0,7)))].sort().reverse();const i=m.indexOf(window._ovHeatMonth);return i>0?m[i-1]:window._ovHeatMonth;})();renderOvHeatmap()",
    onSelect:"window._ovHeatMonth=this.value;renderOvHeatmap()",
    compact:true
  });
}

// Consolidado — KPIs + Resumo Anual + Heatmap mensal
function renderConsolidado(){
  const rows=filtrarPagina('consolidado');
  const allTipsters=[...new Set(rows.map(r=>r.tipster).filter(Boolean))].sort();
  const annualByT={}, monthlyByT={}, byTYMD={};
  rows.forEach(r=>{
    const d=new Date(r.data+'T12:00:00');
    const ymKey=`${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`;
    const dayKey=r.data.slice(0,10);
    const t=r.tipster; if(!t)return;
    const res=r.resultado;
    if(!annualByT[t])annualByT[t]={pl:0,n:0,w:0,l:0,hw:0,hl:0,v:0};
    annualByT[t].pl+=r.lucro; annualByT[t].n++;
    if(res==='W')annualByT[t].w++; else if(res==='L')annualByT[t].l++;
    else if(res==='HW')annualByT[t].hw++; else if(res==='HL')annualByT[t].hl++;
    else if(res==='V')annualByT[t].v++;
    const mk=ymKey+'_'+t;
    if(!monthlyByT[mk])monthlyByT[mk]={pl:0,n:0,w:0,l:0,hw:0,hl:0,v:0,year:d.getFullYear(),month:d.getMonth()};
    monthlyByT[mk].pl+=r.lucro; monthlyByT[mk].n++;
    if(res==='W')monthlyByT[mk].w++; else if(res==='L')monthlyByT[mk].l++;
    else if(res==='HW')monthlyByT[mk].hw++; else if(res==='HL')monthlyByT[mk].hl++;
    else if(res==='V')monthlyByT[mk].v++;
    if(!byTYMD[ymKey])byTYMD[ymKey]={year:d.getFullYear(),month:d.getMonth(),days:{}};
    if(!byTYMD[ymKey].days[dayKey])byTYMD[ymKey].days[dayKey]={};
    if(!byTYMD[ymKey].days[dayKey][t])byTYMD[ymKey].days[dayKey][t]={pl:0,n:0,w:0,l:0,hw:0,hl:0,v:0};
    const cell=byTYMD[ymKey].days[dayKey][t];
    cell.pl+=r.lucro; cell.n++;
    if(res==='W')cell.w++; else if(res==='L')cell.l++;
    else if(res==='HW')cell.hw++; else if(res==='HL')cell.hl++;
    else if(res==='V')cell.v++;
  });
  const ymKeys=Object.keys(byTYMD).sort().reverse();
  const sT='position:sticky;left:0;z-index:2;white-space:nowrap;';
  const sA='position:sticky;left:130px;z-index:2;white-space:nowrap;border-right:1px solid var(--border2);';
  const hBg='background:var(--bg4);';
  const rBg='background:var(--bg3);';
  const totPL=allTipsters.reduce((a,t)=>a+(annualByT[t]?.pl||0),0);
  const totN=allTipsters.reduce((a,t)=>a+(annualByT[t]?.n||0),0);
  const totS=rows.reduce((a,r)=>a+r.stake,0);
  const totROI=totS>0?(totPL/totS*100):0;
  const totW=allTipsters.reduce((a,t)=>a+(annualByT[t]?.w||0),0);
  const totHW=allTipsters.reduce((a,t)=>a+(annualByT[t]?.hw||0),0);
  const totL=allTipsters.reduce((a,t)=>a+(annualByT[t]?.l||0),0);
  const totHL=allTipsters.reduce((a,t)=>a+(annualByT[t]?.hl||0),0);
  const totV=allTipsters.reduce((a,t)=>a+(annualByT[t]?.v||0),0);
  const tlc=totPL>=0?'var(--green)':'var(--red)';
  const trc=totROI>=0?'var(--green)':'var(--red)';
  const totSettled=totW+totHW+totL+totHL;
  const totWR=totSettled>0?((totW+totHW)/totSettled*100):0;
  const totDetail=[totW?`W:${totW}`:'',totHW?`HW:${totHW}`:'',totL?`L:${totL}`:'',totHL?`HL:${totHL}`:'',totV?`V:${totV}`:''].filter(Boolean).join(' ');
  function tdR(content,extra=''){return`<td style="text-align:right;padding:3px 7px;white-space:nowrap;font-size:11px;${extra}">${content}</td>`;}
  const totalAnnualRow=`<tr style="border-bottom:2px solid var(--border2);background:var(--bg4)">
    <td style="font-weight:700;color:var(--text);padding:5px 8px;text-align:left;font-size:12px">Total</td>
    <td style="text-align:right;padding:5px 7px;font-size:11px;font-family:'JetBrains Mono',monospace"><span style="font-size:10px;color:var(--text3);margin-right:6px">${totDetail}</span><span style="font-size:13px;font-weight:700;color:var(--text)">${totN.toLocaleString('pt-BR')}</span></td>
    ${tdR(fmtPL(totPL),`color:${tlc};font-weight:700`)}
    ${tdR(fmtR(totS))}
    ${tdR((totROI>=0?'+':'')+totROI.toFixed(2)+'%',`color:${trc};font-weight:700`)}
    ${tdR(totWR.toFixed(1)+'%')}
    ${tdR(calcAvgOdd(rows).toFixed(2))}
    ${tdR(totN>0?fmtR(totS/totN):'—')}
  </tr>`;
  const anualRows=allTipsters.map(t=>{
    const d=annualByT[t];if(!d)return'';
    const tRows=rows.filter(r=>r.tipster===t);
    const turnover=tRows.reduce((a,r)=>a+r.stake,0);
    const roiV=turnover>0?(d.pl/turnover*100):0;
    const settled=d.w+d.hw+d.l+d.hl;
    const wr=settled>0?((d.w+d.hw)/settled*100):0;
    const avgOdd=calcAvgOdd(tRows);
    const avgStake=d.n>0?turnover/d.n:0;
    const lc=d.pl>=0?'var(--green)':'var(--red)';
    const rc=roiV>=0?'var(--green)':'var(--red)';
    const detail=[d.w?`W:${d.w}`:'',d.hw?`HW:${d.hw}`:'',d.l?`L:${d.l}`:'',d.hl?`HL:${d.hl}`:'',d.v?`V:${d.v}`:''].filter(Boolean).join(' ');
    return`<tr>
      <td style="font-weight:700;color:var(--text);padding:5px 8px;text-align:left;font-size:11px">${t}</td>
      <td style="text-align:right;padding:5px 7px;font-size:11px;font-family:'JetBrains Mono',monospace"><span style="font-size:10px;color:var(--text3);margin-right:6px">${detail}</span><span style="font-size:13px;font-weight:600;color:var(--text)">${d.n.toLocaleString('pt-BR')}</span></td>
      ${tdR(fmtPL(d.pl),`color:${lc};font-weight:600`)}
      ${tdR(fmtR(turnover))}
      ${tdR((roiV>=0?'+':'')+roiV.toFixed(2)+'%',`color:${rc}`)}
      ${tdR(wr.toFixed(1)+'%')}
      ${tdR(avgOdd.toFixed(2))}
      ${tdR(fmtR(avgStake))}
    </tr>`;
  }).join('');
  const resumoAnualHTML=mkCard('cons_resumo',
    `Resumo Anual <span style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:${tlc};margin-left:10px">${fmtPL(totPL)}</span>`,
    `<div style="overflow-x:auto"><table class="tbl" id="tblConsAnual" style="width:100%;font-size:11px">
      <thead><tr>
        <th style="text-align:left;min-width:90px;padding:5px 8px">Tipster<span class="sort-icon"></span></th>
        <th style="text-align:right;min-width:70px;padding:5px 7px">Bets<span class="sort-icon"></span></th>
        <th style="text-align:right;min-width:100px;padding:5px 7px">P/L<span class="sort-icon"></span></th>
        <th style="text-align:right;min-width:85px;padding:5px 7px">Turnover<span class="sort-icon"></span></th>
        <th style="text-align:right;min-width:60px;padding:5px 7px">ROI<span class="sort-icon"></span></th>
        <th style="text-align:right;min-width:60px;padding:5px 7px">WR%<span class="sort-icon"></span></th>
        <th style="text-align:right;min-width:60px;padding:5px 7px">Odd<span class="sort-icon"></span></th>
        <th style="text-align:right;min-width:75px;padding:5px 7px">Stake<span class="sort-icon"></span></th>
      </tr></thead>
      <tbody>${totalAnnualRow}${anualRows}</tbody>
    </table></div>`);
  // Heatmap mensal
  const allPLs=ymKeys.flatMap(ym=>allTipsters.map(t=>monthlyByT[ym+'_'+t]?.pl||0));
  const maxAbsM=Math.max(...allPLs.map(Math.abs),1);
  function heatBg(v){const a=0.12+Math.min(1,Math.abs(v)/maxAbsM)*0.82;return v>0?`rgba(0,160,100,${a})`:v<0?`rgba(200,40,60,${a})`:'transparent';}
  function heatTxt(v){if(v===0)return'var(--text3)';const a=0.12+Math.min(1,Math.abs(v)/maxAbsM)*0.82;return a>0.5?(v>0?'#d0fff0':'#ffe0e5'):(v>0?'var(--green)':'var(--red)');}
  const mLabels=ymKeys.map(k=>{const v=byTYMD[k];return MESES_CURTOS[v.month]+' '+v.year;});
  const heatRows=allTipsters.map(t=>{
    const acc=annualByT[t];
    const accC=acc?.pl>=0?'var(--green)':acc?.pl<0?'var(--red)':'var(--text3)';
    const cells=ymKeys.map(ymKey=>{
      const d=monthlyByT[ymKey+'_'+t];
      if(!d||d.n===0)return`<td style="background:var(--bg4);border-radius:3px;padding:5px 8px;text-align:right;color:var(--text3);font-size:11px">—</td>`;
      const tRows=rows.filter(r=>r.tipster===t&&r.data.slice(0,7)===ymKey);
      const mStake=tRows.reduce((a,r)=>a+r.stake,0);
      const mROI=mStake>0?(d.pl/mStake*100):0;
      return`<td style="background:${heatBg(d.pl)};border-radius:3px;padding:5px 8px;text-align:right;color:${heatTxt(d.pl)};font-weight:600;white-space:nowrap;font-size:11px" title="${t} - ${mLabels[ymKeys.indexOf(ymKey)]}: ${fmtPL(d.pl)} (${d.n}b, ROI ${mROI.toFixed(2)}%)">${fmtPL(d.pl)}<br><span style="font-size:9px;opacity:.7">${(mROI>=0?'+':'')+mROI.toFixed(1)}% · ${d.n}b</span></td>`;
    }).join('');
    return`<tr>
      <td style="${sT}${rBg}font-weight:700;color:var(--text);padding:5px 10px;border-right:1px solid var(--border2);font-size:12px">${t}</td>
      <td style="${sA}${rBg}color:${accC};text-align:right;padding:5px 10px;font-weight:700;font-size:12px">${acc?fmtPL(acc.pl):'—'}<br><span style="font-size:9px;opacity:.55">${acc?.n||0}b</span></td>
      ${cells}
    </tr>`;
  }).join('');
  const heatTotalCells=ymKeys.map(ymKey=>{
    const pl=allTipsters.reduce((a,t)=>a+(monthlyByT[ymKey+'_'+t]?.pl||0),0);
    const n=allTipsters.reduce((a,t)=>a+(monthlyByT[ymKey+'_'+t]?.n||0),0);
    return`<td style="background:${heatBg(pl)};border-radius:3px;padding:5px 8px;text-align:right;color:${heatTxt(pl)};font-weight:700;white-space:nowrap;font-size:11px">${fmtPL(pl)}<br><span style="font-size:9px;opacity:.7">${n}b</span></td>`;
  }).join('');
  const hBg2='background:var(--bg4);';
  const heatThStyle=`${hBg2}padding:5px 10px;text-align:right;font-size:9px;text-transform:uppercase;color:var(--text3);white-space:nowrap;min-width:110px`;
  const heatmapHTML=mkCard('cons_heat','Evolução Mensal',
    `<div style="overflow-x:auto"><table id="consHeatTable" style="border-collapse:separate;border-spacing:2px;font-size:12px;font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums">
      <thead><tr style="border-bottom:1px solid var(--border2)">
        <th style="${sT}${hBg2}padding:5px 10px;text-align:left;font-size:9px;text-transform:uppercase;color:var(--text3);border-right:1px solid var(--border2);min-width:130px">Tipster</th>
        <th style="${sA}${hBg2}padding:5px 10px;text-align:right;font-size:9px;text-transform:uppercase;color:var(--text3);min-width:95px">Acumulado</th>
        ${mLabels.map(m=>`<th style="${heatThStyle}">${m}</th>`).join('')}
      </tr></thead>
      <tbody>
        <tr style="border-bottom:2px solid var(--border2)">
          <td style="${sT}${hBg2}font-weight:700;color:var(--text);padding:5px 10px;border-right:1px solid var(--border2)">Total</td>
          <td style="${sA}${hBg2}color:${totPL>=0?'var(--green)':'var(--red)'};text-align:right;padding:5px 10px;font-weight:700">${fmtPL(totPL)}</td>
          ${heatTotalCells}
        </tr>
        ${heatRows}
      </tbody>
    </table></div>`);
  const activeTipsters=allTipsters.length;
  const kpiHTML=mkKpiGrid(rows,{plLabel:'P/L Total',contextLabel:'Tipsters',contextVal:activeTipsters,contextSub:activeTipsters+' tipsters ativos'});
  const cont=document.getElementById('consolidadoContent');
  // Calendar heatmap for consolidado
  if(!window._consHeatMonth){
    const allMonths=[...new Set(rows.map(r=>r.data.slice(0,7)))].sort().reverse();
    window._consHeatMonth=allMonths[0]||'';
  }
  window._calHeatCb=null;
  const calHeatConsHTML=mkCard('cons_cal','Calendário — Resultados Diários',
    `<div id="consCalWrap">${mkCalendarHeatmap(window._consHeatMonth,rows,{
      showNav:true,
      onPrev:"window._consHeatMonth=(function(){const m=[...new Set(DADOS.map(r=>r.data.slice(0,7)))].sort().reverse();const i=m.indexOf(window._consHeatMonth);return i<m.length-1?m[i+1]:window._consHeatMonth;})();renderConsolidado()",
      onNext:"window._consHeatMonth=(function(){const m=[...new Set(DADOS.map(r=>r.data.slice(0,7)))].sort().reverse();const i=m.indexOf(window._consHeatMonth);return i>0?m[i-1]:window._consHeatMonth;})();renderConsolidado()",
      onSelect:"window._consHeatMonth=this.value;renderConsolidado()",
      compact:false
    })}</div>`);
  if(cont){cont.innerHTML=calHeatConsHTML+kpiHTML+resumoAnualHTML+heatmapHTML;setTimeout(()=>{makeSortable('tblConsAnual',[1,2,3,4,5,6,7]);},100);}
}

// ── MENSAL ──────────────────────────────────────────────────────────────────
function getAvailableMonths(){
  const months=[...new Set(DADOS.map(r=>r.data.slice(0,7)))].sort().reverse();
  return months;
}
function renderMensal(){
  const cont=document.getElementById('mensalContent');if(!cont)return;
  if(!DADOS||!DADOS.length){cont.innerHTML='<p style="color:var(--text3);padding:2rem">Carregando dados...</p>';return;}
  const months=getAvailableMonths();
  if(!months.length){cont.innerHTML='<p style="color:var(--text3);padding:2rem">Sem dados.</p>';return;}
  // Get current selected month or default to latest
  const selMonth=window._mensalSelMonth||months[0];
  if(!months.includes(window._mensalSelMonth))window._mensalSelMonth=months[0];
  const selMonthVal=window._mensalSelMonth||months[0];

  // Month selector UI — replaced by heatmap calendar as hero
  const [yr,mo]=selMonthVal.split('-');
  const moLabel=MESES[parseInt(mo)-1]+' '+yr;

  // Hero: Calendar Heatmap
  window._calHeatCb=(day)=>{
    // Click a day: could show daily tooltip in future
  };
  const heatmapHeroHTML=mkCard('mensal_hero_cal','Calendário — '+moLabel,
    `<div style="min-height:360px" id="mensalCalWrap">
      ${mkCalendarHeatmap(selMonthVal,DADOS,{
        showNav:true,
        onPrev:"prevMensal()",
        onNext:"nextMensal()",
        onSelect:"selectMensal(this.value)",
        compact:false
      })}
    </div>`);

  const rows=DADOS.filter(r=>r.data.slice(0,7)===selMonthVal);
  if(!rows.length){cont.innerHTML=heatmapHeroHTML+'<p style="color:var(--text3);padding:1rem">Sem apostas neste mês.</p>';return;}

  const allTipsters=[...new Set(rows.map(r=>r.tipster).filter(Boolean))].sort();
  const days=[...new Set(rows.map(r=>r.data.slice(0,10)))].sort();

  // KPIs do mês
  const totPL=rows.reduce((a,r)=>a+r.lucro,0);
  const totS=rows.reduce((a,r)=>a+r.stake,0);
  const kpiHTML=mkKpiGrid(rows,{plLabel:'P/L do Mês',contextLabel:'Dias Ativos',contextVal:days.length,contextSub:'de '+new Date(selMonthVal+'-01').toLocaleDateString('pt-BR',{month:'long',year:'numeric'})});

  // Tabela dia a dia com tipsters (igual ao bloco do Consolidado, mas só para este mês)
  const byTDay={};
  rows.forEach(r=>{
    const d=r.data.slice(0,10),t=r.tipster;if(!t)return;
    if(!byTDay[d])byTDay[d]={};
    if(!byTDay[d][t])byTDay[d][t]={pl:0,n:0,w:0,l:0,hw:0,hl:0,v:0};
    const cell=byTDay[d][t];
    cell.pl+=r.lucro;cell.n++;
    if(r.resultado==='W')cell.w++;else if(r.resultado==='L')cell.l++;
    else if(r.resultado==='HW')cell.hw++;else if(r.resultado==='HL')cell.hl++;
    else if(r.resultado==='V')cell.v++;
  });
  const byTMonth={};
  rows.forEach(r=>{const t=r.tipster;if(!t)return;if(!byTMonth[t])byTMonth[t]={pl:0,n:0,w:0,l:0,hw:0,hl:0,v:0};
    byTMonth[t].pl+=r.lucro;byTMonth[t].n++;
    if(r.resultado==='W')byTMonth[t].w++;else if(r.resultado==='L')byTMonth[t].l++;
    else if(r.resultado==='HW')byTMonth[t].hw++;else if(r.resultado==='HL')byTMonth[t].hl++;
    else if(r.resultado==='V')byTMonth[t].v++;
  });

  function tipsterCell2(d){
    if(!d||d.n===0)return`<td style="color:var(--text3);text-align:right;padding:4px 8px">—</td>`;
    const c=d.pl>0?'var(--green)':d.pl<0?'var(--red)':'var(--text3)';
    const detail=[d.w?`W:${d.w}`:'',d.hw?`HW:${d.hw}`:'',d.l?`L:${d.l}`:'',d.hl?`HL:${d.hl}`:'',d.v?`V:${d.v}`:''].filter(Boolean).join(' ');
    return`<td style="color:${c};text-align:right;padding:4px 8px;white-space:nowrap;vertical-align:top"><span style="font-weight:600">${fmtPL(d.pl)}</span><br><span style="font-size:9px;opacity:.55;color:var(--text3)">${d.n}b ${detail}</span></td>`;
  }

  const sT2='position:sticky;left:0;z-index:2;white-space:nowrap;';
  const sA2='position:sticky;left:130px;z-index:2;white-space:nowrap;border-right:1px solid var(--border2);';
  const hBgM='background:var(--bg4);';
  const rBgM='background:var(--bg3);';

  const daysDesc=[...days].reverse();
  const dayHdrs=daysDesc.map(day=>{
    const dp=new Date(day+'T12:00:00');
    const ds=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][dp.getDay()];
    return`<th style="${hBgM}padding:5px 8px;text-align:right;font-size:9px;text-transform:uppercase;color:var(--text3);white-space:nowrap;min-width:88px">${ds} ${day.slice(8)}</th>`;
  }).join('');

  const totalDayPL=totPL;
  const dayTotRow=`<tr style="border-bottom:2px solid var(--border2)">
    <td style="${sT2}${hBgM}font-weight:700;color:var(--text);padding:5px 10px;border-right:1px solid var(--border2)">Total</td>
    <td style="${sA2}${hBgM}color:${totalDayPL>=0?'var(--green)':'var(--red)'};text-align:right;padding:5px 10px;font-weight:700">${fmtPL(totalDayPL)}</td>
    ${daysDesc.map(day=>{
      const pl=allTipsters.reduce((a,t)=>a+(byTDay[day]?.[t]?.pl||0),0);
      const n=allTipsters.reduce((a,t)=>a+(byTDay[day]?.[t]?.n||0),0);
      if(n===0)return`<td style="${hBgM}text-align:right;padding:5px 8px;color:var(--text3)">—</td>`;
      const c=pl>=0?'var(--green)':'var(--red)';
      return`<td style="${hBgM}color:${c};text-align:right;padding:5px 8px;font-weight:700;white-space:nowrap">${fmtPL(pl)}<br><span style="font-size:9px;opacity:.55;color:var(--text3)">${n}b</span></td>`;
    }).join('')}
  </tr>`;

  const tipRows=allTipsters.map(t=>{
    const acc=byTMonth[t];
    const accC=acc?.pl>=0?'var(--green)':acc?.pl<0?'var(--red)':'var(--text3)';
    const accDetail=acc?[acc.w?`W:${acc.w}`:'',acc.hw?`HW:${acc.hw}`:'',acc.l?`L:${acc.l}`:'',acc.hl?`HL:${acc.hl}`:'',acc.v?`V:${acc.v}`:''].filter(Boolean).join(' '):'';
    const dayCells=daysDesc.map(day=>tipsterCell2(byTDay[day]?.[t])).join('');
    return`<tr>
      <td style="${sT2}${rBgM}font-weight:700;color:var(--text);padding:4px 10px;border-right:1px solid var(--border2);font-size:12px">${t}</td>
      <td style="${sA2}${rBgM}color:${accC};text-align:right;padding:4px 10px;font-weight:700">${acc?fmtPL(acc.pl):'—'}<br><span style="font-size:9px;opacity:.55;color:var(--text3)">${acc?.n||0}b ${accDetail}</span></td>
      ${dayCells}
    </tr>`;
  }).join('');

  const tabelaHTML=mkCard('mensal_tabela',`Dia a Dia — ${moLabel}`,
    `<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:12px;font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums;white-space:nowrap;min-width:400px">
      <thead><tr style="border-bottom:1px solid var(--border2)">
        <th style="${sT2}${hBgM}padding:5px 10px;text-align:left;font-size:9px;text-transform:uppercase;color:var(--text3);border-right:1px solid var(--border2);min-width:130px">Tipster</th>
        <th style="${sA2}${hBgM}padding:5px 10px;text-align:right;font-size:9px;text-transform:uppercase;color:var(--text3);min-width:95px">Mês</th>
        ${dayHdrs}
      </tr></thead>
      <tbody>${dayTotRow}${tipRows}</tbody>
    </table></div>`);

  // Gráfico P/L acumulado diário do mês
  const cumByDay=[];let cum=0;
  days.forEach(day=>{
    const pl=allTipsters.reduce((a,t)=>a+(byTDay[day]?.[t]?.pl||0),0);
    cum+=pl;cumByDay.push({day,pl,cum:parseFloat(cum.toFixed(2))});
  });
  const chartHTML=mkCard('mensal_chart','Evolução do P/L no Mês',
    `<div class="chart-wrap" style="height:240px"><canvas id="chartMensalCum"></canvas></div>`);

  // Tabela comparativa tipsters do mês
  const tipTableRows=allTipsters.map(t=>{
    const d=byTMonth[t];if(!d)return'';
    const tR=rows.filter(r=>r.tipster===t);
    const s=tR.reduce((a,r)=>a+r.stake,0);
    const roi2=s>0?(d.pl/s*100):0;
    const set2=d.w+d.hw+d.l+d.hl;
    const wr2=set2>0?((d.w+d.hw)/set2*100):0;
    const lc=d.pl>=0?'color:var(--green)':'color:var(--red)';
    const rc=roi2>=0?'color:var(--green)':'color:var(--red)';
    const detail=[d.w?`W:${d.w}`:'',d.hw?`HW:${d.hw}`:'',d.l?`L:${d.l}`:'',d.hl?`HL:${d.hl}`:'',d.v?`V:${d.v}`:''].filter(Boolean).join(' ');
    return`<tr><td style="font-weight:700;color:var(--text)">${t}</td><td>${d.n}</td>
      <td><span style="font-size:9px;color:var(--text3)">${detail}</span></td>
      <td style="${lc};font-weight:600">${fmtPL(d.pl)}</td>
      <td>${fmtR(s)}</td>
      <td style="${rc}">${(roi2>=0?'+':'')+roi2.toFixed(2)}%</td>
      <td>${wr2.toFixed(1)}%</td>
      <td>${calcAvgOdd(tR).toFixed(2)}</td></tr>`;
  }).join('');
  const tipLc=totPL>=0?'color:var(--green)':'color:var(--red)';
  const roi=totS>0?(totPL/totS*100):0;
  const tipRc=roi>=0?'color:var(--green)':'color:var(--red)';
  const W=rows.filter(r=>r.resultado==='W').length;
  const HW=rows.filter(r=>r.resultado==='HW').length;
  const L=rows.filter(r=>r.resultado==='L').length;
  const HL=rows.filter(r=>r.resultado==='HL').length;
  const V=rows.filter(r=>r.resultado==='V').length;
  const setTot=W+HW+L+HL;
  const wr=setTot>0?((W+HW)/setTot*100):0;
  const tipTableHTML=mkCard('mensal_tiptable','Tipsters — Comparativo do Mês',
    `<div class="tbl-wrap"><table class="tbl" id="tblMensalTip">
      <thead><tr><th>Tipster<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Resultados</th><th>P/L<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>Win Rate%<span class="sort-icon"></span></th><th>Odd Méd.<span class="sort-icon"></span></th></tr></thead>
      <tbody>
        <tr class="total-row"><td>Total</td><td>${rows.length}</td><td><span style="font-size:9px;color:var(--text3)">W:${W} HW:${HW} L:${L} HL:${HL} V:${V}</span></td><td style="${tipLc};font-weight:700">${fmtPL(totPL)}</td><td>${fmtR(totS)}</td><td style="${tipRc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td>${wr.toFixed(1)}%</td><td>${calcAvgOdd(rows).toFixed(2)}</td></tr>
        ${tipTableRows}
      </tbody>
    </table></div>`);

  cont.innerHTML=heatmapHeroHTML+kpiHTML+chartHTML+tabelaHTML+tipTableHTML;
  setTimeout(()=>{
    makeSortable('tblMensalTip',[1,3,4,5,6,7]);
    const labels=cumByDay.map(d=>{const p=d.day.split('-');return p[2]+'/'+p[1];});
    const dailyVals=cumByDay.map(d=>d.pl);
    const cumVals=cumByDay.map(d=>d.cum);
    mkChart('chartMensalCum',{type:'bar',data:{labels,datasets:[
      {type:'line',data:cumVals,borderColor:'#00C896',tension:.4,pointRadius:3,fill:false,borderWidth:2,yAxisID:'y1',label:'Acumulado'},
      {type:'bar',data:dailyVals,backgroundColor:dailyVals.map(v=>v>=0?'rgba(0,214,143,.6)':'rgba(240,80,110,.6)'),borderRadius:2,yAxisID:'y',label:'Diário'}
    ]},options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'top',labels:{color:isDark()?'#eeedf0':'#0f0f18',font:{size:11},boxWidth:10,padding:12}},tooltip:{callbacks:{label:ctx=>(ctx.dataset.label||'')+': '+fmtPL(ctx.raw)}}},
      scales:{
        x:{ticks:{color:tc(),font:{size:10}},grid:{display:false},border:{display:false}},
        y:{ticks:{color:tc(),font:{size:10},callback:v=>fmtK(v)},grid:{color:gc()},border:{display:false},position:'left'},
        y1:{ticks:{color:tc(),font:{size:10},callback:v=>fmtK(v)},grid:{display:false},border:{display:false},position:'right'}
      }}});
  },100);
}
window.selectMensal=function(v){window._mensalSelMonth=v;renderMensal();}
window.prevMensal=function(){
  const months=getAvailableMonths();const cur=window._mensalSelMonth||months[0];
  const idx=months.indexOf(cur);if(idx<months.length-1){window._mensalSelMonth=months[idx+1];renderMensal();}
}
window.nextMensal=function(){
  const months=getAvailableMonths();const cur=window._mensalSelMonth||months[0];
  const idx=months.indexOf(cur);if(idx>0){window._mensalSelMonth=months[idx-1];renderMensal();}
}

// ── DIÁRIO (nova aba) ────────────────────────────────────────────────────────
function getAvailableDays(){
  return [...new Set(DADOS.map(r=>r.data.slice(0,10)))].sort().reverse();
}
function renderDiario(){
  const cont=document.getElementById('diarioContent');if(!cont)return;
  const days=getAvailableDays();
  if(!days.length){cont.innerHTML='<p style="color:var(--text3);padding:2rem">Sem dados.</p>';return;}
  if(!window._diarioSelDay||!days.includes(window._diarioSelDay))window._diarioSelDay=days[0];
  const selDay=window._diarioSelDay;
  const [yr,mo,dy]=selDay.split('-');
  const dayLabel=`${dy}/${mo}/${yr}`;
  const dp=new Date(selDay+'T12:00:00');
  const dowLabel=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][dp.getDay()];

  const selectorHTML=`<div style="display:flex;align-items:center;gap:16px;margin-bottom:1.5rem;padding:1rem 1.25rem;background:var(--bg3);border:1px solid var(--border);border-radius:8px;flex-wrap:wrap">
    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;font-family:'JetBrains Mono',monospace">Dia</div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      <button onclick="prevDiario()" style="padding:5px 10px;background:var(--bg4);border:1px solid var(--border2);color:var(--text2);border-radius:5px;cursor:pointer;font-size:13px">←</button>
      <select id="diarioDaySel" onchange="selectDiario(this.value)" style="font-size:14px;font-weight:700;padding:6px 12px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:5px;font-family:'Manrope',sans-serif;cursor:pointer">
        ${days.map(d=>{const[y2,m2,d2]=d.split('-');return`<option value="${d}"${d===selDay?' selected':''}>${d2}/${m2}/${y2}</option>`;}).join('')}
      </select>
      <button onclick="nextDiario()" style="padding:5px 10px;background:var(--bg4);border:1px solid var(--border2);color:var(--text2);border-radius:5px;cursor:pointer;font-size:13px">→</button>
      <span style="font-size:12px;color:var(--text3);margin-left:8px;font-family:'JetBrains Mono',monospace">${dowLabel}</span>
    </div>
  </div>`;

  const rows=DADOS.filter(r=>r.data.slice(0,10)===selDay);
  if(!rows.length){cont.innerHTML=selectorHTML+'<p style="color:var(--text3);padding:1rem">Sem apostas neste dia.</p>';return;}

  const allTipsters=[...new Set(rows.map(r=>r.tipster).filter(Boolean))].sort();
  const totPL=rows.reduce((a,r)=>a+r.lucro,0);
  const totS=rows.reduce((a,r)=>a+r.stake,0);
  const roi=totS>0?(totPL/totS*100):0;
  const W=rows.filter(r=>r.resultado==='W').length;
  const HW=rows.filter(r=>r.resultado==='HW').length;
  const L=rows.filter(r=>r.resultado==='L').length;
  const HL=rows.filter(r=>r.resultado==='HL').length;
  const V=rows.filter(r=>r.resultado==='V').length;
  const wr=((W+HW)/((W+HW+L+HL)||1))*100;

  const kpiHTML=mkKpiGrid(rows,{plLabel:'P/L do Dia',contextLabel:'Tipsters Ativos',contextVal:allTipsters.length,contextSub:allTipsters.join(', ')});

  // Tabela de resultados por tipster (P/L, bets, roi, wr, odd)
  const byTipster={};
  rows.forEach(r=>{
    const t=r.tipster;if(!t)return;
    if(!byTipster[t])byTipster[t]={pl:0,n:0,w:0,l:0,hw:0,hl:0,v:0,s:0,wt:0,stk:0};
    byTipster[t].pl+=r.lucro;byTipster[t].n++;byTipster[t].s+=r.stake;
    if(r.resultado==='W')byTipster[t].w++;else if(r.resultado==='L')byTipster[t].l++;
    else if(r.resultado==='HW')byTipster[t].hw++;else if(r.resultado==='HL')byTipster[t].hl++;
    else if(r.resultado==='V')byTipster[t].v++;
    if(r.odd>0&&r.stake>0){byTipster[t].wt+=r.odd*r.stake;byTipster[t].stk+=r.stake;}
  });
  const tipEnts=Object.entries(byTipster).sort((a,b)=>b[1].pl-a[1].pl);
  const tipTableRows=tipEnts.map(([t,d])=>{
    const roi2=d.s>0?(d.pl/d.s*100):0;
    const set2=d.w+d.hw+d.l+d.hl;
    const wr2=set2>0?((d.w+d.hw)/set2*100):0;
    const avgOdd=d.stk>0?d.wt/d.stk:0;
    const lc=d.pl>=0?'color:var(--green)':'color:var(--red)';
    const rc=roi2>=0?'color:var(--green)':'color:var(--red)';
    const detail=[d.w?`W:${d.w}`:'',d.hw?`HW:${d.hw}`:'',d.l?`L:${d.l}`:'',d.hl?`HL:${d.hl}`:'',d.v?`V:${d.v}`:''].filter(Boolean).join(' ');
    return`<tr><td style="font-weight:700;color:var(--text)">${t}</td><td>${d.n}</td>
      <td><span style="font-size:9px;color:var(--text3)">${detail}</span></td>
      <td style="${lc};font-weight:600">${fmtPL(d.pl)}</td>
      <td>${fmtR(d.s)}</td>
      <td style="${rc}">${(roi2>=0?'+':'')+roi2.toFixed(2)}%</td>
      <td>${wr2.toFixed(1)}%</td>
      <td>${avgOdd.toFixed(2)}</td></tr>`;
  }).join('');
  const tipLc=totPL>=0?'color:var(--green)':'color:var(--red)';
  const tipRc=roi>=0?'color:var(--green)':'color:var(--red)';
  const tipTableHTML=mkCard('diario_tips','Tipsters — Resultados do Dia',
    `<div class="tbl-wrap"><table class="tbl" id="tblDiarioTip">
      <thead><tr><th>Tipster<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Resultados</th><th>P/L<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>Win Rate%<span class="sort-icon"></span></th><th>Odd Méd.<span class="sort-icon"></span></th></tr></thead>
      <tbody>
        <tr class="total-row"><td>Total</td><td>${rows.length}</td><td><span style="font-size:9px;color:var(--text3)">W:${W} HW:${HW} L:${L} HL:${HL} V:${V}</span></td><td style="${tipLc};font-weight:700">${fmtPL(totPL)}</td><td>${fmtR(totS)}</td><td style="${tipRc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td>${wr.toFixed(1)}%</td><td>${calcAvgOdd(rows).toFixed(2)}</td></tr>
        ${tipTableRows}
      </tbody>
    </table></div>`);

  // Gráfico de barras: P/L por tipster
  const chartHTML=mkCard('diario_chart','P/L por Tipster',
    `<div class="chart-wrap" style="height:280px"><canvas id="chartDiarioPL"></canvas></div>`);

  // Gráfico distribuição de resultados (stacked)
  const chartResHTML=mkCard('diario_res','Distribuição de Resultados',
    `<div class="chart-wrap" style="height:220px"><canvas id="chartDiarioRes"></canvas></div>`);

  // Lista de apostas do dia — card style
  const RES_LABELS_D={W:'Ganha',HW:'½ Ganha',L:'Perdida',HL:'½ Perdida',V:'Void'};
  const apostasCardsD=rows.slice().sort((a,b)=>b.data.localeCompare(a.data)).map(r=>{
    const plC=r.lucro>0?'var(--green)':r.lucro<0?'var(--red)':'var(--text3)';
    const hora=r.data.length>10?r.data.slice(11,16):'';
    const casaIcon=casaImg(r.casa,13);
    const svgIcon=sportEmoji(r.esporte);
    const resLabel=RES_LABELS_D[r.resultado]||r.resultado;
    return`<div class="bet-card res-${r.resultado}" style="height:${CARD_H}px">
      <div class="bet-card-main" style="min-width:0;overflow:hidden">
        <div class="bet-card-meta">
          ${hora?`<span class="bet-time">${hora}</span>`:''}
          <span class="bet-sport-tag">${svgIcon}<span style="color:var(--text3)">${r.esporte||''}</span></span>
          ${r.tipster?`<span class="bet-tipster">${r.tipster}</span>`:''}
          <span class="bet-casa-pill">${casaIcon}<span>${r.casa||'—'}</span></span>
        </div>
        <div class="bet-aposta">${r.aposta||'—'}</div>
        ${r.descricao?`<div class="bet-desc">${r.descricao}</div>`:''}
      </div>
      <div class="bet-card-nums">
        <div class="bet-num"><span class="bet-res-pill bet-res-${r.resultado}">${resLabel}</span><span class="bet-num-lbl">Resultado</span></div>
        <div class="bet-num"><span class="bet-num-val" style="color:var(--text)">${r.odd.toFixed(2)}</span><span class="bet-num-lbl">Odd</span></div>
        <div class="bet-num"><span class="bet-num-val" style="color:var(--text)">${fmtR(r.stake)}</span><span class="bet-num-lbl">Stake</span></div>
        <div class="bet-num" style="width:90px;min-width:90px"><span class="bet-num-val" style="color:${plC};font-size:12px">${fmtPL(r.lucro)}</span><span class="bet-num-lbl">P/L</span></div>
      </div>
    </div>`;
  }).join('');
  const apostasHTML=mkCard('diario_apostas','Apostas do Dia',`<div>${apostasCardsD}</div>`);

  cont.innerHTML=selectorHTML+kpiHTML+tipTableHTML+chartHTML+chartResHTML+apostasHTML;
  setTimeout(()=>{
    makeSortable('tblDiarioTip',[1,3,4,5,6,7]);
    // tblDiarioApostas replaced with cards
    // Gráfico P/L por tipster — barras com ROI% e WR% visíveis nas barras
    const tLabels=tipEnts.map(e=>e[0]);
    const tVals=tipEnts.map(e=>parseFloat(e[1].pl.toFixed(2)));
    const tRois=tipEnts.map(e=>e[1].s>0?parseFloat((e[1].pl/e[1].s*100).toFixed(2)):0);
    const tWrs=tipEnts.map(e=>{const s=e[1].w+e[1].hw+e[1].l+e[1].hl;return s>0?parseFloat(((e[1].w+e[1].hw)/s*100).toFixed(1)):0;});
    const diarioLabels={id:'diarioLabels',afterDatasetsDraw(chart){
      const{ctx}=chart;
      chart.getDatasetMeta(0).data.forEach((bar,i)=>{
        const pl=tVals[i];const roi=tRois[i];const wr=tWrs[i];
        if(Math.abs(pl)<0.01)return;
        ctx.save();
        ctx.font='bold 11px JetBrains Mono, monospace';
        ctx.fillStyle='rgba(255,255,255,.92)';
        ctx.textAlign=pl>=0?'left':'right';
        ctx.textBaseline='middle';
        const x=pl>=0?bar.x+6:bar.x-6;
        ctx.fillText(`ROI ${(roi>=0?'+':'')+roi.toFixed(1)}%  WR ${wr.toFixed(0)}%`,x,bar.y);
        ctx.restore();
      });
    }};
    mkChart('chartDiarioPL',{type:'bar',data:{labels:tLabels,datasets:[
      {type:'bar',data:tVals,backgroundColor:tVals.map(v=>v>=0?'rgba(0,214,143,.75)':'rgba(240,80,110,.75)'),borderRadius:4,label:'P/L (R$)'},
    ]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
      layout:{padding:{right:180}},
      plugins:{legend:{display:false},
        tooltip:{callbacks:{label:ctx=>`P/L: ${fmtPL(ctx.raw)}  ROI: ${(tRois[ctx.dataIndex]>=0?'+':'')+tRois[ctx.dataIndex].toFixed(2)}%  WR: ${tWrs[ctx.dataIndex].toFixed(1)}%`}}},
      scales:{
        x:{ticks:{color:tc(),font:{size:10},callback:v=>fmtK(v)},grid:{color:gc()},border:{display:false}},
        y:{ticks:{color:tc(),font:{size:11,weight:'600'}},grid:{display:false},border:{display:false}},
      }},plugins:[diarioLabels]});
    // Gráfico distribuição resultados por tipster (stacked)
    const resLabels=tipEnts.map(e=>e[0]);
    mkChart('chartDiarioRes',{type:'bar',data:{labels:resLabels,datasets:[
      {label:'W',data:tipEnts.map(e=>e[1].w||0),backgroundColor:'rgba(0,214,143,.8)',borderRadius:2,stack:'s'},
      {label:'HW',data:tipEnts.map(e=>e[1].hw||0),backgroundColor:'rgba(52,211,153,.7)',borderRadius:2,stack:'s'},
      {label:'HL',data:tipEnts.map(e=>e[1].hl||0),backgroundColor:'rgba(248,113,113,.7)',borderRadius:2,stack:'s'},
      {label:'L',data:tipEnts.map(e=>e[1].l||0),backgroundColor:'rgba(240,80,110,.8)',borderRadius:2,stack:'s'},
      {label:'V',data:tipEnts.map(e=>e[1].v||0),backgroundColor:'rgba(128,128,160,.4)',borderRadius:2,stack:'s'},
    ]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'top',labels:{color:isDark()?'#eeedf0':'#0f0f18',font:{size:11},boxWidth:10,padding:12}},
        tooltip:{callbacks:{label:ctx=>ctx.dataset.label+': '+ctx.raw}}},
      scales:{
        x:{stacked:true,ticks:{color:tc(),font:{size:10}},grid:{color:gc()},border:{display:false}},
        y:{stacked:true,ticks:{color:tc(),font:{size:11,weight:'600'}},grid:{display:false},border:{display:false}}
      }}});
  },100);
}
window.selectDiario=function(v){window._diarioSelDay=v;renderDiario();}
window.prevDiario=function(){
  const days=getAvailableDays();const cur=window._diarioSelDay||days[0];
  const idx=days.indexOf(cur);if(idx<days.length-1){window._diarioSelDay=days[idx+1];renderDiario();}
}
window.nextDiario=function(){
  const days=getAvailableDays();const cur=window._diarioSelDay||days[0];
  const idx=days.indexOf(cur);if(idx>0){window._diarioSelDay=days[idx-1];renderDiario();}
}

// ── SEMANA ───────────────────────────────────────────────────────────────────
function getWeekMonday(dateStr){
  const d=new Date(dateStr+'T12:00:00');
  const day=d.getDay();
  const diff=day===0?-6:1-day; // Monday=0 offset
  d.setDate(d.getDate()+diff);
  return d.toISOString().slice(0,10);
}
function getAvailableWeeks(){
  const days=[...new Set(DADOS.map(r=>r.data.slice(0,10)))].sort();
  const weeks=[...new Set(days.map(d=>getWeekMonday(d)))].sort().reverse();
  return weeks;
}
function renderSemana(){
  const cont=document.getElementById('semanaContent');if(!cont)return;
  const weeks=getAvailableWeeks();
  if(!weeks.length){cont.innerHTML='<p style="color:var(--text3);padding:2rem">Sem dados.</p>';return;}
  if(!window._semanaSelWeek||!weeks.includes(window._semanaSelWeek))window._semanaSelWeek=weeks[0];
  const selWeek=window._semanaSelWeek;
  // End of week = Sunday
  const endDate=new Date(selWeek+'T12:00:00');endDate.setDate(endDate.getDate()+6);
  const endStr=endDate.toISOString().slice(0,10);
  const [ys,ms,ds]=selWeek.split('-');
  const [ye,me,de]=endStr.split('-');
  const weekLabel=`${ds}/${ms}/${ye} → ${de}/${me}/${ye}`;

  const selectorHTML=`<div style="display:flex;align-items:center;gap:16px;margin-bottom:1.5rem;padding:1rem 1.25rem;background:var(--bg3);border:1px solid var(--border);border-radius:8px;flex-wrap:wrap">
    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;font-family:'JetBrains Mono',monospace">Semana</div>
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      <button onclick="prevSemana()" style="padding:5px 10px;background:var(--bg4);border:1px solid var(--border2);color:var(--text2);border-radius:5px;cursor:pointer;font-size:13px">←</button>
      <select id="semanaWeekSel" onchange="selectSemana(this.value)" style="font-size:13px;font-weight:700;padding:6px 12px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);border-radius:5px;font-family:'JetBrains Mono',monospace;cursor:pointer">
        ${weeks.map(w=>{
          const ed=new Date(w+'T12:00:00');ed.setDate(ed.getDate()+6);
          const[yw,mw,dw]=w.split('-');const[ye2,me2,de2]=ed.toISOString().slice(0,10).split('-');
          return`<option value="${w}"${w===selWeek?' selected':''}>${dw}/${mw}/${yw} → ${de2}/${me2}/${ye2}</option>`;
        }).join('')}
      </select>
      <button onclick="nextSemana()" style="padding:5px 10px;background:var(--bg4);border:1px solid var(--border2);color:var(--text2);border-radius:5px;cursor:pointer;font-size:13px">→</button>
      <span style="font-size:11px;color:var(--text3);margin-left:8px;font-family:'JetBrains Mono',monospace">${weekLabel}</span>
    </div>
  </div>`;

  const rows=DADOS.filter(r=>{const d=r.data.slice(0,10);return d>=selWeek&&d<=endStr;});
  if(!rows.length){cont.innerHTML=selectorHTML+'<p style="color:var(--text3);padding:1rem">Sem apostas nesta semana.</p>';return;}

  const allTipsters=[...new Set(rows.map(r=>r.tipster).filter(Boolean))].sort();
  const weekDays=[];{const d=new Date(selWeek+'T12:00:00');for(let i=0;i<7;i++){weekDays.push(d.toISOString().slice(0,10));d.setDate(d.getDate()+1);}}
  const activeDays=weekDays.filter(d=>rows.some(r=>r.data.slice(0,10)===d));

  const totPL=rows.reduce((a,r)=>a+r.lucro,0);
  const totS=rows.reduce((a,r)=>a+r.stake,0);
  const roi=totS>0?(totPL/totS*100):0;
  const wins=rows.filter(r=>['W','HW'].includes(r.resultado)).length;
  const settled=rows.filter(r=>r.resultado!=='V').length;
  const wr=settled>0?(wins/settled*100):0;
  const W=rows.filter(r=>r.resultado==='W').length;
  const L=rows.filter(r=>r.resultado==='L').length;
  const HW=rows.filter(r=>r.resultado==='HW').length;
  const HL=rows.filter(r=>r.resultado==='HL').length;
  const V=rows.filter(r=>r.resultado==='V').length;

  const kpiHTML=mkKpiGrid(rows,{plLabel:'P/L da Semana',contextLabel:'Dias Ativos',contextVal:activeDays.length+' / 7',contextSub:'de seg a dom'});

  // Tabela dia a dia da semana (seg→dom nas colunas)
  const byTipDay={};
  rows.forEach(r=>{
    const d=r.data.slice(0,10),t=r.tipster;if(!t)return;
    if(!byTipDay[t])byTipDay[t]={};
    if(!byTipDay[t][d])byTipDay[t][d]={pl:0,n:0,w:0,l:0,hw:0,hl:0,v:0};
    const cell=byTipDay[t][d];
    cell.pl+=r.lucro;cell.n++;
    if(r.resultado==='W')cell.w++;else if(r.resultado==='L')cell.l++;
    else if(r.resultado==='HW')cell.hw++;else if(r.resultado==='HL')cell.hl++;
    else if(r.resultado==='V')cell.v++;
  });
  const byTipWeek={};
  rows.forEach(r=>{const t=r.tipster;if(!t)return;if(!byTipWeek[t])byTipWeek[t]={pl:0,n:0,w:0,l:0,hw:0,hl:0,v:0,s:0};
    byTipWeek[t].pl+=r.lucro;byTipWeek[t].n++;byTipWeek[t].s+=r.stake;
    if(r.resultado==='W')byTipWeek[t].w++;else if(r.resultado==='L')byTipWeek[t].l++;
    else if(r.resultado==='HW')byTipWeek[t].hw++;else if(r.resultado==='HL')byTipWeek[t].hl++;
    else if(r.resultado==='V')byTipWeek[t].v++;
  });

  function tipCellW(d){
    if(!d||d.n===0)return`<td style="color:var(--text3);text-align:right;padding:4px 8px">—</td>`;
    const c=d.pl>0?'var(--green)':d.pl<0?'var(--red)':'var(--text3)';
    const det=[d.w?`W:${d.w}`:'',d.hw?`HW:${d.hw}`:'',d.l?`L:${d.l}`:'',d.hl?`HL:${d.hl}`:'',d.v?`V:${d.v}`:''].filter(Boolean).join(' ');
    return`<td style="color:${c};text-align:right;padding:4px 8px;white-space:nowrap;vertical-align:top"><span style="font-weight:600">${fmtPL(d.pl)}</span><br><span style="font-size:9px;opacity:.55;color:var(--text3)">${d.n}b ${det}</span></td>`;
  }
  const DOWS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const sT3='position:sticky;left:0;z-index:2;white-space:nowrap;';
  const sA3='position:sticky;left:130px;z-index:2;white-space:nowrap;border-right:1px solid var(--border2);';
  const hBgW='background:var(--bg4);';
  const rBgW='background:var(--bg3);';

  const dayHdrs=weekDays.map(day=>{
    const dp=new Date(day+'T12:00:00');
    const dow=DOWS[dp.getDay()];
    const [,md,dd]=day.split('-');
    const hasData=rows.some(r=>r.data.slice(0,10)===day);
    return`<th style="${hBgW}padding:5px 8px;text-align:right;font-size:9px;text-transform:uppercase;${hasData?'color:var(--text2)':'color:var(--text3);opacity:.5'};white-space:nowrap;min-width:88px">${dow} ${dd}/${md}</th>`;
  }).join('');

  const dayTotRow=`<tr style="border-bottom:2px solid var(--border2)">
    <td style="${sT3}${hBgW}font-weight:700;color:var(--text);padding:5px 10px;border-right:1px solid var(--border2)">Total</td>
    <td style="${sA3}${hBgW}color:${totPL>=0?'var(--green)':'var(--red)'};text-align:right;padding:5px 10px;font-weight:700">${fmtPL(totPL)}</td>
    ${weekDays.map(day=>{
      const pl=allTipsters.reduce((a,t)=>a+(byTipDay[t]?.[day]?.pl||0),0);
      const n=allTipsters.reduce((a,t)=>a+(byTipDay[t]?.[day]?.n||0),0);
      if(n===0)return`<td style="${hBgW}text-align:right;padding:5px 8px;color:var(--text3)">—</td>`;
      const c=pl>=0?'var(--green)':'var(--red)';
      return`<td style="${hBgW}color:${c};text-align:right;padding:5px 8px;font-weight:700;white-space:nowrap">${fmtPL(pl)}<br><span style="font-size:9px;opacity:.55;color:var(--text3)">${n}b</span></td>`;
    }).join('')}
  </tr>`;

  const tipRows=allTipsters.map(t=>{
    const acc=byTipWeek[t];
    const accC=acc?.pl>=0?'var(--green)':acc?.pl<0?'var(--red)':'var(--text3)';
    const accDet=acc?[acc.w?`W:${acc.w}`:'',acc.hw?`HW:${acc.hw}`:'',acc.l?`L:${acc.l}`:'',acc.hl?`HL:${acc.hl}`:'',acc.v?`V:${acc.v}`:''].filter(Boolean).join(' '):'';
    const dayCells=weekDays.map(day=>tipCellW(byTipDay[t]?.[day])).join('');
    return`<tr>
      <td style="${sT3}${rBgW}font-weight:700;color:var(--text);padding:4px 10px;border-right:1px solid var(--border2);font-size:12px">${t}</td>
      <td style="${sA3}${rBgW}color:${accC};text-align:right;padding:4px 10px;font-weight:700">${acc?fmtPL(acc.pl):'—'}<br><span style="font-size:9px;opacity:.55;color:var(--text3)">${acc?.n||0}b ${accDet}</span></td>
      ${dayCells}
    </tr>`;
  }).join('');

  const tabelaHTML=mkCard('semana_tabela',`Dia a Dia — ${weekLabel}`,
    `<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:12px;font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums;white-space:nowrap;min-width:400px">
      <thead><tr style="border-bottom:1px solid var(--border2)">
        <th style="${sT3}${hBgW}padding:5px 10px;text-align:left;font-size:9px;text-transform:uppercase;color:var(--text3);border-right:1px solid var(--border2);min-width:130px">Tipster</th>
        <th style="${sA3}${hBgW}padding:5px 10px;text-align:right;font-size:9px;text-transform:uppercase;color:var(--text3);min-width:95px">Semana</th>
        ${dayHdrs}
      </tr></thead>
      <tbody>${dayTotRow}${tipRows}</tbody>
    </table></div>`);

  // Gráfico barras diárias da semana
  const cumData=[];let cumW=0;
  const dailyPLs=weekDays.map(day=>{
    const pl=rows.filter(r=>r.data.slice(0,10)===day).reduce((a,r)=>a+r.lucro,0);
    cumW+=pl;cumData.push(parseFloat(cumW.toFixed(2)));
    return pl;
  });
  const dayLabels=weekDays.map(day=>{const dp=new Date(day+'T12:00:00');const[,md,dd]=day.split('-');return DOWS[dp.getDay()]+' '+dd+'/'+md;});
  const chartHTML=mkCard('semana_chart','P/L Diário da Semana',
    `<div class="chart-wrap" style="height:240px"><canvas id="chartSemanaPL"></canvas></div>`);

  // Tabela tipsters da semana
  const tipEnts2=Object.entries(byTipWeek).sort((a,b)=>b[1].pl-a[1].pl);
  const tipTableRows2=tipEnts2.map(([t,d])=>{
    const roi2=d.s>0?(d.pl/d.s*100):0;
    const set2=d.w+d.hw+d.l+d.hl;
    const wr2=set2>0?((d.w+d.hw)/set2*100):0;
    const lc=d.pl>=0?'color:var(--green)':'color:var(--red)';
    const rc=roi2>=0?'color:var(--green)':'color:var(--red)';
    const det=[d.w?`W:${d.w}`:'',d.hw?`HW:${d.hw}`:'',d.l?`L:${d.l}`:'',d.hl?`HL:${d.hl}`:'',d.v?`V:${d.v}`:''].filter(Boolean).join(' ');
    return`<tr><td style="font-weight:700;color:var(--text)">${t}</td><td>${d.n}</td>
      <td><span style="font-size:9px;color:var(--text3)">${det}</span></td>
      <td style="${lc};font-weight:600">${fmtPL(d.pl)}</td><td>${fmtR(d.s)}</td>
      <td style="${rc}">${(roi2>=0?'+':'')+roi2.toFixed(2)}%</td><td>${wr2.toFixed(1)}%</td></tr>`;
  }).join('');
  const tipLcW=totPL>=0?'color:var(--green)':'color:var(--red)';
  const tipRcW=roi>=0?'color:var(--green)':'color:var(--red)';
  const tipTableHTML2=mkCard('semana_tips','Tipsters — Comparativo da Semana',
    `<div class="tbl-wrap"><table class="tbl" id="tblSemanaTip">
      <thead><tr><th>Tipster<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Resultados</th><th>P/L<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>Win Rate%<span class="sort-icon"></span></th></tr></thead>
      <tbody>
        <tr class="total-row"><td>Total</td><td>${rows.length}</td><td><span style="font-size:9px;color:var(--text3)">W:${W} HW:${HW} L:${L} HL:${HL} V:${V}</span></td><td style="${tipLcW};font-weight:700">${fmtPL(totPL)}</td><td>${fmtR(totS)}</td><td style="${tipRcW}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td>${wr.toFixed(1)}%</td></tr>
        ${tipTableRows2}
      </tbody>
    </table></div>`);

  // Hero calendar heatmap for the week's month
  const weekMonth=selWeek.slice(0,7);
  window._calHeatCb=null;
  const semanaHeatHTML=mkCard('semana_hero_cal','Calendário — Semana de '+weekLabel,
    `<div id="semanaCalWrap">${mkCalendarHeatmap(weekMonth,DADOS,{
      showNav:false,
      compact:false
    })}</div>`);

  cont.innerHTML=semanaHeatHTML+selectorHTML+kpiHTML+tabelaHTML+chartHTML+tipTableHTML2;
  setTimeout(()=>{
    makeSortable('tblSemanaTip',[1,3,4,5,6]);
    mkChart('chartSemanaPL',{type:'bar',data:{labels:dayLabels,datasets:[
      {type:'line',data:cumData,borderColor:'#00C896',tension:.4,pointRadius:4,pointBackgroundColor:'#00C896',fill:false,borderWidth:2,yAxisID:'y1',label:'Acumulado'},
      {type:'bar',data:dailyPLs,backgroundColor:dailyPLs.map(v=>v>=0?'rgba(0,214,143,.6)':'rgba(240,80,110,.6)'),borderRadius:4,yAxisID:'y',label:'Diário'}
    ]},options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'top',labels:{color:isDark()?'#eeedf0':'#0f0f18',font:{size:11},boxWidth:10,padding:12}},
        tooltip:{callbacks:{label:ctx=>(ctx.dataset.label||'')+': '+fmtPL(ctx.raw)}}},
      scales:{
        x:{ticks:{color:tc(),font:{size:11}},grid:{display:false},border:{display:false}},
        y:{ticks:{color:tc(),font:{size:10},callback:v=>fmtK(v)},grid:{color:gc()},border:{display:false},position:'left'},
        y1:{ticks:{color:tc(),font:{size:10},callback:v=>fmtK(v)},grid:{display:false},border:{display:false},position:'right'}
      }}});
  },100);
}
window.selectSemana=function(v){window._semanaSelWeek=v;renderSemana();}
window.prevSemana=function(){
  const weeks=getAvailableWeeks();const cur=window._semanaSelWeek||weeks[0];
  const idx=weeks.indexOf(cur);if(idx<weeks.length-1){window._semanaSelWeek=weeks[idx+1];renderSemana();}
}
window.nextSemana=function(){
  const weeks=getAvailableWeeks();const cur=window._semanaSelWeek||weeks[0];
  const idx=weeks.indexOf(cur);if(idx>0){window._semanaSelWeek=weeks[idx-1];renderSemana();}
}


function toggleBlock(key){
  const body=document.getElementById('mbody_'+key);
  const tog=document.getElementById('mtog_'+key);
  if(!body)return;
  const isOpen=body.classList.contains('open');
  if(!isOpen){body.classList.add('open');if(tog)tog.style.transform='rotate(180deg)';}
  else{body.classList.remove('open');if(tog)tog.style.transform='';}
}

// Sports & Casas
function buildSummaryTable(tableId,label,ents,isCasa=false){
  const rows=ents.map(([nome,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0,wr=d.t>0?(d.w/d.t*100):0;
    const lc=d.l>=0?'color:var(--green)':'color:var(--red)';
    const rc=roi>=0?'color:var(--green)':'color:var(--red)';
    const label_cell=isCasa?casaCell(nome):sportCell(nome);
    return`<tr><td style="font-weight:600;color:var(--text)">${label_cell}</td><td>${d.n}</td><td>${wr.toFixed(1)}%</td><td>${fmtR(d.s)}</td><td style="${lc}">${fmtPL(d.l)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td></tr>`;
  }).join('');
  const tot=ents.reduce((a,[,d])=>({n:a.n+d.n,w:a.w+d.w,t:a.t+d.t,s:a.s+d.s,l:a.l+d.l}),{n:0,w:0,t:0,s:0,l:0});
  const tRoi=tot.s>0?(tot.l/tot.s*100):0,tWr=tot.t>0?(tot.w/tot.t*100):0;
  const tlc=tot.l>=0?'color:var(--green)':'color:var(--red)';const trc=tRoi>=0?'color:var(--green)':'color:var(--red)';
  return`<div class="tbl-wrap" style="margin-top:.75rem"><table class="tbl" id="${tableId}"><thead><tr><th>${label}<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Win Rate%<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>Profit<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th></tr></thead><tbody>${rows}<tr class="total-row"><td>Total</td><td>${tot.n}</td><td>${tWr.toFixed(1)}%</td><td>${fmtR(tot.s)}</td><td style="${tlc}">${fmtPL(tot.l)}</td><td style="${trc}">${(tRoi>=0?'+':'')+tRoi.toFixed(2)}%</td></tr></tbody></table></div>`;
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

function renderSport(rows){
  const map={};rows.forEach(r=>{if(!map[r.esporte])map[r.esporte]={l:0,s:0,n:0,w:0,t:0};map[r.esporte].l+=r.lucro;map[r.esporte].s+=r.stake;map[r.esporte].n++;if(r.resultado!=='V'){map[r.esporte].t++;if(['W','HW'].includes(r.resultado))map[r.esporte].w++;}});
  const ents=Object.entries(map).filter(e=>e[0]&&e[0]!=='undefined').sort((a,b)=>b[1].l-a[1].l);

  // KPI cards sorted by turnover, 6/row
  const entsByTurnover = [...ents].sort((a,b)=>b[1].s-a[1].s);
  const sportCards = entsByTurnover.map(([sport,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0;
    const wr=d.t>0?(d.w/d.t*100):0;
    const iconHtml=`<span style="font-size:16px">${sportEmoji(sport)}</span>`;
    return mkOneStatCard(iconHtml, sport, d.l, roi, d.s, d.n, `WR ${wr.toFixed(0)}%`);
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
    return mkOneStatCard(iconHtml, casa, d.l, roi, d.s, d.n, `WR ${wr.toFixed(0)}%`);
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
      return mkOneStatCard(iconHtml, t, d.l, roi, d.s, d.n, `WR ${wr.toFixed(0)}%`);
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
    return`<tr><td style="font-weight:700;color:var(--text)">${t}</td><td>${d.n}</td><td>${wr.toFixed(1)}%</td><td>${fmtR(d.s)}</td><td style="${lc}">${fmtPL(d.l)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td>${avgOdd.toFixed(2)}</td><td>${fmtR(avgStake)}</td></tr>`;
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
    return`<tr><td style="font-weight:700;color:var(--text)">${d.tipster}</td><td>${casaCell(d.casa)}</td><td>${d.n}</td><td>${wr.toFixed(1)}%</td><td>${fmtR(d.s)}</td><td style="${lc}">${fmtPL(d.l)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td>${avgOdd.toFixed(2)}</td></tr>`;
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
    return`<tr><td>${MESES[v.mes]} ${v.ano}</td><td>${v.bets}</td><td style="${pc}">${fmtPL(v.pl)}</td><td>${fmtR(v.s)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td>${wr.toFixed(1)}%</td><td>${fmtR(avgStake)}</td><td>${avgOdd.toFixed(2)}</td></tr>`;
  }).join('');
  const tRoi=totS>0?(totPL/totS*100):0,tWr=totT>0?(totW/totT*100):0;
  const tc2=totPL>=0?'color:var(--green)':'color:var(--red)';const rc2=tRoi>=0?'color:var(--green)':'color:var(--red)';
  document.querySelector('#tipsterMonthTable tbody').innerHTML=mHTML+`<tr class="total-row"><td>Total</td><td>${totB}</td><td style="${tc2}">${fmtPL(totPL)}</td><td>${fmtR(totS)}</td><td style="${rc2}">${(tRoi>=0?'+':'')+tRoi.toFixed(2)}%</td><td>${tWr.toFixed(1)}%</td><td>${totB>0?fmtR(totS/totB):'—'}</td><td>—</td></tr>`;
  setTimeout(()=>makeSortable('tipsterMonthTable',[1,2,3,4,5,6,7]),100);
}

// Apostas — espelho da base de dados com virtual scroll
let apostasFiltered=[], apostasSortCol=0, apostasSortAsc=false;
let apostasColFilters={};

function renderApostas(){
  const baseRows=filtrarPagina('apostas');
  apostasFiltered=baseRows.filter(r=>{
    return APOSTAS_COLS.every((col,i)=>{
      const f=(apostasColFilters[i]||'').toLowerCase().trim();
      if(!f)return true;
      const v=col==='lucro'?r.lucro.toFixed(2):col==='stake'?r.stake.toString():col==='odd'?r.odd.toString():(r[col]||'').toString();
      return v.toLowerCase().includes(f);
    });
  });
  apostasFiltered.sort((a,b)=>{
    const col=APOSTAS_COLS[apostasSortCol];
    const av=APOSTAS_NUM.includes(apostasSortCol)?parseFloat(a[col]||0):String(a[col]||'');
    const bv=APOSTAS_NUM.includes(apostasSortCol)?parseFloat(b[col]||0):String(b[col]||'');
    const res=APOSTAS_NUM.includes(apostasSortCol)?(av-bv):av.localeCompare(bv);
    return apostasSortAsc?res:-res;
  });
  // KPI
  const pl=apostasFiltered.reduce((a,r)=>a+r.lucro,0);
  const stake=apostasFiltered.reduce((a,r)=>a+r.stake,0);
  const roi=stake>0?(pl/stake*100):0;
  const wins=apostasFiltered.filter(r=>['W','HW'].includes(r.resultado)).length;
  const settled=apostasFiltered.filter(r=>r.resultado!=='V').length;
  const wr=settled>0?(wins/settled*100):0;
  const avgOddAp=calcAvgOdd(apostasFiltered);
  const avgStakeAp=apostasFiltered.length>0?stake/apostasFiltered.length:0;
  const kpiEl=document.getElementById('apostasKPI');
  if(kpiEl){
    const mkKA=(l,v,c,sub)=>`<div class="kpi" style="height:110px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-start;padding:14px 16px;overflow:hidden"><div class="kpi-label" style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--text3);margin-bottom:8px;white-space:nowrap;flex-shrink:0">${l}</div><div class="kpi-val ${c}" style="font-size:22px;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap;flex-shrink:0">${v}</div>${sub?`<div class="kpi-sub" style="font-size:10px;margin-top:8px;font-family:'JetBrains Mono',monospace;display:flex;flex-wrap:wrap;gap:2px 5px;overflow:hidden">${sub}</div>`:''}</div>`;
    const betsBreak=[
      apostasFiltered.filter(r=>r.resultado==='W').length?`<span class="res-w">W:${apostasFiltered.filter(r=>r.resultado==='W').length}</span>`:'',
      apostasFiltered.filter(r=>r.resultado==='HW').length?`<span class="res-hw">HW:${apostasFiltered.filter(r=>r.resultado==='HW').length}</span>`:'',
      apostasFiltered.filter(r=>r.resultado==='L').length?`<span class="res-l">L:${apostasFiltered.filter(r=>r.resultado==='L').length}</span>`:'',
      apostasFiltered.filter(r=>r.resultado==='HL').length?`<span class="res-hl">HL:${apostasFiltered.filter(r=>r.resultado==='HL').length}</span>`:'',
      apostasFiltered.filter(r=>r.resultado==='V').length?`<span class="res-v">V:${apostasFiltered.filter(r=>r.resultado==='V').length}</span>`:''
    ].filter(Boolean).join('');
    const activeTips=[...new Set(apostasFiltered.map(r=>r.tipster).filter(Boolean))];
    const row1=[
      mkKA('P/L', fmtPL(pl), pl>=0?'pos':'neg', ''),
      mkKA('Turnover', fmtR(stake), 'neu', ''),
      mkKA('ROI', (roi>=0?'+':'')+roi.toFixed(2)+'%', roi>=0?'pos':'neg', ''),
      mkKA('Tipsters Ativos', activeTips.length.toString(), 'neu', activeTips.slice(0,3).join(', ')+(activeTips.length>3?'...':'')),
    ];
    const row2=[
      mkKA('Apostas', apostasFiltered.length.toLocaleString('pt-BR'), 'neu', betsBreak),
      mkKA('Stake Média', fmtR(avgStakeAp), 'neu', 'por aposta'),
      mkKA('Odd Média Pond.', avgOddAp.toFixed(2), 'neu', 'Σ(odd×stake)/Σ(stake)'),
      mkKA('Win Rate', wr.toFixed(1)+'%', wr>=50?'pos':'neg', settled+' encerradas'),
    ];
    kpiEl.innerHTML=
      `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px;width:100%">${row1.join('')}</div>`+
      `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:1rem;width:100%">${row2.join('')}</div>`;
  }
  // Update sort button active states
  document.querySelectorAll('.apostas-sort-btn').forEach(btn=>{
    const ci=parseInt(btn.dataset.col);
    btn.classList.toggle('active',ci===apostasSortCol);
    const arrow=btn.querySelector('.sort-arrow');
    if(arrow)arrow.textContent=ci===apostasSortCol?(apostasSortAsc?'↑':'↓'):'';
  });
  // Virtual scroll render
  renderApostasVirt();
}

function betResLabel(r){return{W:'Ganha',HW:'½ Ganha',L:'Perdida',HL:'½ Perdida',V:'Void'}[r]||r;}
function renderApostasVirt(){
  const cont=document.getElementById('apostasCont');
  if(!cont)return;
  const rows=apostasFiltered;
  const total=rows.length;
  const wrapper=document.getElementById('apostasCardWrap');
  if(!wrapper)return;
  const scrollTop=cont.scrollTop;
  const contH=cont.clientHeight||600;
  const buf=10;
  const startIdx=Math.max(0,Math.floor(scrollTop/CARD_H)-buf);
  const endIdx=Math.min(total,Math.ceil((scrollTop+contH)/CARD_H)+buf);
  const topPad=startIdx*CARD_H;
  const botPad=Math.max(0,(total-endIdx)*CARD_H);
  const RES_LABELS={W:'Ganha',HW:'½ Ganha',L:'Perdida',HL:'½ Perdida',V:'Void'};
  const cards=rows.slice(startIdx,endIdx).map(r=>{
    const d=r.data.slice(0,10);
    const [yr,mo,dy]=d.split('-');
    const hora=r.data.length>10?r.data.slice(11,16):'';
    const dateStr=`${dy}/${mo}`;
    const plC=r.lucro>0?'var(--green)':r.lucro<0?'var(--red)':'var(--text3)';
    const resLabel=RES_LABELS[r.resultado]||r.resultado;
    const resClass=`bet-res-${r.resultado}`;
    const cardClass=`bet-card res-${r.resultado}`;
    const casaIcon=casaImg(r.casa,13);
    const svgIcon=sportEmoji(r.esporte);
    return`<div class="${cardClass}" style="height:${CARD_H}px">
      <div class="bet-card-main" style="min-width:0;overflow:hidden">
        <div class="bet-card-meta">
          <span class="bet-time">${dateStr}${hora?' · '+hora:''}</span>
          <span class="bet-sport-tag">${svgIcon}<span style="color:var(--text3)">${r.esporte||''}</span></span>
          ${r.tipster?`<span class="bet-tipster">${r.tipster}</span>`:''}
          <span class="bet-casa-pill">${casaIcon}<span>${r.casa||'—'}</span></span>
          ${r.parceiro&&r.parceiro!=='—'?`<span style="font-size:9px;color:var(--text3);font-family:'Manrope',sans-serif">${r.parceiro}</span>`:''}
        </div>
        <div class="bet-aposta">${r.aposta||'—'}</div>
        ${r.descricao?`<div class="bet-desc">${r.descricao}</div>`:''}
      </div>
      <div class="bet-card-nums">
        <div class="bet-num">
          <span class="bet-res-pill ${resClass}">${resLabel}</span>
          <span class="bet-num-lbl">Resultado</span>
        </div>
        <div class="bet-num">
          <span class="bet-num-val" style="color:var(--text)">${r.odd.toFixed(2)}</span>
          <span class="bet-num-lbl">Odd</span>
        </div>
        <div class="bet-num">
          <span class="bet-num-val" style="color:var(--text)">${fmtR(r.stake)}</span>
          <span class="bet-num-lbl">Stake</span>
        </div>
        <div class="bet-num" style="width:90px;min-width:90px">
          <span class="bet-num-val" style="color:${plC};font-size:12px">${fmtPL(r.lucro)}</span>
          <span class="bet-num-lbl">P/L</span>
        </div>
      </div>
    </div>`;
  }).join('');
  wrapper.innerHTML=
    `<div class="virt-spacer" style="height:${topPad}px"></div>`+
    cards+
    `<div class="virt-spacer" style="height:${botPad}px"></div>`;
}

function apostasSort(colIdx){
  if(apostasSortCol===colIdx)apostasSortAsc=!apostasSortAsc;
  else{apostasSortCol=colIdx;apostasSortAsc=false;}
  renderApostas();
}
function apostasFilter(colIdx,val){apostasColFilters[colIdx]=val;renderApostas();}
function clearApostasFilters(){
  apostasColFilters={};
  document.querySelectorAll('.acf').forEach(el=>el.value='');
  renderApostas();
}

// Parceiros / Fornecedores
function normForn(f){return(!f||f==='—')?'Eu':f;}

// Persistent cost store
const COST_KEY='dash_custos_v2';
let custoData={};
(()=>{try{custoData=JSON.parse(localStorage.getItem(COST_KEY)||'{}')}catch(e){}})();
function saveCusto(forn,casa,val){
  const k=forn+'||'+casa;
  const n=parseFloat(val.replace(/\./g,'').replace(',','.'));
  if(!isNaN(n)&&n>0)custoData[k]=n; else delete custoData[k];
  try{localStorage.setItem(COST_KEY,JSON.stringify(custoData));}catch(e){}
  recalcCustos();
  renderCostPies();
  // Atualiza card de custo na visão geral e na aba fornecedores
  renderOvCusto();
  const{allForns,allCasas,contaCount}=_costState;
  if(allForns&&allForns.length)renderCustoCards(allForns,allCasas,contaCount);
}
let _costState={allForns:[],allCasas:[],contaCount:{}};

function buildCostState(rows){
  const normRows=rows.map(r=>({...r,fornecedor:normForn(r.fornecedor)}));
  const allForns=[...new Set(normRows.map(r=>r.fornecedor))].sort();
  const allCasasRaw=[...new Set(normRows.map(r=>r.casa).filter(Boolean))];
  const contaMap={};
  normRows.forEach(r=>{const k=r.casa+'||'+r.fornecedor;if(!contaMap[k])contaMap[k]=new Set();contaMap[k].add(r.conta);});
  const contaCount={};
  allForns.forEach(f=>allCasasRaw.forEach(c=>{const s=contaMap[c+'||'+f];contaCount[f+'||'+c]=s?s.size:0;}));
  const casaTotal={};allCasasRaw.forEach(c=>{casaTotal[c]=allForns.reduce((a,f)=>a+(contaCount[f+'||'+c]||0),0);});
  const allCasas=allCasasRaw.slice().sort((a,b)=>(casaTotal[b]||0)-(casaTotal[a]||0));
  _costState={allForns,allCasas,contaCount};
  return _costState;
}

function recalcCustos(){
  const{allForns,allCasas,contaCount}=_costState;
  let grandTot=0;
  const fornTotals={};allForns.forEach(f=>fornTotals[f]=0);
  document.querySelectorAll('#costTbody tr[data-casa]').forEach(tr=>{
    const casa=tr.dataset.casa;
    let rowTot=0;
    allForns.forEach(f=>{
      const k=f+'||'+casa;
      const custo=custoData[k]||0;
      const nContas=contaCount[k]||0;
      const tot=custo*nContas;
      rowTot+=tot;
      fornTotals[f]+=tot;
      const totEl=tr.querySelector('[data-tot-forn="'+f+'"]');
      if(totEl)totEl.textContent=tot>0?'R$ '+fmt(tot,0):'—';
    });
    grandTot+=rowTot;
    const rowTotEl=tr.querySelector('.cost-row-total');
    if(rowTotEl)rowTotEl.textContent=rowTot>0?'R$ '+fmt(rowTot,0):'—';
  });
  allForns.forEach(f=>{
    const el=document.getElementById('cost-col-tot-'+CSS.escape(f));
    if(el)el.textContent=fornTotals[f]>0?'R$ '+fmt(fornTotals[f],0):'—';
  });
  const gt=document.getElementById('cost-grand-total');
  if(gt)gt.textContent=grandTot>0?'R$ '+fmt(grandTot,0):'—';
}

function renderCostPies(){
  const{allForns,allCasas,contaCount}=_costState;
  if(!document.getElementById('chartCostForn'))return;
  const fornTots={};
  allForns.forEach(f=>{fornTots[f]=allCasas.reduce((a,c)=>{const k=f+'||'+c;return a+(custoData[k]||0)*(contaCount[k]||0);},0);});
  const fEnts=Object.entries(fornTots).filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]);
  const casaTots={};
  allCasas.forEach(c=>{casaTots[c]=allForns.reduce((a,f)=>{const k=f+'||'+c;return a+(custoData[k]||0)*(contaCount[k]||0);},0);});
  const cEnts=Object.entries(casaTots).filter(e=>e[1]>0).sort((a,b)=>b[1]-a[1]);
  const PIE_COLORS=['#00C896','#1E90FF','#F5A623','#a78bfa','#2dd4bf','#f87171','#34d399','#fbbf24','#60a5fa','#c084fc','#fb923c','#ffd700','#ff8c69','#dda0dd','#87ceeb'];
  if(!fEnts.length){destroyChart('chartCostForn');destroyChart('chartCostCasa');return;}
  const txtColor=isDark()?'#eeedf0':'#0f0f18';
  const pieOpts=(totalVal)=>({responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{
    legend:{display:true,position:'bottom',align:'center',labels:{
      color:txtColor,
      font:{size:11,family:"'Manrope',sans-serif"},
      boxWidth:10,boxHeight:10,padding:10,borderRadius:3,useBorderRadius:true,
      generateLabels(chart){const ds=chart.data.datasets[0];return chart.data.labels.map((lbl,i)=>{
        const v=ds.data[i];const pct=totalVal>0?(v/totalVal*100).toFixed(1):'0';
        const shortLbl=lbl.length>14?lbl.slice(0,13)+'…':lbl;
        return{text:`${shortLbl}  ${pct}%  ·  R$${fmt(v,0)}`,fillStyle:ds.backgroundColor[i],strokeStyle:'transparent',hidden:false,index:i};
      });}}},
    tooltip:{callbacks:{label:ctx=>{const pct=totalVal>0?(ctx.raw/totalVal*100).toFixed(1):'0';return`${ctx.label}: R$ ${fmt(ctx.raw,0)} (${pct}%)`}}}}});
  const fTotal=fEnts.reduce((a,e)=>a+e[1],0);
  mkChart('chartCostForn',{type:'doughnut',data:{labels:fEnts.map(e=>e[0]),datasets:[{data:fEnts.map(e=>parseFloat(e[1].toFixed(2))),backgroundColor:PIE_COLORS.slice(0,fEnts.length),borderWidth:3,borderColor:isDark()?'#081320':'#fff',hoverOffset:8}]},options:pieOpts(fTotal)});
  const cTotal=cEnts.reduce((a,e)=>a+e[1],0);
  mkChart('chartCostCasa',{type:'doughnut',data:{labels:cEnts.map(e=>e[0]),datasets:[{data:cEnts.map(e=>parseFloat(e[1].toFixed(2))),backgroundColor:PIE_COLORS.slice(0,cEnts.length),borderWidth:3,borderColor:isDark()?'#081320':'#fff',hoverOffset:8}]},options:pieOpts(cTotal)});
}

function buildCostTable(allForns,allCasas,contaCount){
  _costState={allForns,allCasas,contaCount};
  // ── header ──
  const nCols=allForns.map(f=>`<th style="text-align:center;min-width:70px">${f}<br><span style="font-size:9px;color:var(--blue);font-weight:400;font-family:'JetBrains Mono',monospace">Contas</span></th>`).join('');
  const cCols=allForns.map(f=>`<th style="text-align:center;min-width:100px">${f}<br><span style="font-size:9px;color:var(--amber);font-weight:400;font-family:'JetBrains Mono',monospace">Custo/conta</span></th>`).join('');
  const tCols=allForns.map(f=>`<th style="text-align:center;min-width:90px">${f}<br><span style="font-size:9px;color:var(--green);font-weight:400;font-family:'JetBrains Mono',monospace">Total</span></th>`).join('');
  const header=`<tr><th style="text-align:left;position:sticky;left:0;background:var(--bg4);z-index:2;min-width:140px">Casa</th>${nCols}${cCols}${tCols}<th style="text-align:center;border-left:1px solid var(--border2);min-width:100px">Total Geral</th></tr>`;

  // ── total row (topo) ──
  const grandTot=allCasas.reduce((a,c)=>a+allForns.reduce((b,f)=>{const k=f+'||'+c;return b+(custoData[k]||0)*(contaCount[k]||0);},0),0);
  const totNcols=allForns.map(f=>{const n=allCasas.reduce((a,c)=>a+(contaCount[f+'||'+c]||0),0);return`<td style="text-align:center;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:11px">${n||'—'}</td>`;}).join('');
  const totEmptyCols=allForns.map(()=>`<td></td>`).join('');
  const totFornCols=allForns.map(f=>{const tot=allCasas.reduce((a,c)=>{const k=f+'||'+c;return a+(custoData[k]||0)*(contaCount[k]||0);},0);return`<td id="cost-col-tot-${f}" style="text-align:center;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:11px">${tot>0?'R$ '+fmt(tot,0):'—'}</td>`;}).join('');
  const totalRow=`<tr class="total-row" style="border-bottom:2px solid var(--border2)"><td style="position:sticky;left:0;background:var(--bg4);z-index:1;font-weight:700">Total</td>${totNcols}${totEmptyCols}${totFornCols}<td id="cost-grand-total" style="text-align:center;font-weight:700;border-left:1px solid var(--border2);font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--amber)">${grandTot>0?'R$ '+fmt(grandTot,0):'—'}</td></tr>`;

  // ── body rows ──
  const bodyRows=allCasas.map(c=>{
    const nCells=allForns.map(f=>{const n=contaCount[f+'||'+c]||0;return`<td style="text-align:center;font-weight:600;color:${n>0?'var(--text)':'var(--text3)'};font-family:'JetBrains Mono',monospace;font-size:11px">${n||'—'}</td>`;}).join('');
    const inputCells=allForns.map(f=>{
      const k=f+'||'+c;const saved=custoData[k]?custoData[k].toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'';const n=contaCount[k]||0;
      const safe_f=f.replace(/\\/g,'\\\\').replace(/'/g,"\\'");const safe_c=c.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return`<td style="text-align:center;padding:3px 5px">${n>0?`<input type="text" value="${saved}" placeholder="0,00" style="width:84px;text-align:right;padding:3px 7px;background:var(--bg5);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:11px;outline:none" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border2)';saveCusto('${safe_f}','${safe_c}',this.value)" onkeydown="if(event.key==='Enter')this.blur()">`:'<span style="color:var(--text3);font-size:11px">—</span>'}</td>`;
    }).join('');
    const totalCells=allForns.map(f=>{const k=f+'||'+c;const n=contaCount[k]||0;const custo=custoData[k]||0;const tot=custo*n;return`<td data-tot-forn="${f}" style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text2)">${tot>0?'R$ '+fmt(tot,0):'—'}</td>`;}).join('');
    const rowTot=allForns.reduce((a,f)=>{const k=f+'||'+c;return a+(custoData[k]||0)*(contaCount[k]||0);},0);
    return`<tr data-casa="${c}"><td style="font-weight:600;color:var(--text);position:sticky;left:0;background:var(--bg3);z-index:1;padding:4px 8px">${casaCell(c)}</td>${nCells}${inputCells}${totalCells}<td class="cost-row-total" style="text-align:center;font-weight:700;border-left:1px solid var(--border2);font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text)">${rowTot>0?'R$ '+fmt(rowTot,0):'—'}</td></tr>`;
  }).join('');

  document.getElementById('costTableWrap').innerHTML=`
    <p style="font-size:11px;color:var(--text3);margin-bottom:.75rem;font-family:'Manrope',sans-serif">💡 Insira o custo de cada conta comprada por fornecedor/casa. O total é calculado pelo nº de contas ativas. Valores salvos automaticamente no navegador.</p>
    <div class="tbl-wrap"><table class="tbl" id="tblCost"><thead>${header}</thead><tbody id="costTbody">${totalRow}${bodyRows}</tbody></table></div>`;
  setTimeout(()=>makeSortable('tblCost',[]),100);
  renderCostPies();
}

function renderParceiros(rows){
  const normRows=rows.map(r=>({...r,fornecedor:normForn(r.fornecedor)}));
  // ── Resumo por fornecedor ──
  const byForn={};
  normRows.forEach(r=>{const f=r.fornecedor;if(!byForn[f])byForn[f]={l:0,s:0,n:0,contas:new Set()};byForn[f].l+=r.lucro;byForn[f].s+=r.stake;byForn[f].n++;byForn[f].contas.add(r.conta);});
  const fornEnts=Object.entries(byForn).sort((a,b)=>b[1].l-a[1].l);
  const fornNames=fornEnts.map(e=>e[0]);const fornVals=fornEnts.map(e=>parseFloat(e[1].l.toFixed(2)));
  mkChart('chartForn',{type:'bar',data:{labels:fornNames,datasets:[{data:fornVals,backgroundColor:fornVals.map(v=>v>=0?'rgba(0,214,143,.65)':'rgba(240,80,110,.65)'),borderRadius:4}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>'R$ '+fmt(ctx.raw)}}},scales:{x:{ticks:{color:tc(),font:{size:10},callback:v=>'R$'+fmt(v,0)},grid:{color:gc()},border:{display:false}},y:{ticks:{color:tc(),font:{size:11}},grid:{display:false},border:{display:false}}}}});
  const{allForns,allCasas,contaCount}=buildCostState(rows);
  const casaTotal={};allCasas.forEach(c=>{casaTotal[c]=allForns.reduce((a,f)=>a+(contaCount[f+'||'+c]||0),0);});

  // Resumo com custo integrado
  const fornRows=fornEnts.map(([f,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0;
    const custo=allCasas.reduce((a,c)=>{const k=f+'||'+c;return a+(custoData[k]||0)*(contaCount[k]||0);},0);
    const lc=d.l>=0?'color:var(--green)':'color:var(--red)';
    const rc=roi>=0?'color:var(--green)':'color:var(--red)';
    const cc=custo>0?'color:var(--amber)':'color:var(--text3)';
    return`<tr><td style="font-weight:700;color:var(--text)">${f}</td><td>${d.contas.size}</td><td>${d.n}</td><td>${fmtR(d.s)}</td><td style="${lc}">${fmtPL(d.l)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td style="${cc}">${custo>0?'R$ '+fmt(custo,0):'—'}</td></tr>`;
  }).join('');
  const totFornPL=fornEnts.reduce((a,[,d])=>a+d.l,0);
  const totFornS=fornEnts.reduce((a,[,d])=>a+d.s,0);
  const totFornN=fornEnts.reduce((a,[,d])=>a+d.n,0);
  const totFornContas=fornEnts.reduce((a,[,d])=>a+d.contas.size,0);
  const totFornCusto=fornEnts.reduce((a,[f])=>a+allCasas.reduce((b,c)=>{const k=f+'||'+c;return b+(custoData[k]||0)*(contaCount[k]||0);},0),0);
  const totFornROI=totFornS>0?(totFornPL/totFornS*100):0;
  const totFornLC=totFornPL>=0?'color:var(--green)':'color:var(--red)';
  const totFornRC=totFornROI>=0?'color:var(--green)':'color:var(--red)';
  const fornTotalRow=`<tr class="total-row"><td style="font-weight:700">Total</td><td>${totFornContas}</td><td>${totFornN}</td><td>${fmtR(totFornS)}</td><td style="${totFornLC}">${fmtPL(totFornPL)}</td><td style="${totFornRC}">${(totFornROI>=0?'+':'')+totFornROI.toFixed(2)}%</td><td style="color:var(--amber)">${totFornCusto>0?'R$ '+fmt(totFornCusto,0):'—'}</td></tr>`;
  document.getElementById('fornTable').innerHTML=`<table class="tbl" id="tblForn"><thead><tr><th>Fornecedor<span class="sort-icon"></span></th><th>Contas<span class="sort-icon"></span></th><th>Apostas<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>Lucro<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>Custo<span class="sort-icon"></span></th></tr></thead><tbody>${fornTotalRow}${fornRows}</tbody></table>`;
  setTimeout(()=>makeSortable('tblForn',[1,2,3,4,5,6]),100);
  const grandTotal=allCasas.reduce((a,c)=>a+(casaTotal[c]||0),0);
  const totRowCross=`<tr class="total-row" style="border-bottom:2px solid var(--border2)"><td style="position:sticky;left:0;background:var(--bg4);z-index:1;font-weight:700">Total</td>${allForns.map(f=>{const n=allCasas.reduce((a,c)=>a+(contaCount[f+'||'+c]||0),0);return`<td style="text-align:center;font-weight:700">${n||'—'}</td>`;}).join('')}<td style="text-align:center;font-weight:700;border-left:1px solid var(--border2)">${grandTotal}</td></tr>`;
  const crossHeader=`<tr><th style="text-align:left;position:sticky;left:0;background:var(--bg4);z-index:2">Casa</th>${allForns.map(f=>`<th style="text-align:center">${f}<span class="sort-icon"></span></th>`).join('')}<th style="text-align:center;border-left:1px solid var(--border2)">Total<span class="sort-icon"></span></th></tr>`;
  const crossRows=allCasas.map(c=>{const cells=allForns.map(f=>{const n=contaCount[f+'||'+c]||0;return`<td style="text-align:center;color:${n>0?'var(--text)':'var(--text3)'}">${n||'—'}</td>`;}).join('');const tot=casaTotal[c];return`<tr><td style="font-weight:600;color:var(--text);position:sticky;left:0;background:var(--bg3);z-index:1;padding:4px 8px">${casaCell(c)}</td>${cells}<td style="text-align:center;font-weight:700;border-left:1px solid var(--border2)">${tot||'—'}</td></tr>`;}).join('');
  document.getElementById('crossTable').innerHTML=`<div class="tbl-wrap"><table class="tbl" id="tblCross"><thead>${crossHeader}</thead><tbody>${totRowCross}${crossRows}</tbody></table></div>`;
  setTimeout(()=>{makeSortable('tblCross',[...Array(allForns.length+1).keys()].slice(1));},100);

  // ── Cards de custo por fornecedor (lê custoData salvo) ──
  renderCustoCards(allForns,allCasas,contaCount);


  // ── Contas Individuais ──
  const map={};
  normRows.forEach(r=>{const key=r.fornecedor+'||'+r.conta+'||'+r.casa;if(!map[key])map[key]={conta:r.conta,forn:r.fornecedor,casa:r.casa,n:0,s:0,l:0,datas:[]};map[key].n++;map[key].s+=r.stake;map[key].l+=r.lucro;map[key].datas.push(r.data);});
  const accRows=Object.values(map).sort((a,b)=>b.l-a.l).map(e=>{const roi=e.s>0?(e.l/e.s*100):0;const lc=e.l>=0?'color:var(--green)':'color:var(--red)';const rc=roi>=0?'color:var(--green)':'color:var(--red)';const sorted=e.datas.slice().sort();const d1=sorted[0].slice(0,10).split('-'),d2=sorted[sorted.length-1].slice(0,10).split('-');const dias=Math.round((new Date(sorted[sorted.length-1])-new Date(sorted[0]))/864e5);return`<tr><td style="font-weight:700;color:var(--text)">${e.forn}</td><td>${e.conta}</td><td>${casaCell(e.casa)}</td><td>${e.n}</td><td>${fmtR(e.s)}</td><td style="${lc}">${fmtPL(e.l)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(1)}%</td><td>${d1[2]}/${d1[1]}/${d1[0].slice(2)}</td><td>${d2[2]}/${d2[1]}/${d2[0].slice(2)}</td><td>${dias}d</td></tr>`;}).join('');
  document.getElementById('parcTable').innerHTML=`<table class="tbl" id="tblParc"><thead><tr><th>Fornecedor<span class="sort-icon"></span></th><th>Conta<span class="sort-icon"></span></th><th>Casa<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>Profit<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>1ª Aposta<span class="sort-icon"></span></th><th>Última<span class="sort-icon"></span></th><th>Período<span class="sort-icon"></span></th></tr></thead><tbody>${accRows}</tbody></table>`;
  setTimeout(()=>makeSortable('tblParc',[3,4,5,6,9]),100);
}

// ── Custo cards na aba Fornecedores ──
function renderCustoCards(allForns,allCasas,contaCount){
  const el=document.getElementById('fornCustoCards');
  if(!el)return;
  const PIE_COLORS=['#00C896','#1E90FF','#F5A623','#a78bfa','#2dd4bf','#f87171','#34d399','#fbbf24','#60a5fa','#c084fc','#fb923c'];
  const fornTots={};
  allForns.forEach(f=>{fornTots[f]=allCasas.reduce((a,c)=>{const k=f+'||'+c;return a+(custoData[k]||0)*(contaCount[k]||0);},0);});
  const grandCost=Object.values(fornTots).reduce((a,v)=>a+v,0);

  if(!grandCost){
    el.innerHTML=`<div style="text-align:center;padding:2rem;font-size:12px;color:var(--text3);font-family:'Manrope',sans-serif">
      💡 Preencha os custos de contas na aba <strong style="color:var(--amber)">Custos de Contas</strong> para ver o resumo aqui.
    </div>`;
    return;
  }

  const totalContas=allForns.reduce((a,f)=>a+allCasas.reduce((b,c)=>b+(contaCount[f+'||'+c]||0),0),0);
  const contasComPreco=allForns.reduce((a,f)=>a+allCasas.reduce((b,c)=>{const k=f+'||'+c;return b+((custoData[k]||0)>0?(contaCount[k]||0):0);},0),0);
  const avgCostPago=contasComPreco>0?grandCost/contasComPreco:0;

  // Card total consolidado
  const totalCard=`<div style="background:var(--bg4);border:2px solid var(--border2);border-radius:8px;padding:1rem 1.25rem;min-width:200px;flex-shrink:0;display:flex;flex-direction:column;justify-content:center">
    <div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem;font-family:'JetBrains Mono',monospace">Total</div>
    <div style="font-size:26px;font-weight:700;color:var(--amber);font-family:'JetBrains Mono',monospace;letter-spacing:-.02em">R$ ${fmt(grandCost,0)}</div>
    <div style="font-size:11px;color:var(--text2);font-family:'JetBrains Mono',monospace;margin-top:4px">${contasComPreco} contas · R$${fmt(avgCostPago,0)}/conta</div>
    <div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:2px">${allForns.filter(f=>fornTots[f]>0).length} fornecedores</div>
  </div>`;

  // Apenas os cards por fornecedor
  const fornCards=allForns.filter(f=>fornTots[f]>0).sort((a,b)=>fornTots[b]-fornTots[a]).map((f,i)=>{
    const tot=fornTots[f];
    const pct=grandCost>0?(tot/grandCost*100).toFixed(1):0;
    const nContas=allCasas.reduce((a,c)=>a+(contaCount[f+'||'+c]||0),0);
    const nPago=allCasas.reduce((a,c)=>{const k=f+'||'+c;return a+((custoData[k]||0)>0?(contaCount[k]||0):0);},0);
    const avgF=nPago>0?tot/nPago:0;
    const color=PIE_COLORS[i%PIE_COLORS.length];
    const casasComCusto=allCasas.filter(c=>{const k=f+'||'+c;return (custoData[k]||0)>0&&(contaCount[k]||0)>0;});
    const casasF=casasComCusto.sort((a,b)=>{const ka=f+'||'+a,kb=f+'||'+b;return (custoData[kb]||0)*(contaCount[kb]||0)-(custoData[ka]||0)*(contaCount[ka]||0);}).slice(0,5);
    const casaRows=casasF.map(c=>{
      const k=f+'||'+c;const custo=custoData[k]||0;const n=contaCount[k]||0;const subtot=custo*n;
      return`<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text2)">${casaCell(c)}</div>
        <div style="text-align:right;font-size:11px;font-family:'JetBrains Mono',monospace">
          <span style="color:var(--text3)">${n}×R$${fmt(custo,0)}</span>
          <span style="color:var(--text);font-weight:600;margin-left:8px">R$${fmt(subtot,0)}</span>
        </div>
      </div>`;
    }).join('');
    const moreCount=casasComCusto.length-5;
    return`<div style="background:var(--bg4);border:1px solid var(--border);border-top:2px solid ${color};border-radius:8px;padding:1rem;flex:1;min-width:220px;max-width:340px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:.5rem">
        <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
        <div style="font-size:13px;font-weight:700;color:var(--text)">${f}</div>
        <div style="margin-left:auto;font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${pct}% do total</div>
      </div>
      <div style="font-size:24px;font-weight:700;color:var(--amber);font-family:'JetBrains Mono',monospace;letter-spacing:-.02em;margin-bottom:2px">R$ ${fmt(tot,0)}</div>
      <div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-bottom:.75rem">${nContas} contas · média R$${fmt(avgF,0)}/conta</div>
      <div>${casaRows}</div>
      ${moreCount>0?`<div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:5px;text-align:center">+ ${moreCount} casas</div>`:''}
    </div>`;
  }).join('');

  el.innerHTML=`<div style="display:flex;flex-wrap:wrap;gap:.75rem">${totalCard}${fornCards}</div>`;
}
// ── Card de sequências e topo na Visão Geral ──
function renderOvStreaks(rows){
  const el=document.getElementById('ovStreaksContent');
  if(!el||!rows.length)return;
  // Calcula P/L acumulado dia a dia
  const byDay={};rows.forEach(r=>{const k=r.data.slice(0,10);if(!byDay[k])byDay[k]=0;byDay[k]+=r.lucro;});
  const days=Object.keys(byDay).sort();
  let cum=0,peak=0,peakDate='',peakVal=0;
  const cumVals=days.map(d=>{cum+=byDay[d];if(cum>peakVal){peakVal=cum;peakDate=d;}return{d,v:cum};});
  // Sequência positiva atual (dias consecutivos com P/L diário positivo desde o último negativo)
  let posStreak=0,posVal=0,negStreak=0,negVal=0;
  // Positive streak (dias consecutivos de lucro a partir do final)
  for(let i=days.length-1;i>=0;i--){if(byDay[days[i]]>0){posStreak++;posVal+=byDay[days[i]];}else break;}
  // Negative streak
  for(let i=days.length-1;i>=0;i--){if(byDay[days[i]]<0){negStreak++;negVal+=byDay[days[i]];}else break;}
  // Peak date formatted
  const pd=peakDate?peakDate.split('-'):[];
  const peakDateFmt=pd.length===3?`${pd[2]}/${pd[1]}/${pd[0].slice(2)}`:'-';
  // Last day
  const lastDay=days[days.length-1];
  const isPosCurrent=posStreak>0&&byDay[lastDay]>0;
  const isNegCurrent=negStreak>0&&byDay[lastDay]<0;
  el.innerHTML=`
    <div class="kpi-grid" style="margin-bottom:0">
      <div class="kpi" style="border-color:var(--green)22">
        <div class="kpi-label" style="color:var(--green)">Sequência Positiva</div>
        <div class="kpi-val ${isPosCurrent?'pos':'neu'}">${isPosCurrent?posStreak:0} dias</div>
        <div class="kpi-sub">${isPosCurrent?'+ '+fmtPL(posVal).replace('+ ',''):('última: '+posStreak+' dias  +'+fmtR(posVal))}</div>
      </div>
      <div class="kpi" style="border-color:var(--red)22">
        <div class="kpi-label" style="color:var(--red)">Drawdown Atual</div>
        <div class="kpi-val ${isNegCurrent?'neg':'neu'}">${isNegCurrent?negStreak:0} dias</div>
        <div class="kpi-sub">${isNegCurrent?fmtPL(negVal):('último: '+negStreak+' dias')}</div>
      </div>
      <div class="kpi" style="border-color:var(--amber)22">
        <div class="kpi-label" style="color:var(--amber)">Topo Histórico</div>
        <div class="kpi-val pos">${fmtPL(peakVal)}</div>
        <div class="kpi-sub">atingido em ${peakDateFmt}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Distância do Topo</div>
        <div class="kpi-val ${cum<peakVal?'neg':'pos'}">${cum<peakVal?fmtPL(cum-peakVal):fmtPL(0)}</div>
        <div class="kpi-sub">P/L atual: ${fmtPL(cum)}</div>
      </div>
    </div>`;
}

// ── Card de custo na Visão Geral ──
function renderOvCusto(){
  const el=document.getElementById('ovCustoContent');
  if(!el)return;
  if((!_costState.allForns||!_costState.allForns.length)&&DADOS&&DADOS.length){
    buildCostState(DADOS);
  }
  const{allForns,allCasas,contaCount}=_costState;
  if(!allForns||!allForns.length){
    el.innerHTML=`<div style="text-align:center;padding:1.5rem;color:var(--text3);font-size:12px;font-family:'Manrope',sans-serif">Aguardando dados...</div>`;
    return;
  }
  const PIE_COLORS=['#00C896','#1E90FF','#F5A623','#a78bfa','#2dd4bf','#f87171','#34d399','#fbbf24','#60a5fa','#c084fc','#fb923c'];
  const fornTots={};
  allForns.forEach(f=>{fornTots[f]=allCasas.reduce((a,c)=>{const k=f+'||'+c;return a+(custoData[k]||0)*(contaCount[k]||0);},0);});
  const grandCost=Object.values(fornTots).reduce((a,v)=>a+v,0);
  if(!grandCost){
    el.innerHTML=`<div style="text-align:center;padding:1.5rem;color:var(--text3);font-size:12px;font-family:'Manrope',sans-serif">💡 Preencha os custos na aba <strong style="color:var(--amber)">Custos de Contas</strong> para ver o resumo aqui.</div>`;
    return;
  }
  const totalContas=allForns.reduce((a,f)=>a+allCasas.reduce((b,c)=>b+(contaCount[f+'||'+c]||0),0),0);
  // Custo médio só de contas que têm preço configurado (exclui contas grátis)
  const contasComPreco=allForns.reduce((a,f)=>a+allCasas.reduce((b,c)=>{const k=f+'||'+c;return b+((custoData[k]||0)>0?(contaCount[k]||0):0);},0),0);
  const avgCostPago=contasComPreco>0?grandCost/contasComPreco:0;
  const lucroTotal=DADOS.reduce((a,r)=>a+r.lucro,0);
  const lucroLiq=lucroTotal-grandCost;
  const casaTots={};
  allCasas.forEach(c=>{casaTots[c]=allForns.reduce((a,f)=>{const k=f+'||'+c;return a+(custoData[k]||0)*(contaCount[k]||0);},0);});
  const casasComCusto=allCasas.filter(c=>casaTots[c]>0);
  const avgPorCasa=casasComCusto.length>0?grandCost/casasComCusto.length:0;

  // Mini cards por casa — logo, nome em negrito, total acima, custo médio abaixo
  const casaCards=casasComCusto.sort((a,b)=>casaTots[b]-casaTots[a]).map(c=>{
    const nContas=allForns.reduce((a,f)=>a+(contaCount[f+'||'+c]||0),0);
    const nPago=allForns.reduce((a,f)=>{const k=f+'||'+c;return a+((custoData[k]||0)>0?(contaCount[k]||0):0);},0);
    const avg=nPago>0?casaTots[c]/nPago:0;
    return`<div style="background:var(--bg4);border:1px solid var(--border);border-radius:8px;padding:.75rem 1rem;display:flex;align-items:center;gap:12px;min-width:220px">
      <div style="flex-shrink:0;transform:scale(1.3)">${casaImg(c,16)||''}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px">${c}</div>
        <div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-bottom:6px">${nContas} contas</div>
        <div style="display:flex;align-items:baseline;gap:10px">
          <span style="font-size:18px;font-weight:700;color:var(--amber);font-family:'JetBrains Mono',monospace">R$ ${fmt(casaTots[c],0)}</span>
          <span style="font-size:13px;font-weight:600;color:var(--text2);font-family:'JetBrains Mono',monospace">R$${fmt(avg,0)}/conta</span>
        </div>
      </div>
    </div>`;
  }).join('');

  // Cards por fornecedor (idênticos ao card de Fornecedores & Parceiros)
  const fornCards=allForns.filter(f=>fornTots[f]>0).sort((a,b)=>fornTots[b]-fornTots[a]).map((f,i)=>{
    const tot=fornTots[f];
    const pct=grandCost>0?(tot/grandCost*100).toFixed(1):0;
    const nContas=allCasas.reduce((a,c)=>a+(contaCount[f+'||'+c]||0),0);
    const avgF=nContas>0?tot/nContas:0;
    const color=PIE_COLORS[i%PIE_COLORS.length];
    const casasComCustoF=allCasas.filter(c=>{const k=f+'||'+c;return (custoData[k]||0)>0&&(contaCount[k]||0)>0;});
    const casasF=casasComCustoF.sort((a,b)=>{const ka=f+'||'+a,kb=f+'||'+b;return (custoData[kb]||0)*(contaCount[kb]||0)-(custoData[ka]||0)*(contaCount[ka]||0);}).slice(0,5);
    const casaRows=casasF.map(c=>{
      const k=f+'||'+c;const custo=custoData[k]||0;const n=contaCount[k]||0;const subtot=custo*n;
      return`<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text2)">${casaCell(c)}</div>
        <div style="text-align:right;font-size:11px;font-family:'JetBrains Mono',monospace">
          <span style="color:var(--text3)">${n}×R$${fmt(custo,0)}</span>
          <span style="color:var(--text);font-weight:600;margin-left:8px">R$${fmt(subtot,0)}</span>
        </div>
      </div>`;
    }).join('');
    const moreCount=casasComCustoF.length-5;
    return`<div style="background:var(--bg4);border:1px solid var(--border);border-top:2px solid ${color};border-radius:8px;padding:1rem;flex:1;min-width:200px;max-width:340px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:.5rem">
        <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
        <div style="font-size:13px;font-weight:700;color:var(--text)">${f}</div>
        <div style="margin-left:auto;font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--text3)">${pct}% do total</div>
      </div>
      <div style="font-size:22px;font-weight:700;color:var(--amber);font-family:'JetBrains Mono',monospace;letter-spacing:-.02em;margin-bottom:2px">R$ ${fmt(tot,0)}</div>
      <div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-bottom:.75rem">${nContas} contas · média R$${fmt(avgF,0)}/conta</div>
      <div>${casaRows}</div>
      ${moreCount>0?`<div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace;margin-top:5px;text-align:center">+ ${moreCount} casas</div>`:''}
    </div>`;
  }).join('');

  el.innerHTML=`
    <div class="kpi-grid" style="margin-bottom:1rem">
      <div class="kpi"><div class="kpi-label">Custo Total</div><div class="kpi-val neg">R$ ${fmt(grandCost,0)}</div><div class="kpi-sub">${totalContas} contas · ${allForns.filter(f=>fornTots[f]>0).length} fornecedores</div></div>
      <div class="kpi"><div class="kpi-label">P/L Bruto</div><div class="kpi-val ${lucroTotal>=0?'pos':'neg'}">${fmtPL(lucroTotal)}</div><div class="kpi-sub">sem deduzir custos</div></div>
      <div class="kpi"><div class="kpi-label">P/L Líquido</div><div class="kpi-val ${lucroLiq>=0?'pos':'neg'}">${fmtPL(lucroLiq)}</div><div class="kpi-sub">após custo de contas</div></div>
      <div class="kpi"><div class="kpi-label">Custo Médio/Conta</div><div class="kpi-val neu">R$ ${fmt(avgCostPago,0)}</div><div class="kpi-sub">${contasComPreco} contas com preço</div></div>
      <div class="kpi"><div class="kpi-label">Custo Médio/Casa</div><div class="kpi-val neu">R$ ${fmt(avgPorCasa,0)}</div><div class="kpi-sub">${casasComCusto.length} casas com custo</div></div>
    </div>
    ${casasComCusto.length>0?`<div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">${casaCards}</div>`:''}
    <div style="display:flex;flex-wrap:wrap;gap:.75rem">${fornCards}</div>`;
}

// ── Aba Custos de Contas ──
function renderCustos(rows){
  // rows vem do filtrarPagina — sempre disponível após o fetch
  const fonte=rows&&rows.length?rows:DADOS;
  if(!fonte||!fonte.length){
    const wrap=document.getElementById('costTableWrap');
    if(wrap)wrap.innerHTML=`<div style="text-align:center;padding:2rem;color:var(--text3);font-family:'Manrope',sans-serif;font-size:12px">Aguardando carregamento dos dados...</div>`;
    return;
  }
  // Sempre usa DADOS completo para o estado (custos devem refletir todas as contas, não filtradas)
  buildCostState(DADOS.length?DADOS:fonte);
  const{allForns,allCasas,contaCount}=_costState;
  buildCostTable(allForns,allCasas,contaCount);
  // Sem gráficos de pizza — apenas tabela de preenchimento
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
    {l:'Win Rate',v:totWR.toFixed(1)+'%',c:totWR>=50?'pos':'neg',s:`${ents.length} casas`},
    {l:'Odd Média Pond.',v:calcAvgOdd(rows).toFixed(2),c:'neu',s:'Σ(odd×stake)/Σ(stake)'},
  ].map(k=>`<div class="kpi"><div class="kpi-label">${k.l}</div><div class="kpi-val ${k.c}">${k.v}</div><div class="kpi-sub">${k.s}</div></div>`).join('');
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
  if(barEl)barEl.innerHTML=barRows||'<div style="color:var(--text3);font-size:12px;padding:1rem">Sem dados</div>';
  // Tabela detalhada
  const tblRows=ents.map(([c,d])=>{
    const roi=d.s>0?(d.l/d.s*100):0,wr=d.t>0?((d.w+d.hw)/d.t*100):0;
    const avgOdd=d.stk>0?d.wt/d.stk:0;
    const lc=d.l>=0?'color:var(--green)':'color:var(--red)';const rc=roi>=0?'color:var(--green)':'color:var(--red)';
    return`<tr><td style="font-weight:600">${casaCell(c)}</td><td>${d.n}</td><td><span style="color:var(--green)">W:${d.w}</span> <span style="color:var(--hw)">HW:${d.hw}</span> <span style="color:var(--hl)">HL:${d.hl}</span> <span style="color:var(--red)">L:${d.l2}</span> <span style="color:var(--text3)">V:${d.v}</span></td><td>${wr.toFixed(1)}%</td><td>${fmtR(d.s)}</td><td style="${lc};font-weight:600">${fmtPL(d.l)}</td><td style="${rc}">${(roi>=0?'+':'')+roi.toFixed(2)}%</td><td>${avgOdd.toFixed(2)}</td></tr>`;
  }).join('');
  const tblEl=document.getElementById('resultadosCasaTable');
  if(tblEl)tblEl.innerHTML=`<table class="tbl" id="tblResCasa"><thead><tr><th>Casa<span class="sort-icon"></span></th><th>Bets<span class="sort-icon"></span></th><th>Resultados</th><th>Win Rate%<span class="sort-icon"></span></th><th>Turnover<span class="sort-icon"></span></th><th>P/L<span class="sort-icon"></span></th><th>ROI<span class="sort-icon"></span></th><th>Odd Média Pond.<span class="sort-icon"></span></th></tr></thead><tbody>${tblRows}</tbody></table>`;
  setTimeout(()=>makeSortable('tblResCasa',[1,3,4,5,6,7]),100);
}

// Metrics knowledge base
function renderMetrics(rows){
  const mddR=calcMDDreais(rows),mddPct=calcMDDpct(rows);
  const xmdd=calcXMDD(rows),emdd=xmdd*0.85;
  const pval=calcPValue(rows),pl=rows.reduce((a,r)=>a+r.lucro,0);
  const profEmdd=emdd>0?(pl/emdd).toFixed(2):'—';
  const roi=calcROI(rows),wr=calcWR(rows),avgOdd=calcAvgOdd(rows);
  const stake=rows.reduce((a,r)=>a+r.stake,0);
  document.getElementById('metricsKPI').innerHTML=[
    {l:'MDD Real (R$)',v:'R$ '+fmt(mddR,0),c:mddR<5000?'pos':mddR<15000?'neu':'neg'},
    {l:'MDD Real (%)',v:mddPct.toFixed(2)+'%',c:mddPct<15?'pos':mddPct<30?'neu':'neg'},
    {l:'EMDD (R$)',v:'R$ '+fmt(emdd,0),c:emdd<5000?'pos':emdd<15000?'neu':'neg'},
    {l:'XMDD Monte Carlo',v:'R$ '+fmt(xmdd,0),c:xmdd<5000?'pos':xmdd<15000?'neu':'neg'},
    {l:'P-Value',v:pval<0.001?'<0.001':pval.toFixed(3),c:pval<0.05?'pos':pval<0.15?'neu':'neg'},
    {l:'Profit / EMDD',v:profEmdd,c:parseFloat(profEmdd)>=5?'pos':parseFloat(profEmdd)>=2?'neu':'neg'},
  ].map(k=>`<div class="kpi"><div class="kpi-label">${k.l}</div><div class="kpi-val ${k.c}">${k.v}</div></div>`).join('');
}

// Apostas — constantes globais (devem vir antes do buildHTML)
const APOSTAS_COLS=['data','esporte','tipster','casa','parceiro','aposta','descricao','stake','odd','resultado','lucro'];
const APOSTAS_HDRS=['Data','Esporte','Tipster','Casa','Parceiro','Aposta','Descrição','Stake','Odd','Resultado','P/L'];
const APOSTAS_NUM=[7,8,10];
const ROW_H=34;
const CARD_H=76; // card height in px for virtual scroll

// Build HTML
function renderCustoTipster(){
  ctLoad();
  const cont=document.getElementById('custoTipsterContent');
  if(!cont)return;
  const tipsters=[...new Set(DADOS.map(r=>r.tipster).filter(Boolean))].sort();
  const months=ctGetMonths();

  // ── CUSTOS GERAIS ──
  function buildCGRows(){
    return cgData.map((row,idx)=>{
      const totalRow=months.reduce((a,m)=>a+(parseFloat((row.values[m]||'').toString().replace(',','.'))||0),0);
      const vals=months.map(m=>{
        const v=row.values[m]||'';
        return`<td style="padding:3px 5px;text-align:center"><input type="text" value="${v}" placeholder="0,00" data-cgidx="${idx}" data-cgm="${m}" style="width:74px;text-align:right;padding:3px 7px;background:var(--bg5);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:11px;outline:none" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border2)';saveCG(this)" onkeydown="if(event.key==='Enter')this.blur()"></td>`;
      }).join('');
      const tc2=totalRow>0?'color:var(--amber)':'color:var(--text3)';
      return`<tr>
        <td style="padding:4px 8px"><input type="text" value="${row.tipo||''}" placeholder="Descrição do custo" data-cgidx="${idx}" data-cgtipo="1" style="width:160px;padding:3px 7px;background:var(--bg5);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:'Manrope',sans-serif;font-size:12px;outline:none;font-weight:600" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border2)';saveCGTipo(this)" onkeydown="if(event.key==='Enter')this.blur()"></td>
        ${vals}
        <td style="text-align:center;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:11px;border-left:1px solid var(--border2);padding:0 8px;${tc2}">${totalRow>0?'R$ '+fmt(totalRow,0):'—'}</td>
        <td style="text-align:center;padding:0 6px"><button onclick="deleteCG(${idx})" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:13px;line-height:1;padding:2px 4px;border-radius:3px" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--text3)'">✕</button></td>
      </tr>`;
    }).join('');
  }

  function buildCGTotal(){
    return months.map(m=>{
      const tot=cgData.reduce((a,r)=>a+(parseFloat((r.values[m]||'').toString().replace(',','.'))||0),0);
      return`<td style="text-align:center;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--amber)">${tot>0?'R$ '+fmt(tot,0):'—'}</td>`;
    }).join('');
  }

  // ── CUSTO TIPSTERS ──
  function buildCTRows(){
    return tipsters.map(t=>{
      if(!ctData[t])ctData[t]={};
      const totalT=months.reduce((a,m)=>a+(parseFloat((ctData[t][m]||'').toString().replace(',','.'))||0),0);
      const vals=months.map(m=>{
        const v=ctData[t][m]||'';
        return`<td style="padding:3px 5px;text-align:center"><input type="text" value="${v}" placeholder="0,00" data-ct="${t}" data-ctm="${m}" style="width:74px;text-align:right;padding:3px 7px;background:var(--bg5);border:1px solid var(--border2);color:var(--text);border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:11px;outline:none" onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border2)';saveCT(this)" onkeydown="if(event.key==='Enter')this.blur()"></td>`;
      }).join('');
      const tc2=totalT>0?'color:var(--amber)':'color:var(--text3)';
      return`<tr><td style="font-weight:700;color:var(--text);padding:4px 8px">${t}</td>${vals}<td style="text-align:center;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:11px;border-left:1px solid var(--border2);padding:0 8px;${tc2}">${totalT>0?'R$ '+fmt(totalT,0):'—'}</td></tr>`;
    }).join('');
  }

  function buildCTTotal(){
    return months.map(m=>{
      const tot=tipsters.reduce((a,t)=>a+(parseFloat(((ctData[t]||{})[m]||'').toString().replace(',','.'))||0),0);
      return`<td style="text-align:center;font-weight:700;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--amber)">${tot>0?'R$ '+fmt(tot,0):'—'}</td>`;
    }).join('');
  }

  const monthHdrs=months.map(m=>`<th style="text-align:center;min-width:90px">${ctFmtMonth(m)}</th>`).join('');

  cont.innerHTML=`
    <div style="margin-bottom:1rem">
      ${mkCard('cg_table','Custos Gerais',`
        <p style="font-size:11px;color:var(--text3);margin-bottom:.75rem">💡 Adicione qualquer custo fixo ou variável: VPN, ferramentas, taxas, etc. Preencha mensalmente. Valores salvos no navegador.</p>
        <div class="tbl-wrap"><table class="tbl" id="tblCG">
          <thead><tr><th style="text-align:left;min-width:180px">Tipo / Descrição</th>${monthHdrs}<th style="text-align:center;border-left:1px solid var(--border2)">Total</th><th></th></tr></thead>
          <tbody id="cgTbody">
            <tr class="total-row"><td style="font-weight:700">Total</td>${buildCGTotal()}<td style="border-left:1px solid var(--border2)"></td><td></td></tr>
            ${buildCGRows()}
          </tbody>
        </table></div>
        <button onclick="addCG()" style="margin-top:.75rem;padding:5px 14px;background:transparent;border:1px solid var(--border2);color:var(--text2);border-radius:5px;cursor:pointer;font-size:11px;font-family:'Manrope',sans-serif;display:flex;align-items:center;gap:5px" onmouseover="this.style.borderColor='var(--green)';this.style.color='var(--green)'" onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--text2)'">+ Adicionar linha</button>
      `)}
    </div>
    <div>
      ${mkCard('ct_table','Custo por Tipster',`
        <p style="font-size:11px;color:var(--text3);margin-bottom:.75rem">💡 Preencha mensalmente o custo de assinatura/serviço de cada tipster ativo. Valores salvos permanentemente no navegador.</p>
        <div class="tbl-wrap"><table class="tbl" id="tblCT">
          <thead><tr><th style="text-align:left;min-width:130px">Tipster</th>${monthHdrs}<th style="text-align:center;border-left:1px solid var(--border2)">Total</th></tr></thead>
          <tbody>
            <tr class="total-row"><td style="font-weight:700">Total</td>${buildCTTotal()}<td style="border-left:1px solid var(--border2)"></td></tr>
            ${buildCTRows()}
          </tbody>
        </table></div>
      `)}
    </div>`;
}

