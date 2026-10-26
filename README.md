# GymFit Sevilla — Frontend

Página del gimnasio con un chat conectado al backend Spring Boot (`POST /api/chat`).

- Angular 21 (componentes standalone, signals) y Bootstrap 5.3.
- Requiere Node.js `^20.19.0`, `^22.12.0` o `>=24.0.0`.
- El frontend **no** contiene claves de API: solo llama a `/api/chat`. Hablar con el LLM es cosa del backend.

## Desarrollo

```bash
npm ci          # instalar dependencias exactas del package-lock.json
npm start       # http://localhost:4200 (el backend debe estar en http://localhost:8080)
```

`proxy.conf.json` redirige `/api/*` a `http://localhost:8080`, así que no hace falta configurar CORS en desarrollo.

## Comprobaciones

```bash
npx ng build                 # compilación de producción en dist/
npx ng test --watch=false    # tests unitarios (Vitest), sin backend ni red
```
