// Filter state
const FS={};
function gfs(p){if(!FS[p])FS[p]={df:'',dt:'',qd:0};return FS[p];}
function filtrarPagina(p){
  const st=gfs(p);let d=[...DADOS];
  if(st.df)d=d.filter(r=>r.data>=st.df);
  if(st.dt)d=d.filter(r=>r.data<=st.dt);
  if(st.qd>0){const lim=new Date(Date.now()-st.qd*864e5).toISOString().slice(0,10);d=d.filter(r=>r.data>=lim);}
  const sp=msGet('sp_'+p),ca=msGet('ca_'+p),ti=msGet('ti_'+p);
  if(sp.size>0)d=d.filter(r=>sp.has(r.esporte));
  if(ca.size>0)d=d.filter(r=>ca.has(r.casa));
  if(ti.size>0)d=d.filter(r=>ti.has(r.tipster));
  return d;
}
function setDateF(p,type,val){const st=gfs(p);st.qd=0;if(type==='f')st.df=val;else st.dt=val;rqb(p);renderPage(p);}
function setQuick(p,days){const st=gfs(p);st.qd=days;st.df='';st.dt='';['df_f_'+p,'df_t_'+p].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});rqb(p);renderPage(p);}
function clearDate(p){const st=gfs(p);st.qd=0;st.df='';st.dt='';['df_f_'+p,'df_t_'+p].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});rqb(p);renderPage(p);}
function rqb(p){const st=gfs(p);document.querySelectorAll('#page-'+p+' .qbtn').forEach(b=>{if(b.dataset.all)b.className='qbtn'+(st.qd===0&&!st.df&&!st.dt?' active':'');else b.className='qbtn'+(st.qd===parseInt(b.dataset.days)?' active':'');});}

// Multiselect
const MSS={};
function msGet(id){return MSS[id]||new Set();}
function msInit(id){MSS[id]=new Set();}
function msToggle(id,val){if(!MSS[id])MSS[id]=new Set();if(val==='__all__'){MSS[id]=new Set();return;}if(MSS[id].has(val))MSS[id].delete(val);else MSS[id].add(val);}

