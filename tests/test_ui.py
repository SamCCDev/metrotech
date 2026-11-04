"""Pruebas del prototipo en un navegador real.
Uso: python tests/test_ui.py [ruta-a-chromium]
Necesita: pip install playwright (y un Chromium; sin ruta usa el de Playwright)."""
import sys, pathlib, json
from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
APP = (RAIZ / 'app' / 'index.html').as_uri()
OK_JSON = RAIZ / 'tests' / 'fichas_ok.json'
MAL_JSON = RAIZ / 'tests' / 'fichas_mal.json'
resultados = []

def esperado_desde_data():
    # Las cifras del inicio calculadas en Python directo de data.js, sin pasar por el JS de la app.
    txt = (RAIZ / 'app' / 'data.js').read_text(encoding='utf-8')
    d = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
    celdas = 0
    for c in d['categorias']:
        for m in d['modos']:
            ok = {f['proveedor'] for f in d['fichas'] if f['categoria'] == c['id'] and m['id'] in f['modos'] and f['verificacion'] != 'no-verificada'}
            celdas += len(ok) >= 3
    return {'kpi-fichas': str(len(d['fichas'])), 'kpi-prov': str(len({f['proveedor'] for f in d['fichas']})),
            'kpi-celdas': f'{celdas} de 16', 'ini-ver-ok': str(sum(f['verificacion'] == 'verificada' for f in d['fichas'])),
            'activos': len(d['activos'])}

def cifras_inicio(pg):
    return {t: pg.inner_text(f'[data-testid={t}] b' if t.startswith('kpi') else f'[data-testid={t}]').strip()
            for t in ('kpi-fichas', 'kpi-prov', 'kpi-celdas', 'ini-ver-ok')}

def distintas(pg, esp):
    got = cifras_inicio(pg)
    return [k for k in got if got[k] != esp[k]]

def chk(nombre, cond, detalle=''):
    resultados.append((nombre, bool(cond), detalle))
    print(('OK  ' if cond else 'FALLA'), nombre, detalle)

def idx(pg, a):
    return float(pg.inner_text(f'[data-testid={a}-idx]'))

def resumen(pg):
    return pg.inner_text('[data-testid=resumen]')

