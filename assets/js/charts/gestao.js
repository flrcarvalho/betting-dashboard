// ── gestao.js — Custos, Parceiros, Métricas, Custo Tipster ──────────────────────

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
  const PIE_COLORS=['#2BC07E','#2E8BFF','#E0A21A','#7FB2FF','#95A1B0','#E5524B','#34d399','#fbbf24','#60a5fa','#AEB7C2','#fb923c','#E0A21A','#1E7CF0','#AEB7C2','#60a5fa'];
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
  mkChart('chartCostForn',{type:'doughnut',data:{labels:fEnts.map(e=>e[0]),datasets:[{data:fEnts.map(e=>parseFloat(e[1].toFixed(2))),backgroundColor:PIE_COLORS.slice(0,fEnts.length),borderWidth:3,borderColor:isDark()?'#0A0D12':'#fff',hoverOffset:8}]},options:pieOpts(fTotal)});
  const cTotal=cEnts.reduce((a,e)=>a+e[1],0);
  mkChart('chartCostCasa',{type:'doughnut',data:{labels:cEnts.map(e=>e[0]),datasets:[{data:cEnts.map(e=>parseFloat(e[1].toFixed(2))),backgroundColor:PIE_COLORS.slice(0,cEnts.length),borderWidth:3,borderColor:isDark()?'#0A0D12':'#fff',hoverOffset:8}]},options:pieOpts(cTotal)});
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
  const PIE_COLORS=['#2BC07E','#2E8BFF','#E0A21A','#7FB2FF','#95A1B0','#E5524B','#34d399','#fbbf24','#60a5fa','#AEB7C2','#fb923c'];
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
