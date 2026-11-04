"""Revisión diaria de las fichas y de las novedades de cada proveedor. La corre el GitHub Action una vez por día
(.github/workflows/actualizar.yml) y también se puede correr a mano: python tools/actualizar.py

Qué revisa, ficha por ficha:
  - si el enlace abre (respuesta HTTP 200 a 399 con contenido);
  - si la página nombra el producto (busca las palabras clave de CLAVES, sin distinguir mayúsculas);
  - la fecha de publicación del dato, cuando la página la declara (metadatos de artículo, JSON-LD, <time>, la fecha de
    creación de un PDF o una fecha en la propia dirección). No usa la fecha de la consulta como fecha del dato.
Y por proveedor, las novedades de los últimos 30 días: el RSS del propio proveedor si su sitio lo anuncia, y si no,
la búsqueda de Google News en RSS. Las dos son fuentes abiertas y no piden clave.

Qué NO hace: no agrega ni quita fichas, no cambia los activos ni el Plan de Tecnología, y no comprueba que lo que dice
cada fuente sea cierto. Las novedades se muestran aparte; un analista decide si alguna merece una ficha nueva.

Escribe datos/estado.json, datos/novedades.json y un registro de la corrida en registro/AAAA-MM-DD.json. Después hay
que correr tools/gen_data.py para regenerar app/data.js."""
import datetime as dt, email.utils, gzip, html, io, json, pathlib, re, sys, time, urllib.parse, urllib.request
import logging
import xml.etree.ElementTree as ET
logging.getLogger('pypdf').setLevel(logging.ERROR)

RAIZ = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / 'tools'))
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 MetroTech-revision'
HOY = dt.date.today()

# Palabras que tiene que nombrar la página para que cuente como «nombra el producto».
CLAVES = {
 'rs-metro-alstom': ['Metropolis'], 'rs-metro-siemens': ['Inspiro'], 'rs-metro-hitachi': ['Baltimore'],
 'rs-tram-alstom': ['Citadis'], 'rs-tram-caf': ['Urbos'], 'rs-tram-stadler': ['Tramlink'], 'rs-tram-siemens': ['Avenio'],
 'rs-brt-volvo': ['BZRT'], 'rs-brt-byd': ['K12A', 'BYD'], 'rs-cable-doppelmayr': ['3S'], 'rs-cable-leitner': ['Diamond'],
 'rs-cable-poma': ['Sigma'], 'sc-metro-alstom': ['Urbalis', 'CBTC'], 'sc-metro-siemens': ['Trainguard', 'CBTC'],
 'sc-metro-hitachi': ['SelTrac', 'urban rail control'], 'sc-tram-alstom': ['tramway', 'LRV'], 'sc-tram-thales': ['tramway'],
 'sc-brt-trapeze': ['Intelligent Transportation'], 'sc-brt-init': ['ITCS', 'INIT'], 'sc-brt-clever': ['Clever Devices'],
 'sc-cable-doppelmayr': ['Connect'], 'sc-cable-leitner': ['control system'], 'en-metro-alstom': ['HESOP'],
 'en-metro-abb': ['substation'], 'en-metro-siemens': ['SITRAS'], 'en-tram-alstom': ['APS'], 'en-tram-siemens': ['SITRAS'],
 'en-brt-abb': ['Panto'], 'en-brt-kempower': ['Pantograph'], 'en-brt-heliox': ['charging', 'Heliox'],
 'en-cable-doppelmayr': ['Direct Drive'], 'en-cable-leitner': ['drive system'], 'dg-metro-alstom': ['HealthHub'],
 'dg-metro-hitachi': ['HMAX'], 'dg-metro-siemens': ['Railigent'], 'dg-brt-init': ['ticketing'], 'dg-brt-masabi': ['Justride'],
 'dg-brt-clever': ['passenger', 'Clever Devices'], 'dg-cable-doppelmayr': ['Connect'], 'dg-cable-leitner': ['ConnX'],
 'dg-cable-poma': ['service', 'POMA'],
}


def nombre_busqueda(proveedor):
    # «Hitachi Rail (SelTrac)» -> «Hitachi Rail»; «POMA / Sigma» -> «POMA»
    return re.split(r'\s*[(/]', proveedor)[0].strip()


