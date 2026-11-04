# MetroTech: prototipo

Prototipo funcional de la propuesta para el Reto 5 del programa de innovación abierta del Metro de Medellín, «Radar Tecnológico: El futuro de la movilidad». Es una página web estática que reproduce los cinco pasos del método: definir qué se revisa, cargar fichas, comparar proveedores, puntuar el riesgo de obsolescencia y decidir con alertas ligadas a un Plan de Tecnología.

## Cómo abrirlo

Está publicado en GitHub Pages: https://samccdev.github.io/metrotech/ . También se puede abrir `index.html` (o `app/index.html`) con doble clic. Funciona en cualquier navegador actual, sin instalar nada y sin conexión una vez abierto. El código está en `app/app.js` y los datos en `app/data.js`.

Lo que se cambie en pantalla (los datos de un activo, los pesos, las fichas nuevas o las decisiones) se guarda solo en el navegador de quien lo usa. El botón «Volver a los datos de ejemplo», en el paso 2, devuelve todo al estado inicial.

## Las palabras que usa

Una ficha es el registro de un producto: quién lo vende, cómo se llama, a qué categoría y modo de transporte sirve, y el enlace a su fuente, que es la página pública que lo respalda. El cuadro del paso 1 cruza 4 categorías de tecnología (vehículos, señalización y control, energía y tracción, y tecnología digital) con 4 modos de transporte (metro, tranvía, buses BRT y cable aéreo). Cada cruce es una casilla, y una casilla está completa cuando tiene al menos 3 proveedores con una fuente que cuenta, que es el mínimo que pide el reto.

Un activo es un sistema que el Metro tiene instalado, como una flota de trenes o la señalización de una línea. Su índice de obsolescencia va de 0 a 100 y combina cuánto de su vida útil ya pasó, cuánto depende de un solo proveedor y su brecha tecnológica, que es qué tan atrás está frente al mercado, de 0 a 5. El semáforo pinta el índice: verde es riesgo bajo (menos de 35), amarillo es medio y rojo es alto (65 o más). El Plan de Tecnología es la lista de prioridades de renovación del Metro; cada prioridad fija un umbral, y cuando el índice de un activo llega a ese umbral aparece una alerta.

## Qué hace cada pantalla

El inicio muestra las cifras principales, el cuadro de casillas, el índice de cada activo, qué tan confiable es cada fuente, las casillas incompletas, las novedades de los proveedores y la propuesta en seis respuestas. Todas las cifras se calculan con los datos cargados.

El paso 1 muestra el cuadro de 4 por 4 y cuántos proveedores tiene cada casilla. El paso 2 lista las fichas con su clasificación y permite sumar fichas desde un archivo JSON o agregarlas a mano; las fichas nuevas entran con confianza baja y no cuentan hasta que alguien las revise. El paso 3 compara los proveedores de una casilla con los mismos campos. El paso 4 calcula el índice de cada activo y deja cambiar los pesos y los datos. El paso 5 muestra las alertas y las casillas incompletas, y lleva una bitácora de decisiones que se puede descargar en JSON.

## Cómo se clasifican las fuentes

Cada fuente tiene tres clasificaciones:

- El tipo, que dice quién la publica: el fabricante, la prensa especializada o un tercero independiente.
- La fecha del dato, que es la fecha de publicación que declara la página (en sus metadatos, en un PDF o en la propia dirección). No es la fecha de la consulta. Si la página no la declara, la ficha dice «sin fecha».
- La confianza: alta si la publica alguien distinto del fabricante y la página abrió, media si solo lo dice el fabricante, y baja si la página no abrió en la última revisión. Las fichas de confianza baja se muestran, pero no cuentan para el mínimo de 3.

Ninguna de las tres confirma que el dato sea cierto: dicen de dónde viene, cuándo se publicó y si la página sigue en pie.

## La revisión diaria

Las 41 fichas de 21 proveedores se cargaron a mano el 28 de octubre de 2026. Desde el 4 de noviembre, un GitHub Action (`.github/workflows/actualizar.yml`) corre una vez al día, a las 6:00 de Medellín, y hace esto:

1. Vuelve a abrir el enlace de cada ficha, mira si la página nombra el producto y actualiza la fecha del dato y la confianza (`tools/actualizar.py`).
2. Busca las novedades de los últimos 30 días de cada proveedor: en su propio RSS, si su sitio lo anuncia, y en la búsqueda de Google News en RSS. Las dos son abiertas y no piden clave. Se quedan las que nombran al proveedor en el título y hablan de transporte; el filtro es por palabras y puede dejar pasar alguna nota ajena.
3. Regenera `app/data.js` (`tools/gen_data.py`) y corre todas las pruebas.
4. Si las pruebas pasan, publica los datos nuevos y el registro de la corrida (`registro/AAAA-MM-DD.json`). Si alguna falla, no publica nada, la página sigue con los datos del día anterior y el registro queda guardado en la corrida del Action.

La revisión no agrega ni quita fichas, no cambia los activos ni el Plan de Tecnología y no comprueba que lo que dice cada fuente sea cierto. Las novedades se muestran aparte: un analista decide si alguna merece una ficha nueva. Algunos sitios rechazan las consultas automáticas o tardan en responder, así que una ficha puede pasar a confianza baja un día y volver al siguiente.

## Qué es real y qué es de ejemplo

Los proveedores, los productos y los enlaces son reales. Los activos del Metro y las prioridades del Plan de Tecnología son datos de ejemplo inventados para la demostración, y la pantalla lo avisa con una franja fija. El índice de obsolescencia es una fórmula simple, pensada para que el Metro la reemplace por la suya. No calcula costos en pesos: el costo evitado se mediría en un piloto con los datos reales del Plan de Tecnología.

## Pruebas

```
pip install playwright pypdf
python -m playwright install chromium
python tests/test_actualizar.py   # sin red: regla de confianza, fechas, filtro de novedades, RSS
python tests/test_ui.py           # en un navegador real
```

`tests/test_ui.py` recorre las seis pantallas. Como la revisión diaria cambia los datos todos los días, la interfaz se prueba contra una copia fija (`tests/data_prueba.js`, el estado del 28 de octubre de 2026, que genera `python tools/gen_data.py --prueba`), y los datos vivos tienen pruebas propias: que la confianza siga la regla, que las fechas tengan formato válido y que la app abra con ellos sin errores y cuente lo mismo que Python. Para comprobar que las pruebas pueden fallar, se rompió a propósito la regla de confianza en los datos vivos, y la prueba correspondiente falló.

`tools/medir.py` revisa el contraste (4,5:1 como mínimo) y que nada desborde en las seis pantallas, a 1920×1080 al 100 y al 90 %, 1366×768, 1080×1920 y en un celular de 390 px, en modo claro y oscuro. Antes de medir comprueba que detecta dos defectos fabricados.

El nombre del producto está en un solo lugar, `NOMBRE` en `tools/gen_data.py`; la app lo toma de `data.js`.

## Límites

Es un prototipo de demostración, no el sistema con madurez TRL 7 que pide el reto (un sistema demostrado en un entorno operativo real). No está desplegado en Metro Digital, y no hay información pública de esa plataforma para confirmar que lo aceptaría. No resume documentos con inteligencia artificial; esa parte del método está descrita en el documento de la propuesta, pero no está construida.
