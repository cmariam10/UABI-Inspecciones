
const $id=(id)=>document.getElementById(id);
const fSec=$id('fSec'), fArq=$id('fArq'), fEst=$id('fEst'), fElem=$id('fElem'), fAnalisis=$id('fAnalisis'), fOpp=$id('fOpp'), fYear=$id('fYear'), fSearch=$id('fSearch');
const btnClear=$id('btnClear'), btnFit=$id('btnFit');
const kInm=$id('kInm'), kFis=$id('kFis'), kAnalisis=$id('kAnalisis'), kOpp=$id('kOpp');
const pAnalisis=$id('pAnalisis'), pOpp=$id('pOpp');
const a0=$id('a0'), a1=$id('a1'), a2=$id('a2'), a3=$id('a3'), pa0=$id('pa0'), pa1=$id('pa1'), pa2=$id('pa2'), pa3=$id('pa3');
const e0=$id('e0'), e1=$id('e1'), e2=$id('e2'), e3=$id('e3'), pe0=$id('pe0'), pe1=$id('pe1'), pe2=$id('pe2'), pe3=$id('pe3');
const analisisBody=$id('analisisBody'), oppMiniBody=$id('oppMiniBody'), secBody=$id('secBody'), elemFullBody=$id('elemFullBody'), oppBody=$id('oppBody'), tbody=$id('tbody');


let points = [];
let elementRows = [];

async function cargarDatos() {
  try {
    const [respInmuebles, respElementos] = await Promise.all([
      fetch('data/inspecciones.json'),
      fetch('data/elementos.json')
    ]);

    if (!respInmuebles.ok || !respElementos.ok) {
      throw new Error('No fue posible cargar los archivos JSON del visor.');
    }

    points = await respInmuebles.json();
    elementRows = await respElementos.json();
    iniciarVisor();
  } catch (error) {
    console.error(error);
    document.body.insertAdjacentHTML('afterbegin', `<div style="padding:12px;background:#fff3cd;color:#664d03;border-bottom:1px solid #ffecb5;font-family:Segoe UI,Arial,sans-serif">No se pudieron cargar los datos. Si estás abriendo el archivo directamente, usa GitHub Pages o un servidor local.</div>`);
  }
}

