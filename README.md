# Petite Critique – Front-end (TP2 Programación IV, UTN FRLP)

**Petite Critique** es una SPA pública en React que consume la API REST del ranking gastronómico de restaurantes. El back-office de administración sigue en Rails (`/admin`) y **no** se reimplementa acá.

| | |
|---|---|
| **Nombre del proyecto** | **Petite Critique** (Guía gastronómica & ranking de reseñas) |
| **Temática** | Ranking de restaurantes, cafeterías, hamburgueserías, pancherías, tenedores libres y parrillas con sistema de recompensas por reseñas |
| **Integrantes** | Nicolás Licha (Front-end) y Elisa Ramos (Back-end) |
| **Modalidad** | Grupal (2 personas): front-end y back-end en repositorios separados |
| **Autor del back-end original** | Elisa Ramos |
| **Repositorio Front-end** | https://github.com/nicolaslicha02/rankingrestaurantes-frontend |
| **Repositorio Back-end** | https://github.com/elisaramosf/rankingrestaurantes |
| **Framework front** | React 18+ con Vite y TypeScript |
| **Otras librerías** | React Router, TanStack Query, Tailwind CSS 4, lucide-react, Vitest + React Testing Library |
| **URLs de deploy** | _Sin deploy publicado (ejecución integrada local en `http://localhost:5173` y `http://localhost:3000`)_ |

## Requisitos y versiones

- **Front-end:** Node.js ≥ 20 (probado con v24.12.0) y npm ≥ 10 (probado con 11.12.1).
- **Back-end:** Ruby 4.0.6 / 4.0.7, Rails 8.1.3.1, Bundler y PostgreSQL (probado con PostgreSQL 18).

## Instalación y ejecución

### Back-end (Rails, repositorio aparte)
```bash
git clone https://github.com/elisaramosf/rankingrestaurantes.git
cd rankingrestaurantes && bundle install
bin/rails db:create db:migrate db:seed
bin/rails server            # http://localhost:3000 (back-office en /admin)
```
*(En Windows: ejecutar `ruby bin/rails ...` y configurar `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` si PostgreSQL requiere autenticación TCP).*

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

## Comandos de pruebas, calidad y compilación

### Front-end
```bash
npm test        # tests automatizados (Vitest + React Testing Library, API simulada con mocks)
npm run lint    # ESLint (0 warnings permitidos)
npm run build   # chequeo de tipos (tsc) + build de producción en dist/
```

### Back-end (desde el repo `rankingrestaurantes`)
```bash
bin/rails test              # suite Minitest (con RAILS_ENV=test migrado)
bin/rubocop                 # análisis de estilo Ruby
bin/brakeman --no-pager     # análisis estático de seguridad
```

## Datos de prueba (demo)

| Rol / Perfil | Email | Contraseña | Acceso y detalle |
|---|---|---|---|
| Administrador (`/admin`) | `admin@example.com` | `admin1234` | Back-office Rails (`http://localhost:3000/admin`) para gestionar categorías, restaurantes y fotos |
| Usuario común | `usuario@example.com` | `usuario1234` | Front-end (`http://localhost:5173`): reseñar, editar/eliminar reseñas propias y guardar favoritos |

También es posible crear nuevos usuarios finales desde `/register` (`POST /api/v1/users`). Todas son credenciales de desarrollo/seeds locales, no cuentas reales. El front-end **nunca** maneja roles.

> **Nota sobre los datos iniciales:** los seeds originales del back-end cargan 2 restaurantes (`Don Mario` y `La Estancia`), sin reseñas previas ni fotos adjuntas (el front-end muestra fotos representativas de respaldo si `photo_url` es `null`). Desde `/admin` pueden agregarse más locales, categorías y fotos; desde el front-end pueden cargarse reseñas y probar el **Pase Petite Critique** (incluye botones de demostración `1★ (15)`, `2★ (30)`, `3★ (50 ¡Ruleta!)` para validar la carga progresiva y la ruleta sin tener que escribir 50 reseñas manualmente).

## Documentación del contrato de la API (obligatoria en grupo)

- **Contrato completo de la API (Markdown):** [docs/contrato-api.md](docs/contrato-api.md)
- **Pedidos y mejoras sugeridas al back-end:** [docs/pedidos-backend.md](docs/pedidos-backend.md)
- **Material del checkpoint (pantallas, wireframes, navegación):** [docs/checkpoint.md](docs/checkpoint.md)
- **Checklist de verificación y guion de demo:** [docs/contrato-y-demo.md](docs/contrato-y-demo.md)

## Funcionalidades destacadas de Petite Critique
- **Pase Petite Critique (Camino a las 50 reseñas + Ruleta Gourmet):** barra de progreso que carga progresivamente **3 estrellas** (`1★` a las 15 reseñas, `2★` a las 30 reseñas y `3★` a las 50 reseñas). Al completar las 3 estrellas se habilita una **Ruleta interactiva** con descuentos y premios que entrega un cupón con código único.
- **Podio Top 3 (`🥇 #1`, `🥈 #2`, `🥉 #3`)**, chips rápidos de categorías, selector de ordenamiento (*Mejor promedio*, *Más reseñados*, *Nombre A–Z*) y botón **"🎲 ¿Dónde comemos hoy?"** que recomienda un local al azar.

## Advertencias y excepciones justificadas (brechas de la API)

Cada una está marcada en el código con `// TODO(backend)`.

| Brecha | Fallback en el front |
|---|---|
| **CORS no configurado** en el back | Proxy de Vite (`/api` → `localhost:3000`) y rutas relativas. Un deploy requiere `rack-cors` en el back. |
| Sin promedio ni cantidad de reseñas | Se piden las reseñas de cada restaurante (**patrón N+1**, en paralelo y cacheado) y se calcula en el cliente. Aceptable para el TP, no escala. |
| Sin endpoint de categorías | Se derivan de los valores únicos de `category`. |
| Sin búsqueda/paginación server-side | Se filtra y ordena en el cliente. |
| `photo_url` puede ser `null` | Fotografía gastronómica representativa por restaurante/categoría + fallback ilustrado. |
| Favoritos sin foto ni categoría | Se cruza `restaurant_id` con `/restaurants`. |
| Tokens sin expiración | Ante cualquier 401 se limpia la sesión y se redirige a `/login`. |
