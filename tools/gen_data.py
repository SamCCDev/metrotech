import json
C='2026-10-28'
# El nombre del producto vive solo aquí: la app lo toma de data.js (título, encabezado y textos).
NOMBRE='MetroTech'
MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
C_TXT='%d de %s de %s'%(int(C[8:]),MESES[int(C[5:7])-1],C[:4])
V,P,N='verificada','parcial','no-verificada'
# (id,cat,[modos confirmados],[modos supuestos],proveedor,producto,url,verif,tipo,dato,nota_dato)
F=[
('rs-metro-alstom','rs',['metro'],[],'Alstom','Metropolis','https://www.alstom.com/solutions/rolling-stock/metropolis-metros-keeping-your-city-breathing',V,'fabricante','Más de 35.000 coches Metropolis en el mundo, 6.000 sin conductor (página del fabricante)'),
('rs-metro-siemens','rs',['metro'],[],'Siemens Mobility','Inspiro','https://press.siemens.com/global/en/pressrelease/start-siemens-mobilitys-inspiro-trains-and-automatic-train-control-systems-metro-sofia',V,'fabricante','Trenes Inspiro en servicio en la Línea 3 del Metro de Sofía (comunicado del fabricante)'),
('rs-metro-hitachi','rs',['metro'],[],'Hitachi Rail','Trenes de metro (proyecto Baltimore)','https://www.hitachirail.com/products-and-solutions/rolling-stock/metro-trains/baltimore-metro/',V,'fabricante',None),
('rs-tram-alstom','rs',['tranvia'],[],'Alstom','Citadis','https://www.alstom.com/sites/alstom.com/files/2019/12/10/20191210_PR_Tramway_Angers_EN.pdf',V,'fabricante',None),
('rs-tram-caf','rs',['tranvia'],[],'CAF','Urbos','https://www.caf.net/en/soluciones/familia/urbos/index.php',N,'fabricante','100 % piso bajo, 750 V CC, de 18 a 43 m (datos técnicos del fabricante, según resultado de búsqueda; el sitio no dejó abrir la página cuando se comprobó el enlace)'),
('rs-tram-stadler','rs',['tranvia'],[],'Stadler','Tramlink','https://stadlerrail.com/api/docs/x/f6df7f1948/tramlink_blt_en.pdf',P,'fabricante',None),
('rs-tram-siemens','rs',['tranvia'],[],'Siemens Mobility','Avenio','https://assets.new.siemens.com/siemens/assets/api/uuid:d08bfc2a-0f91-46e7-9b37-abafb2b6438b/product-specification-avenio-e.pdf',V,'fabricante',None),
('rs-brt-volvo','rs',['brt'],[],'Volvo Buses','BZRT Electric (articulado y biarticulado)','https://www.volvobuses.com/en/city-and-intercity/chassis/volvo-bzrt-electric.html',V,'fabricante','Biarticulado de unos 28 m y hasta 250 pasajeros (comunicado de Volvo, mayo de 2025)'),
('rs-brt-byd','rs',['brt'],[],'BYD','K12A biarticulado eléctrico','https://www.sustainable-bus.com/news/a-27-electric-meter-bus-for-brt-systems-byd-launches-the-world-longest-ebus',V,'prensa','27 m, 250 pasajeros, cerca de 300 km de autonomía (nota de prensa especializada)'),
('rs-cable-doppelmayr','rs',['cable'],[],'Doppelmayr (CWA)','Cabina 3S','https://www.doppelmayr.com/en/cwa-cabins/3s-cabins/',V,'fabricante',None),
('rs-cable-leitner','rs',['cable'],[],'Leitner','Cabina Diamond','https://leitner.com/fileadmin/user_upload/pages/Diamond_cabin.pdf',V,'fabricante',None),
('rs-cable-poma','rs',['cable'],[],'POMA / Sigma','Cabinas Sigma','https://www.poma.net/en/subsidiaries/sigma/',V,'fabricante',None),
('sc-metro-alstom','sc',['metro'],[],'Alstom','Urbalis (CBTC)','https://www.alstom.com/solutions/signalling/urban-signalling/communications-based-train-control-world-leading-high-capacity-signalling',V,'fabricante',None),
('sc-metro-siemens','sc',['metro'],[],'Siemens Mobility','Trainguard MT (CBTC)','https://www.mobility.siemens.com/us/en/portfolio/rail-infrastructure/communications-based-train-control-system.html',V,'fabricante',None),
('sc-metro-hitachi','sc',['metro'],[],'Hitachi Rail (SelTrac)','Control y supervisión de tren urbano','https://www.hitachirail.com/products-and-solutions/urban-rail-control-supervision/',V,'fabricante','Hitachi Rail completó en mayo de 2024 la compra del negocio de Thales de sistemas de transporte terrestre, de donde viene SelTrac (según resultados de búsqueda)'),
('sc-tram-alstom','sc',['tranvia'],[],'Alstom','Señalización de tranvía y LRV','https://www.alstom.com/tramway-lrv-signalling-advanced-assistance-operations-and-safety',V,'fabricante',None),
('sc-tram-thales','sc',['tranvia'],[],'Thales','Señalización de tranvía y LRT','https://www.thalesgroup.com/en/tramway-lrt-signalling-solution',V,'fabricante','Puede repetirse con Hitachi Rail, que compró ese negocio; falta confirmar quién es hoy el dueño del producto'),
('sc-brt-trapeze','sc',['brt'],[],'Trapeze','Sistemas de transporte inteligentes para buses','https://trapezegroup.com/intelligent-transportation-systems/',V,'fabricante',None),
('sc-brt-init','sc',['brt'],[],'INIT','ITCS / información en tiempo real','https://www.initse.com/ende/home/',V,'fabricante',None),
('sc-brt-clever','sc',['brt'],[],'Clever Devices (Hitachi)','Gestión de flotas','https://www.cleverdevices.com/',V,'fabricante',None),
('sc-cable-doppelmayr','sc',['cable'],[],'Doppelmayr','Doppelmayr Connect (control)','https://mediencenter.doppelmayr.com/doppelmayr-connect-de/58165605',V,'fabricante',None),
('sc-cable-leitner','sc',['cable'],[],'Leitner','Sistema de control Leitner','https://www.leitner.com/en/products/ropeway-components/detail/leitner-control-system/',V,'fabricante',None),
('en-metro-alstom','en',['metro'],[],'Alstom','HESOP (subestación reversible)','https://www.alstom.com/press-releases-news/2025/6/capturing-wasted-energy-our-cities',V,'fabricante',None),
('en-metro-abb','en',['metro'],[],'ABB','Subestaciones de tracción ferroviaria','https://new.abb.com/news/detail/13146/abb-substations-to-strengthen-railway-infrastructure-in-switzerland',N,'fabricante','Aparece en resultados de búsqueda; el sitio no respondió cuando se comprobó el enlace'),
('en-metro-siemens','en',['metro'],[],'Siemens Mobility','SITRAS (alimentación de tracción)','https://press.siemens.com/global/en/pressrelease/start-siemens-mobilitys-inspiro-trains-and-automatic-train-control-systems-metro-sofia',P,'fabricante','El comunicado menciona el sistema SITRAS RSC en el Metro de Sofía; no es una página de producto'),
('en-tram-alstom','en',['tranvia'],[],'Alstom','APS (alimentación por el suelo)','https://www.alstom.com/sites/alstom.com/files/2019/12/16/20191214_PR_Sydney_tramway_inauguration_ES.pdf',V,'fabricante',None),
('en-tram-siemens','en',['tranvia'],[],'Siemens Mobility','SITRAS HES (almacenamiento de energía)','https://assets.new.siemens.com/siemens/assets/api/uuid:b21e946a-c640-4ae7-adb6-cff8125f0adf/siemens-mobility-qatar-education-city-light-rail-project.pdf',V,'fabricante',None),
('en-brt-abb','en',['brt'],[],'ABB','Panto Up (carga con pantógrafo)','https://new.abb.com/news/detail/25203/abb-expands-e-bus-charging-portfolio-with-automated-pantograph/',N,'fabricante','Aparece en resultados de búsqueda; el sitio no respondió cuando se comprobó el enlace'),
('en-brt-kempower','en',['brt'],[],'Kempower','Pantograph Up','https://kempower.com/solution/kempower-pantograph-up/',V,'fabricante','Hasta 500 kW de potencia de carga (página del fabricante, según resultado de búsqueda)'),
('en-brt-heliox','en',['brt'],[],'Heliox','Carga rápida para vehículos eléctricos','https://www.heliox-energy.com/',V,'fabricante',None),
('en-cable-doppelmayr','en',['cable'],[],'Doppelmayr','Direct Drive','https://newsroom.doppelmayr.com/de/doppelmayr/all/doppelmayr-direct-drive:-neue-animation/',N,'fabricante','Accionamiento sin reductor (según resultados de búsqueda; el sitio no respondió cuando se comprobó el enlace)'),
('en-cable-leitner','en',['cable'],[],'Leitner','Sistema de accionamiento','https://www.leitner.com/en/products/ropeway-components/detail/leitner-drive-system/',V,'fabricante',None),
('dg-metro-alstom','dg',['metro'],['tranvia'],'Alstom','HealthHub','https://www.alstom.com/solutions/services/digital-railway-solutions-unlock-higher-asset-availability-reliability-and-performance',V,'fabricante','Reduce hasta 30 % el tiempo fuera de servicio, según el fabricante (afirmación sin contrastar)'),
('dg-metro-hitachi','dg',['metro'],['tranvia'],'Hitachi Rail','HMAX','https://www.hitachirail.com/products-and-solutions/digital-asset-management/',V,'fabricante','Más de 2.000 trenes con HMAX según la página de producto; 2.500 según una página de 2026 (las dos cifras no coinciden)'),
('dg-metro-siemens','dg',['metro'],['tranvia'],'Siemens Mobility','Railigent X','https://press.siemens.com/global/en/pressrelease/siemens-mobility-presents-future-rail-innotrans-2022',P,'fabricante','El comunicado de InnoTrans 2022 nombra Railigent X; no es una página de producto'),
('dg-brt-init','dg',['brt'],[],'INIT','Ticketing y datos de pasajeros','https://www.initse.com/ende/home/',P,'fabricante','Se presenta como proveedor de planificación, despacho, telemática y ticketing para buses y tren'),
('dg-brt-masabi','dg',['brt'],[],'Masabi','Justride (pasajes móviles)','https://www.masabi.com/',V,'fabricante',None),
('dg-brt-clever','dg',['brt'],[],'Clever Devices (Hitachi)','Experiencia del pasajero y eficiencia operativa','https://www.cleverdevices.com/',P,'fabricante',None),
('dg-cable-doppelmayr','dg',['cable'],[],'Doppelmayr','Connect Cabin','https://mediencenter.doppelmayr.com/doppelmayr-connect-de/58165605',V,'fabricante',None),
('dg-cable-leitner','dg',['cable'],[],'Leitner','ConnX','https://www.leitner.com/en/products/ropeway-systems/connx/',V,'fabricante',None),
('dg-cable-poma','dg',['cable'],[],'POMA','Servicios digitales','https://www.poma.net/en/services/',V,'fabricante',None),
]
import pathlib, sys
RAIZ=pathlib.Path(__file__).resolve().parent.parent

