# Radar Propio: prototipo

Prototipo funcional de la propuesta para el Reto 5 del programa de innovación abierta del Metro de Medellín, «Radar Tecnológico: El futuro de la movilidad». Es una página web estática que reproduce los cinco pasos del método: definir qué se vigila, cargar fuentes, comparar proveedores, puntuar la obsolescencia y decidir con alertas ligadas a un Plan de Tecnología.

## Cómo abrirlo

Abra el archivo `app/index.html` con doble clic. Funciona en cualquier navegador actual, sin instalar nada, sin servidor y sin conexión a internet. No usa servicios externos ni inteligencia artificial: todo el código está en `app/app.js` y los datos en `app/data.js`.

Lo que se cambie en pantalla (datos de un activo, pesos, fichas nuevas, decisiones) se guarda únicamente en el navegador de quien lo usa. El botón «Restablecer datos de ejemplo», en el paso 2, vuelve al estado inicial.

## Qué hace cada pantalla

El paso 1 muestra la matriz de cuatro categorías tecnológicas (material rodante, señalización y control, energía y tracción, tecnología digital) por cuatro modos (metro, tranvía, BRT, cable). Cada celda indica cuántos proveedores con fuente tiene, sobre el mínimo de tres que pide el reto.

El paso 2 lista las fuentes cargadas, permite importar más desde un archivo JSON y agregar fichas a mano. Las fichas nuevas entran como no verificadas y no cuentan para el mínimo hasta que alguien las revise.

El paso 3 compara los proveedores de una celda con la misma ficha, y dice si la aplicación a ese modo viene de la fuente o es un supuesto.

El paso 4 calcula un índice de obsolescencia de 0 a 100 por activo, a partir de la edad frente a la vida útil, la dependencia del proveedor (que baja con cada alternativa con fuente y sube si el proveedor es cautivo) y la brecha tecnológica. Los pesos se ajustan con tres controles. En pantalla de celular cada activo se muestra como una tarjeta con los campos editables plegados.

El paso 5 cruza los índices con las prioridades del Plan de Tecnología, muestra las alertas y las brechas de cobertura, y lleva una bitácora de decisiones que se puede exportar a JSON.

## De dónde salen los datos

Las 41 fichas corresponden a 21 proveedores reales, cada una con un enlace público y la fecha de consulta (28 de octubre de 2026). De las 41, 32 están verificadas (la página respondió y nombra el producto), 5 son parciales (respondió, pero es un comunicado o un documento que no se pudo leer entero) y 4 no se pudieron verificar porque el sitio bloqueó la consulta automática. Las afirmaciones de cada ficha son del fabricante o de prensa especializada y no están contrastadas de forma independiente.

Ocho de las dieciséis celdas llegan a tres proveedores con fuente. Las otras ocho quedan visibles como brecha en lugar de rellenarse con nombres sin respaldo.

Los activos del Metro y las prioridades del Plan de Tecnología son datos de ejemplo inventados para la demostración. La pantalla lo avisa con una franja permanente. No son información del Metro.

El índice de obsolescencia es una fórmula simple y legible, pensada para que el Metro la reemplace por la suya. No calcula costos en pesos: el costo evitado se mediría en un piloto con los datos reales del Plan de Tecnología.

## Pruebas

`tests/test_ui.py` recorre las cinco pantallas en un navegador real con Playwright. Comprueba que ninguna produce errores de consola, que el puntaje cambia cuando cambia un dato (y no cambia cuando se repite el mismo), que un dato fuera de rango se rechaza, que las alertas aparecen y desaparecen con los índices, que una ficha manual o importada no completa una celda mientras no esté verificada, que un JSON inválido se rechaza y que en celular no hay desbordamiento horizontal.

```
pip install playwright
python tests/test_ui.py                  # usa el Chromium de Playwright
python tests/test_ui.py /ruta/a/chrome   # o uno ya instalado
```

La última corrida pasó 44 de 44 pruebas. Para comprobar que las pruebas pueden fallar, se corrieron contra una copia con el cálculo del índice fijado en 50: fallaron 7.

`tools/gen_data.py` regenera `app/data.js` a partir de la lista de fichas. Los datos se editan ahí y no a mano en el JS.

## Límites

Es un prototipo de demostración, no el sistema que el reto pide con madurez TRL 7. No está desplegado en Metro Digital y no hay información pública de esa plataforma para confirmar que lo aceptaría. No resume documentos con inteligencia artificial; esa parte del método queda descrita en el documento de la propuesta, no construida.
