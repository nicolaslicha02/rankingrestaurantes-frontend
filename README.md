# Petite Critique – Front-end (TP2 Programación IV, UTN FRLP)

**Petite Critique** es una SPA pública en React que consume la API REST del ranking gastronómico de restaurantes. El back-office de administración sigue en Rails (`/admin`) y **no** se reimplementa acá.

| | |
|---|---|
| **Nombre del proyecto** | **Petite Critique** (Guía gastronómica & ranking de reseñas) |
| **Temática** | Ranking de restaurantes, cafeterías, hamburgueserías, pancherías, tenedores libres y parrillas con sistema de recompensas por reseñas |
| **Integrantes** | Nicolás Licha (Front-end) y Elisa Ramos (Back-end) |
| **Modalidad** | Grupal (2 personas): front-end y back-end en repos separados |
| **Autor del back-end original** | Elisa Ramos (repo: https://github.com/elisaramosf/rankingrestaurantes) |
| **Framework front** | React 18+ con Vite y TypeScript |
| **Otras librerías** | React Router, TanStack Query, Tailwind CSS 4, lucide-react, Vitest + React Testing Library |
| **URLs de deploy** | _sin deploy por ahora_ |

## Requisitos

- Node.js ≥ 20 (probado con 24) y npm ≥ 10.
- Back-end: Ruby, Bundler, PostgreSQL y Rails 8.1.

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

## Comandos
```bash
npm test        # tests (Vitest + React Testing Library, API simulada con mocks)
npm run lint    # ESLint (0 warnings permitidos)
npm run build   # chequeo de tipos (tsc) + build de producción en dist/
```

## Datos de prueba (demo)
| Perfil | Email | Contraseña | Detalle para la demo |
|---|---|---|---|
| Usuario Demo | `usuario@example.com` | `usuario1234` | Arranca con 16 reseñas (1★ desbloqueada) y 4 favoritos |
| Crítica Gourmet | `critico@example.com` | `critico1234` | Arranca con **49 reseñas**: al publicar **1 reseña más** llega a 50, completa las **3 estrellas** y desbloquea la **Ruleta de Premios** |

Son credenciales de seeds locales, no cuentas reales. Los seeds cargan **19 locales gastronómicos** en 10 categorías (*Cafetería, Hamburguesería, Panchería, Tenedor Libre, Parrilla, Pizzería, Bodegón, Heladería, Sushi & Nikkei y Cervecería Artesanal*), 12 usuarios y más de 120 reseñas con direcciones y comentarios realistas.
El front **nunca** maneja roles.

## Funcionalidades destacadas de Petite Critique
- **Pase Petite Critique (Camino a las 50 reseñas + Ruleta Gourmet):** barra de progreso que carga progresivamente **3 estrellas** (`1★` a las 15 reseñas, `2★` a las 30 reseñas y `3★` a las 50 reseñas). Al completar las 3 estrellas se habilita una **Ruleta interactiva** con descuentos y premios (café de especialidad gratis, 2x1 en hamburguesas, 35% OFF en pizzerías, combo pancho gratis, postre libre en parrilla o 1/4 kg de helado) que entrega un cupón con código único.
- **Podio Top 3 (`🥇 #1`, `🥈 #2`, `🥉 #3`)**, chips rápidos de categorías, selector de ordenamiento (*Mejor promedio*, *Más reseñados*, *Nombre A–Z*) y botón **"🎲 ¿Dónde comemos hoy?"** que recomienda un local al azar.

## Advertencias y excepciones justificadas (brechas de la API)

Cada una está marcada en el código con `// TODO(backend)`.

| Brecha | Fallback en el front |
|---|---|
| **CORS no configurado** en el back | Proxy de Vite (`/api` → `localhost:3000`) y rutas relativas. Un deploy requiere `rack-cors` en el back. |
| Sin promedio ni cantidad de reseñas | Se piden las reseñas de cada restaurante (**patrón N+1**, en paralelo y cacheado) y se calcula en el cliente. Aceptable para el TP, no escala. |
| Sin endpoint de categorías | Se derivan de los valores únicos de `category`. |
| Sin búsqueda/paginación server-side | Se filtra y ordena en el cliente. |
| `photo_url` puede ser `null` | Fotografía gastronómica representativa por categoría + fallback ilustrado. |
| Favoritos sin foto ni categoría | Se cruza `restaurant_id` con `/restaurants`. |
| Tokens sin expiración | Ante cualquier 401 se limpia la sesión y se redirige a `/login`. |

Pedidos al back priorizados: [docs/pedidos-backend.md](docs/pedidos-backend.md).
Material del checkpoint (pantallas, wireframes, endpoints): [docs/checkpoint.md](docs/checkpoint.md).
Verificación del contrato y guion de demo: [docs/contrato-y-demo.md](docs/contrato-y-demo.md).
