"""Pruebas sin red de la revisión diaria (tools/actualizar.py) y de la regla de confianza (tools/gen_data.py).
Uso: python tests/test_actualizar.py"""
import importlib.util, pathlib, sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / 'tools'))
spec = importlib.util.spec_from_file_location('actualizar', RAIZ / 'tools' / 'actualizar.py')
A = importlib.util.module_from_spec(spec); spec.loader.exec_module(A)
import gen_data as G

resultados = []
def chk(nombre, cond, detalle=''):
    resultados.append(bool(cond)); print(('OK  ' if cond else 'FALLA'), nombre, detalle)

# confianza: tres casos y el caso que no debe confundirse
chk('confianza: no abre -> baja, aunque sea prensa', G.confianza('prensa', False) == 'baja')
chk('confianza: fabricante que abre -> media', G.confianza('fabricante', True) == 'media')
chk('confianza: prensa especializada que abre -> alta', G.confianza('prensa', True) == 'alta')
chk('confianza: tercero independiente que abre -> alta', G.confianza('tercero', True) == 'alta')

# fecha del dato: la de publicación declarada, nunca la de hoy
html_art = '<meta property="article:published_time" content="2025-06-05T10:00:00Z">'
chk('fecha: metadato de artículo', A.fecha_publicacion(html_art, 'https://x.com/a') == '2025-06-05')
chk('fecha: JSON-LD datePublished', A.fecha_publicacion('{"datePublished": "2023-03-14"}', 'https://x.com/a') == '2023-03-14')
chk('fecha: tomada de la dirección', A.fecha_publicacion('', 'https://x.com/files/2019/12/10/nota.pdf') == '2019-12-10')
chk('fecha: sin fecha -> None, no la de hoy', A.fecha_publicacion('<p>sin fecha</p>', 'https://x.com/producto/') is None)
chk('fecha: una fecha futura no vale', A.fecha_publicacion('{"datePublished": "2099-01-01"}', 'https://x.com/a') is None)

# filtro de novedades: el nombre del proveedor y una palabra de transporte en el título
def pasa(titulo, marca):
    t = titulo.lower()
    import re
    return bool(re.search(r'\b' + re.escape(marca.lower()) + r'\b', t) and A.TRANSPORTE.search(t) and not A.AJENO.search(t))
chk('novedades: teleférico de Doppelmayr pasa', pasa('Doppelmayr construirá un teleférico urbano en Panamá', 'Doppelmayr'))
chk('novedades: una atleta llamada Poma no pasa', not pasa('Anita Poma gana los 1.500 metros', 'POMA'))
chk('novedades: un SUV de Volvo no pasa', not pasa('Volvo confirma el EX50: SUV de 4,7 metros', 'Volvo'))
chk('novedades: «metros» de largo no cuenta como metro', not pasa('BYD lanza una berlina de 5 metros', 'BYD'))
chk('novedades: INIT no coincide dentro de «initiative»', not pasa('New rail initiative announced', 'INIT'))
chk('marca: Siemens Mobility se busca como Siemens', A.marca('Siemens Mobility') == 'Siemens')

# lectura de RSS y Atom
rss = b'<rss><channel><item><title>T1</title><link>https://a/1</link><pubDate>Tue, 03 Nov 2026 10:00:00 GMT</pubDate></item></channel></rss>'
chk('rss: título, enlace y fecha', A.leer_rss(rss) == [('T1', 'https://a/1', '2026-11-03', '')])
atom = b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>T2</title><link href="https://a/2"/><published>2026-10-01T00:00:00Z</published></entry></feed>'
chk('atom: título, enlace y fecha', A.leer_rss(atom) == [('T2', 'https://a/2', '2026-10-01', '')])

# todas las fichas tienen palabras clave propias
faltan = [f['id'] for f in G.fichas_base() if f['id'] not in A.CLAVES]
chk('cada ficha tiene sus palabras clave', not faltan, str(faltan))

print(f'\n{sum(resultados)} de {len(resultados)} pruebas pasaron')
sys.exit(0 if all(resultados) else 1)
