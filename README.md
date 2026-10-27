# GymFit Sevilla — Frontend

Página web del gimnasio GymFit Sevilla: una landing oscura con detalles naranjas y un **chat** que consulta horarios y
tarifas a través del backend Spring Boot (`POST /api/chat`).

El backend está en [gymfit-sevilla-backend](https://github.com/jesusgalvan95/gymfit-sevilla-backend).

## Cómo funciona

```
Navegador ──► Angular (chat) ──POST /api/chat──► Backend Spring Boot ──► Ollama (qwen3:4b) | Claude | reglas
```

- El componente `chat` envía el mensaje del usuario con `ChatService` y muestra la respuesta.
- El frontend **no** contiene claves de API ni habla con ningún LLM: de eso se ocupa solo el backend.
- En desarrollo, `proxy.conf.json` redirige `/api/*` a `http://localhost:8080`, así que no hace falta configurar CORS.

## Tecnologías

- Angular 21 (componentes standalone y signals)
- Bootstrap 5.3
- TypeScript 5.9 y RxJS 7.8
- Vitest y jsdom para los tests unitarios

## Requisitos

- Node.js `^20.19.0`, `^22.12.0` o `>=24.0.0`
- El backend en marcha en `http://localhost:8080`

## Ejecución con Ollama y qwen3:4b

Para que el chat responda con un modelo local y gratuito:

1. Instala [Ollama](https://ollama.com/) y descarga el modelo (una sola vez, ~2,5 GB):

   ```bash
   ollama pull qwen3:4b
   ```

2. Arranca el backend con el proveedor `ollama` (desde el repositorio del backend):

   ```bash
   GYMFIT_LLM_PROVIDER=ollama ./mvnw spring-boot:run
   ```

   En PowerShell: `$env:GYMFIT_LLM_PROVIDER = "ollama"; .\mvnw.cmd spring-boot:run`.

3. Arranca el frontend:

   ```bash
   npm ci          # instala las dependencias exactas del package-lock.json
   npm start       # http://localhost:4200
   ```

Si no activas Ollama, el backend responde con su motor de reglas y el chat funciona igual. `qwen3:4b` razona antes de
responder, así que la primera respuesta puede tardar unos segundos.

## Comandos

| Comando                     | Descripción                                   |
|-----------------------------|-----------------------------------------------|
| `npm start`                 | Servidor de desarrollo en `localhost:4200`    |
| `npx ng build`              | Compilación de producción en `dist/`          |
| `npx ng test --watch=false` | Tests unitarios (sin backend ni red)          |

## Estructura

```
src/app/
├── app.*            # Página principal (landing)
└── chat/            # Componente del chat, modelos y servicio HTTP (con sus tests)
public/img/          # Imágenes optimizadas (WebP)
proxy.conf.json      # Proxy de desarrollo hacia el backend
```

## Imágenes

La fotografía de fondo de la sección principal es una imagen de stock de Pexels con fines ilustrativos (no es de
GymFit Sevilla). Fuente, autor, licencia y modificaciones en [CREDITOS-IMAGENES.md](CREDITOS-IMAGENES.md).
