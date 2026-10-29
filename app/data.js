window.RADAR_DATA = {
 "version": "0.1",
 "generado": "2026-10-28",
 "aviso": "Los proveedores y enlaces son reales y se consultaron el 2026-10-28. Los activos y el Plan de Tecnología son DATOS DE EJEMPLO, no del Metro.",
 "anio_ref": 2026,
 "modos": [
  {
   "id": "metro",
   "nombre": "Metro"
  },
  {
   "id": "tranvia",
   "nombre": "Tranvía"
  },
  {
   "id": "brt",
   "nombre": "BRT"
  },
  {
   "id": "cable",
   "nombre": "Cable"
  }
 ],
 "categorias": [
  {
   "id": "rs",
   "nombre": "Material rodante / vehículos",
   "desc": "Trenes, tranvías, buses eléctricos y cabinas"
  },
  {
   "id": "sc",
   "nombre": "Señalización y control",
   "desc": "Control de trenes (CBTC), gestión de flota, control de teleféricos"
  },
  {
   "id": "en",
   "nombre": "Energía y tracción",
   "desc": "Subestaciones, almacenamiento, carga de buses, accionamientos"
  },
  {
   "id": "dg",
   "nombre": "Tecnología digital",
   "desc": "Mantenimiento predictivo, pasajes, datos, conectividad"
  }
 ],
 "fichas": [
  {
   "id": "rs-metro-alstom",
   "categoria": "rs",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [],
   "proveedor": "Alstom",
   "producto": "Metropolis",
   "url": "https://www.alstom.com/solutions/rolling-stock/metropolis-metros-keeping-your-city-breathing",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": "Más de 35.000 coches Metropolis en el mundo, 6.000 sin conductor (página del fabricante)",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "rs-metro-siemens",
   "categoria": "rs",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [],
   "proveedor": "Siemens Mobility",
   "producto": "Inspiro",
   "url": "https://press.siemens.com/global/en/pressrelease/start-siemens-mobilitys-inspiro-trains-and-automatic-train-control-systems-metro-sofia",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": "Trenes Inspiro en servicio en la Línea 3 del Metro de Sofía (comunicado del fabricante)",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "rs-metro-hitachi",
   "categoria": "rs",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [],
   "proveedor": "Hitachi Rail",
   "producto": "Trenes de metro (proyecto Baltimore)",
   "url": "https://www.hitachirail.com/products-and-solutions/rolling-stock/metro-trains/baltimore-metro/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "rs-tram-alstom",
   "categoria": "rs",
   "modos": [
    "tranvia"
   ],
   "modos_supuestos": [],
   "proveedor": "Alstom",
   "producto": "Citadis",
   "url": "https://www.alstom.com/sites/alstom.com/files/2019/12/10/20191210_PR_Tramway_Angers_EN.pdf",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "rs-tram-caf",
   "categoria": "rs",
   "modos": [
    "tranvia"
   ],
   "modos_supuestos": [],
   "proveedor": "CAF",
   "producto": "Urbos",
   "url": "https://www.caf.net/en/soluciones/familia/urbos/index.php",
   "verificacion": "no-verificada",
   "tipo_fuente": "fabricante",
   "dato": "100 % piso bajo, 750 V CC, de 18 a 43 m (datos técnicos del fabricante, según resultado de búsqueda; el sitio bloqueó la consulta automática)",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "rs-tram-stadler",
   "categoria": "rs",
   "modos": [
    "tranvia"
   ],
   "modos_supuestos": [],
   "proveedor": "Stadler",
   "producto": "Tramlink",
   "url": "https://stadlerrail.com/api/docs/x/f6df7f1948/tramlink_blt_en.pdf",
   "verificacion": "parcial",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "rs-tram-siemens",
   "categoria": "rs",
   "modos": [
    "tranvia"
   ],
   "modos_supuestos": [],
   "proveedor": "Siemens Mobility",
   "producto": "Avenio",
   "url": "https://assets.new.siemens.com/siemens/assets/api/uuid:d08bfc2a-0f91-46e7-9b37-abafb2b6438b/product-specification-avenio-e.pdf",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "rs-brt-volvo",
   "categoria": "rs",
   "modos": [
    "brt"
   ],
   "modos_supuestos": [],
   "proveedor": "Volvo Buses",
   "producto": "BZRT Electric (articulado y biarticulado)",
   "url": "https://www.volvobuses.com/en/city-and-intercity/chassis/volvo-bzrt-electric.html",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": "Biarticulado de unos 28 m y hasta 250 pasajeros (comunicado de Volvo, mayo de 2025)",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "rs-brt-byd",
   "categoria": "rs",
   "modos": [
    "brt"
   ],
   "modos_supuestos": [],
   "proveedor": "BYD",
   "producto": "K12A biarticulado eléctrico",
   "url": "https://www.sustainable-bus.com/news/a-27-electric-meter-bus-for-brt-systems-byd-launches-the-world-longest-ebus",
   "verificacion": "verificada",
   "tipo_fuente": "prensa",
   "dato": "27 m, 250 pasajeros, cerca de 300 km de autonomía (nota de prensa especializada)",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "rs-cable-doppelmayr",
   "categoria": "rs",
   "modos": [
    "cable"
   ],
   "modos_supuestos": [],
   "proveedor": "Doppelmayr (CWA)",
   "producto": "Cabina 3S",
   "url": "https://www.doppelmayr.com/en/cwa-cabins/3s-cabins/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "rs-cable-leitner",
   "categoria": "rs",
   "modos": [
    "cable"
   ],
   "modos_supuestos": [],
   "proveedor": "Leitner",
   "producto": "Cabina Diamond",
   "url": "https://leitner.com/fileadmin/user_upload/pages/Diamond_cabin.pdf",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "rs-cable-poma",
   "categoria": "rs",
   "modos": [
    "cable"
   ],
   "modos_supuestos": [],
   "proveedor": "POMA / Sigma",
   "producto": "Cabinas Sigma",
   "url": "https://www.poma.net/en/subsidiaries/sigma/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "sc-metro-alstom",
   "categoria": "sc",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [],
   "proveedor": "Alstom",
   "producto": "Urbalis (CBTC)",
   "url": "https://www.alstom.com/solutions/signalling/urban-signalling/communications-based-train-control-world-leading-high-capacity-signalling",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "sc-metro-siemens",
   "categoria": "sc",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [],
   "proveedor": "Siemens Mobility",
   "producto": "Trainguard MT (CBTC)",
   "url": "https://www.mobility.siemens.com/us/en/portfolio/rail-infrastructure/communications-based-train-control-system.html",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "sc-metro-hitachi",
   "categoria": "sc",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [],
   "proveedor": "Hitachi Rail (SelTrac)",
   "producto": "Control y supervisión de tren urbano",
   "url": "https://www.hitachirail.com/products-and-solutions/urban-rail-control-supervision/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": "Hitachi Rail completó en mayo de 2024 la compra del negocio de Thales de sistemas de transporte terrestre, de donde viene SelTrac (según resultados de búsqueda)",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "sc-tram-alstom",
   "categoria": "sc",
   "modos": [
    "tranvia"
   ],
   "modos_supuestos": [],
   "proveedor": "Alstom",
   "producto": "Señalización de tranvía y LRV",
   "url": "https://www.alstom.com/tramway-lrv-signalling-advanced-assistance-operations-and-safety",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "sc-tram-thales",
   "categoria": "sc",
   "modos": [
    "tranvia"
   ],
   "modos_supuestos": [],
   "proveedor": "Thales",
   "producto": "Señalización de tranvía y LRT",
   "url": "https://www.thalesgroup.com/en/tramway-lrt-signalling-solution",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": "Posible solapamiento con Hitachi Rail por la venta del negocio; verificar la titularidad actual",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "sc-brt-trapeze",
   "categoria": "sc",
   "modos": [
    "brt"
   ],
   "modos_supuestos": [],
   "proveedor": "Trapeze",
   "producto": "Sistemas de transporte inteligentes para buses",
   "url": "https://trapezegroup.com/intelligent-transportation-systems/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "sc-brt-init",
   "categoria": "sc",
   "modos": [
    "brt"
   ],
   "modos_supuestos": [],
   "proveedor": "INIT",
   "producto": "ITCS / información en tiempo real",
   "url": "https://www.initse.com/ende/home/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "sc-brt-clever",
   "categoria": "sc",
   "modos": [
    "brt"
   ],
   "modos_supuestos": [],
   "proveedor": "Clever Devices (Hitachi)",
   "producto": "Gestión de flotas",
   "url": "https://www.cleverdevices.com/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "sc-cable-doppelmayr",
   "categoria": "sc",
   "modos": [
    "cable"
   ],
   "modos_supuestos": [],
   "proveedor": "Doppelmayr",
   "producto": "Doppelmayr Connect (control)",
   "url": "https://mediencenter.doppelmayr.com/doppelmayr-connect-de/58165605",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "sc-cable-leitner",
   "categoria": "sc",
   "modos": [
    "cable"
   ],
   "modos_supuestos": [],
   "proveedor": "Leitner",
   "producto": "Sistema de control Leitner",
   "url": "https://www.leitner.com/en/products/ropeway-components/detail/leitner-control-system/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "en-metro-alstom",
   "categoria": "en",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [],
   "proveedor": "Alstom",
   "producto": "HESOP (subestación reversible)",
   "url": "https://www.alstom.com/press-releases-news/2025/6/capturing-wasted-energy-our-cities",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "en-metro-abb",
   "categoria": "en",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [],
   "proveedor": "ABB",
   "producto": "Subestaciones de tracción ferroviaria",
   "url": "https://new.abb.com/news/detail/13146/abb-substations-to-strengthen-railway-infrastructure-in-switzerland",
   "verificacion": "no-verificada",
   "tipo_fuente": "fabricante",
   "dato": "Aparece en resultados de búsqueda; el sitio no respondió a la consulta automática",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "en-metro-siemens",
   "categoria": "en",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [],
   "proveedor": "Siemens Mobility",
   "producto": "SITRAS (alimentación de tracción)",
   "url": "https://press.siemens.com/global/en/pressrelease/start-siemens-mobilitys-inspiro-trains-and-automatic-train-control-systems-metro-sofia",
   "verificacion": "parcial",
   "tipo_fuente": "fabricante",
   "dato": "El comunicado menciona el sistema SITRAS RSC en el Metro de Sofía; no es una página de producto",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "en-tram-alstom",
   "categoria": "en",
   "modos": [
    "tranvia"
   ],
   "modos_supuestos": [],
   "proveedor": "Alstom",
   "producto": "APS (alimentación por el suelo)",
   "url": "https://www.alstom.com/sites/alstom.com/files/2019/12/16/20191214_PR_Sydney_tramway_inauguration_ES.pdf",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "en-tram-siemens",
   "categoria": "en",
   "modos": [
    "tranvia"
   ],
   "modos_supuestos": [],
   "proveedor": "Siemens Mobility",
   "producto": "SITRAS HES (almacenamiento de energía)",
   "url": "https://assets.new.siemens.com/siemens/assets/api/uuid:b21e946a-c640-4ae7-adb6-cff8125f0adf/siemens-mobility-qatar-education-city-light-rail-project.pdf",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "en-brt-abb",
   "categoria": "en",
   "modos": [
    "brt"
   ],
   "modos_supuestos": [],
   "proveedor": "ABB",
   "producto": "Panto Up (carga con pantógrafo)",
   "url": "https://new.abb.com/news/detail/25203/abb-expands-e-bus-charging-portfolio-with-automated-pantograph/",
   "verificacion": "no-verificada",
   "tipo_fuente": "fabricante",
   "dato": "Aparece en resultados de búsqueda; el sitio no respondió a la consulta automática",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "en-brt-kempower",
   "categoria": "en",
   "modos": [
    "brt"
   ],
   "modos_supuestos": [],
   "proveedor": "Kempower",
   "producto": "Pantograph Up",
   "url": "https://kempower.com/solution/kempower-pantograph-up/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": "Hasta 500 kW de potencia de carga (página del fabricante, según resultado de búsqueda)",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "en-brt-heliox",
   "categoria": "en",
   "modos": [
    "brt"
   ],
   "modos_supuestos": [],
   "proveedor": "Heliox",
   "producto": "Carga rápida para vehículos eléctricos",
   "url": "https://www.heliox-energy.com/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "en-cable-doppelmayr",
   "categoria": "en",
   "modos": [
    "cable"
   ],
   "modos_supuestos": [],
   "proveedor": "Doppelmayr",
   "producto": "Direct Drive",
   "url": "https://newsroom.doppelmayr.com/de/doppelmayr/all/doppelmayr-direct-drive:-neue-animation/",
   "verificacion": "no-verificada",
   "tipo_fuente": "fabricante",
   "dato": "Accionamiento sin reductor (según resultados de búsqueda; el sitio no respondió a la consulta automática)",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "en-cable-leitner",
   "categoria": "en",
   "modos": [
    "cable"
   ],
   "modos_supuestos": [],
   "proveedor": "Leitner",
   "producto": "Sistema de accionamiento",
   "url": "https://www.leitner.com/en/products/ropeway-components/detail/leitner-drive-system/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "dg-metro-alstom",
   "categoria": "dg",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [
    "tranvia"
   ],
   "proveedor": "Alstom",
   "producto": "HealthHub",
   "url": "https://www.alstom.com/solutions/services/digital-railway-solutions-unlock-higher-asset-availability-reliability-and-performance",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": "Reduce hasta 30 % el tiempo fuera de servicio, según el fabricante (afirmación sin contrastar)",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "dg-metro-hitachi",
   "categoria": "dg",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [
    "tranvia"
   ],
   "proveedor": "Hitachi Rail",
   "producto": "HMAX",
   "url": "https://www.hitachirail.com/products-and-solutions/digital-asset-management/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": "Más de 2.000 trenes con HMAX según la página de producto; 2.500 según una página de 2026 (las dos cifras no coinciden)",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "dg-metro-siemens",
   "categoria": "dg",
   "modos": [
    "metro"
   ],
   "modos_supuestos": [
    "tranvia"
   ],
   "proveedor": "Siemens Mobility",
   "producto": "Railigent X",
   "url": "https://press.siemens.com/global/en/pressrelease/siemens-mobility-presents-future-rail-innotrans-2022",
   "verificacion": "parcial",
   "tipo_fuente": "fabricante",
   "dato": "El comunicado de InnoTrans 2022 nombra Railigent X; no es una página de producto",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "dg-brt-init",
   "categoria": "dg",
   "modos": [
    "brt"
   ],
   "modos_supuestos": [],
   "proveedor": "INIT",
   "producto": "Ticketing y datos de pasajeros",
   "url": "https://www.initse.com/ende/home/",
   "verificacion": "parcial",
   "tipo_fuente": "fabricante",
   "dato": "Se presenta como proveedor de planificación, despacho, telemática y ticketing para buses y tren",
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "dg-brt-masabi",
   "categoria": "dg",
   "modos": [
    "brt"
   ],
   "modos_supuestos": [],
   "proveedor": "Masabi",
   "producto": "Justride (pasajes móviles)",
   "url": "https://www.masabi.com/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "dg-brt-clever",
   "categoria": "dg",
   "modos": [
    "brt"
   ],
   "modos_supuestos": [],
   "proveedor": "Clever Devices (Hitachi)",
   "producto": "Experiencia del pasajero y eficiencia operativa",
   "url": "https://www.cleverdevices.com/",
   "verificacion": "parcial",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "dg-cable-doppelmayr",
   "categoria": "dg",
   "modos": [
    "cable"
   ],
   "modos_supuestos": [],
   "proveedor": "Doppelmayr",
   "producto": "Connect Cabin",
   "url": "https://mediencenter.doppelmayr.com/doppelmayr-connect-de/58165605",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "dg-cable-leitner",
   "categoria": "dg",
   "modos": [
    "cable"
   ],
   "modos_supuestos": [],
   "proveedor": "Leitner",
   "producto": "ConnX",
   "url": "https://www.leitner.com/en/products/ropeway-systems/connx/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  },
  {
   "id": "dg-cable-poma",
   "categoria": "dg",
   "modos": [
    "cable"
   ],
   "modos_supuestos": [],
   "proveedor": "POMA",
   "producto": "Servicios digitales",
   "url": "https://www.poma.net/en/services/",
   "verificacion": "verificada",
   "tipo_fuente": "fabricante",
   "dato": null,
   "consultada": "2026-10-28",
   "madurez_trl_estimada": null
  }
 ],
 "activos": [
  {
   "id": "A1",
   "nombre": "Flota de trenes de metro, lote antiguo",
   "modo": "metro",
   "categoria": "rs",
   "instalado": 1994,
   "vida_util": 40,
   "cautivo": true,
   "brecha": 3
  },
  {
   "id": "A2",
   "nombre": "Sistema de señalización de línea de metro",
   "modo": "metro",
   "categoria": "sc",
   "instalado": 2005,
   "vida_util": 25,
   "cautivo": true,
   "brecha": 2
  },
  {
   "id": "A3",
   "nombre": "Subestaciones de tracción de metro",
   "modo": "metro",
   "categoria": "en",
   "instalado": 2008,
   "vida_util": 35,
   "cautivo": false,
   "brecha": 1
  },
  {
   "id": "A4",
   "nombre": "Plataforma de mantenimiento de trenes",
   "modo": "metro",
   "categoria": "dg",
   "instalado": 2015,
   "vida_util": 10,
   "cautivo": true,
   "brecha": 3
  },
  {
   "id": "A5",
   "nombre": "Flota de tranvías",
   "modo": "tranvia",
   "categoria": "rs",
   "instalado": 2015,
   "vida_util": 30,
   "cautivo": false,
   "brecha": 1
  },
  {
   "id": "A6",
   "nombre": "Alimentación del tranvía",
   "modo": "tranvia",
   "categoria": "en",
   "instalado": 2015,
   "vida_util": 30,
   "cautivo": true,
   "brecha": 1
  },
  {
   "id": "A7",
   "nombre": "Buses del corredor BRT",
   "modo": "brt",
   "categoria": "rs",
   "instalado": 2012,
   "vida_util": 12,
   "cautivo": false,
   "brecha": 3
  },
  {
   "id": "A8",
   "nombre": "Despacho y pasajes del BRT",
   "modo": "brt",
   "categoria": "dg",
   "instalado": 2012,
   "vida_util": 10,
   "cautivo": true,
   "brecha": 4
  },
  {
   "id": "A9",
   "nombre": "Control de línea de cable",
   "modo": "cable",
   "categoria": "sc",
   "instalado": 2004,
   "vida_util": 20,
   "cautivo": true,
   "brecha": 3
  },
  {
   "id": "A10",
   "nombre": "Accionamiento de línea de cable",
   "modo": "cable",
   "categoria": "en",
   "instalado": 2010,
   "vida_util": 25,
   "cautivo": false,
   "brecha": 1
  }
 ],
 "pt": [
  {
   "id": "PT-1",
   "prioridad": "Alta",
   "titulo": "Renovar señalización de línea de metro antes del fin de vida",
   "modo": "metro",
   "categoria": "sc",
   "umbral": 60
  },
  {
   "id": "PT-2",
   "prioridad": "Alta",
   "titulo": "Modernizar plataforma digital de mantenimiento",
   "modo": "metro",
   "categoria": "dg",
   "umbral": 55
  },
  {
   "id": "PT-3",
   "prioridad": "Media",
   "titulo": "Plan de renovación de la flota de metro",
   "modo": "metro",
   "categoria": "rs",
   "umbral": 70
  },
  {
   "id": "PT-4",
   "prioridad": "Media",
   "titulo": "Electrificación y eficiencia del BRT",
   "modo": "brt",
   "categoria": "rs",
   "umbral": 70
  },
  {
   "id": "PT-5",
   "prioridad": "Media",
   "titulo": "Sistema de pasajes y despacho unificado",
   "modo": "brt",
   "categoria": "dg",
   "umbral": 55
  },
  {
   "id": "PT-6",
   "prioridad": "Baja",
   "titulo": "Control de líneas de cable",
   "modo": "cable",
   "categoria": "sc",
   "umbral": 85
  }
 ],
 "pesos": {
  "edad": 0.4,
  "dependencia": 0.3,
  "brecha": 0.3
 }
};
