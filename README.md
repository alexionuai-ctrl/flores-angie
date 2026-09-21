# Flores amarillas para Angie 🌻

Mini sitio estático, diseñado primero para celular, con una experiencia de flores amarillas, texto secuencial, sonido generado con Web Audio y una segunda visita que muestra “¿Volviste?”.

## Qué hace esta versión

- Primera visita: muestra “Para Angie” y un botón para abrir.
- Al abrir: crecen flores amarillas, aparecen mensajes secuenciales y un ambiente musical suave.
- Mensaje final: agradece el tiempo compartido y menciona correctamente **el viernes pasado**.
- Regreso: `localStorage` recuerda que ese navegador ya abrió el regalo y muestra “¿Volviste? 🌻”.
- Flor central: funciona como pequeño easter egg y revela un P. D.
- Privacidad: no hay analytics, cookies, formularios ni envío de datos a un servidor.
- Recursos visuales y de audio de esta V1: originales/autogenerados; no depende de CDNs, imágenes remotas ni audio de terceros.

## Probar localmente

La forma más simple:

```bash
python -m http.server 8000
```

Luego abre:

```text
http://localhost:8000
```

Para borrar el recuerdo de apertura y volver a probar la primera visita:

```text
http://localhost:8000/?reset=1
```

También puedes dar al regalo un identificador único:

```text
http://localhost:8000/?g=8fa27c
```

La memoria se guarda bajo ese identificador. En GitHub Pages funcionará igual.

## Publicar en GitHub Pages

1. Crea un repositorio, por ejemplo `flores-angie`.
2. Sube `index.html`, `styles.css`, `app.js` y `.nojekyll` a la raíz.
3. Ve a **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Usa la rama `main` y la carpeta `/ (root)`.
6. GitHub publicará una dirección del tipo:

```text
https://TU-USUARIO.github.io/flores-angie/
```

Para Angie puedes enviar una URL con identificador aleatorio, por ejemplo:

```text
https://TU-USUARIO.github.io/flores-angie/?g=8fa27c
```

Esto no autentica a Angie; sólo separa la memoria de este regalo de cualquier otro regalo que uses con la misma página.

## Limitación de “¿Volviste?”

La página reconoce el mismo almacenamiento del navegador, no la identidad de una persona. Si se abre en otro navegador/dispositivo, en incógnito o se borran los datos del sitio, se verá como una primera visita.

## Próxima iteración sugerida

Comparar esta implementación original con animaciones MIT de flores amarillas y conservar sólo elementos que mejoren la estética sin añadir dependencias frágiles. También se puede sustituir el ambiente Web Audio por una pieza CC0 si se desea una identidad musical concreta.
