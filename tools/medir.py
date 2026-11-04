"""Contraste (4,5:1 o más) y desbordes horizontales en las 6 pantallas (inicio y los 5 pasos), en 1920x1080 al 100 y
al 90 %, 1366x768, 1080x1920 y 390, en claro y oscuro. Antes de medir, un control negativo: la misma medición sobre la página con
dos defectos fabricados (un bloque de 600 px y un texto gris claro sobre blanco) tiene que encontrar los dos; si no, la
medición no sirve y sale 1. Uso: python tools/medir.py [url]"""
import sys, json, pathlib
from playwright.sync_api import sync_playwright
RAIZ = pathlib.Path(__file__).resolve().parent.parent
URL = sys.argv[1] if len(sys.argv) > 1 else (RAIZ / 'app' / 'index.html').as_uri()
TAM = {'pc1920': ((1920, 1080), 1, False), 'pc1366': ((1366, 768), 1, False), 'pc1920-90': ((2134, 1200), 0.9, False), 'vertical1080': ((1080, 1920), 1, False), 'celular390': ((390, 844), 2, True)}
MEDIR = r"""() => {
  const W = document.documentElement.clientWidth, malos = {desborde: [], contraste: []};
  const cx = document.createElement('canvas').getContext('2d', {willReadFrequently: true});
  const rgb = c => { cx.clearRect(0,0,1,1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0,0,1,1); const d = cx.getImageData(0,0,1,1).data; return [d[0], d[1], d[2], d[3]/255]; };
  const lum = ([r,g,b]) => { const f = v => { v /= 255; return v <= .03928 ? v/12.92 : Math.pow((v+.055)/1.055, 2.4); }; return .2126*f(r) + .7152*f(g) + .0722*f(b); };
  const fondo = el => { while (el) { const c = rgb(getComputedStyle(el).backgroundColor); if (c[3] > .5) return c; el = el.parentElement; } return rgb(getComputedStyle(document.body).backgroundColor); };
  const nombre = el => (el.dataset.testid ? '[' + el.dataset.testid + '] ' : '') + el.tagName + ' «' + (el.innerText || el.value || '').trim().slice(0, 40) + '»';
  if (document.documentElement.scrollWidth > W + 1) malos.desborde.push('página: ' + document.documentElement.scrollWidth + ' px de ' + W);
  document.querySelectorAll('body *').forEach(el => { const r = el.getBoundingClientRect();
    if (r.width && r.right > W + 1 && !el.closest('.scroll, .tabs')) malos.desborde.push(nombre(el) + ' termina en ' + Math.round(r.right)); });
  let textos = 0;
  document.querySelectorAll('body *').forEach(el => {
    const propio = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!propio || el.closest('script,style') || !el.getClientRects().length) return;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) return; textos++;
    const a = lum(rgb(cs.color)), b = lum(fondo(el)), k = (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    if (k < 4.5) malos.contraste.push(nombre(el) + ' ' + k.toFixed(2));
  });
  return {malos, textos};
}"""
DEFECTOS = """() => document.querySelector('main').insertAdjacentHTML('afterbegin',
  '<div data-testid="def-ancho" style="width:600px;height:4px">x</div><p data-testid="def-gris" style="color:#cfcfcf;background:#fff">gris</p>')"""
fallas, informe = [], {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--no-sandbox'])
    c = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = c.new_page(); pg.goto(URL); pg.wait_for_timeout(300); pg.evaluate(DEFECTOS); n = pg.evaluate(MEDIR)['malos']
    neg = {'desborde': any('def-ancho' in x for x in n['desborde']), 'contraste': any('def-gris' in x for x in n['contraste'])}
    informe['control_negativo'] = neg; c.close()
    if not all(neg.values()): fallas.append(f'el control negativo no detectó {[k for k, v in neg.items() if not v]}')
    for tema in ('light', 'dark'):
        for k, (vp, dsf, movil) in TAM.items():
            c = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=dsf, is_mobile=movil, has_touch=movil, color_scheme=tema)
            pg = c.new_page(); pg.goto(URL); pg.wait_for_timeout(300)
            for t in range(6):
                pg.click(f'[data-testid=tab-{t}]'); pg.wait_for_timeout(150)
                r = pg.evaluate(MEDIR); clave = f'{tema} {k} pantalla {t}'
                informe[clave] = {'textos': r['textos'], 'desborde': len(r['malos']['desborde']), 'contraste': len(r['malos']['contraste'])}
                for x in (r['malos']['desborde'] + r['malos']['contraste'])[:6]: fallas.append(f'{clave}: {x}')
            c.close()
    b.close()
tot = sum(v['textos'] for kk, v in informe.items() if kk != 'control_negativo')
print(f'evaluados {tot} textos en {len(informe) - 1} combinaciones; control negativo {informe["control_negativo"]}')
print('FALLAS:' if fallas else 'OK: 0 fallas de contraste ni desborde', *fallas[:300], sep='\n  ')
sys.exit(1 if fallas else 0)
