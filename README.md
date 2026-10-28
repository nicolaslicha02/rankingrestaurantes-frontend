# Ranking de Restaurantes – Front-end (TP2 Programación IV, UTN FRLP)

SPA pública en React para consumir la API REST del ranking de restaurantes. El back-office de administración sigue en Rails (`/admin`) y **no** se reimplementa acá.

| | |
|---|---|
| **Temática** | Ranking de restaurantes: reseñas, puntajes y favoritos |
| **Integrantes** | Nicolás Licha (Front-end) y Elisa Ramos (Back-end) |
| **Modalidad** | Grupal (2 personas): front-end y back-end en repos separados |
| **Autor del back-end original** | Elisa Ramos (repo: https://github.com/elisaramosf/rankingrestaurantes) |
| **Framework front** | React 18+ con Vite y TypeScript |
| **Otras librerías** | React Router, TanStack Query, Tailwind CSS 4, lucide-react, Vitest + React Testing Library |
| **URLs de deploy** | _sin deploy por ahora_ |

## Requisitos

- Node.js ≥ 20 (probado con 24) y npm ≥ 10.
- Back-end: Ruby (ver `.ruby-version` del repo), Bundler, PostgreSQL y Rails 8.1.

## Instalación y ejecución

### Back-end (Rails, repo aparte)
```bash
git clone https://github.com/elisaramosf/rankingrestaurantes.git
cd rankingrestaurantes && bundle install
bin/rails db:create db:migrate db:seed
bin/rails server            # http://localhost:3000
```

### Front-end
```bash
npm install
cp .env.example .env        # (Windows: copy .env.example .env)
npm run dev                 # http://localhost:5173
```

### Variables de entorno (`.env.example`, sin secretos)
| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API. En desarrollo, ruta relativa (la resuelve el proxy). | `/api/v1` |
| `DEV_PROXY_TARGET` | Solo desarrollo: destino del proxy de Vite. | `http://localhost:3000` |

La URL de la API nunca está hardcodeada: se lee de `VITE_API_URL`.
Para un deploy, usar la URL completa (p. ej. `https://mi-back.onrender.com/api/v1`) al hacer `npm run build`.

## Comandos
```bash
npm test        # tests (Vitest + React Testing Library, API simulada con mocks)
npm run lint    # ESLint (0 warnings permitidos)
npm run build   # chequeo de tipos (tsc) + build de producción en dist/
```

## Datos de prueba (demo)
| Rol | Email | Contraseña |
|---|---|---|
| Usuario | `usuario@example.com` | `usuario1234` |

Son credenciales de seeds locales, no cuentas reales. Los seeds traen solo 2 restaurantes (Don Mario, La Estancia), sin fotos ni reseñas: creá reseñas desde la UI y subí fotos desde `/admin` (credenciales de admin en el README del back).
El front **nunca** maneja roles.

## Advertencias y excepciones justificadas (brechas de la API)

Cada una está marcada en el código con `// TODO(backend)`.

| Brecha | Fallback en el front |
|---|---|
| **CORS no configurado** en el back | Proxy de Vite (`/api` → `localhost:3000`) y rutas relativas. Un deploy requiere `rack-cors` en el back. |
| Sin promedio ni cantidad de reseñas | Se piden las reseñas de cada restaurante (**patrón N+1**, en paralelo y cacheado) y se calcula en el cliente. Aceptable para el TP, no escala. |
| Sin endpoint de categorías | Se derivan de los valores únicos de `category`. |
| Sin búsqueda/paginación server-side | Se filtra y ordena en el cliente. |
| `photo_url` puede ser `null` | Placeholder con ícono. |
| Favoritos sin foto ni categoría | Se cruza `restaurant_id` con `/restaurants`. |
| Tokens sin expiración | Ante cualquier 401 se limpia la sesión y se redirige a `/login`. |

Pedidos al back priorizados: [docs/pedidos-backend.md](docs/pedidos-backend.md).
Material del checkpoint (pantallas, wireframes, endpoints): [docs/checkpoint.md](docs/checkpoint.md).
Verificación del contrato y guion de demo: [docs/contrato-y-demo.md](docs/contrato-y-demo.md).

## Estructura
```
src/api/         apiFetch (base URL, Bearer, JSON, 204, ApiError, 401 global) + auth/restaurants/reviews/favorites
src/auth/        AuthProvider, useAuth, ProtectedRoute, GuestRoute
src/hooks/       hooks de TanStack Query (restaurantes, reseñas, favoritos optimistas, ratings)
src/components/  tarjetas, estrellas (lectura y teclado), formularios, estados vacío/error/carga, toasts
src/pages/       Home, RestaurantDetail, Favorites, Login, Register, NotFound
src/types/       tipos del contrato (sin any)
```
Query keys: `['restaurants']`, `['restaurant', id]`, `['reviews', id]`, `['favorites']`.

## Accesibilidad
Etiquetas en todos los campos, estrellas operables con flechas/Home/End (radiogroup), foco visible, enlace "Saltar al contenido", `role="alert"` en errores, diálogos de confirmación con foco y Escape.