function buildMS(id,items,ph,page,cb,withIcons=false){
  if(!MSS[id])MSS[id]=new Set();
  const hs=MSS[id]?.size>0;
  const optItems=items.map(it=>{
    const ico=withIcons?casaImg(it,13):'';
    const isSport=id.startsWith('sp_');
    const emo=isSport?sportEmoji(it):'';    
    const safe=it.replace(/'/g,"\\'").replace(/"/g,'\\"');
    const safeAttr=it.replace(/"/g,'&quot;');
    return`<div class="ms-opt ${MSS[id]?.has(it)?'sel':''}" data-val="${safeAttr}" onclick="toggleMS('${id}','${safe}','${page}','${cb||''}')"><span class="ms-chk">${MSS[id]?.has(it)?'✓':''}</span><span style="display:inline-flex;align-items:center;gap:2px">${ico}${emo}${it}</span></div>`;
  }).join('');
  const selLbl=hs?(MSS[id].size===1?[...MSS[id]][0]:MSS[id].size+' sel.'):ph;
  return`<div class="ms-wrap" id="msw_${id}">
    <div class="ms-btn ${hs?'asel':''}" id="msb_${id}" data-ph="${ph}" data-page="${page}" data-cb="${cb||''}" data-icons="${withIcons?1:0}" onclick="openMS(event,'${id}','${page}','${cb||''}')">
      <span id="msl_${id}">${hs&&withIcons&&MSS[id].size===1?casaImg([...MSS[id]][0],13)+[...MSS[id]][0]:selLbl}</span>
      <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>
    </div>
    <div class="ms-dd" id="msd_${id}">
      <input class="ms-search" style="margin:6px 10px 4px;font-size:11px;padding:4px 8px;background:var(--bg4);border:1px solid var(--border2);color:var(--text2);border-radius:4px;font-family:'JetBrains Mono',monospace;outline:none;flex-shrink:0" type="text" placeholder="Buscar..." oninput="filterMSOpts('${id}')" onclick="event.stopPropagation()">
      <div class="ms-opts-scroll" id="ms-opts-${id}">
        <div class="ms-opt ${!hs?'sel':''}" onclick="toggleMS('${id}','__all__','${page}','${cb||''}')"><span class="ms-chk">${!hs?'✓':''}</span><span>Todos</span></div>
        ${optItems}
      </div>
      <div class="ms-footer">
        <span class="ms-cl" onclick="toggleMS('${id}','__all__','${page}','${cb||''}');event.stopPropagation()">Limpar</span>
        <button class="ms-ok" onclick="applyMS('${id}','${page}','${cb||''}');event.stopPropagation()">OK</button>
      </div>
    </div>
  </div>`;
}
function filterMSOpts(id){
  const inp=document.querySelector(`#msd_${id} .ms-search`);
  if(!inp)return;
  const q=inp.value.toLowerCase();
  const optsWrap=document.getElementById('ms-opts-'+id);
  if(!optsWrap)return;
  optsWrap.querySelectorAll('.ms-opt').forEach((o,i)=>{
    if(i===0){o.style.display='';return;}// "Todos" always visible
    const v=o.querySelector('span:last-child')?.textContent||'';
    o.style.display=v.toLowerCase().includes(q)?'':'none';
  });
}
function openMS(e,id,page,cb){
  e.stopPropagation();
  const btn=document.getElementById('msb_'+id),drop=document.getElementById('msd_'+id);
  if(!drop)return;
  const isOpen=drop.classList.contains('open');
  document.querySelectorAll('.ms-dd.open').forEach(d=>d.classList.remove('open'));
  if(!isOpen){
    const rect=btn.getBoundingClientRect();
    drop.style.top=(rect.bottom+4)+'px';
    drop.style.left=rect.left+'px';
    drop.classList.add('open');
    // focus search
    setTimeout(()=>{const s=drop.querySelector('.ms-search');if(s){s.value='';filterMSOpts(id);s.focus();}},50);
  }
}
document.addEventListener('click',(e)=>{if(!e.target.closest('.ms-dd')&&!e.target.closest('.ms-btn'))document.querySelectorAll('.ms-dd.open').forEach(d=>d.classList.remove('open'));});
// toggleMS: só marca/desmarca e atualiza visual, NÃO renderiza
function toggleMS(id,val,page,cb){
  msToggle(id,val);
  refreshMS(id);
  // update checkmarks visually without closing or re-rendering
  const optsWrap=document.getElementById('ms-opts-'+id);
  if(optsWrap){
    if(val==='__all__'){
      optsWrap.querySelectorAll('.ms-opt').forEach((o,i)=>{
        o.classList.toggle('sel',i===0);
        const chk=o.querySelector('.ms-chk');if(chk)chk.textContent=i===0?'✓':'';
      });
    } else {
      const hs=MSS[id]?.size>0;
      // update "Todos" option
      const todos=optsWrap.querySelector('.ms-opt:first-child');
      if(todos){todos.classList.toggle('sel',!hs);const chk=todos.querySelector('.ms-chk');if(chk)chk.textContent=!hs?'✓':'';}
      // update the clicked option
      optsWrap.querySelectorAll('.ms-opt').forEach(o=>{
        const v=o.dataset.val;if(v===undefined)return;
        const sel=MSS[id]?.has(v);
        o.classList.toggle('sel',sel);
        const chk=o.querySelector('.ms-chk');if(chk)chk.textContent=sel?'✓':'';
      });
    }
  }
}
// applyMS: fecha o dropdown e dispara o render
function applyMS(id,page,cb){
  document.querySelectorAll('.ms-dd.open').forEach(d=>d.classList.remove('open'));
  if(cb&&window[cb])window[cb](page);else renderPage(page);
}
function clickMS(id,val,page,cb){msToggle(id,val);refreshMS(id);if(cb&&window[cb])window[cb](page);else renderPage(page);}
function refreshMS(id){
  const hs=MSS[id]?.size>0;
  const btn=document.getElementById('msb_'+id),lbl=document.getElementById('msl_'+id),drop=document.getElementById('msd_'+id);
  const ph=btn?.dataset?.ph||'';
  const withIcons=btn?.dataset?.icons==='1';
  if(lbl){
    if(hs){
      if(withIcons&&MSS[id].size===1){lbl.innerHTML=casaImg([...MSS[id]][0],13)+[...MSS[id]][0];}
      else lbl.textContent=MSS[id].size===1?[...MSS[id]][0]:MSS[id].size+' sel.';
    }else lbl.textContent=ph;
  }
  if(btn)btn.className='ms-btn'+(hs?' asel':'');
  if(drop){
    const optsWrap=document.getElementById('ms-opts-'+id);
    if(optsWrap)optsWrap.querySelectorAll('.ms-opt').forEach((o,i)=>{
      if(i===0){o.className='ms-opt'+(!hs?' sel':'');o.querySelector('.ms-chk').textContent=!hs?'✓':'';return;}
      const v=o.querySelector('span:last-child')?.textContent||o.querySelector('span:last-child')?.innerText||'';
      const s=MSS[id]?.has(v);
      o.className='ms-opt'+(s?' sel':'');
      o.querySelector('.ms-chk').textContent=s?'✓':'';
    });
    const cl=drop.querySelector('.ms-cl');
    if(hs&&!cl){const d=document.createElement('div');d.className='ms-cl';d.textContent='Limpar seleção';d.onclick=()=>{msToggle(id,'__all__');refreshMS(id);renderPage(id.split('_').pop());};drop.appendChild(d);}
    else if(!hs&&cl)cl.remove();
  }
}

function buildFilters(p,sports,casas,tipsters){
  const st=gfs(p);
  return`<div class="filters">
    <div class="filter-group">
      <div class="filter-label">Período</div>
      <div class="date-row">
        <input type="date" id="df_f_${p}" value="${st.df}" onchange="setDateF('${p}','f',this.value)">
        <span class="date-sep">→</span>
        <input type="date" id="df_t_${p}" value="${st.dt}" onchange="setDateF('${p}','t',this.value)">
      </div>
      <div class="quick-btns">
        <button class="qbtn ${st.qd===7?'active':''}" data-days="7" onclick="setQuick('${p}',7)">7d</button>
        <button class="qbtn ${st.qd===15?'active':''}" data-days="15" onclick="setQuick('${p}',15)">15d</button>
        <button class="qbtn ${st.qd===30?'active':''}" data-days="30" onclick="setQuick('${p}',30)">30d</button>
        <button class="qbtn ${st.qd===90?'active':''}" data-days="90" onclick="setQuick('${p}',90)">90d</button>
        <button class="qbtn ${st.qd===0&&!st.df&&!st.dt?'active':''}" data-all="1" onclick="clearDate('${p}')">Tudo</button>
      </div>
    </div>
    <div class="filter-group"><div class="filter-label">Esporte</div>${buildMS('sp_'+p,sports,'Todos os esportes',p)}</div>
    <div class="filter-group"><div class="filter-label">Casa</div>${buildMS('ca_'+p,casas,'Todas as casas',p,'',true)}</div>
    ${tipsters?`<div class="filter-group"><div class="filter-label">Tipster</div>${buildMS('ti_'+p,tipsters,'Todos os tipsters',p)}</div>`:''}
  </div>`;
}