with sync_playwright() as p:
    kw = {'args': ['--no-sandbox']}
    if len(sys.argv) > 1:
        kw['executable_path'] = sys.argv[1]
    b = p.chromium.launch(**kw)
    ctx = b.new_context(viewport={'width': 1366, 'height': 860}, accept_downloads=True)
    pg = ctx.new_page()
    errores = []
    pg.on('console', lambda m: errores.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errores.append(str(e)))
    pg.goto(APP)

    # 0. el detector de errores de consola debe poder detectar uno (control positivo)
    n0 = len(errores)
    pg.evaluate("console.error('error sembrado')")
    chk('detector de consola detecta un error sembrado', len(errores) == n0 + 1)
    errores.clear()

    # 0b. el inicio: abre primero y sus cifras salen de data.js
    esp = esperado_desde_data()
    chk('la app abre en el inicio', pg.locator('[data-testid=p0]').count() == 1)
    chk('cifras del inicio = data.js (41 fichas, 21 proveedores, 8 de 16, 32 verificadas)', not distintas(pg, esp), str(cifras_inicio(pg)))
    pg.evaluate("document.querySelector('[data-testid=kpi-fichas] b').textContent='40'")
    chk('el comparador detecta un número alterado (control positivo)', distintas(pg, esp) == ['kpi-fichas'])
    pg.click('[data-testid=tab-0]')
    chk('alertas del inicio = alertas del paso 5', pg.inner_text('[data-testid=kpi-alertas] b') == '3')
    barras = pg.locator('[data-testid^=ini-act-]')
    vals = [float(x.split()[0]) for x in barras.locator('.bv').all_inner_texts()]
    chk('una barra por activo, de mayor a menor', barras.count() == esp['activos'] and vals == sorted(vals, reverse=True), str(vals))
    chk('las seis preguntas', pg.locator('[data-testid^=ini-q-]').count() == 6)
    chk('8 brechas en el inicio', pg.locator('[data-testid=ini-brechas] li').count() == 8)
    pg.click('[data-testid=ini-celda-dg-tranvia]')
    chk('tocar una celda abre el paso 1 con esa celda', pg.locator('[data-testid=p1]').count() == 1
        and pg.get_attribute('[data-testid=celda-dg-tranvia]', 'aria-pressed') == 'true')
    pg.click('[data-testid=tab-0]'); pg.click('[data-testid=ini-paso-4]')
    chk('el botón del paso 4 abre el paso 4', pg.locator('[data-testid=p4]').count() == 1)
    pg.click('[data-testid=tab-4]'); pg.fill('[data-testid=A2-instalado]', '2024'); pg.dispatch_event('[data-testid=A2-instalado]', 'change')
    pg.click('[data-testid=tab-0]')
    chk('renovar un activo baja las alertas del inicio (3 -> 2)', pg.inner_text('[data-testid=kpi-alertas] b') == '2', pg.inner_text('[data-testid=kpi-alertas] b'))
    pg.click('[data-testid=tab-2]'); pg.click('[data-testid=reset]')

    # 1. cada pantalla carga sin errores y muestra su contenido
    for i, tid in enumerate(['p1', 'p2', 'p3', 'p4', 'p5'], 1):
        pg.click(f'[data-testid=tab-{i}]')
        chk(f'pantalla {i} muestra su contenido', pg.locator(f'[data-testid={tid}]').count() == 1)
    chk('sin errores de consola en las 5 pantallas', not errores, str(errores))

    # 2. paso 1: matriz 4x4, celdas completas conocidas
    pg.click('[data-testid=tab-1]')
    chk('matriz con 16 celdas', pg.locator('[data-testid^=celda-]').count() == 16)
    chk('resumen inicial: 8 celdas completas', 'Casillas completas: 8 de 16' in resumen(pg), resumen(pg))
    chk('celda sin proveedores confirmados aparece como 0/3', '0/3' in pg.inner_text('[data-testid=celda-dg-tranvia]'))

    # 3. paso 4: el puntaje cambia si cambia un dato (prueba negativa incluida)
    pg.click('[data-testid=tab-4]')
    base = idx(pg, 'A1')
    chk('A1 parte en 65.0', base == 65.0, str(base))
    pg.fill('[data-testid=A1-instalado]', '1994'); pg.dispatch_event('[data-testid=A1-instalado]', 'change')
    chk('mismo dato, mismo puntaje (control negativo)', idx(pg, 'A1') == base)
    pg.fill('[data-testid=A1-instalado]', '2020'); pg.dispatch_event('[data-testid=A1-instalado]', 'change')
    nuevo = idx(pg, 'A1')
    chk('un activo más nuevo baja el puntaje', nuevo < base, f'{base} -> {nuevo}')
    pg.fill('[data-testid=A1-instalado]', '1900'); pg.dispatch_event('[data-testid=A1-instalado]', 'change')
    chk('dato fuera de rango se rechaza y el puntaje no cambia', pg.input_value('[data-testid=A1-instalado]') == '2020' and idx(pg, 'A1') == nuevo)
    pg.fill('[data-testid=A1-instalado]', '1994'); pg.dispatch_event('[data-testid=A1-instalado]', 'change')
    pg.check('[data-testid=A5-cautivo]')
    chk('marcar proveedor cautivo sube el puntaje', idx(pg, 'A5') > 20.7, str(idx(pg, 'A5')))
    pg.uncheck('[data-testid=A5-cautivo]')
    chk('desmarcarlo lo devuelve a 20.7', idx(pg, 'A5') == 20.7, str(idx(pg, 'A5')))
    pg.fill('[data-testid=peso-edad]', '1'); pg.dispatch_event('[data-testid=peso-edad]', 'change')
    chk('cambiar el peso de la edad mueve el puntaje', idx(pg, 'A1') != 65.0, str(idx(pg, 'A1')))
    pg.click('[data-testid=tab-2]'); pg.click('[data-testid=reset]')
    pg.click('[data-testid=tab-4]')
    chk('restablecer devuelve 65.0', idx(pg, 'A1') == 65.0, str(idx(pg, 'A1')))

    # 4. alertas ligadas al Plan de Tecnología
    pg.click('[data-testid=tab-5]')
    chk('PT-1 alerta al inicio (A2 = 60.6 >= 60)', 'PT-1' in pg.inner_text('[data-testid=p5]'))
    chk('PT-3 no alerta al inicio (A1 = 65.0 < 70)', 'PT-3 (' not in pg.inner_text('[data-testid=p5]'))
    chk('hay 3 alertas del Plan de Tecnología al inicio', pg.locator('[data-testid=alerta-pt]').count() == 3, str(pg.locator('[data-testid=alerta-pt]').count()))
    pg.click('[data-testid=tab-4]'); pg.fill('[data-testid=A1-brecha]', '5'); pg.dispatch_event('[data-testid=A1-brecha]', 'change')
    pg.click('[data-testid=tab-5]')
    chk('subir la brecha de A1 dispara PT-3', 'PT-3 (' in pg.inner_text('[data-testid=p5]'))
    pg.click('[data-testid=tab-4]'); pg.fill('[data-testid=A1-brecha]', '3'); pg.dispatch_event('[data-testid=A1-brecha]', 'change')
    pg.click('[data-testid=tab-5]')
    pg.click('[data-testid=tab-4]')
    pg.fill('[data-testid=A2-instalado]', '2024'); pg.dispatch_event('[data-testid=A2-instalado]', 'change')
    pg.click('[data-testid=tab-5]')
    chk('PT-1 desaparece si el activo se renueva', 'PT-1 (' not in pg.inner_text('[data-testid=p5]'))
    chk('hay alertas de cobertura insuficiente', pg.locator('[data-testid=alerta-cob]').count() == 8,
        str(pg.locator('[data-testid=alerta-cob]').count()))

    # 5. paso 2: agregar e importar fuentes
    pg.click('[data-testid=tab-2]'); pg.click('[data-testid=reset]')
    pg.click('[data-testid=tab-1]'); antes = resumen(pg)
    pg.click('[data-testid=tab-2]')
    pg.click('[data-testid=f-add]')
    chk('ficha vacía se rechaza con mensaje', 'Faltan datos' in pg.inner_text('[data-testid=add-err]'))
    pg.select_option('#f-cat', 'rs'); pg.select_option('#f-modo', 'brt')
    pg.fill('#f-prov', 'Proveedor manual'); pg.fill('#f-prod', 'Producto manual'); pg.fill('#f-url', 'https://example.com/x')
    pg.click('[data-testid=f-add]')
    pg.click('[data-testid=tab-1]')
    chk('ficha manual entra, pero como no verificada no completa la celda', 'Fichas cargadas: 42' in resumen(pg) and 'Casillas completas: 8 de 16' in resumen(pg), resumen(pg))
    pg.click('[data-testid=tab-2]')
    pg.set_input_files('[data-testid=file-import]', str(MAL_JSON)); pg.wait_for_timeout(400)
    chk('JSON inválido se rechaza', 'rechazó' in pg.inner_text('[data-testid=import-err]'))
    pg.set_input_files('[data-testid=file-import]', str(OK_JSON))
    pg.wait_for_timeout(300); pg.click('[data-testid=tab-1]')
    chk('JSON válido suma una ficha más', 'Fichas cargadas: 43' in resumen(pg), resumen(pg))
    pg.click('[data-testid=tab-2]')
    pg.reload(); pg.click('[data-testid=tab-1]')
    chk('persistencia en el navegador (43 fichas tras recargar)', 'Fichas cargadas: 43' in resumen(pg), resumen(pg))
    pg.click('[data-testid=tab-2]'); pg.click('[data-testid=reset]')

    # 6. paso 3 y 5
    pg.click('[data-testid=tab-3]')
    pg.select_option('[data-testid=sel-cat]', 'sc'); pg.select_option('[data-testid=sel-modo]', 'brt')
    chk('comparar: celda sc/brt lista 3 fichas', pg.locator('[data-testid=tabla-fichas] tbody tr').count() == 3)
    pg.select_option('[data-testid=sel-cat]', 'dg'); pg.select_option('[data-testid=sel-modo]', 'tranvia')
    chk('comparar: celda dg/tranvia dice que aplica por supuesto', 'supuesto del analista' in pg.inner_text('[data-testid=tabla-fichas]'))
    pg.click('[data-testid=tab-5]'); pg.fill('[data-testid=b-dec]', 'Evaluar renovación de la señalización'); pg.click('[data-testid=b-add]')
    chk('bitácora registra una decisión', pg.locator('[data-testid=b-item]').count() == 1)
    with pg.expect_download() as d:
        pg.click('[data-testid=b-export]')
    chk('exportar descarga un JSON', d.value.suggested_filename.endswith('.json'))
    chk('sin errores de consola en todo el recorrido', not errores, str(errores))
    ctx.close()

    # 7. celular: sin desbordamiento horizontal de la página
    m = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    mp = m.new_page(); merr = []
    mp.on('console', lambda x: merr.append(x.text) if x.type == 'error' else None); mp.on('pageerror', lambda e: merr.append(str(e)))
    mp.goto(APP)
    for i in range(0, 6):
        mp.click(f'[data-testid=tab-{i}]')
        ancho = mp.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1')
        chk(f'celular: pantalla {i} sin desbordar la página', ancho)
    mp.click('[data-testid=tab-4]')
    alto = mp.evaluate('document.documentElement.scrollHeight')
    chk('celular: paso 4 en tarjetas, alto de página razonable', alto < 4500, f'{alto}px')
    chk('celular: sin tabla en el paso 4', mp.locator('[data-testid=p4] table').count() == 0)
    chk('celular: campos editables plegados al inicio', not mp.locator('[data-testid=A1-instalado]').is_visible())
    mp.click('[data-testid=A1-det] summary')
    mp.fill('[data-testid=A1-instalado]', '2020'); mp.dispatch_event('[data-testid=A1-instalado]', 'change')
    chk('celular: editar un dato cambia el índice (65.0 -> menor)', float(mp.inner_text('[data-testid=A1-idx]')) < 65.0)
    chk('celular: sin errores de consola', not merr, str(merr))
    b.close()

fallas = [r for r in resultados if not r[1]]
print(f'\n{len(resultados)-len(fallas)} de {len(resultados)} pruebas pasaron')
sys.exit(1 if fallas else 0)