def fichas_base():
  return [dict(id=i,categoria=c,modos=m,modos_supuestos=ms,proveedor=p,producto=pr,url=u,tipo_fuente=t,dato=d,v28=v)
          for i,c,m,ms,p,pr,u,v,t,d in F]

def confianza(tipo,abre):
  # Alta: la fuente no es el fabricante (prensa especializada o tercero independiente) y la página abrió.
  # Media: solo lo dice el fabricante. Baja: la página no se pudo abrir o todavía no se revisó.
  if not abre: return 'baja'
  return 'media' if tipo=='fabricante' else 'alta'

def fecha_txt(iso):
  return '%d de %s de %s'%(int(iso[8:]),MESES[int(iso[5:7])-1],iso[:4])

def armar(prueba=False):
  """prueba=True ignora la revisión diaria y usa el estado del 28 de octubre de 2026: es la copia fija de las pruebas."""
  est,nov={},{'revisado':None,'novedades':[]}
  if not prueba:
    try: est=json.loads((RAIZ/'datos'/'estado.json').read_text(encoding='utf-8'))
    except FileNotFoundError: est={}
    try: nov=json.loads((RAIZ/'datos'/'novedades.json').read_text(encoding='utf-8'))
    except FileNotFoundError: pass
  else:
    nov=json.loads((RAIZ/'tests'/'novedades_prueba.json').read_text(encoding='utf-8'))
  revisado=est.get('revisado') or C
  fichas=[]
  for b in fichas_base():
    e=(est.get('fichas') or {}).get(b['id']) or {'abre':b['v28']!=N,'nombra':b['v28']==V,'fecha_dato':None,'revisada':C}
    fichas.append(dict(id=b['id'],categoria=b['categoria'],modos=b['modos'],modos_supuestos=b['modos_supuestos'],proveedor=b['proveedor'],
      producto=b['producto'],url=b['url'],tipo_fuente=b['tipo_fuente'],dato=b['dato'],abre=bool(e['abre']),nombra=bool(e['nombra']),
      fecha_dato=e.get('fecha_dato'),consultada=e.get('revisada') or revisado,confianza=confianza(b['tipo_fuente'],e['abre']),madurez_trl_estimada=None))
  return dict(
 version='0.2',generado=C,revisado=revisado,nombre=NOMBRE,novedades=nov.get('novedades',[]),novedades_desde=nov.get('desde'),
 aviso='Los proveedores y los enlaces son reales. Se revisan solos una vez al día; la última revisión fue el %s. Los activos y el Plan de Tecnología son datos de ejemplo, no del Metro.'%fecha_txt(revisado),
 anio_ref=2026,
 modos=[dict(id='metro',nombre='Metro'),dict(id='tranvia',nombre='Tranvía'),dict(id='brt',nombre='Buses BRT'),dict(id='cable',nombre='Cable aéreo')],
 categorias=[dict(id='rs',nombre='Vehículos',desc='Trenes, tranvías, buses eléctricos y cabinas'),dict(id='sc',nombre='Señalización y control',desc='Control de trenes por comunicaciones (CBTC), gestión de flotas de buses y control de cables aéreos'),dict(id='en',nombre='Energía y tracción',desc='Subestaciones, almacenamiento de energía, carga de buses eléctricos y motores de los cables'),dict(id='dg',nombre='Tecnología digital',desc='Mantenimiento predictivo, venta de pasajes, datos y conectividad')],
 fichas=fichas,
 activos=[
  dict(id='A1',nombre='Flota de trenes de metro, lote antiguo',modo='metro',categoria='rs',instalado=1994,vida_util=40,cautivo=True,brecha=3),
  dict(id='A2',nombre='Sistema de señalización de línea de metro',modo='metro',categoria='sc',instalado=2005,vida_util=25,cautivo=True,brecha=2),
  dict(id='A3',nombre='Subestaciones de tracción de metro',modo='metro',categoria='en',instalado=2008,vida_util=35,cautivo=False,brecha=1),
  dict(id='A4',nombre='Plataforma de mantenimiento de trenes',modo='metro',categoria='dg',instalado=2015,vida_util=10,cautivo=True,brecha=3),
  dict(id='A5',nombre='Flota de tranvías',modo='tranvia',categoria='rs',instalado=2015,vida_util=30,cautivo=False,brecha=1),
  dict(id='A6',nombre='Alimentación del tranvía',modo='tranvia',categoria='en',instalado=2015,vida_util=30,cautivo=True,brecha=1),
  dict(id='A7',nombre='Buses del corredor BRT',modo='brt',categoria='rs',instalado=2012,vida_util=12,cautivo=False,brecha=3),
  dict(id='A8',nombre='Despacho y pasajes del BRT',modo='brt',categoria='dg',instalado=2012,vida_util=10,cautivo=True,brecha=4),
  dict(id='A9',nombre='Control de línea de cable',modo='cable',categoria='sc',instalado=2004,vida_util=20,cautivo=True,brecha=3),
  dict(id='A10',nombre='Accionamiento de línea de cable',modo='cable',categoria='en',instalado=2010,vida_util=25,cautivo=False,brecha=1),
 ],
 pt=[
  dict(id='PT-1',prioridad='Alta',titulo='Renovar la señalización de una línea de metro antes de que termine su vida útil',modo='metro',categoria='sc',umbral=60),
  dict(id='PT-2',prioridad='Alta',titulo='Modernizar la plataforma digital de mantenimiento de trenes',modo='metro',categoria='dg',umbral=55),
  dict(id='PT-3',prioridad='Media',titulo='Renovar la flota de trenes de metro',modo='metro',categoria='rs',umbral=70),
  dict(id='PT-4',prioridad='Media',titulo='Electrificar los buses BRT y hacerlos más eficientes',modo='brt',categoria='rs',umbral=70),
  dict(id='PT-5',prioridad='Media',titulo='Unificar la venta de pasajes y el despacho de los buses BRT',modo='brt',categoria='dg',umbral=55),
  dict(id='PT-6',prioridad='Baja',titulo='Revisar el control de las líneas de cable aéreo',modo='cable',categoria='sc',umbral=85),
 ],
 pesos=dict(edad=0.4,dependencia=0.3,brecha=0.3),
 )

def main():
  prueba='--prueba' in sys.argv
  data=armar(prueba)
  destino=RAIZ/('tests/data_prueba.js' if prueba else 'app/data.js')
  destino.write_text('window.RADAR_DATA = '+json.dumps(data,ensure_ascii=False,indent=1)+';\n',encoding='utf8')
  print(len(data['fichas']),'fichas ->',destino.relative_to(RAIZ))

if __name__=='__main__':
  main()
