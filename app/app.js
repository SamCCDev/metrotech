(function(){
'use strict';
var D=window.RADAR_DATA, KEY='metrotech-v2';
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
var NOMBRE=D.nombre||'MetroTech';
var MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function fechaLarga(iso){var x=String(iso||'').split('-');return x.length===3?(+x[2])+' de '+MESES[+x[1]-1]+' de '+x[0]:iso}
var TIPO_TXT={fabricante:'Fabricante',prensa:'Prensa especializada',tercero:'Tercero independiente'};
function tipoTxt(t){return TIPO_TXT[t]||'Sin clasificar'}
function aniosDesde(iso){if(!iso)return null;var a=new Date(iso.length===7?iso+'-01':iso),b=new Date(D.revisado||D.generado);return (b-a)/31557600000}
function minus(t){return t.charAt(0).toLowerCase()+t.slice(1)}
function mname(id){var m=D.modos.filter(function(x){return x.id===id})[0];return m?m.nombre:id}
function cname(id){var c=D.categorias.filter(function(x){return x.id===id})[0];return c?c.nombre:id}

// ---- modelo
function cobertura(modo,cat){var ok={},nv={},su={};
  S.fichas.forEach(function(f){if(f.categoria!==cat)return;
    if(f.modos.indexOf(modo)>=0){if(f.confianza==='baja')nv[f.proveedor]=1;else ok[f.proveedor]=1}
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
var TABS=['Inicio','Definir','Cargar fichas','Comparar','Puntuar','Decidir'];
function ir(i){S.tab=i;S.open=undefined;render()}
function render(){
  var nav=document.getElementById('nav');nav.textContent='';
  TABS.forEach(function(t,i){nav.appendChild(h('button',{role:'tab','aria-selected':String(S.tab===i),'data-testid':'tab-'+i,
    onclick:function(){ir(i)}},i?h('span',{class:'n',text:i}):null,t))});
  document.title=NOMBRE;var h1=document.querySelector('.brand h1');if(h1)h1.textContent=NOMBRE;
  document.getElementById('aviso').textContent=D.aviso;
  var m=document.getElementById('main');m.textContent='';
  [p0,p1,p2,p3,p4,p5][S.tab](m);
  if(S.open===undefined)window.scrollTo(0,0)}

// ---- inicio: lo que el radar encontró y las seis preguntas, con las cifras calculadas de los datos cargados
function resumenRadar(){var prov={},ver={alta:0,media:0,baja:0},tipo={},edad={reciente:0,vieja:0,sin:0},celdas=0,brechas=[];
  S.fichas.forEach(function(f){prov[f.proveedor]=1;ver[f.confianza]=(ver[f.confianza]||0)+1;tipo[f.tipo_fuente]=(tipo[f.tipo_fuente]||0)+1;
    var a=aniosDesde(f.fecha_dato);if(a===null)edad.sin++;else if(a<2)edad.reciente++;else edad.vieja++});
  D.categorias.forEach(function(c){D.modos.forEach(function(mo){var n=cobertura(mo.id,c.id).ok.length;if(n>=3)celdas++;else brechas.push({c:c,mo:mo,n:n})})});
  var act=S.activos.map(function(a){var p=puntaje(a);return {a:a,idx:p.idx,s:sem(p.idx)}}).sort(function(x,y){return y.idx-x.idx});
  return {fichas:S.fichas.length,prov:Object.keys(prov).length,ver:ver,tipo:tipo,edad:edad,celdas:celdas,brechas:brechas,act:act,
    rojos:act.filter(function(x){return x.s==='rojo'}).length,alertasPT:alertas().filter(function(x){return x.tipo==='pt'}).length}}
function kpi(tid,num,lab,sub){return h('div',{class:'kpi','data-testid':tid},h('b',{text:String(num)}),h('span',{class:'kl',text:lab}),sub?h('span',{class:'ks',text:sub}):null)}
var SEM_TXT={verde:'bajo',amarillo:'medio',rojo:'alto'};
function p0(m){var r=resumenRadar();
  var hero=h('section',{class:'card hero','data-testid':'p0'},
    h('p',{class:'kicker',text:'Reto 5 del Metro de Medellín'}),
    h('h2',{text:'El Metro suele enterarse tarde de las tecnologías que ofrece el mercado. '+NOMBRE+' reúne esa información en un solo lugar y muestra qué activos están cerca de quedar obsoletos, para decidir con tiempo.'}),
    h('p',{class:'lead',text:'Es un método de cinco pasos y una herramienta que maneja el propio equipo del Metro. Usa solo información pública y cada cálculo se puede revisar. Una ficha es el registro de un producto: quién lo vende, cómo se llama y el enlace a la página pública que lo respalda. Las fichas se cargaron a mano el '+fechaLarga(D.generado)+' y una revisión automática las vuelve a comprobar una vez al día; la última fue el '+fechaLarga(D.revisado||D.generado)+'. Con esos datos, el prototipo muestra lo siguiente:'}),
    h('div',{class:'kpis'},
      kpi('kpi-fichas',r.fichas,'fichas de productos, cada una con su enlace',(r.ver.alta+r.ver.media)+' abrieron en la última revisión'),
      kpi('kpi-prov',r.prov,'proveedores distintos','todos son empresas reales del mercado'),
      kpi('kpi-celdas',r.celdas+' de 16','casillas con 3 proveedores o más','4 categorías en 4 modos de transporte'),
      kpi('kpi-alertas',r.alertasPT,'alertas del Plan de Tecnología',r.rojos+' activos de ejemplo con riesgo alto')));
  m.appendChild(hero);
  var g=h('div',{class:'grid2'});
  // cobertura: matriz 4x4
  var mat=h('section',{class:'card','data-testid':'ini-matriz'},h('h3',{text:'Cuántos proveedores hay en cada casilla'}),
    h('p',{class:'note',text:'Cada casilla cruza una categoría de tecnología con un modo de transporte y cuenta los proveedores que tienen una fuente válida. El reto pide al menos 3 por casilla. Toca una casilla para abrirla en el paso 1.'}));
  var gm=h('div',{class:'mgrid'});gm.appendChild(h('span'));
  D.modos.forEach(function(mo){gm.appendChild(h('span',{class:'mh',text:mo.nombre}))});
  D.categorias.forEach(function(c){gm.appendChild(h('span',{class:'mr',text:c.nombre.split(' /')[0]}));
    D.modos.forEach(function(mo){var n=cobertura(mo.id,c.id).ok.length,k=n>=3?'c3':n>=1?'c1':'c0';
      gm.appendChild(h('button',{class:'mc '+k,'data-testid':'ini-celda-'+c.id+'-'+mo.id,'aria-label':c.nombre+', '+mo.nombre+': '+n+' de 3',
        onclick:function(){S.sel={cat:c.id,modo:mo.id};ir(1)}},h('b',{text:String(n)}),h('small',{text:n>=3?'completa':n?'incompleta':'vacía'})))})});
  mat.appendChild(gm);
  mat.appendChild(h('p',{class:'leyenda'},h('span',{class:'mc c3 sw'}),' 3 o más · ',h('span',{class:'mc c1 sw'}),' 1 o 2 · ',h('span',{class:'mc c0 sw'}),' ninguno'));
  g.appendChild(mat);
  // obsolescencia: barras
  var ob=h('section',{class:'card','data-testid':'ini-activos'},h('h3',{text:'Qué activos están más cerca de quedar obsoletos'}),
    h('p',{class:'note',text:'Un activo es un sistema que el Metro tiene instalado, como una flota de trenes o la señalización de una línea. Cada uno recibe un índice de obsolescencia de 0 a 100, que combina su edad, cuánto depende de un solo proveedor y qué tan atrás está frente al mercado. Estos activos son de ejemplo; no son datos del Metro.'}));
  var bl=h('div',{class:'bars'});
  r.act.forEach(function(x){bl.appendChild(h('div',{class:'brow','data-testid':'ini-act-'+x.a.id},
    h('span',{class:'bn',text:x.a.nombre}),
    h('span',{class:'bt'},h('i',{class:'bf s-'+x.s,style:'width:'+Math.max(2,Math.round(x.idx))+'%'})),
    h('span',{class:'bv'},h('b',{text:x.idx.toFixed(0)}),' '+SEM_TXT[x.s])))});
  ob.appendChild(bl);
  ob.appendChild(h('p',{class:'leyenda'},'El riesgo es bajo por debajo de 35, medio de 35 a 65 y alto desde 65. ',h('button',{class:'lnk',onclick:function(){ir(4)},text:'Cambiar cuánto pesa cada factor (paso 4)'})));
  g.appendChild(ob);
  m.appendChild(g);
  // verificación de las fuentes y brechas
  var g2=h('div',{class:'grid2'});
  var vt=r.ver.alta+r.ver.media+r.ver.baja||1;
  var vf=h('section',{class:'card','data-testid':'ini-verif'},h('h3',{text:'Qué tan confiable es cada fuente'}),
    h('p',{class:'note',text:'Cada fuente se clasifica en tres ejes: quién la publica, cuándo se publicó el dato y qué confianza merece. Solo las fuentes de confianza alta o media cuentan para el mínimo de 3. Ninguna clasificación confirma que el dato sea cierto.'}),
    h('div',{class:'stack3'},
      h('i',{class:'v1',style:'width:'+(100*r.ver.alta/vt)+'%'}),h('i',{class:'v2',style:'width:'+(100*r.ver.media/vt)+'%'}),h('i',{class:'v3',style:'width:'+(100*r.ver.baja/vt)+'%'})),
    h('ul',{class:'vleg'},h('li',null,h('span',{class:'sw v1'}),h('b',{'data-testid':'ini-conf-alta',text:String(r.ver.alta)}),' de confianza alta: la publica alguien distinto del fabricante y la página abrió'),
      h('li',null,h('span',{class:'sw v2'}),h('b',{'data-testid':'ini-conf-media',text:String(r.ver.media)}),' de confianza media: solo lo dice el fabricante'),
      h('li',null,h('span',{class:'sw v3'}),h('b',{'data-testid':'ini-conf-baja',text:String(r.ver.baja)}),' de confianza baja: la página no abrió en la última revisión, así que no cuentan')),
    h('p',{class:'note','data-testid':'ini-tipos',text:'Quién la publica: '+(r.tipo.fabricante||0)+' el fabricante, '+(r.tipo.prensa||0)+' la prensa especializada y '+(r.tipo.tercero||0)+' un tercero independiente.'}),
    h('p',{class:'note','data-testid':'ini-edad',text:'Cuándo se publicó el dato: '+r.edad.reciente+' hace menos de 2 años, '+r.edad.vieja+' hace 2 años o más y '+r.edad.sin+' sin fecha de publicación en la página.'}));
  g2.appendChild(vf);
  var br=h('section',{class:'card','data-testid':'ini-brechas'},h('h3',{text:'Dónde faltan proveedores ('+r.brechas.length+' casillas incompletas)'}),
    h('p',{class:'note',text:'En estas casillas hay menos de 3 proveedores con una fuente válida. Quedan a la vista como incompletas y no se rellenaron con nombres sin respaldo.'}));
  var ul=h('ul',{class:'blist'});r.brechas.forEach(function(x){ul.appendChild(h('li',null,h('b',{text:x.n+' de 3'}),' · '+x.c.nombre+' · '+x.mo.nombre))});
  br.appendChild(ul);g2.appendChild(br);m.appendChild(g2);
  var nv=D.novedades||[],nc=h('section',{class:'card','data-testid':'ini-novedades'},h('h3',{text:'Novedades de los proveedores en los últimos 30 días ('+nv.length+')'}),
    h('p',{class:'note',text:'La revisión diaria las busca en el RSS de cada proveedor, cuando lo tiene, y en Google News. Se filtran por el nombre del proveedor y por palabras de transporte, así que puede colarse alguna nota ajena. Las novedades no cambian las fichas: un analista decide si alguna merece una ficha nueva.'}));
  if(!nv.length)nc.appendChild(h('p',{text:'La última revisión no encontró novedades.'}));
  var nl=h('ul',{class:'nlist'});nv.forEach(function(x){nl.appendChild(h('li',{'data-testid':'novedad'},h('span',{class:'nf',text:(x.fecha?fechaLarga(x.fecha):'sin fecha')+' · '+x.proveedor}),' ',
    h('a',{href:x.enlace,target:'_blank',rel:'noopener noreferrer',text:x.titulo}),x.medio?h('span',{class:'note',text:' ('+x.medio+')'}):null))});
  nc.appendChild(nl);m.appendChild(nc);
  // las seis preguntas
  var q=h('section',{class:'card','data-testid':'ini-preguntas'},h('h3',{text:'La propuesta en seis respuestas'}));
  var qg=h('div',{class:'qgrid'});
  [['El problema','Hoy el Metro evalúa una tecnología cuando ya hay un problema o una compra en marcha. Lo hace por separado en cada modo de transporte y con búsquedas manuales. Así pierde oportunidades de negociar con tiempo y no mide el riesgo de depender de un solo proveedor.'],
   ['La solución','La propuesta es un método de cinco pasos (definir, cargar fichas, comparar, puntuar y decidir) y una herramienta que funcionaría dentro de Metro Digital, algo que falta confirmar con TI. Es vigilancia tecnológica: revisar de forma ordenada y periódica qué ofrece el mercado. El prototipo ya revisa solo, una vez al día, que cada enlace abra y busca novedades de cada proveedor; agregar o quitar fichas sigue siendo trabajo de una persona.'],
   ['La propuesta de valor','Reúne en un solo lugar al menos 48 fichas, 3 proveedores para cada una de las 16 casillas. Un semáforo marca qué activos están en riesgo y cada cálculo se puede revisar. Según el plan propuesto, desde la semana 11 del piloto el equipo del Metro maneja la herramienta sin ayuda externa.'],
   ['Por qué es la mejor','El reto dice que el Metro no busca comprar un tren, un software cerrado ni una consultoría puntual, y que no quiere exponer sus datos en una inteligencia artificial pública. '+NOMBRE+' entrega un método para elegir, tiene código abierto, deja al Metro manejándolo por su cuenta y usa solo fuentes públicas.'],
   ['La viabilidad','La propuesta cobraría por implementar el piloto, por una licencia anual del método y por un soporte que se reduce con el tiempo. Producirlo cuesta poco, porque usa fuentes abiertas, software libre y la infraestructura del Metro. No promete una cifra de ahorro en pesos; el piloto se encarga de medirla.'],
   ['La factibilidad','Lo necesario para construirlo ya existe. El piloto dura hasta 16 semanas, entre mayo y agosto de 2027, que es el plazo de la convocatoria. Primero se construye con el equipo del Metro, después el Metro carga fichas con revisión y al final las maneja por su cuenta. La prueba de que funcionó es concreta: en la semana 14, un analista del Metro agrega un proveedor sin ayuda.']
  ].forEach(function(x,i){qg.appendChild(h('div',{class:'q','data-testid':'ini-q-'+(i+1)},h('span',{class:'qn',text:String(i+1)}),h('h4',{text:x[0]}),h('p',{text:x[1]})))});
  q.appendChild(qg);m.appendChild(q);
  // entrada a los pasos
  var pas=h('section',{class:'card','data-testid':'ini-pasos'},h('h3',{text:'Los cinco pasos del método'}),h('p',{class:'note',text:'Cada paso es una pantalla del prototipo y usa los mismos datos de arriba.'}));
  var pr=h('div',{class:'pasos'});
  [['Definir','Se elige qué revisar: 4 categorías en 4 modos de transporte.'],['Cargar fichas','Cada producto entra con el enlace a una página pública.'],['Comparar','Las soluciones se ven lado a lado, con los mismos campos.'],['Puntuar','Cada activo recibe un índice de obsolescencia y un color.'],['Decidir','El comité revisa las alertas y anota lo que decide.']]
   .forEach(function(x,i){pr.appendChild(h('button',{class:'paso','data-testid':'ini-paso-'+(i+1),onclick:function(){ir(i+1)}},h('span',{class:'n',text:String(i+1)}),h('b',{text:x[0]}),h('small',{text:x[1]})))});
  pas.appendChild(pr);m.appendChild(pas)}

function badge(cov){var n=cov.ok.length,cl=n>=3?'b-ok':n>=1?'b-mid':'b-bad';return h('span',{class:'badge '+cl,text:n+'/3'})}

function p1(m){
  var comp=0;D.categorias.forEach(function(c){D.modos.forEach(function(mo){if(cobertura(mo.id,c.id).ok.length>=3)comp++})});
  var card=h('section',{class:'card','data-testid':'p1'},h('h2',{text:'1. Definir qué se revisa'}),
   h('p',{class:'lead',text:'El cuadro cruza 4 categorías de tecnología con 4 modos de transporte. Cada casilla necesita al menos 3 proveedores con una fuente válida. Toca una casilla para ver sus fichas.'}),
   h('p',{'data-testid':'resumen',text:'Casillas completas: '+comp+' de 16. Fichas cargadas: '+S.fichas.length+'.'}));
  var t=h('table',{class:'matrix'}),hr=h('tr',null,h('th',{text:'Categoría'}));
  D.modos.forEach(function(mo){hr.appendChild(h('th',{text:mo.nombre}))});t.appendChild(h('thead',null,hr));
  var tb=h('tbody');
  D.categorias.forEach(function(c){var tr=h('tr',null,h('th',{text:c.nombre,title:c.desc}));
    D.modos.forEach(function(mo){var cov=cobertura(mo.id,c.id),on=S.sel.cat===c.id&&S.sel.modo===mo.id;
      var det=[];if(cov.nv.length)det.push(cov.nv.length+' de confianza baja');if(cov.su.length)det.push(cov.su.length+(cov.su.length===1?' aplicada por supuesto':' aplicadas por supuesto'));
      tr.appendChild(h('td',{class:'cellbtn'},h('button',{'aria-pressed':String(on),'data-testid':'celda-'+c.id+'-'+mo.id,
        onclick:function(){S.sel={cat:c.id,modo:mo.id};render()}},badge(cov),
        h('div',{class:'note',text:cov.ok.length?cov.ok.join(', '):'sin proveedores'}),det.length?h('div',{class:'note',text:det.join(' · ')}):null)))});
    tb.appendChild(tr)});
  t.appendChild(tb);card.appendChild(h('div',{class:'scroll'},t));
  card.appendChild(h('p',{class:'note',text:'Las categorías son una propuesta inicial. Las áreas técnicas del Metro las ajustarían en este paso.'}));
  m.appendChild(card);
  m.appendChild(detalleCelda())}

function detalleCelda(){var c=S.sel.cat,mo=S.sel.modo,cov=cobertura(mo,c);
  var card=h('section',{class:'card'},h('h2',{text:cname(c)+' · '+mname(mo)}));
  card.appendChild(h('p',{class:'lead',text:cov.ok.length>=3?'Casilla completa: tiene '+cov.ok.length+' proveedores con fuente válida.':'Casilla incompleta: '+(3-cov.ok.length===1?'falta 1 proveedor':'faltan '+(3-cov.ok.length)+' proveedores')+' con fuente válida para llegar al mínimo de 3.'}));
  var l=S.fichas.filter(function(f){return f.categoria===c&&(f.modos.indexOf(mo)>=0||(f.modos_supuestos||[]).indexOf(mo)>=0)});
  if(!l.length)card.appendChild(h('p',{text:'Todavía no hay fichas en esta casilla.'}));
  l.forEach(function(f){card.appendChild(h('div',null,h('strong',{text:f.proveedor}),' · '+f.producto+' ',cbadge(f.confianza),
    f.modos.indexOf(mo)<0?h('span',{class:'note',text:' (se supone que sirve para este modo; la fuente no lo dice)'}):null))});
  return card}
function cbadge(c){return h('span',{class:'badge '+(c==='alta'?'b-ok':c==='media'?'b-mid':'b-gray'),text:'confianza '+(c||'baja')})}

function p2(m){
  var card=h('section',{class:'card','data-testid':'p2'},h('h2',{text:'2. Cargar fichas'}),
   h('p',{class:'lead',text:'Cada ficha entra con el enlace a una página pública, que es su fuente. En esta pantalla se revisan las fichas cargadas, se suman más desde un archivo o se agregan a mano. Nada de lo que se carga sale de este computador.'}));
  var t=h('table'),th=h('tr');['Proveedor','Producto','Tipo de fuente','Fecha del dato','Confianza','Revisada','Fuente'].forEach(function(x){th.appendChild(h('th',{text:x}))});
  t.appendChild(h('thead',null,th));var tb=h('tbody');
  S.fichas.forEach(function(f){tb.appendChild(h('tr',null,h('td',{'data-l':'Proveedor',text:f.proveedor}),h('td',{'data-l':'Producto',text:f.producto}),
    h('td',{'data-l':'Tipo de fuente',text:tipoTxt(f.tipo_fuente)}),h('td',{'data-l':'Fecha del dato',text:f.fecha_dato||'sin fecha'}),
    h('td',{'data-l':'Confianza'},cbadge(f.confianza)),h('td',{'data-l':'Revisada',text:f.consultada||'sin revisar'}),
    h('td',{'data-l':'Fuente'},h('a',{href:f.url,target:'_blank',rel:'noopener noreferrer',text:'abrir'}))))});
  t.appendChild(tb);card.appendChild(h('div',{class:'scroll stack','data-testid':'tabla-fuentes'},t));
  card.appendChild(h('p',{class:'note',text:'Cada fuente tiene tres clasificaciones. El tipo dice quién la publica: el fabricante, la prensa especializada o un tercero independiente. La fecha del dato es la de publicación que declara la página, no la de la consulta; si la página no la declara, dice «sin fecha». La confianza es alta si la publica alguien distinto del fabricante y la página abrió, media si solo lo dice el fabricante y baja si la página no abrió en la última revisión. Las fichas de confianza baja se muestran, pero no cuentan para el mínimo de 3. Una revisión automática corre una vez al día: vuelve a abrir cada enlace, mira si la página nombra el producto, actualiza la fecha del dato y la confianza, y busca novedades de cada proveedor. No agrega ni quita fichas y no comprueba que lo que dice cada fuente sea cierto.'}));
  m.appendChild(card);
  var imp=h('section',{class:'card'},h('h2',{text:'Sumar fichas desde un archivo'}),
   h('p',{class:'note',text:'El archivo tiene que estar en formato JSON: una lista en la que cada ficha trae categoria (rs, sc, en o dg), modos, proveedor, producto y url. Las fichas que entran así quedan con confianza baja, y no cuentan para el mínimo, hasta que alguien las revise y las sume a la lista que revisa el sistema cada día.'}),
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
   h('div',{class:'row'},h('button',{class:'btn sec','data-testid':'reset',onclick:reset,text:'Volver a los datos de ejemplo'})));
  m.appendChild(add)}
function validFicha(f){return f&&typeof f==='object'&&['rs','sc','en','dg'].indexOf(f.categoria)>=0&&Array.isArray(f.modos)&&f.modos.length&&
  f.modos.every(function(x){return ['metro','tranvia','brt','cable'].indexOf(x)>=0})&&typeof f.proveedor==='string'&&f.proveedor.trim()&&
  typeof f.producto==='string'&&f.producto.trim()&&typeof f.url==='string'&&/^https?:\/\/\S+$/.test(f.url)}
function onFile(ev){var file=ev.target.files[0];if(!file)return;var r=new FileReader();
  r.onload=function(){var arr;try{arr=JSON.parse(r.result)}catch(e){S.importErr='El archivo no se pudo leer como JSON.';render();return}
    if(!Array.isArray(arr)||!arr.length||!arr.every(validFicha)){S.importErr='Se rechazó el archivo porque a alguna ficha le falta categoria, modos, proveedor, producto o un enlace que empiece con http:// o https://.';render();return}
    arr.forEach(function(f,i){S.fichas.push({id:'imp-'+Date.now()+'-'+i,categoria:f.categoria,modos:f.modos,modos_supuestos:[],proveedor:f.proveedor.trim(),producto:f.producto.trim(),
      url:f.url,tipo_fuente:'sin clasificar',confianza:'baja',abre:false,nombra:false,fecha_dato:null,dato:null,consultada:null})});
    S.importErr='';save();render()};
  r.readAsText(file)}
function onAdd(){var g=function(id){return document.getElementById(id).value};
  var f={categoria:g('f-cat'),modos:[g('f-modo')],proveedor:g('f-prov'),producto:g('f-prod'),url:g('f-url').trim()};
  if(!validFicha(f)){S.addErr='Faltan datos. La ficha necesita proveedor, producto y un enlace que empiece con http:// o https://.';render();return}
  S.fichas.push({id:'man-'+Date.now(),categoria:f.categoria,modos:f.modos,modos_supuestos:[],proveedor:f.proveedor.trim(),producto:f.producto.trim(),url:f.url,
    tipo_fuente:'sin clasificar',confianza:'baja',abre:false,nombra:false,fecha_dato:null,dato:null,consultada:null});S.addErr='';save();render()}

function p3(m){
  var cat=h('select',{'data-testid':'sel-cat',onchange:function(e){S.sel.cat=e.target.value;render()}}),mo=h('select',{'data-testid':'sel-modo',onchange:function(e){S.sel.modo=e.target.value;render()}});
  D.categorias.forEach(function(c){cat.appendChild(h('option',{value:c.id,text:c.nombre,selected:c.id===S.sel.cat}))});
  D.modos.forEach(function(x){mo.appendChild(h('option',{value:x.id,text:x.nombre,selected:x.id===S.sel.modo}))});
  var cov=cobertura(S.sel.modo,S.sel.cat);
  var card=h('section',{class:'card','data-testid':'p3'},h('h2',{text:'3. Comparar proveedores'}),
   h('p',{class:'lead',text:'Todas las fichas tienen los mismos campos, así que las soluciones se comparan lado a lado sin depender de lo que alguien recuerde.'}),
   h('div',{class:'row'},h('label',null,'Categoría',cat),h('label',null,'Modo',mo)),
   h('p',{'data-testid':'cobertura-celda'},'Proveedores que cuentan para el mínimo: ',h('strong',{text:cov.ok.length+' de 3'}),cov.ok.length<3?' (casilla incompleta)':''));
  var l=S.fichas.filter(function(f){return f.categoria===S.sel.cat&&(f.modos.indexOf(S.sel.modo)>=0||(f.modos_supuestos||[]).indexOf(S.sel.modo)>=0)});
  if(!l.length){card.appendChild(h('p',{text:'No hay fichas en esta casilla. Puedes agregarlas en el paso 2.'}))}
  else{var t=h('table'),hr=h('tr');['Proveedor','Producto','Dato del fabricante o la prensa','Aplica a este modo','Fecha del dato','Confianza','Fuente'].forEach(function(x){hr.appendChild(h('th',{text:x}))});
    t.appendChild(h('thead',null,hr));var tb=h('tbody');
    l.forEach(function(f){var conf=f.modos.indexOf(S.sel.modo)>=0;tb.appendChild(h('tr',null,h('td',{'data-l':'Proveedor'},h('strong',{text:f.proveedor})),h('td',{'data-l':'Producto',text:f.producto}),
      h('td',{'data-l':'Dato',text:f.dato||'sin dato cargado'}),h('td',{'data-l':'Aplica',text:conf?'según la fuente':'supuesto del analista'}),
      h('td',{'data-l':'Fecha del dato',text:f.fecha_dato||'sin fecha'}),h('td',{'data-l':'Confianza'},cbadge(f.confianza)),h('td',{'data-l':'Fuente'},h('a',{href:f.url,target:'_blank',rel:'noopener noreferrer',text:'abrir'}))))});
    t.appendChild(tb);card.appendChild(h('div',{class:'scroll stack','data-testid':'tabla-fichas'},t))}
  card.appendChild(h('p',{class:'note',text:'Los datos son lo que afirma cada fabricante o la prensa especializada; nadie los contrastó por separado. El nivel de madurez de cada solución (TRL, una escala de 1 a 9 que va de la idea a un producto probado en servicio) lo estimaría el analista del Metro con la fuente a la vista.'}));
  m.appendChild(card)}

function p4(m){
  var card=h('section',{class:'card','data-testid':'p4'},h('h2',{text:'4. Puntuar el riesgo de obsolescencia'}),
   h('p',{class:'lead',text:'Cada activo recibe un índice de obsolescencia de 0 a 100. El índice combina cuánto de su vida útil ya pasó, cuánto depende de un solo proveedor y su brecha tecnológica, que mide de 0 a 5 qué tan atrás está frente a lo que ofrece hoy el mercado. El Metro decide cuánto pesa cada factor. Los activos son datos de ejemplo.'}));
  var w=h('div',{class:'row'});
  [['edad','Peso de la edad'],['dependencia','Peso de la dependencia'],['brecha','Peso de la brecha']].forEach(function(p){
    var out=h('span',{text:S.pesos[p[0]].toFixed(2)});
    w.appendChild(h('label',null,h('span',null,p[1]+': ',out),h('input',{type:'range',min:'0',max:'1',step:'0.05',value:String(S.pesos[p[0]]),'data-testid':'peso-'+p[0],
      oninput:function(e){S.pesos[p[0]]=parseFloat(e.target.value);out.textContent=S.pesos[p[0]].toFixed(2)},onchange:function(){save();render()}})))});
  card.appendChild(w);
  var t=h('table'),hr=h('tr');['Activo (ejemplo)','Modo y categoría','Año de instalación','Vida útil (años)','Depende de un solo proveedor','Brecha tecnológica (0 a 5)','Alternativas','Índice'].forEach(function(x){hr.appendChild(h('th',{text:x}))});
  t.appendChild(h('thead',null,hr));var tb=h('tbody');
  S.activos.forEach(function(a){var p=puntaje(a);
    function num(field,min,max){return h('input',{class:'num',type:'number',min:String(min),max:String(max),value:String(a[field]),'data-testid':a.id+'-'+field,
      onchange:function(e){var v=parseInt(e.target.value,10);if(isNaN(v)||v<min||v>max){e.target.value=a[field];return}a[field]=v;save();render()}})}
    tb.appendChild(h('tr',{'data-testid':'fila-'+a.id},h('td',{'data-l':'Activo'},h('strong',{text:a.nombre}),h('div',{class:'note',text:a.id+' · dato de ejemplo'})),
      h('td',{'data-l':'Modo y categoría',text:mname(a.modo)+' · '+cname(a.categoria)}),h('td',{'data-l':'Instalado'},num('instalado',1950,2026)),h('td',{'data-l':'Vida útil'},num('vida_util',1,80)),
      h('td',{'data-l':'Cautivo'},h('input',{type:'checkbox',checked:a.cautivo,'data-testid':a.id+'-cautivo',onchange:function(e){a.cautivo=e.target.checked;save();render()}})),
      h('td',{'data-l':'Brecha'},num('brecha',0,5)),h('td',{'data-l':'Alternativas',text:p.alt+' con fuente'}),
      h('td',{'data-l':'Índice'},h('span',{class:'sem s-'+sem(p.idx)}),h('span',{class:'idx','data-testid':a.id+'-idx',text:p.idx.toFixed(1)}),
        h('div',{class:'bar'},h('i',{style:'width:'+Math.round(p.idx)+'%'})),
        h('div',{class:'note',text:p.restan>0?'Le quedan '+p.restan+' años de vida útil':'Ya cumplió su vida útil'}))))});
  t.appendChild(tb);
  card.appendChild(window.innerWidth<=720?tarjetas():h('div',{class:'scroll stack'},t));
  card.appendChild(h('p',{class:'note',text:'El semáforo marca el riesgo: verde es bajo (menos de 35), amarillo es medio (de 35 a 65) y rojo es alto (65 o más). La dependencia baja cuando hay tres alternativas con fuente y sube cuando el activo depende de un solo proveedor. El prototipo no calcula costos en pesos colombianos; el costo evitado se mediría en el piloto con los datos reales del Plan de Tecnología.'}));
  m.appendChild(card)}


function tarjetas(){var box=h('div',{'data-testid':'tarjetas'});
  S.activos.forEach(function(a){var p=puntaje(a);
    function num(field,min,max,lab){return h('label',null,lab,h('input',{class:'num',type:'number',min:String(min),max:String(max),value:String(a[field]),'data-testid':a.id+'-'+field,
      onchange:function(e){var v=parseInt(e.target.value,10);if(isNaN(v)||v<min||v>max){e.target.value=a[field];return}a[field]=v;S.open=a.id;save();render()}}))}
    box.appendChild(h('div',{class:'tcard','data-testid':'fila-'+a.id},
      h('div',{class:'thead'},h('span',{class:'sem s-'+sem(p.idx)}),h('span',{class:'idx','data-testid':a.id+'-idx',text:p.idx.toFixed(1)}),
        h('div',null,h('strong',{text:a.nombre}),h('div',{class:'note',text:a.id+' · '+mname(a.modo)+' · '+cname(a.categoria)+' · dato de ejemplo'}))),
      h('div',{class:'bar'},h('i',{style:'width:'+Math.round(p.idx)+'%'})),
      h('div',{class:'note',text:(p.restan>0?'Le quedan '+p.restan+' años de vida útil':'Ya cumplió su vida útil')+' · Alternativas con fuente: '+p.alt}),
      h('details',{open:S.open===a.id,'data-testid':a.id+'-det'},h('summary',{text:'Cambiar los datos del activo'}),
        h('div',{class:'row'},num('instalado',1950,2026,'Año de instalación'),num('vida_util',1,80,'Vida útil (años)'),num('brecha',0,5,'Brecha tecnológica (0 a 5)'),
          h('label',null,'Depende de un solo proveedor',h('input',{type:'checkbox',checked:a.cautivo,'data-testid':a.id+'-cautivo',onchange:function(e){a.cautivo=e.target.checked;S.open=a.id;save();render()}}))))))});
  return box}

function alertas(){var out=[];
  D.pt.forEach(function(r){S.activos.filter(function(a){return a.modo===r.modo&&a.categoria===r.categoria}).forEach(function(a){var p=puntaje(a);
    if(p.idx>=r.umbral)out.push({tipo:'pt',txt:'Prioridad '+r.id+' (importancia '+minus(r.prioridad)+'): '+r.titulo+'. El activo «'+a.nombre+'» tiene un índice de '+p.idx.toFixed(1)+', igual o mayor que el umbral de '+r.umbral+' que fija esa prioridad.'})})});
  D.categorias.forEach(function(c){D.modos.forEach(function(mo){var n=cobertura(mo.id,c.id).ok.length;
    if(n<3)out.push({tipo:'cob',txt:'Casilla incompleta: '+c.nombre+' en '+minus(mo.nombre)+' tiene '+n+' de 3 proveedores con fuente válida.'})})});
  return out}
function p5(m){var al=alertas(),pt=al.filter(function(a){return a.tipo==='pt'}),cb=al.filter(function(a){return a.tipo==='cob'});
  var card=h('section',{class:'card','data-testid':'p5'},h('h2',{text:'5. Decidir y dejar registro'}),
   h('p',{class:'lead',text:'El Plan de Tecnología es la lista de prioridades de renovación del Metro; aquí es un plan de ejemplo. Cada prioridad fija un umbral, y aparece una alerta cuando el índice de un activo de esa prioridad llega a ese umbral. Las alertas se calculan con los datos cargados. El comité del radar las revisa, decide y anota la decisión en la bitácora.'}),
   h('h3',{text:'Alertas del Plan de Tecnología ('+pt.length+')'}));
  if(!pt.length)card.appendChild(h('div',{class:'alert ok','data-testid':'sin-alertas-pt',text:'Ningún activo llega al umbral de una prioridad del Plan de Tecnología.'}));
  pt.forEach(function(a){card.appendChild(h('div',{class:'alert','data-testid':'alerta-pt',text:a.txt}))});
  card.appendChild(h('h3',{text:'Casillas incompletas ('+cb.length+')'}));
  cb.forEach(function(a){card.appendChild(h('div',{class:'alert warn','data-testid':'alerta-cob',text:a.txt}))});
  m.appendChild(card);
  var sel=h('select',{id:'b-act'});S.activos.forEach(function(a){sel.appendChild(h('option',{value:a.id,text:a.id+' · '+a.nombre}))});
  var b=h('section',{class:'card'},h('h2',{text:'Bitácora de decisiones'}),
   h('div',{class:'row'},h('label',null,'Activo',sel),h('label',null,'Decisión del comité',h('input',{id:'b-dec','data-testid':'b-dec',size:'40'})),
     h('label',null,'Costo evitado (si se conoce)',h('input',{id:'b-costo',placeholder:'sin cuantificar'})),h('button',{class:'btn','data-testid':'b-add',text:'Registrar',onclick:function(){
       var d=document.getElementById('b-dec').value.trim();if(!d)return;S.bitacora.push({fecha:new Date().toISOString().slice(0,10),activo:document.getElementById('b-act').value,decision:d,costo_evitado:document.getElementById('b-costo').value.trim()||'sin cuantificar'});save();render()}}),
     h('button',{class:'btn sec','data-testid':'b-export',text:'Descargar en JSON',onclick:exportar})));
  if(!S.bitacora.length)b.appendChild(h('p',{class:'note',text:'Todavía no hay decisiones registradas.'}));
  S.bitacora.forEach(function(x){b.appendChild(h('div',{'data-testid':'b-item',text:x.fecha+' · '+x.activo+' · '+x.decision+' · costo evitado: '+x.costo_evitado}))});
  m.appendChild(b)}
function exportar(){var blob=new Blob([JSON.stringify({bitacora:S.bitacora,activos:S.activos,pesos:S.pesos},null,1)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='metrotech-bitacora.json';document.body.appendChild(a);a.click();a.remove()}

load();render();var _w=window.innerWidth;window.addEventListener('resize',function(){if((window.innerWidth<=720)!==(_w<=720)){_w=window.innerWidth;render()}});
})();
