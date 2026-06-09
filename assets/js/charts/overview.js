// ── overview.js — Gráficos e cards da Visão Geral ──────────────────────────────

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
  // ── Sparkline: últimos 90 dias de P/L acumulado ──────────────────────────
  const byDay90={};
  rows.forEach(r=>{const k=r.data.slice(0,10);if(!byDay90[k])byDay90[k]=0;byDay90[k]+=r.lucro;});
  const days90=Object.keys(byDay90).sort().slice(-90);
  let cum90=0;const cumPL90=days90.map(d=>{cum90+=byDay90[d];return parseFloat(cum90.toFixed(2));});
  const spark=mkSparkline(cumPL90,96,26);

  // ── Andar 1: P/L Bruto → Custo Conta → Custo Tipster → P/L Líquido ────────
  const row1=[
    {l:'P/L Bruto',v:fmtPL(lucro),c:lucro>=0?'pos':'neg',s:'antes de custos',accent:''},
    {l:'Custo de Contas',v:costConta>0?fmtPL(-costConta):fmtR(0),c:costConta>0?'neg':'neu',s:'total aquisição',accent:''},
    {l:'Custo de Tipsters',v:costTipster>0?fmtPL(-costTipster):fmtR(0),c:costTipster>0?'neg':'neu',s:'assinaturas / serviços',accent:''},
    {l:'P/L Líquido',v:fmtPL(lucroLiq),c:lucroLiq>=0?'pos':'neg',s:'resultado final',accent:'background:rgba(46,139,255,0.08);border-color:rgba(46,139,255,.22);',spark},
  ];
  // ── Andar 2: Turnover → ROI → Odd Média → Win Rate ──────────────────────
  const row2=[
    {l:'Turnover',v:fmtR(stake),c:'neu',s:'volume apostado'},
    {l:'ROI',v:(roi>=0?'+':'')+roi.toFixed(2)+'%',c:roi>=0?'pos':'neg',s:n+' apostas'},
    {l:'Odd Média Pond.',v:calcAvgOdd(rows).toFixed(2),c:'neu',s:'Σ(odd×stake)/Σ(stake)'},
    {l:'Win Rate',v:wr.toFixed(1)+'%',c:'neu',s:`<span class="res-w">W:${W}</span> <span class="res-hw">HW:${HW}</span> <span class="res-l">L:${L}</span> <span class="res-hl">HL:${HL}</span> <span class="res-v">V:${V}</span>`,bar:wr},
  ];
  const divider=`<div style="grid-column:1/-1;height:1px;background:var(--border);margin:2px 0;opacity:.6"></div>`;
  document.getElementById('kpiGrid').innerHTML=
    `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:.5rem">${row1.map(k=>`<div class="kpi" style="position:relative;${k.accent||''}">${k.accent?`<div style="position:absolute;top:0;left:0;right:0;height:2px;background:var(--accent);border-radius:8px 8px 0 0;opacity:.8"></div>`:''}<div class="kpi-label"><span class="kpi-pipe"></span> ${k.l}</div><div class="kpi-val ${k.c}">${k.v}</div><div class="kpi-sub">${k.s}</div>${k.spark?`<div class="kpi-sparkline">${k.spark}</div>`:''}</div>`).join('')}</div>`+
    `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:1.25rem">${row2.map(k=>`<div class="kpi"><div class="kpi-label"><span class="kpi-pipe"></span> ${k.l}</div><div class="kpi-val ${k.c}">${k.v}</div>${k.bar!==undefined?`<div class="wrc"><div class="t"><div class="f" style="width:${Math.min(100,Math.max(0,k.bar)).toFixed(1)}%"></div></div></div>`:''}<div class="kpi-sub">${k.s}</div></div>`).join('')}</div>`;
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
  const ptR=cumPL.map((_,i)=>i===cumPL.length-1?5:0);
  mkChart('chartBankroll',{type:'bar',data:{labels:lbl,datasets:[
    {type:'line',data:cumPL,
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
          generateLabels:()=>[
            {text:'P/L acumulado',strokeStyle:'#2E8BFF',fillStyle:'#2E8BFF',lineWidth:2,pointStyle:'line',hidden:false,datasetIndex:0},
            {text:'Dia positivo', strokeStyle:'rgba(43,192,126,.8)',fillStyle:'rgba(43,192,126,.8)',lineWidth:0,pointStyle:'rect',hidden:false,datasetIndex:1},
            {text:'Dia negativo', strokeStyle:'rgba(229,82,75,.8)',fillStyle:'rgba(229,82,75,.8)',lineWidth:0,pointStyle:'rect',hidden:false,datasetIndex:1}
          ]}},
      tooltip:{callbacks:{label:ctx=>(ctx.dataset.label||'')+': '+fmtK(ctx.raw),title:ctx=>{const i=ctx[0].dataIndex;return days[i]?.split('-').reverse().join('/')||'';},}}},
    scales:{
      x:{display:false},
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
    {type:'bar',data:counts,backgroundColor:'rgba(46,139,255,.55)',borderRadius:3,label:'Apostas',yAxisID:'y'},
    {type:'line',data:wrs,borderColor:'#2BC07E',backgroundColor:'transparent',tension:.3,pointRadius:5,pointBackgroundColor:'#2BC07E',borderWidth:2,label:'Win Rate %',yAxisID:'y1',spanGaps:false},
    {type:'line',data:rois,borderColor:'#E0A21A',backgroundColor:'transparent',tension:.3,pointRadius:5,pointBackgroundColor:'#E0A21A',borderWidth:2,label:'ROI %',yAxisID:'y2',borderDash:[4,3],spanGaps:false}
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},
    plugins:{legend:{display:true,position:'top',labels:{color:tc(),font:{size:11},boxWidth:12,padding:16}},
      tooltip:{callbacks:{label:ctx=>{if(ctx.datasetIndex===0)return'Apostas: '+ctx.raw;if(ctx.datasetIndex===1)return'Win Rate: '+(ctx.raw?.toFixed(1)||'—')+'%';return'ROI: '+(ctx.raw?.toFixed(2)||'—')+'%';}}}},
    scales:{
      x:{ticks:{color:tc(),font:{size:10}},grid:{display:false},border:{display:false}},
      y:{ticks:{color:tc(),font:{size:10}},grid:{color:gc()},border:{display:false},position:'left'},
      y1:{ticks:{color:'#2BC07E',font:{size:10},callback:v=>v+'%'},grid:{display:false},border:{display:false},position:'right'},
      y2:{ticks:{color:'#E0A21A',font:{size:10},callback:v=>v+'%'},grid:{display:false},border:{display:false},position:'right',offset:true}
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

// ── Overview Heatmap Calendar ─────────────────────────────────────────────────
function renderOvHeatmap(){
  const cont=document.getElementById('ovHeatmapContent');if(!cont)return;
  if(!DADOS||!DADOS.length){cont.innerHTML=mkEmpty('Sem dados carregados');return;}
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
        <div class="kpi-sub">${isPosCurrent?fmtPL(posVal):('última: '+posStreak+' dias  +'+fmtR(posVal))}</div>
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
    el.innerHTML=`<div style="text-align:center;padding:1.5rem;color:var(--text3);font-size:12px;font-family:var(--font-sans)">Aguardando dados...</div>`;
    return;
  }
  const PIE_COLORS=['#2BC07E','#2E8BFF','#E0A21A','#7FB2FF','#95A1B0','#E5524B','#34d399','#fbbf24','#60a5fa','#AEB7C2','#fb923c'];
  const fornTots={};
  allForns.forEach(f=>{fornTots[f]=allCasas.reduce((a,c)=>{const k=f+'||'+c;return a+(custoData[k]||0)*(contaCount[k]||0);},0);});
  const grandCost=Object.values(fornTots).reduce((a,v)=>a+v,0);
  if(!grandCost){
    el.innerHTML=`<div style="text-align:center;padding:1.5rem;color:var(--text3);font-size:12px;font-family:var(--font-sans)">💡 Preencha os custos na aba <strong style="color:var(--amber)">Custos de Contas</strong> para ver o resumo aqui.</div>`;
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

      <div class="kpi"><div class="kpi-label">Custo Médio/Conta</div><div class="kpi-val neu">R$ ${fmt(avgCostPago,0)}</div><div class="kpi-sub">${contasComPreco} contas com preço</div></div>
      <div class="kpi"><div class="kpi-label">Custo Médio/Casa</div><div class="kpi-val neu">R$ ${fmt(avgPorCasa,0)}</div><div class="kpi-sub">${casasComCusto.length} casas com custo</div></div>
    </div>
    ${casasComCusto.length>0?`<div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border)">${casaCards}</div>`:''}
    <div style="display:flex;flex-wrap:wrap;gap:.75rem">${fornCards}</div>`;
}
