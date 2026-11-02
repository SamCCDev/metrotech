"""Capturas de la pantalla de inicio: 1920x1080 al 100 y al 90 %, 1080x1920 y 390, en claro y oscuro.
Uso: python tools/capturar_inicio.py [url]   (por defecto, app/index.html del disco)"""
import sys, pathlib
from playwright.sync_api import sync_playwright
RAIZ = pathlib.Path(__file__).resolve().parent.parent
URL = sys.argv[1] if len(sys.argv) > 1 else (RAIZ / 'app' / 'index.html').as_uri()
OUT = RAIZ / 'capturas' / 'inicio'; OUT.mkdir(parents=True, exist_ok=True)
TAM = {'pc1920': ((1920, 1080), 1, False), 'pc1920-90': ((2134, 1200), 0.9, False), 'vertical1080': ((1080, 1920), 1, False), 'celular390': ((390, 844), 2, True)}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--no-sandbox'])
    for tema in ('light', 'dark'):
        for k, (vp, dsf, movil) in TAM.items():
            c = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, device_scale_factor=dsf, is_mobile=movil, has_touch=movil, color_scheme=tema)
            pg = c.new_page(); pg.goto(URL); pg.wait_for_timeout(400)
            pg.screenshot(path=str(OUT / f'inicio-{k}-{"claro" if tema == "light" else "oscuro"}.png'))
            c.close()
    b.close()
print('capturas en', OUT)
