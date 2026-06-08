// ── temporal.js — Views temporais: Consolidado, Mensal, Diário, Semana ──────────

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
      {type:'line',data:cumVals,borderColor:'#2BC07E',tension:.4,pointRadius:3,fill:false,borderWidth:2,yAxisID:'y1',label:'Acumulado'},
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
  const chartHTML=mkCard('semana_chart','Resultado Geral',
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
    function getBarColor(value, pos, neg) {
      if (value >= 0) {
        if (value < pos[0]) return '#1a4a2e';
        if (value < pos[1]) return '#166534';
        if (value < pos[2]) return '#15803d';
        if (value < pos[3]) return '#16a34a';
        return '#22c55e';
      } else {
        const abs = Math.abs(value);
        if (abs < neg[0]) return '#4a1a1a';
        if (abs < neg[1]) return '#7f1d1d';
        if (abs < neg[2]) return '#991b1b';
        if (abs < neg[3]) return '#b91c1c';
        return '#ef4444';
      }
    }
    function calcPercentiles(values) {
      const sorted = [...values].sort((a, b) => a - b);
      return [0.2, 0.4, 0.6, 0.8].map(p => sorted[Math.floor(p * sorted.length)] || 0);
    }
    const posVals = dailyPLs.filter(v => v > 0);
    const negVals = dailyPLs.filter(v => v < 0).map(v => Math.abs(v));
    const posPerc = calcPercentiles(posVals);
    const negPerc = calcPercentiles(negVals);
    mkChart('chartSemanaPL',{type:'bar',data:{labels:dayLabels,datasets:[
      {type:'line',data:cumData,borderColor:'#7FB2FF',tension:.4,pointRadius:4,pointBackgroundColor:'#7FB2FF',fill:false,borderWidth:2,yAxisID:'y1',label:'Acumulado'},
      {type:'bar',data:dailyPLs,backgroundColor:dailyPLs.map(v=>getBarColor(v,posPerc,negPerc)),borderRadius:4,yAxisID:'y',label:'Diário'}
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

