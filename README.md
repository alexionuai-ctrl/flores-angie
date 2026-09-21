# Flores amarillas para Angie — V3

Mini experiencia web pensada para móvil, que también funciona bien en PC.
Se publica tal cual en GitHub Pages (solo archivos estáticos, sin dependencias externas).

## Qué se arregló en V3

El problema de fondo de la V2 era que la escena estaba armada con posiciones
absolutas mezclando `px` y `vh`. Eso hacía que, según el alto y ancho real del
teléfono, los girasoles quedaran fuera de pantalla, recortados o tapados.

- **El ramo ahora es un SVG con `viewBox`.** Toda la geometría vive en un sistema
  de coordenadas propio (400×560) y el navegador lo escala solo. Se ve idéntico en
  cualquier pantalla: no hay nada que se salga ni que se corte.
- **Tallos que nacen de un mismo punto.** Antes cada flor estaba suelta; ahora las
  7 salen del mismo nudo y se abren en abanico.
- **Papel del ramo rehecho.** Antes eran tres rectángulos blancos que parecían
  hojas sueltas; ahora es un cono de papel con dobleces y un moño.
- **La tarjeta final ya no queda tapada.** Está dentro del flujo de la página: al
  aparecer empuja el ramo hacia arriba en lugar de superponerse.
- **Layout flexible.** Barra superior, texto, escena y tarjeta se reparten el alto
  disponible; funciona en pantallas bajas, altas y en horizontal.
- **Crecimiento del tallo con `stroke-dashoffset`** (más fluido y barato en móvil
  que animar tamaños).
- **Zona táctil de la flor central** ubicada dentro del SVG, así siempre coincide
  con la flor aunque cambie el tamaño de pantalla.
- Notch / safe areas de iPhone respetadas (`env(safe-area-inset-*)`).
- `100dvh` con respaldo a `100vh` para la barra de direcciones móvil.
- Botones con área táctil mínima de 44px, foco visible y soporte de teclado.
- Nota secreta como diálogo real, con fondo oscurecido y cierre con `Esc`.
- Respeta `prefers-reduced-motion`: muestra el ramo completo sin animaciones.

## Publicar / actualizar en GitHub Pages

Reemplaza en la raíz del repositorio `index.html`, `styles.css` y `app.js`.
Mantén también `.nojekyll`, `THIRD_PARTY_RESOURCES.md` y `THIRD_PARTY_LICENSES.md`.

## Pruebas

- Primera visita: abre la URL del sitio.
- Reset de memoria: agrega `?reset=1`.
- Regalo con identificador: agrega `?g=CODIGO`.

Ejemplo:

`https://usuario.github.io/flores-angie/?g=f7a21`

## Nota sobre el sonido

El audio se genera con la Web Audio API (sin archivos). Los navegadores móviles
solo permiten sonido tras un toque del usuario, por eso arranca al pulsar "Abrir".
El botón ♪ de la esquina lo activa o silencia en cualquier momento.
