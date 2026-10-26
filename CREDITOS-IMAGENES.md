# Créditos y licencias de las imágenes

Las fotografías de esta página son **imágenes de stock con fines ilustrativos**. **No muestran las instalaciones, el
equipamiento ni a las personas de GymFit Sevilla**, y la página lo indica en cada foto y en el pie de página.

## Licencia

Las tres fotografías proceden de [Pexels](https://www.pexels.com/) y se usan bajo la
[Licencia de Pexels](https://www.pexels.com/license/) (comprobada el 26/10/2026; cada ficha muestra "License: Free").

Lo que permite: descargar y usar las fotos gratis, también con fines comerciales; modificarlas; no exige atribución
(se agradece, y aquí se da).

Lo que no permite, y por tanto se respeta:

- Mostrar a personas identificables de forma ofensiva o que las perjudique.
- Dar a entender que una persona o marca respalda el proyecto.
- Vender copias sin modificar, o redistribuir las fotos en otras webs de imágenes.
- Usar las fotos como marca, nombre comercial o logotipo.

## Imágenes utilizadas

| Uso en la página | Archivos en `public/img/` | Título original | Autor | Ficha original |
|---|---|---|---|---|
| Fondo de la sección principal (decorativa) | `principal-768.webp`, `-1280`, `-1920` | Barbell on the Floor | Leon Mart | <https://www.pexels.com/photo/barbell-on-the-floor-1552252/> |
| Galería, izquierda | `deportista-600.webp`, `-1200` | Grayscale Photography of Man Carrying Barbell | DreamLens Production | <https://www.pexels.com/photo/grayscale-photography-of-man-carrying-barbell-896058/> |
| Galería, derecha | `ambiente-600.webp`, `-1200` | Rustic Gym Interior with Fitness Equipment | Tima Miroshnichenko | <https://www.pexels.com/photo/people-rope-sport-rustic-6389892/> |

## Modificaciones realizadas

Se descargaron las versiones redimensionadas que ofrece la CDN de Pexels (2400, 1800 y 1800 px de ancho) y se
optimizaron en local con [sharp](https://sharp.pixelplumbing.com/) (herramienta externa al proyecto, no es una
dependencia):

- Conversión a **WebP** (calidad 70–78) y generación de varios anchos para `srcset`. Peso total: unos 216 KB.
- *Tima Miroshnichenko*: la foto original es vertical; se recortó una franja apaisada (3:2) con las mancuernas y los
  discos. El recorte deja fuera un cartel de marca que aparecía en la parte alta.
- En la web, la foto de portada lleva un degradado oscuro encima (CSS) para que el texto se lea.

## Observaciones

- En la foto de portada se ven, muy pequeñas y desenfocadas, las inscripciones de los discos de la barra. No se
  presentan como publicidad ni como respaldo de ninguna marca.
- La foto *Grayscale Photography of Man Carrying Barbell* muestra a una persona reconocible. Se usa de forma neutra
  y positiva, como ilustración, y se indica que no es de GymFit Sevilla. Pexels no garantiza una autorización de
  imagen de la persona retratada: si el proyecto pasara a un uso comercial real, conviene sustituirla por fotografías
  propias o con autorización expresa.