function iniciarVisor(){
const fmt=n=>Number(n||0).toLocaleString('es-CO');
const pct=(a,b)=>b?((a/b)*100).toFixed(1).replace('.',',')+'%':'0%';

// Limpieza de registros de prueba o con datos personales en dirección.
(function(){
  const esRegistroPrueba = p => /mariam\s*peña|prueba/i.test(String(p.direccion||''));
  for (let i = points.length - 1; i >= 0; i--) {
    if (esRegistroPrueba(points[i])) points.splice(i, 1);
  }
  const idsValidos = new Set(points.map(p => String(p.id||'')+'|'+String(p.gid||'')));
  if (typeof elementRows !== 'undefined') {
    for (let i = elementRows.length - 1; i >= 0; i--) {
      const r = elementRows[i];
      if (!idsValidos.has(String(r.id||'')+'|'+String(r.gid||''))) elementRows.splice(i, 1);
    }
  }
})();
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function riskClass(score){return score===3?'n3':score===2?'n2':score===1?'n1':'n0';}
function dotRisk(r){let c=r==='Nivel 1'?'r1':r==='Nivel 2'?'r2':r==='Nivel 3'?'r3':'r0';const label=(r==='Sin riesgo'||r==='No posee'||!r)?'Sin riesgo':r;return `<span class="pill"><i class="dot ${c}"></i>${esc(label)}</span>`;}
function fillSelect(id, vals, label){document.getElementById(id).innerHTML='<option value="">'+label+'</option>'+vals.filter(v=>v!==undefined&&v!==null&&String(v).trim()).map(v=>`<option>${esc(v)}</option>`).join('');}
fillSelect('fSec',[...new Set(points.map(p=>p.secretaria||'Sin dato'))].sort(),'Todas');
fillSelect('fElem',[...new Set(elementRows.map(r=>r.elemento||'Sin dato'))].sort(),'Todos');
fillSelect('fAnalisis',[...new Set(points.flatMap(p=>p.analisis_items||[]))].sort(),'Todos');
fillSelect('fYear',[...new Set(points.map(p=>p.year||'Sin dato'))].sort((a,b)=>String(b).localeCompare(String(a))),'Todos');
const map=L.map('map',{zoomControl:true,preferCanvas:true}).setView([6.2442,-75.5812],12);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap &copy; CARTO'}).addTo(map);
let markerLayer=L.layerGroup().addTo(map);let lastBounds=null;
function normTxt(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function filteredPoints(){const sec=fSec.value, arq=fArq.value, est=fEst.value, analisis=fAnalisis.value, opp=fOpp.value, year=fYear.value; const rawSearch=(fSearch&&fSearch.value)?fSearch.value:''; const terms=normTxt(rawSearch).split(/\s+/).filter(Boolean); const elem=fElem.value; let idsWithElem=null; if(elem) idsWithElem=new Set(elementRows.filter(r=>r.elemento===elem).map(r=>r.id)); return points.filter(p=>{const searchText=normTxt(`${p.id||''} ${p.inmueble||''} ${p.denominacion||''} ${p.direccion||''} ${p.matriculas||''} ${p.activos||''} ${p.secretaria||''} ${p.Responsable||''} ${p.Catastro||''}`); const searchOk=!terms.length||terms.some(t=>searchText.includes(t)); return (!sec||p.secretaria===sec)&&(!arq||p.riesgo_arq===arq)&&(!est||p.riesgo_est===est)&&(!analisis||(p.analisis_items||[]).includes(analisis))&&(!opp||p.oportunidad===opp)&&(!year||String(p.year)===String(year))&&(!elem||idsWithElem.has(p.id))&&searchOk;});}
function filteredElemRows(fp){const ids=new Set(fp.map(p=>p.id)); const elem=fElem.value; return elementRows.filter(r=>ids.has(r.id)&&(!elem||r.elemento===elem));}
function popup(p){const anal=(p.analisis_items||[]).map(d=>`<span class="pill">${esc(d)}</span>`).join('')||'<span class="small">Sin dato registrado</span>';return `<b>${esc(p.inmueble||'Sin nombre')}</b><br><span class="small">${esc(p.direccion||'Sin dirección')} · ${esc(p.id)} · ${esc(p.fecha)}</span><br><br><b>Matrículas:</b> ${esc(p.matriculas||'Sin dato')}<br><b>Activos:</b> ${esc(p.activos||'Sin dato')}<br><b>Secretaría:</b> ${esc(p.secretaria)}<br><b>Hallazgos físicos:</b> ${p.hallazgos_fisicos||0}<br><br><b>Riesgo arquitectónico:</b> ${dotRisk(p.riesgo_arq)}<br><b>Riesgo estructural:</b> ${dotRisk(p.riesgo_est)}<br><br><b>Dato susceptible de ser analizado para ajuste en el inventario:</b><br>${anal}<br><br><b>Oportunidad:</b> ${esc(p.oportunidad)}<br><span class="small">${esc(p.desc_oportunidad||'')}</span>`;}
function addMarkers(fp, fit=false){markerLayer.clearLayers(); fp.forEach(p=>{const icon=L.divIcon({className:'',html:`<div class="marker ${riskClass(p.riesgo_max)}"></div>`,iconSize:[8,8],iconAnchor:[4,4]}); L.marker([p.lat,p.lon],{icon}).bindPopup(popup(p)).addTo(markerLayer);}); if(fp.length){try{const group=L.featureGroup(markerLayer.getLayers()); lastBounds=group.getBounds().pad(.10); if(fit) map.fitBounds(lastBounds);}catch(e){}}}
function countRisk(fp,field){const o={'Sin riesgo':0,'Nivel 1':0,'Nivel 2':0,'Nivel 3':0,other:0};fp.forEach(p=>{if(o[p[field]]!=null)o[p[field]]++;else o.other++;});return o;}
function donut(id,yes,total,color){const deg=total?Math.round(yes/total*360):0;document.getElementById(id).style.background=`conic-gradient(${color} 0deg, ${color} ${deg}deg, #e5e7eb ${deg}deg)`;}

function resumenHallazgos(p){
  try{
    const id = p && p.id;
    const rows = (typeof elementRows !== 'undefined' && Array.isArray(elementRows)) ? elementRows.filter(r=>r.id===id) : [];
    if(!rows.length){ return '<span class="small">Sin hallazgos físicos registrados</span>'; }
    const byElem = {};
    rows.forEach(r=>{
      const el = r.elemento || 'Sin elemento';
      byElem[el] = (byElem[el]||0) + 1;
    });
    const txt = Object.entries(byElem).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`${esc(k)} (${fmt(v)})`).join(', ');
    const extra = Object.keys(byElem).length>5 ? ` <span class="small">+${Object.keys(byElem).length-5} más</span>` : '';
    return txt + extra;
  }catch(e){
    return '<span class="small">No fue posible resumir</span>';
  }
}

function update(){const fp=filteredPoints(); const er=filteredElemRows(fp); addMarkers(fp,false); const total=fp.length; const fis=er.length; const anal=fp.filter(p=>p.tiene_analisis==='Sí').length; const opp=fp.filter(p=>p.oportunidad==='Sí').length; kInm.textContent=fmt(total);kFis.textContent=fmt(fis);kAnalisis.textContent=fmt(anal);kOpp.textContent=fmt(opp);pAnalisis.textContent='('+pct(anal,total)+')';pOpp.textContent='('+pct(opp,total)+')';donut('donutAnalisis',anal,total,'#5EA0C9');donut('donutOpp',opp,total,'#5EA0C9');
 const arq=countRisk(fp,'riesgo_arq'), est=countRisk(fp,'riesgo_est'); a0.textContent=fmt(arq['Sin riesgo']);a1.textContent=fmt(arq['Nivel 1']);a2.textContent=fmt(arq['Nivel 2']);a3.textContent=fmt(arq['Nivel 3']);pa0.textContent=pct(arq['Sin riesgo'],total);pa1.textContent=pct(arq['Nivel 1'],total);pa2.textContent=pct(arq['Nivel 2'],total);pa3.textContent=pct(arq['Nivel 3'],total); e0.textContent=fmt(est['Sin riesgo']);e1.textContent=fmt(est['Nivel 1']);e2.textContent=fmt(est['Nivel 2']);e3.textContent=fmt(est['Nivel 3']);pe0.textContent=pct(est['Sin riesgo'],total);pe1.textContent=pct(est['Nivel 1'],total);pe2.textContent=pct(est['Nivel 2'],total);pe3.textContent=pct(est['Nivel 3'],total);
 const elem={}; er.forEach(r=>{const k=r.elemento||'Sin dato'; if(!elem[k])elem[k]={h:0,ids:new Set(),area:0,pats:{}}; elem[k].h++; elem[k].ids.add(r.id); elem[k].area+=Number(r.area)||0; elem[k].pats[r.patologia]=(elem[k].pats[r.patologia]||0)+1;}); const elemRows=Object.entries(elem).sort((a,b)=>b[1].h-a[1].h); const elementBodyEl=document.getElementById('elementBody'); if(elementBodyEl){elementBodyEl.innerHTML=elemRows.slice(0,8).map(([k,v])=>`<tr><td><b>${esc(k)}</b></td><td>${fmt(v.h)}</td><td>${fmt(v.ids.size)}</td></tr>`).join('')||'<tr><td colspan="3" class="small">Sin datos</td></tr>';} elemFullBody.innerHTML=elemRows.map(([k,v])=>{const pats=Object.entries(v.pats).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([p,c])=>`${esc(p)} (${fmt(c)})`).join(', ');return `<tr><td><b>${esc(k)}</b></td><td>${fmt(v.h)}</td><td>${fmt(v.ids.size)}</td><td>${fmt(v.area.toFixed(1))}</td><td>${pats||'Sin dato'}</td></tr>`}).join('')||'<tr><td colspan="5" class="small">Sin datos</td></tr>';
 const analisis={}; fp.forEach(p=>(p.analisis_items||[]).forEach(d=>{if(!analisis[d])analisis[d]=new Set(); analisis[d].add(p.id);})); analisisBody.innerHTML=Object.entries(analisis).sort((a,b)=>b[1].size-a[1].size).slice(0,5).map(([k,v])=>`<tr><td><b>${esc(k)}</b></td><td>${fmt(v.size)}</td></tr>`).join('')||'<tr><td class="small">Sin datos</td></tr>';oppMiniBody.innerHTML=`<tr><td><b>Con oportunidad</b></td><td>${fmt(opp)}</td></tr><tr><td>Sin oportunidad</td><td>${fmt(total-opp)}</td></tr>`;
 const sec={}; fp.forEach(p=>{const k=p.secretaria||'Sin dato'; if(!sec[k])sec[k]={ids:new Set(),fis:0,anal:0,opp:0,n3:0}; sec[k].ids.add(p.id); sec[k].fis+=p.hallazgos_fisicos||0; if(p.tiene_analisis==='Sí')sec[k].anal++; if(p.oportunidad==='Sí')sec[k].opp++; if(p.riesgo_max===3)sec[k].n3++;}); secBody.innerHTML=Object.entries(sec).sort((a,b)=>b[1].ids.size-a[1].ids.size).map(([k,v])=>`<tr><td><b>${esc(k)}</b></td><td>${fmt(v.ids.size)}</td><td>${fmt(v.fis)}</td><td>${fmt(v.anal)}</td><td>${fmt(v.opp)}</td><td>${fmt(v.n3)}</td></tr>`).join('')||'<tr><td colspan="6" class="small">Sin datos</td></tr>';
 const searchCount=$id('searchCount'); if(searchCount) searchCount.textContent='Mostrando '+fmt(fp.length)+' inmueble(s) en el listado'; tbody.innerHTML=fp.map(p=>`<tr><td>${esc(p.id)}</td><td><b>${esc(p.inmueble||'Sin nombre')}</b><br><span class="small">${esc(p.direccion||'Sin dirección')}</span></td><td>${esc(p.matriculas||'Sin dato')}</td><td>${esc(p.activos||'Sin dato')}</td><td>${esc(p.secretaria)}</td><td>${resumenHallazgos(p)}</td><td>Arq. ${dotRisk(p.riesgo_arq)}<br>Est. ${dotRisk(p.riesgo_est)}</td><td>${(p.analisis_items||[]).map(esc).join(', ')||'No registra'}</td><td>${esc(p.oportunidad)}<br><span class="small truncate">${esc(p.desc_oportunidad||'')}</span></td></tr>`).join('')||'<tr><td colspan="9" class="small">Sin datos</td></tr>';
 oppBody.innerHTML=fp.filter(p=>p.oportunidad==='Sí').map(p=>`<tr><td><b>${esc(p.inmueble)}</b><br><span class="small">${esc(p.denominacion||p.id)}</span></td><td>${esc(p.matriculas||'Sin dato')}</td><td>${esc(p.activos||'Sin dato')}</td><td>${esc(p.secretaria)}</td><td>${esc(p.desc_oportunidad||'Sin descripción')}</td></tr>`).join('')||'<tr><td colspan="5" class="small">Sin oportunidades registradas</td></tr>';}
['fSec','fArq','fEst','fElem','fAnalisis','fOpp','fYear','fSearch'].forEach(id=>document.getElementById(id).addEventListener('input',update));btnClear.onclick=()=>{['fSec','fArq','fEst','fElem','fAnalisis','fOpp','fYear'].forEach(id=>document.getElementById(id).value='');fSearch.value='';update();};btnFit.onclick=()=>{if(lastBounds)map.fitBounds(lastBounds);};document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');['tblDetalle','tblSec','tblElem','tblOpp'].forEach(id=>document.getElementById(id).style.display='none');const mapId={detalle:'tblDetalle',secretaria:'tblSec',elemento:'tblElem',oportunidades:'tblOpp'}[t.dataset.tab];document.getElementById(mapId).style.display='table';});update();setTimeout(()=>{if(lastBounds)map.fitBounds(lastBounds)},300);

}

cargarDatos();