# Palabras completas de transporte público; «metros» (la medida) no cuenta como «metro».
TRANSPORTE = re.compile(r"\b(metro|metrocable|subte|trenes|tren|tranv[ií]as?|telef[eé]ricos?|telecabinas?|cable a[eé]reo|"
                        r"autob[uú]s(es)?|buses|e-?bus(es)?|ferroviari[oa]s?|railway|rail|trains?|trams?|tramway|ropeways?|"
                        r"g[oó]ndolas?|se[ñn]alizaci[oó]n|signall?ing|transporte p[uú]blico|transit|brt|catenaria|locomotoras?)\b", re.I)
# Temas del mismo nombre que no son de este radar: autos, robótica, deportes.
AJENO = re.compile(r"\b(suv|berlina|sed[aá]n|coches?|todocamino|robotics|rob[oó]tica|atletismo|motociclista)\b", re.I)


class _Sigue308(urllib.request.HTTPRedirectHandler):
    # Python 3.10 no sigue el 308 (redirección permanente); el GitHub Action usa 3.12, que sí lo sigue.
    def http_error_308(self, req, fp, code, msg, headers):
        return self.http_error_302(req, fp, 302, msg, headers)


_abrir = urllib.request.build_opener(_Sigue308).open


def marca(nombre):
    # La palabra con que la prensa nombra al proveedor: «Siemens Mobility» -> «Siemens», «Clever Devices» queda igual.
    return nombre if nombre in ('Clever Devices',) else nombre.split()[0]


def pedir(url, limite=6_000_000, timeout=25, intentos=2):
    for i in range(intentos):
        try:
            return _pedir(url, limite, timeout)
        except urllib.error.HTTPError:
            raise
        except Exception:
            if i == intentos - 1:
                raise
            time.sleep(3)


