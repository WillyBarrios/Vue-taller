## Desarrollo local con Laravel Sanctum (evitar 419)

Para que las mutaciones (POST/PUT/DELETE) funcionen desde la SPA con Laravel Sanctum:

1) Variables de entorno del frontend (Vite)
- Crear `.env.local` en la raíz con:
	- `VITE_API_URL=http://localhost:8000/api`

2) Servidor de desarrollo de Vite
- En `vite.config.ts` se configuró:
	- `server.host = 'localhost'`
	- `server.port = 5173`

3) Backend Laravel (.env)
- `APP_URL=http://localhost:8000`
- `SESSION_DOMAIN=localhost`
- `SANCTUM_STATEFUL_DOMAINS=localhost:5173`
- `SESSION_SECURE_COOKIE=false` (si usas HTTP)

4) CORS (`config/cors.php`)
- `paths` incluye `api/*` y `sanctum/csrf-cookie`
- `allowed_origins` incluye `http://localhost:5173`
- `supports_credentials` => true

5) Middlewares (Kernel)
- En el grupo `api` verifica:
	- `\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class`
	- `\Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class`
	- `\Illuminate\Session\Middleware\StartSession::class`

6) Limpiar cachés
- `php artisan optimize:clear && php artisan view:clear && php artisan config:clear`

Con esto, la SPA obtiene `XSRF-TOKEN` al llamar `GET /sanctum/csrf-cookie` y Axios envía `X-XSRF-TOKEN` + cookies en cada mutación.

# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
