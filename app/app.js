(function(){
'use strict';
var D=window.RADAR_DATA, KEY='radar-propio-v1';
var S={tab:0,sel:{cat:'sc',modo:'metro'},fichas:null,activos:null,pesos:null,bitacora:[],importErr:'',addErr:''};

function h(tag,attrs){var e=document.createElement(tag);attrs=attrs||{};
  Object.keys(attrs).forEach(function(k){var v=attrs[k];if(v===null||v===undefined||v===false)return;
    if(k==='class')e.className=v;else if(k==='text')e.textContent=v;else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);
    else if(v===true)e.setAttribute(k,'');else e.setAttribute(k,v)});
  for(var i=2;i<arguments.length;i++){var c=arguments[i];if(c===null||c===undefined||c===false)continue;
    e.appendChild(typeof c==='string'||typeof c==='number'?document.createTextNode(String(c)):c)}
  return e}
function clone(o){return JSON.parse(JSON.stringify(o))}
function load(){var st=null;try{st=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){st=null}
  S.fichas=st&&st.fichas?st.fichas:clone(D.fichas);S.activos=st&&st.activos?st.activos:clone(D.activos);
  S.pesos=st&&st.pesos?st.pesos:clone(D.pesos);S.bitacora=st&&st.bitacora?st.bitacora:[]}
function save(){try{localStorage.setItem(KEY,JSON.stringify({fichas:S.fichas,activos:S.activos,pesos:S.pesos,bitacora:S.bitacora}))}catch(e){}}
function reset(){try{localStorage.removeItem(KEY)}catch(e){}load();render()}
function mname(id){var m=D.modos.filter(function(x){return x.id===id})[0];return m?m.nombre:id}
function cname(id){var c=D.categorias.filter(function(x){return x.id===id})[0];return c?c.nombre:id}

// ---- modelo
function cobertura(modo,cat){var ok={},nv={},su={};
  S.fichas.forEach(function(f){if(f.categoria!==cat)return;
    if(f.modos.indexOf(modo)>=0){if(f.verificacion==='no-verificada')nv[f.proveedor]=1;else ok[f.proveedor]=1}
    else if((f.modos_supuestos||[]).indexOf(modo)>=0)su[f.proveedor]=1});
  Object.keys(ok).forEach(function(p){delete nv[p];delete su[p]});
  return {ok:Object.keys(ok),nv:Object.keys(nv),su:Object.keys(su)}}
function puntaje(a){var w=S.pesos,cov=cobertura(a.modo,a.categoria),n=Math.min(cov.ok.length,3);
  var edad=Math.max(0,Math.min(1,(D.anio_ref-a.instalado)/a.vida_util));
  var libre=1-n/3,dep=a.cautivo?0.5+0.5*libre:0.5*libre;
  var br=Math.max(0,Math.min(1,a.brecha/5)),sw=(w.edad+w.dependencia+w.brecha)||1;
  var idx=100*(w.edad*edad+w.dependencia*dep+w.brecha*br)/sw;
  return {idx:idx,edad:edad,dep:dep,br:br,alt:cov.ok.length,restan:a.vida_util-(D.anio_ref-a.instalado)}}
function sem(i){return i>=65?'rojo':i>=35?'amarillo':'verde'}

// ---- UI
// La pestaña 0 es el inicio (el panorama de un vistazo); los pasos del método siguen siendo tab-1 a tab-5.
var TABS=['Inicio','Definir','Cargar fuentes','Comparar','Puntuar','Decidir'];
function ir(i){S.tab=i;S.open=undefined;render()}
function render(){
  var nav=document.getElementById('nav');nav.textContent='';
  TABS.forEach(function(t,i){nav.appendChild(h('button',{role:'tab','aria-selected':String(S.tab===i),'data-testid':'tab-'+i,
    onclick:function(){ir(i)}},i?h('span',{class:'n',text:i}):null,t))});
  document.getElementById('aviso').textContent=D.aviso;
  var m=document.getElementById('main');m.textContent='';
  [p0,p1,p2,p3,p4,p5][S.tab](m);
  if(S.open===undefined)window.scrollTo(0,0)}

// ---- inicio: lo que el radar encontró y las seis preguntas, con las cifras calculadas de los datos cargados
function resumenRadar(){var prov={},ver={verificada:0,parcial:0,'no-verificada':0},celdas=0,brechas=[];
  S.fichas.forEach(function(f){prov[f.proveedor]=1;ver[f.verificacion]=(ver[f.verificacion]||0)+1});
  D.categorias.forEach(function(c){D.modos.forEach(function(mo){var n=cobertura(mo.id,c.id).ok.length;if(n>=3)celdas++;else brechas.push({c:c,mo:mo,n:n})})});
  var act=S.activos.map(function(a){var p=puntaje(a);return {a:a,idx:p.idx,s:sem(p.idx)}}).sort(function(x,y){return y.idx-x.idx});
  return {fichas:S.fichas.length,prov:Object.keys(prov).length,ver:ver,celdas:celdas,brechas:brechas,act:act,
    rojos:act.filter(function(x){return x.s==='rojo'}).length,alertasPT:alertas().filter(function(x){return x.tipo==='pt'}).length}}
function kpi(tid,num,lab,sub){return h('div',{class:'kpi','data-testid':tid},h('b',{text:String(num)}),h('span',{class:'kl',text:lab}),sub?h('span',{class:'ks',text:sub}):null)}
var SEM_TXT={verde:'bajo',amarillo:'medio',rojo:'alto'};
function p0(m){var r=resumenRadar();
  var hero=h('section',{class:'card hero','data-testid':'p0'},
    h('p',{class:'kicker',text:'Reto 5 · Radar tecnológico para el Metro de Medellín'}),
    h('h2',{text:'El Metro se entera tarde de lo que existe en el mercado. Radar Propio lo junta en un solo lugar y avisa antes de que una tecnología quede obsoleta.'}),
    h('p',{class:'lead',text:'Un método de cinco pasos y una herramienta que opera el propio equipo del Metro, con fuentes públicas y sin cajas negras. Esto es lo que encontró el radar con datos reales del mercado:'}),
    h('div',{class:'kpis'},
      kpi('kpi-fichas',r.fichas,'fichas con fuente pública',r.ver.verificada+' verificadas'),
      kpi('kpi-prov',r.prov,'proveedores reales','cada uno con enlace y fecha de consulta'),
      kpi('kpi-celdas',r.celdas+' de 16','celdas con 3 proveedores o más','4 modos × 4 categorías'),
      kpi('kpi-alertas',r.alertasPT,'alertas del Plan de Tecnología',r.rojos+' activos en riesgo alto · ejemplo')));
  m.appendChild(hero);
  var g=h('div',{class:'grid2'});
  // cobertura: matriz 4x4
  var mat=h('section',{class:'card','data-testid':'ini-matriz'},h('h3',{text:'Cobertura del mercado'}),
    h('p',{class:'note',text:'Proveedores con fuente por celda, sobre el mínimo de 3 que pide el reto. Toca una celda para verla en el paso 1.'}));
  var gm=h('div',{class:'mgrid'});gm.appendChild(h('span'));
  D.modos.forEach(function(mo){gm.appendChild(h('span',{class:'mh',text:mo.nombre}))});
  D.categorias.forEach(function(c){gm.appendChild(h('span',{class:'mr',text:c.nombre.split(' /')[0]}));
    D.modos.forEach(function(mo){var n=cobertura(mo.id,c.id).ok.length,k=n>=3?'c3':n>=1?'c1':'c0';
      gm.appendChild(h('button',{class:'mc '+k,'data-testid':'ini-celda-'+c.id+'-'+mo.id,'aria-label':c.nombre+', '+mo.nombre+': '+n+' de 3',
        onclick:function(){S.sel={cat:c.id,modo:mo.id};ir(1)}},h('b',{text:String(n)}),h('small',{text:n>=3?'completa':n?'brecha':'sin datos'})))})});
  mat.appendChild(gm);
  mat.appendChild(h('p',{class:'leyenda'},h('span',{class:'mc c3 sw'}),' 3 o más · ',h('span',{class:'mc c1 sw'}),' 1 o 2 · ',h('span',{class:'mc c0 sw'}),' ninguno'));
  g.appendChild(mat);
  // obsolescencia: barras
  var ob=h('section',{class:'card','data-testid':'ini-activos'},h('h3',{text:'Riesgo de obsolescencia por activo'}),
    h('p',{class:'note',text:'Índice de 0 a 100 (edad, dependencia del proveedor y brecha tecnológica). Activos de ejemplo: no son datos del Metro.'}));
  var bl=h('div',{class:'bars'});
  r.act.forEach(function(x){bl.appendChild(h('div',{class:'brow','data-testid':'ini-act-'+x.a.id},
    h('span',{class:'bn',text:x.a.nombre}),
    h('span',{class:'bt'},h('i',{class:'bf s-'+x.s,style:'width:'+Math.max(2,Math.round(x.idx))+'%'})),
    h('span',{class:'bv'},h('b',{text:x.idx.toFixed(0)}),' '+SEM_TXT[x.s])))});
  ob.appendChild(bl);
  ob.appendChild(h('p',{class:'leyenda'},'Corte: menos de 35 bajo, de 35 a 65 medio, 65 o más alto. ',h('button',{class:'lnk',onclick:function(){ir(4)},text:'Ajustar los pesos en el paso 4'})));
  g.appendChild(ob);
  m.appendChild(g);
  // verificación de las fuentes y brechas
  var g2=h('div',{class:'grid2'});
  var vt=r.ver.verificada+r.ver.parcial+r.ver['no-verificada']||1;
  var vf=h('section',{class:'card','data-testid':'ini-verif'},h('h3',{text:'Qué tan confiables son las fuentes'}),
    h('p',{class:'note',text:'Cada ficha lleva un enlace público y la fecha de consulta. Solo las verificadas y las parciales cuentan para el mínimo de 3.'}),
    h('div',{class:'stack3'},
      h('i',{class:'v1',style:'width:'+(100*r.ver.verificada/vt)+'%'}),h('i',{class:'v2',style:'width:'+(100*r.ver.parcial/vt)+'%'}),h('i',{class:'v3',style:'width:'+(100*r.ver['no-verificada']/vt)+'%'})),
    h('ul',{class:'vleg'},h('li',null,h('span',{class:'sw v1'}),h('b',{'data-testid':'ini-ver-ok',text:String(r.ver.verificada)}),' verificadas: la página responde y nombra el producto'),
      h('li',null,h('span',{class:'sw v2'}),h('b',{text:String(r.ver.parcial)}),' parciales: responde, pero es un comunicado o un documento'),
      h('li',null,h('span',{class:'sw v3'}),h('b',{text:String(r.ver['no-verificada'])}),' sin verificar: el sitio bloqueó la consulta')));
  g2.appendChild(vf);
  var br=h('section',{class:'card','data-testid':'ini-brechas'},h('h3',{text:'Dónde falta mirar ('+r.brechas.length+' brechas)'}),
    h('p',{class:'note',text:'Celdas con menos de 3 proveedores con fuente. Se muestran como brecha en lugar de rellenarlas con nombres sin respaldo.'}));
  var ul=h('ul',{class:'blist'});r.brechas.forEach(function(x){ul.appendChild(h('li',null,h('b',{text:x.n+'/3'}),' '+x.c.nombre+' · '+x.mo.nombre))});
  br.appendChild(ul);g2.appendChild(br);m.appendChild(g2);
  // las seis preguntas
  var q=h('section',{class:'card','data-testid':'ini-preguntas'},h('h3',{text:'La propuesta en seis respuestas'}));
  var qg=h('div',{class:'qgrid'});
  [['El problema','El Metro evalúa tecnología cuando salta una alerta o ya hay una compra en marcha, modo por modo y con búsquedas manuales. Pierde ventanas de negociación y no mide el riesgo de quedar atado a un solo proveedor.'],
   ['La solución','Un método de cinco pasos (definir, recolectar, comparar, puntuar y decidir) y una herramienta dentro de Metro Digital. Vigilancia tecnológica: mirar de forma ordenada y constante qué hacen los demás.'],
   ['La propuesta de valor','48 fichas como mínimo (4 modos, 4 categorías y 3 proveedores por celda) en un solo lugar, un semáforo que avisa a tiempo y cero cajas negras: desde la semana 11 el equipo del Metro opera el radar sin nosotros.'],
   ['Por qué es la mejor','El Metro no quiere comprar un tren, un software cerrado, una consultoría puntual ni exponer datos en IA pública. Radar Propio vende el método para elegir, es código abierto dentro de Metro Digital, termina con el Metro operando solo y usa fuentes públicas.'],
   ['La viabilidad','Cobra por implementar el piloto, por una licencia anual del método y por un soporte que baja con el tiempo. Cuesta poco producirlo: fuentes abiertas, software libre e infraestructura del Metro. No promete un ahorro en pesos: el piloto lo mide.'],
   ['La factibilidad','Todo lo necesario ya existe. 16 semanas, en la ventana de piloto de mayo a agosto de 2027: construir con el equipo del Metro, que el Metro llene fichas con revisión, y que opere solo. La prueba que puede fallar: en la semana 14 un analista agrega un proveedor sin ayuda.']
  ].forEach(function(x,i){qg.appendChild(h('div',{class:'q','data-testid':'ini-q-'+(i+1)},h('span',{class:'qn',text:String(i+1)}),h('h4',{text:x[0]}),h('p',{text:x[1]})))});
  q.appendChild(qg);m.appendChild(q);
  // entrada a los pasos
  var pas=h('section',{class:'card','data-testid':'ini-pasos'},h('h3',{text:'Recorrer el método'}),h('p',{class:'note',text:'Cada paso es una pantalla del prototipo, con los mismos datos de arriba.'}));
  var pr=h('div',{class:'pasos'});
  [['Definir','qué se vigila: 4 modos por 4 categorías'],['Cargar fuentes','solo información pública, con enlace'],['Comparar','una ficha igual para cada solución'],['Puntuar','el semáforo de obsolescencia'],['Decidir','alertas, brechas y bitácora']]
   .forEach(function(x,i){pr.appendChild(h('button',{class:'paso','data-testid':'ini-paso-'+(i+1),onclick:function(){ir(i+1)}},h('span',{class:'n',text:String(i+1)}),h('b',{text:x[0]}),h('small',{text:x[1]})))});
  pas.appendChild(pr);m.appendChild(pas)}

function badge(cov){var n=cov.ok.length,cl=n>=3?'b-ok':n>=1?'b-mid':'b-bad';return h('span',{class:'badge '+cl,text:n+'/3'})}

function p1(m){
  var comp=0;D.categorias.forEach(function(c){D.modos.forEach(function(mo){if(cobertura(mo.id,c.id).ok.length>=3)comp++})});
  var card=h('section',{class:'card','data-testid':'p1'},h('h2',{text:'1. Definir qué se vigila'}),
   h('p',{class:'lead',text:'Matriz de 4 categorías tecnológicas por 4 modos de transporte. Cada celda necesita 3 proveedores o más con fuente. Toca una celda para ver sus fichas.'}),
   h('p',{'data-testid':'resumen',text:'Celdas completas: '+comp+' de 16. Fichas cargadas: '+S.fichas.length+'.'}));
  var t=h('table',{class:'matrix'}),hr=h('tr',null,h('th',{text:'Categoría'}));
  D.modos.forEach(function(mo){hr.appendChild(h('th',{text:mo.nombre}))});t.appendChild(h('thead',null,hr));
  var tb=h('tbody');
  D.categorias.forEach(function(c){var tr=h('tr',null,h('th',{text:c.nombre,title:c.desc}));
    D.modos.forEach(function(mo){var cov=cobertura(mo.id,c.id),on=S.sel.cat===c.id&&S.sel.modo===mo.id;
      var det=[];if(cov.nv.length)det.push(cov.nv.length+' sin verificar');if(cov.su.length)det.push(cov.su.length+' supuesto(s)');
      tr.appendChild(h('td',{class:'cellbtn'},h('button',{'aria-pressed':String(on),'data-testid':'celda-'+c.id+'-'+mo.id,
        onclick:function(){S.sel={cat:c.id,modo:mo.id};render()}},badge(cov),
        h('div',{class:'note',text:cov.ok.length?cov.ok.join(', '):'sin proveedores'}),det.length?h('div',{class:'note',text:det.join(' · ')}):null)))});
    tb.appendChild(tr)});
  t.appendChild(tb);card.appendChild(h('div',{class:'scroll'},t));
  card.appendChild(h('p',{class:'note',text:'Las categorías son una propuesta de partida; las áreas técnicas del Metro las ajustan en este paso.'}));
  m.appendChild(card);
  m.appendChild(detalleCelda())}

function detalleCelda(){var c=S.sel.cat,mo=S.sel.modo,cov=cobertura(mo,c);
  var card=h('section',{class:'card'},h('h2',{text:cname(c)+' · '+mname(mo)}));
  card.appendChild(h('p',{class:'lead',text:cov.ok.length>=3?'Cobertura completa: '+cov.ok.length+' proveedores.':'Brecha: faltan '+(3-cov.ok.length)+' proveedor(es) con fuente para cumplir el mínimo de 3.'}));
  var l=S.fichas.filter(function(f){return f.categoria===c&&(f.modos.indexOf(mo)>=0||(f.modos_supuestos||[]).indexOf(mo)>=0)});
  if(!l.length)card.appendChild(h('p',{text:'Todavía no hay fichas en esta celda.'}));
  l.forEach(function(f){card.appendChild(h('div',null,h('strong',{text:f.proveedor}),' · '+f.producto+' ',vbadge(f.verificacion),
    f.modos.indexOf(mo)<0?h('span',{class:'note',text:' (aplicación a este modo: supuesto)'}):null))});
  return card}
function vbadge(v){return h('span',{class:'badge '+(v==='verificada'?'b-ok':v==='parcial'?'b-mid':'b-gray'),text:v})}

function p2(m){
  var card=h('section',{class:'card','data-testid':'p2'},h('h2',{text:'2. Cargar fuentes'}),
   h('p',{class:'lead',text:'Toda ficha entra con un enlace público. Aquí se revisan las fuentes cargadas, se importan más desde un archivo JSON y se agregan a mano. No se envía nada fuera de este equipo.'}));
  var t=h('table'),th=h('tr');['Proveedor','Producto','Verificación','Tipo','Consultada','Fuente'].forEach(function(x){th.appendChild(h('th',{text:x}))});
  t.appendChild(h('thead',null,th));var tb=h('tbody');
  S.fichas.forEach(function(f){tb.appendChild(h('tr',null,h('td',{'data-l':'Proveedor',text:f.proveedor}),h('td',{'data-l':'Producto',text:f.producto}),
    h('td',{'data-l':'Verificación'},vbadge(f.verificacion)),h('td',{'data-l':'Tipo',text:f.tipo_fuente}),h('td',{'data-l':'Consultada',text:f.consultada||''}),
    h('td',{'data-l':'Fuente'},h('a',{href:f.url,target:'_blank',rel:'noopener noreferrer',text:'abrir'}))))});
  t.appendChild(tb);card.appendChild(h('div',{class:'scroll stack','data-testid':'tabla-fuentes'},t));
  card.appendChild(h('p',{class:'note',text:'Verificada: la página responde y nombra el producto. Parcial: responde pero no es una página de producto o no se pudo leer. No verificada: el sitio no respondió a la consulta automática; se muestra pero no cuenta para el mínimo de 3.'}));
  m.appendChild(card);
  var imp=h('section',{class:'card'},h('h2',{text:'Importar fichas (JSON)'}),
   h('p',{class:'note',text:'Formato: una lista de objetos con categoria (rs, sc, en, dg), modos, proveedor, producto y url. Las fichas importadas quedan como no verificadas hasta que alguien las revise.'}),
   h('div',{class:'row'},h('label',null,'Archivo JSON',h('input',{type:'file',accept:'.json,application/json','data-testid':'file-import',onchange:onFile}))),
   h('div',{class:'err','data-testid':'import-err',text:S.importErr}));
  m.appendChild(imp);
  var cat=h('select',{id:'f-cat'}),modo=h('select',{id:'f-modo'});
  D.categorias.forEach(function(c){cat.appendChild(h('option',{value:c.id,text:c.nombre}))});
  D.modos.forEach(function(x){modo.appendChild(h('option',{value:x.id,text:x.nombre}))});
  var add=h('section',{class:'card'},h('h2',{text:'Agregar una ficha'}),h('div',{class:'row'},
    h('label',null,'Categoría',cat),h('label',null,'Modo',modo),
    h('label',null,'Proveedor',h('input',{id:'f-prov','data-testid':'f-prov'})),h('label',null,'Producto',h('input',{id:'f-prod','data-testid':'f-prod'})),
    h('label',null,'Enlace público (https)',h('input',{id:'f-url','data-testid':'f-url',size:'34'})),
    h('button',{class:'btn','data-testid':'f-add',onclick:onAdd,text:'Agregar'})),h('div',{class:'err','data-testid':'add-err',text:S.addErr}),
   h('div',{class:'row'},h('button',{class:'btn sec','data-testid':'reset',onclick:reset,text:'Restablecer datos de ejemplo'})));
  m.appendChild(add)}
function validFicha(f){return f&&typeof f==='object'&&['rs','sc','en','dg'].indexOf(f.categoria)>=0&&Array.isArray(f.modos)&&f.modos.length&&
  f.modos.every(function(x){return ['metro','tranvia','brt','cable'].indexOf(x)>=0})&&typeof f.proveedor==='string'&&f.proveedor.trim()&&
  typeof f.producto==='string'&&f.producto.trim()&&typeof f.url==='string'&&/^https?:\/\/\S+$/.test(f.url)}
function onFile(ev){var file=ev.target.files[0];if(!file)return;var r=new FileReader();
  r.onload=function(){var arr;try{arr=JSON.parse(r.result)}catch(e){S.importErr='El archivo no es un JSON válido.';render();return}
    if(!Array.isArray(arr)||!arr.length||!arr.every(validFicha)){S.importErr='Se rechazó el archivo: cada ficha necesita categoria, modos, proveedor, producto y una url http(s).';render();return}
    arr.forEach(function(f,i){S.fichas.push({id:'imp-'+Date.now()+'-'+i,categoria:f.categoria,modos:f.modos,modos_supuestos:[],proveedor:f.proveedor.trim(),producto:f.producto.trim(),
      url:f.url,verificacion:'no-verificada',tipo_fuente:'importada',dato:null,consultada:new Date().toISOString().slice(0,10)})});
    S.importErr='';save();render()};
  r.readAsText(file)}
function onAdd(){var g=function(id){return document.getElementById(id).value};
  var f={categoria:g('f-cat'),modos:[g('f-modo')],proveedor:g('f-prov'),producto:g('f-prod'),url:g('f-url').trim()};
  if(!validFicha(f)){S.addErr='Faltan datos: proveedor, producto y un enlace que empiece con http:// o https://.';render();return}
  S.fichas.push({id:'man-'+Date.now(),categoria:f.categoria,modos:f.modos,modos_supuestos:[],proveedor:f.proveedor.trim(),producto:f.producto.trim(),url:f.url,
    verificacion:'no-verificada',tipo_fuente:'manual',dato:null,consultada:new Date().toISOString().slice(0,10)});S.addErr='';save();render()}

function p3(m){
  var cat=h('select',{'data-testid':'sel-cat',onchange:function(e){S.sel.cat=e.target.value;render()}}),mo=h('select',{'data-testid':'sel-modo',onchange:function(e){S.sel.modo=e.target.value;render()}});
  D.categorias.forEach(function(c){cat.appendChild(h('option',{value:c.id,text:c.nombre,selected:c.id===S.sel.cat}))});
  D.modos.forEach(function(x){mo.appendChild(h('option',{value:x.id,text:x.nombre,selected:x.id===S.sel.modo}))});
  var cov=cobertura(S.sel.modo,S.sel.cat);
  var card=h('section',{class:'card','data-testid':'p3'},h('h2',{text:'3. Comparar proveedores'}),
   h('p',{class:'lead',text:'Una ficha igual para cada solución, para comparar sin depender de la memoria de nadie.'}),
   h('div',{class:'row'},h('label',null,'Categoría',cat),h('label',null,'Modo',mo)),
   h('p',{'data-testid':'cobertura-celda'},'Proveedores contados: ',h('strong',{text:cov.ok.length+' de 3'}),cov.ok.length<3?' (celda con brecha)':''));
  var l=S.fichas.filter(function(f){return f.categoria===S.sel.cat&&(f.modos.indexOf(S.sel.modo)>=0||(f.modos_supuestos||[]).indexOf(S.sel.modo)>=0)});
  if(!l.length){card.appendChild(h('p',{text:'No hay fichas en esta celda. Agrega fuentes en el paso 2.'}))}
  else{var t=h('table'),hr=h('tr');['Proveedor','Producto','Dato del fabricante o la prensa','Aplica a este modo','Verificación','Fuente'].forEach(function(x){hr.appendChild(h('th',{text:x}))});
    t.appendChild(h('thead',null,hr));var tb=h('tbody');
    l.forEach(function(f){var conf=f.modos.indexOf(S.sel.modo)>=0;tb.appendChild(h('tr',null,h('td',{'data-l':'Proveedor'},h('strong',{text:f.proveedor})),h('td',{'data-l':'Producto',text:f.producto}),
      h('td',{'data-l':'Dato',text:f.dato||'sin dato cargado'}),h('td',{'data-l':'Aplica',text:conf?'según la fuente':'supuesto del analista'}),
      h('td',{'data-l':'Verificación'},vbadge(f.verificacion)),h('td',{'data-l':'Fuente'},h('a',{href:f.url,target:'_blank',rel:'noopener noreferrer',text:'abrir'}))))});
    t.appendChild(tb);card.appendChild(h('div',{class:'scroll stack','data-testid':'tabla-fichas'},t))}
  card.appendChild(h('p',{class:'note',text:'Los datos son afirmaciones de cada fabricante o de prensa especializada y no están contrastados de forma independiente. El nivel de madurez (TRL) de cada solución lo estima el analista del Metro con la fuente a la vista.'}));
  m.appendChild(card)}

function p4(m){
  var card=h('section',{class:'card','data-testid':'p4'},h('h2',{text:'4. Puntuar la obsolescencia'}),
   h('p',{class:'lead',text:'Índice de 0 a 100 por activo: mezcla la edad respecto a la vida útil, la dependencia del proveedor y la brecha tecnológica. Los pesos los fija el Metro. Los activos son datos de ejemplo.'}));
  var w=h('div',{class:'row'});
  [['edad','Peso de la edad'],['dependencia','Peso de la dependencia'],['brecha','Peso de la brecha']].forEach(function(p){
    var out=h('span',{text:S.pesos[p[0]].toFixed(2)});
    w.appendChild(h('label',null,h('span',null,p[1]+': ',out),h('input',{type:'range',min:'0',max:'1',step:'0.05',value:String(S.pesos[p[0]]),'data-testid':'peso-'+p[0],
      oninput:function(e){S.pesos[p[0]]=parseFloat(e.target.value);out.textContent=S.pesos[p[0]].toFixed(2)},onchange:function(){save();render()}})))});
  card.appendChild(w);
  var t=h('table'),hr=h('tr');['Activo (ejemplo)','Modo · categoría','Instalado','Vida útil (años)','Proveedor cautivo','Brecha (0-5)','Alternativas','Índice'].forEach(function(x){hr.appendChild(h('th',{text:x}))});
  t.appendChild(h('thead',null,hr));var tb=h('tbody');
  S.activos.forEach(function(a){var p=puntaje(a);
    function num(field,min,max){return h('input',{class:'num',type:'number',min:String(min),max:String(max),value:String(a[field]),'data-testid':a.id+'-'+field,
      onchange:function(e){var v=parseInt(e.target.value,10);if(isNaN(v)||v<min||v>max){e.target.value=a[field];return}a[field]=v;save();render()}})}
    tb.appendChild(h('tr',{'data-testid':'fila-'+a.id},h('td',{'data-l':'Activo'},h('strong',{text:a.nombre}),h('div',{class:'note',text:a.id+' · dato de ejemplo'})),
      h('td',{'data-l':'Modo · categoría',text:mname(a.modo)+' · '+cname(a.categoria)}),h('td',{'data-l':'Instalado'},num('instalado',1950,2026)),h('td',{'data-l':'Vida útil'},num('vida_util',1,80)),
      h('td',{'data-l':'Cautivo'},h('input',{type:'checkbox',checked:a.cautivo,'data-testid':a.id+'-cautivo',onchange:function(e){a.cautivo=e.target.checked;save();render()}})),
      h('td',{'data-l':'Brecha'},num('brecha',0,5)),h('td',{'data-l':'Alternativas',text:p.alt+' con fuente'}),
      h('td',{'data-l':'Índice'},h('span',{class:'sem s-'+sem(p.idx)}),h('span',{class:'idx','data-testid':a.id+'-idx',text:p.idx.toFixed(1)}),
        h('div',{class:'bar'},h('i',{style:'width:'+Math.round(p.idx)+'%'})),
        h('div',{class:'note',text:'Vida restante: '+(p.restan>0?p.restan+' años':'agotada')}))))});
  t.appendChild(tb);
  card.appendChild(window.innerWidth<=720?tarjetas():h('div',{class:'scroll stack'},t));
  card.appendChild(h('p',{class:'note',text:'Verde: menos de 35. Amarillo: de 35 a 65. Rojo: 65 o más. Con tres alternativas con fuente, la dependencia baja; un proveedor cautivo la sube. No calcula costos en pesos colombianos: el costo evitado se mide en el piloto con los datos del Plan de Tecnología.'}));
  m.appendChild(card)}


function tarjetas(){var box=h('div',{'data-testid':'tarjetas'});
  S.activos.forEach(function(a){var p=puntaje(a);
    function num(field,min,max,lab){return h('label',null,lab,h('input',{class:'num',type:'number',min:String(min),max:String(max),value:String(a[field]),'data-testid':a.id+'-'+field,
      onchange:function(e){var v=parseInt(e.target.value,10);if(isNaN(v)||v<min||v>max){e.target.value=a[field];return}a[field]=v;S.open=a.id;save();render()}}))}
    box.appendChild(h('div',{class:'tcard','data-testid':'fila-'+a.id},
      h('div',{class:'thead'},h('span',{class:'sem s-'+sem(p.idx)}),h('span',{class:'idx','data-testid':a.id+'-idx',text:p.idx.toFixed(1)}),
        h('div',null,h('strong',{text:a.nombre}),h('div',{class:'note',text:a.id+' · '+mname(a.modo)+' · '+cname(a.categoria)+' · dato de ejemplo'}))),
      h('div',{class:'bar'},h('i',{style:'width:'+Math.round(p.idx)+'%'})),
      h('div',{class:'note',text:'Vida restante: '+(p.restan>0?p.restan+' años':'agotada')+' · alternativas con fuente: '+p.alt}),
      h('details',{open:S.open===a.id,'data-testid':a.id+'-det'},h('summary',{text:'Editar datos del activo'}),
        h('div',{class:'row'},num('instalado',1950,2026,'Instalado'),num('vida_util',1,80,'Vida útil (años)'),num('brecha',0,5,'Brecha (0-5)'),
          h('label',null,'Proveedor cautivo',h('input',{type:'checkbox',checked:a.cautivo,'data-testid':a.id+'-cautivo',onchange:function(e){a.cautivo=e.target.checked;S.open=a.id;save();render()}}))))))});
  return box}

function alertas(){var out=[];
  D.pt.forEach(function(r){S.activos.filter(function(a){return a.modo===r.modo&&a.categoria===r.categoria}).forEach(function(a){var p=puntaje(a);
    if(p.idx>=r.umbral)out.push({tipo:'pt',txt:r.id+' ('+r.prioridad+'): '+r.titulo+'. El activo "'+a.nombre+'" tiene índice '+p.idx.toFixed(1)+', sobre el umbral de '+r.umbral+'.'})})});
  D.categorias.forEach(function(c){D.modos.forEach(function(mo){var n=cobertura(mo.id,c.id).ok.length;
    if(n<3)out.push({tipo:'cob',txt:'Cobertura insuficiente en '+c.nombre+' · '+mo.nombre+': '+n+' de 3 proveedores con fuente.'})})});
  return out}
function p5(m){var al=alertas(),pt=al.filter(function(a){return a.tipo==='pt'}),cb=al.filter(function(a){return a.tipo==='cob'});
  var card=h('section',{class:'card','data-testid':'p5'},h('h2',{text:'5. Decidir y repetir'}),
   h('p',{class:'lead',text:'Las alertas salen de cruzar los índices con las prioridades del Plan de Tecnología (datos de ejemplo). El comité del radar decide y deja registro.'}),
   h('h3',{text:'Alertas del Plan de Tecnología ('+pt.length+')'}));
  if(!pt.length)card.appendChild(h('div',{class:'alert ok','data-testid':'sin-alertas-pt',text:'Ningún activo supera el umbral de una prioridad del Plan de Tecnología.'}));
  pt.forEach(function(a){card.appendChild(h('div',{class:'alert','data-testid':'alerta-pt',text:a.txt}))});
  card.appendChild(h('h3',{text:'Brechas de cobertura ('+cb.length+')'}));
  cb.forEach(function(a){card.appendChild(h('div',{class:'alert warn','data-testid':'alerta-cob',text:a.txt}))});
  m.appendChild(card);
  var sel=h('select',{id:'b-act'});S.activos.forEach(function(a){sel.appendChild(h('option',{value:a.id,text:a.id+' · '+a.nombre}))});
  var b=h('section',{class:'card'},h('h2',{text:'Bitácora de decisiones'}),
   h('div',{class:'row'},h('label',null,'Activo',sel),h('label',null,'Decisión del comité',h('input',{id:'b-dec','data-testid':'b-dec',size:'40'})),
     h('label',null,'Costo evitado (si se conoce)',h('input',{id:'b-costo',placeholder:'sin cuantificar'})),h('button',{class:'btn','data-testid':'b-add',text:'Registrar',onclick:function(){
       var d=document.getElementById('b-dec').value.trim();if(!d)return;S.bitacora.push({fecha:new Date().toISOString().slice(0,10),activo:document.getElementById('b-act').value,decision:d,costo_evitado:document.getElementById('b-costo').value.trim()||'sin cuantificar'});save();render()}}),
     h('button',{class:'btn sec','data-testid':'b-export',text:'Exportar JSON',onclick:exportar})));
  if(!S.bitacora.length)b.appendChild(h('p',{class:'note',text:'Todavía no hay decisiones registradas.'}));
  S.bitacora.forEach(function(x){b.appendChild(h('div',{'data-testid':'b-item',text:x.fecha+' · '+x.activo+' · '+x.decision+' · costo evitado: '+x.costo_evitado}))});
  m.appendChild(b)}
function exportar(){var blob=new Blob([JSON.stringify({bitacora:S.bitacora,activos:S.activos,pesos:S.pesos},null,1)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='radar-propio-bitacora.json';document.body.appendChild(a);a.click();a.remove()}

load();render();var _w=window.innerWidth;window.addEventListener('resize',function(){if((window.innerWidth<=720)!==(_w<=720)){_w=window.innerWidth;render()}});
})();