def _pedir(url, limite, timeout):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': '*/*', 'Accept-Encoding': 'gzip',
                                               'Accept-Language': 'es,en;q=0.8'})
    with _abrir(req, timeout=timeout) as r:
        cuerpo = r.read(limite)
        if r.headers.get('Content-Encoding') == 'gzip':
            cuerpo = gzip.decompress(cuerpo)
        return r.status, (r.headers.get('Content-Type') or '').lower(), cuerpo, r.geturl()


def texto_pdf(cuerpo):
    try:
        from pypdf import PdfReader
    except ImportError:
        return '', None
    try:
        pdf = PdfReader(io.BytesIO(cuerpo))
        txt = ' '.join((p.extract_text() or '') for p in pdf.pages[:6])
        meta = pdf.metadata or {}
        f = meta.get('/CreationDate')
        m = re.match(r'D:(\d{4})(\d{2})(\d{2})', str(f or ''))
        return txt, (f'{m[1]}-{m[2]}-{m[3]}' if m else None)
    except Exception:
        return '', None


RE_FECHAS = [
    r'property=["\']article:published_time["\'][^>]*content=["\'](\d{4}-\d{2}-\d{2})',
    r'content=["\'](\d{4}-\d{2}-\d{2})[^"\']*["\'][^>]*property=["\']article:published_time',
    r'"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})',
    r'name=["\'](?:date|pubdate|publish_date|dc\.date)["\'][^>]*content=["\'](\d{4}-\d{2}-\d{2})',
    r'<time[^>]*datetime=["\'](\d{4}-\d{2}-\d{2})',
]


def fecha_publicacion(html_txt, url):
    """La fecha en que se publicó el dato, si la página la declara. None si no se encuentra."""
    for rx in RE_FECHAS:
        m = re.search(rx, html_txt, re.I)
        if m and valida(m.group(1)):
            return m.group(1)
    m = re.search(r'/(20\d{2})/(\d{1,2})/(\d{1,2})/', url) or re.search(r'/(20\d{2})(\d{2})(\d{2})_', url)
    if m:
        f = f'{m[1]}-{int(m[2]):02d}-{int(m[3]):02d}'
        if valida(f):
            return f
    m = re.search(r'/(20\d{2})/(\d{1,2})/', url)
    if m and valida(f'{m[1]}-{int(m[2]):02d}-01'):
        return f'{m[1]}-{int(m[2]):02d}'
    return None


def valida(f):
    try:
        d = dt.date.fromisoformat(f)
    except ValueError:
        return False
    return dt.date(1995, 1, 1) <= d <= HOY


def revisar_ficha(f):
    out = {'revisada': HOY.isoformat(), 'abre': False, 'nombra': False, 'http': None, 'fecha_dato': None, 'error': None}
    try:
        st, ct, cuerpo, final = pedir(f['url'])
        out['http'] = st
        out['abre'] = 200 <= st < 400 and len(cuerpo) > 200
        if 'pdf' in ct or f['url'].lower().endswith('.pdf'):
            txt, fecha = texto_pdf(cuerpo)
            out['fecha_dato'] = fecha or fecha_publicacion('', final)
        else:
            txt = cuerpo.decode('utf-8', 'replace')
            out['fecha_dato'] = fecha_publicacion(txt, final)
            txt = html.unescape(re.sub(r'<[^>]+>', ' ', txt))
        claves = CLAVES.get(f['id']) or [f['producto'].split()[0]]
        out['nombra'] = out['abre'] and any(k.lower() in txt.lower() for k in claves)
    except urllib.error.HTTPError as e:
        out['http'] = e.code
        out['error'] = f'HTTP {e.code}'
    except Exception as e:
        out['error'] = type(e).__name__ + ': ' + str(e)[:120]
    return out


def leer_rss(cuerpo):
    """Ítems de un RSS 2.0 o un Atom: (título, enlace, fecha ISO o None)."""
    items = []
    raiz = ET.fromstring(cuerpo)
    ns = {'a': 'http://www.w3.org/2005/Atom'}
    for it in raiz.iter('item'):
        fecha = None
        pub = it.findtext('pubDate') or it.findtext('{http://purl.org/dc/elements/1.1/}date')
        if pub:
            try:
                fecha = email.utils.parsedate_to_datetime(pub).date().isoformat()
            except Exception:
                fecha = pub[:10] if re.match(r'\d{4}-\d{2}-\d{2}', pub) else None
        items.append(((it.findtext('title') or '').strip(), (it.findtext('link') or '').strip(), fecha,
                      (it.findtext('source') or '').strip()))
    for it in raiz.iterfind('a:entry', ns):
        link = it.find('a:link', ns)
        items.append(((it.findtext('a:title', '', ns)).strip(), link.get('href') if link is not None else '',
                      (it.findtext('a:published', '', ns) or it.findtext('a:updated', '', ns))[:10] or None, ''))
    return items


def descubrir_rss(sitio):
    try:
        st, ct, cuerpo, final = pedir(sitio, limite=800_000, timeout=15)
    except Exception:
        return None
    txt = cuerpo.decode('utf-8', 'replace')
    for m in re.finditer(r'<link[^>]+>', txt, re.I):
        tag = m.group(0)
        if re.search(r'type=["\']application/(rss|atom)\+xml', tag, re.I):
            h = re.search(r'href=["\']([^"\']+)', tag)
            if h:
                return urllib.parse.urljoin(final, html.unescape(h.group(1)))
    return None


def novedades_de(proveedor, sitio, desde):
    nombre = nombre_busqueda(proveedor)
    origenes = []
    rss = descubrir_rss(sitio) if sitio else None
    if rss:
        origenes.append(('rss del proveedor', rss))
    m = marca(nombre)
    q = f'"{m}" (metro OR tranvía OR teleférico OR BRT OR tren OR railway OR tram OR ropeway)'
    origenes.append(('Google News', 'https://news.google.com/rss/search?' + urllib.parse.urlencode(
        {'q': q + ' when:30d', 'hl': 'es-419', 'gl': 'CO', 'ceid': 'CO:es-419'})))
    vistos, out, errores = set(), [], []
    for origen, url in origenes:
        try:
            _, _, cuerpo, _ = pedir(url, limite=3_000_000, timeout=20)
            for titulo, enlace, fecha, medio in leer_rss(cuerpo):
                if not titulo or not enlace or (fecha and fecha < desde):
                    continue
                # Solo cuenta si el título nombra al proveedor y habla de transporte: así se descartan homónimos
                # (una atleta llamada Poma) y otros negocios del mismo grupo (ABB Robotics).
                t = titulo.lower()
                if not re.search(r'\b' + re.escape(m.lower()) + r'\b', t) or not TRANSPORTE.search(t) or AJENO.search(t):
                    continue
                clave = titulo.lower()[:80]
                if clave in vistos:
                    continue
                vistos.add(clave)
                out.append({'proveedor': nombre, 'titulo': titulo[:220], 'enlace': enlace, 'fecha': fecha,
                            'medio': medio or origen, 'origen': origen})
        except Exception as e:
            errores.append(f'{origen}: {type(e).__name__}')
    out.sort(key=lambda x: x['fecha'] or '', reverse=True)
    return out[:5], [o for o, _ in origenes], errores


def main():
    import gen_data
    inicio = time.time()
    fichas = gen_data.fichas_base()
    estado, errores = {}, []
    for f in fichas:
        e = revisar_ficha(f)
        estado[f['id']] = e
        print(f"{f['id']:24} abre={e['abre']!s:5} nombra={e['nombra']!s:5} fecha={e['fecha_dato']} {e['error'] or ''}")
        time.sleep(0.4)
    desde = (HOY - dt.timedelta(days=30)).isoformat()
    sitios = {}
    for f in fichas:
        p = nombre_busqueda(f['proveedor'])
        u = urllib.parse.urlparse(f['url'])
        # El RSS propio se busca solo en el sitio del fabricante, no en el de un medio que habla de él.
        sitio = f'{u.scheme}://{u.netloc}/' if f['tipo_fuente'] == 'fabricante' else None
        if p not in sitios or (sitio and not sitios[p][1]):
            sitios[p] = (f['proveedor'], sitio)
    novedades, origenes = [], {}
    for p, (prov, sitio) in sorted(sitios.items()):
        items, usados, errs = novedades_de(prov, sitio, desde)
        novedades += items
        origenes[p] = usados
        errores += [f'{p}: {x}' for x in errs]
        print(f'{p:20} {len(items)} novedades  ({", ".join(usados)}) {"; ".join(errs)}')
        time.sleep(0.5)
    datos = RAIZ / 'datos'
    datos.mkdir(exist_ok=True)
    (datos / 'estado.json').write_text(json.dumps({'revisado': HOY.isoformat(), 'fichas': estado}, ensure_ascii=False, indent=1), encoding='utf-8')
    (datos / 'novedades.json').write_text(json.dumps({'revisado': HOY.isoformat(), 'desde': desde, 'origenes': origenes,
                                                      'novedades': novedades}, ensure_ascii=False, indent=1), encoding='utf-8')
    reg = RAIZ / 'registro'
    reg.mkdir(exist_ok=True)
    resumen = {
        'fecha': HOY.isoformat(), 'hora_utc': dt.datetime.now(dt.timezone.utc).strftime('%H:%M'),
        'segundos': round(time.time() - inicio), 'fichas': len(fichas),
        'abren': sum(e['abre'] for e in estado.values()), 'nombran_el_producto': sum(e['nombra'] for e in estado.values()),
        'con_fecha_del_dato': sum(bool(e['fecha_dato']) for e in estado.values()),
        'no_abren': sorted(k for k, e in estado.items() if not e['abre']),
        'proveedores': len(sitios), 'novedades': len(novedades),
        'proveedores_con_rss_propio': sorted(p for p, o in origenes.items() if 'rss del proveedor' in o),
        'errores_de_novedades': errores,
    }
    (reg / f'{HOY.isoformat()}.json').write_text(json.dumps(resumen, ensure_ascii=False, indent=1), encoding='utf-8')
    print(json.dumps({k: v for k, v in resumen.items() if k != 'errores_de_novedades'}, ensure_ascii=False))
    # Si casi nada abre, lo más probable es que la red de la corrida esté caída: no se pisan los datos buenos.
    if resumen['abren'] < len(fichas) // 2:
        print('FALLA: abrieron menos de la mitad de los enlaces; se descarta la corrida', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
