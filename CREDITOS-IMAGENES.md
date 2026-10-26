# Créditos y licencia de la imagen

La fotografía de fondo de la sección principal es una **imagen de stock con fines ilustrativos**. **No muestra las
instalaciones, el equipamiento ni a las personas de GymFit Sevilla**, y la página lo indica en el pie de página.

## Imagen utilizada

| Uso en la página | Archivos en `public/img/` | Título original | Autor | Ficha original |
|---|---|---|---|---|
| Fondo de la sección principal (decorativa, con degradado oscuro encima) | `principal-768.webp`, `principal-1280.webp`, `principal-1920.webp` | Barbell on the Floor | Leon Mart | <https://www.pexels.com/photo/barbell-on-the-floor-1552252/> |

## Licencia

La fotografía procede de [Pexels](https://www.pexels.com/) y se usa bajo la
[Licencia de Pexels](https://www.pexels.com/license/) (comprobada el 26/10/2026; la ficha de la foto muestra
"License: Free").

Lo que permite: descargar y usar la foto gratis, también con fines comerciales; modificarla; no exige atribución
(se agradece, y aquí se da).

Lo que no permite, y por tanto se respeta:

- Mostrar a personas identificables de forma ofensiva o que las perjudique (en esta foto no aparece ninguna persona).
- Dar a entender que una persona o marca respalda el proyecto.
- Vender copias sin modificar, o redistribuir la foto en otras webs de imágenes.
- Usar la foto como marca, nombre comercial o logotipo.

## Modificaciones realizadas

Se descargó la versión redimensionada que ofrece la CDN de Pexels (2400 px de ancho) y se optimizó en local con
[sharp](https://sharp.pixelplumbing.com/) (herramienta externa al proyecto, no es una dependencia):

- Conversión a **WebP** (calidad 70) y tres anchos (768, 1280 y 1920 px) para `srcset`: cada pantalla descarga solo
  el que necesita. Peso: 20, 47 y 86 KB.
- En la web, la foto lleva un degradado oscuro encima (CSS, en `src/app/app.css`) para que el texto se lea.

## Observaciones

- En la foto se ven, muy pequeñas y desenfocadas, las inscripciones de los discos de la barra. No se presentan como
  publicidad ni como respaldo de ninguna marca.
