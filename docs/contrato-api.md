# Documentación del Contrato de la API — Petite Critique (TP N.º 2)

> **Documento obligatorio para modalidad grupal (2 personas)** — Sección 6 del enunciado de Programación IV (UTN FRLP).  
> Corresponde a la integración entre el front-end **Petite Critique** (`React + TypeScript + Vite`) y el back-end **Ranking Restaurantes** (`Ruby on Rails 8.1 + PostgreSQL`).

- **Integrantes:** Nicolás Licha (Front-end) y Elisa Ramos (Back-end).
- **Repositorio Front-end:** https://github.com/nicolaslicha02/rankingrestaurantes-frontend
- **Repositorio Back-end:** https://github.com/elisaramosf/rankingrestaurantes
- **Back-office:** Permanece exclusivamente en Rails (`/admin`) con autenticación por cookie de sesión; no forma parte de esta API ni se reimplementa en React.

---

## 1. Configuración general

| Concepto | Especificación |
|---|---|
| **URL base (desarrollo local)** | `http://localhost:3000/api/v1` |
| **URL base vía proxy del front-end** | `/api/v1` (configurado en `VITE_API_URL`; el proxy de Vite reenvía `/api` a `http://localhost:3000` para evitar bloqueo CORS en desarrollo) |
| **Formato de intercambio** | JSON (`Content-Type: application/json`, `Accept: application/json`) |
| **Formato de fechas** | ISO 8601 en UTC devuelto por Rails (`"YYYY-MM-DDTHH:MM:SS.sssZ"`, ej. `"2026-11-04T19:15:00.000Z"`) |
| **Mecanismo de autenticación** | Token opaco por sesión almacenado en el servidor (`sessions.token`) |

### Cómo iniciar sesión, enviar credenciales y cerrar sesión

1. **Iniciar sesión:** enviar `POST /api/v1/login` con `{ "email": "...", "password": "..." }`. La API crea un registro en `sessions` y responde `201 Created` con `{ "token": "...", "user": { "id", "name", "email" } }`.
   - *Nota sobre registro:* `POST /api/v1/users` crea la cuenta pero **no** inicia sesión ni devuelve token; el front-end encadena `POST /api/v1/login` inmediatamente después de un registro exitoso.
2. **Enviar credenciales en peticiones protegidas:** incluir el encabezado HTTP:
   ```http
   Authorization: Bearer <token>
   ```
   Si el token falta o no existe en `sessions`, la API responde `401 Unauthorized` con `{ "error": "No autorizado" }`. El front-end intercepta cualquier `401` global (excepto en `/login`), limpia el token de `localStorage` y redirige a `/login`.
3. **Cerrar sesión:** enviar `DELETE /api/v1/logout` con el header `Authorization: Bearer <token>`. El servidor destruye la sesión (`204 No Content`) e invalida el token de inmediato (los tokens no vencen por tiempo).

### Formato estándar de respuestas de error

| Código HTTP | Significado | Estructura JSON | Idioma observado en la API |
|---|---|---|---|
| `401 Unauthorized` | Token ausente/inválido o credenciales incorrectas | `{ "error": "No autorizado" }` o `{ "error": "Email o contraseña inválidos" }` | Español |
| `404 Not Found` | Recurso inexistente o reseña ajena (sin permiso de autor) | `{ "error": "No encontrado" }` | Español |
| `422 Unprocessable Entity` | Error de validación de ActiveRecord | `{ "errors": ["Mensaje 1", "Mensaje 2"] }` | Inglés por defecto de Rails (`en.yml`) |

---

## 2. Resumen de endpoints y mapa de uso en el front-end

| Grupo | Método | Ruta | Auth | Permisos / Restricción | Pantalla / Módulo del front que lo consume |
|---|---|---|---|---|---|
| Auth / Usuarios | `POST` | `/api/v1/users` | No | Público (siempre asigna rol `user`) | `/register` (`Register.tsx` → `auth.ts`) |
| Auth / Usuarios | `POST` | `/api/v1/login` | No | Público | `/login` y encadenado desde `/register` (`auth.ts`) |
| Auth / Usuarios | `DELETE` | `/api/v1/logout` | Sí | Usuario autenticado | Header (`Layout.tsx` → `auth.ts`) |
| Auth / Usuarios | `GET` | `/api/v1/profile` | Sí | Usuario autenticado | Restauración de sesión al recargar (`AuthProvider.tsx`) |
| Restaurantes | `GET` | `/api/v1/restaurants` | No | Público | `/` (`Home.tsx`) y cruce de datos en `/favorites` (`Favorites.tsx`) |
| Restaurantes | `GET` | `/api/v1/restaurants/:id` | No | Público | `/restaurants/:id` (`RestaurantDetail.tsx`) |
| Reseñas | `GET` | `/api/v1/restaurants/:restaurant_id/reviews` | No | Público | `/` (cálculo de promedio y Pase Petite Critique) y `/restaurants/:id` |
| Reseñas | `POST` | `/api/v1/restaurants/:restaurant_id/reviews` | Sí | Usuario autenticado | `/restaurants/:id` (`ReviewForm.tsx`) |
| Reseñas | `PATCH` | `/api/v1/reviews/:id` | Sí | Solo el autor de la reseña | `/restaurants/:id` (`ReviewList.tsx` + `ReviewForm.tsx`) |
| Reseñas | `DELETE` | `/api/v1/reviews/:id` | Sí | Solo el autor de la reseña | `/restaurants/:id` (`ReviewList.tsx` + `ConfirmDialog.tsx`) |
| Favoritos | `GET` | `/api/v1/favorites` | Sí | Usuario autenticado (solo propios) | `/` (`FavoriteButton.tsx`) y `/favorites` (`Favorites.tsx`) |
| Favoritos | `POST` | `/api/v1/favorites` | Sí | Usuario autenticado (idempotente) | `/` y `/restaurants/:id` (`FavoriteButton.tsx`) |
| Favoritos | `DELETE` | `/api/v1/favorites/:restaurant_id` | Sí | Usuario autenticado (solo propios) | `/`, `/restaurants/:id` y `/favorites` (`useFavorites.ts`) |

> **Nota sobre endpoints del TP 2 vs. TP 1:** En la API `/api/v1`, los endpoints de **autenticación/usuarios** (`/users`, `/login`, `/logout`, `/profile`), **restaurantes** (`/restaurants`, `/restaurants/:id`), **reseñas** (`/reviews`) y **favoritos** (`/favorites`) conforman el contrato completo consumido por la SPA del TP 2. No se agregaron endpoints nuevos en Rails para categorías, ranking ordenado ni cupones/ruleta (ver Sección 7: *Decisiones de integración y brechas*).

---

## 3. Autenticación y usuarios

### 3.1 `POST /api/v1/users` — Registrar usuario

- **Autenticación:** No requerida (público).
- **Permisos / Restricciones:** El controlador permite únicamente `:name`, `:email`, `:password`. El campo `role` no se acepta ni lo maneja el front-end; el modelo asigna `role: "user"` por defecto. El registro envía un correo de bienvenida vía `UserMailer` (`tmp/mails/` en desarrollo).

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Valores admitidos / Validaciones |
|---|---|---|---|---|
| Header | `Content-Type` | `string` | Sí | `application/json` |
| Body (JSON plano) | `name` | `string` | No en modelo, requerido por el front | Nombre visible del usuario (el front valida que no esté vacío) |
| Body (JSON plano) | `email` | `string` | Sí | Único y no vacío. Se normaliza (`strip.downcase`) |
| Body (JSON plano) | `password` | `string` | Sí | No vacía (validada por `has_secure_password`, máx. 72 bytes por `bcrypt`) |

#### Respuesta exitosa (`201 Created`)
| Campo | Tipo | Obligatorio | Significado |
|---|---|---|---|
| `id` | `integer` | Siempre | Identificador único del usuario creado |
| `name` | `string \| null` | Siempre | Nombre del usuario |
| `email` | `string` | Siempre | Correo normalizado en minúsculas |

#### Respuestas de error
- `422 Unprocessable Entity`: `{ "errors": ["Email can't be blank", "Email has already been taken", "Password can't be blank"] }`.

#### Ejemplos reproducibles
```bash
# Petición exitosa
curl -i -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Francesca","email":"francesca@fran.com","password":"francesca1234"}'
```
```json
// 201 Created
{
  "id": 15,
  "name": "Francesca",
  "email": "francesca@fran.com"
}
```
```bash
# Error: email ya registrado
curl -i -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Francesca","email":"francesca@fran.com","password":"francesca1234"}'
```
```json
// 422 Unprocessable Entity
{
  "errors": ["Email has already been taken"]
}
```

---

### 3.2 `POST /api/v1/login` — Iniciar sesión

- **Autenticación:** No requerida (público).
- **Permisos / Restricciones:** Valida credenciales con `User.authenticate_by` y crea una sesión persistente con token único.

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Valores admitidos / Validaciones |
|---|---|---|---|---|
| Header | `Content-Type` | `string` | Sí | `application/json` |
| Body (JSON plano) | `email` | `string` | Sí | Email de una cuenta existente |
| Body (JSON plano) | `password` | `string` | Sí | Contraseña de la cuenta |

#### Respuesta exitosa (`201 Created`)
| Campo | Tipo | Significado |
|---|---|---|
| `token` | `string` | Token opaco para enviar como `Bearer <token>` |
| `user` | `object` | Objeto con `{ "id": integer, "name": string, "email": string }` |

#### Respuestas de error
- `401 Unauthorized`: `{ "error": "Email o contraseña inválidos" }` (credenciales incorrectas o usuario inexistente).

#### Ejemplos reproducibles
```bash
# Petición exitosa
curl -i -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"usuario1234"}'
```
```json
// 201 Created
{
  "token": "k9Xm2vQp8LzR4nWy7BtF1c...",
  "user": {
    "id": 2,
    "name": "Usuario Demo",
    "email": "usuario@example.com"
  }
}
```
```bash
# Error: contraseña inválida
curl -i -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"incorrecta"}'
```
```json
// 401 Unauthorized
{
  "error": "Email o contraseña inválidos"
}
```

---

### 3.3 `DELETE /api/v1/logout` — Cerrar sesión

- **Autenticación:** Requerida (`Authorization: Bearer <token>`).
- **Permisos / Restricciones:** Invalida exclusivamente la sesión asociada al token enviado.

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Valores admitidos |
|---|---|---|---|---|
| Header | `Authorization` | `string` | Sí | `Bearer <token>` |

#### Respuesta exitosa
- `204 No Content` — Sin cuerpo en la respuesta.

#### Respuestas de error
- `401 Unauthorized`: `{ "error": "No autorizado" }` (si el header falta o el token ya fue invalidado).

#### Ejemplos reproducibles
```bash
curl -i -X DELETE http://localhost:3000/api/v1/logout \
  -H "Authorization: Bearer <TOKEN>"
# HTTP/1.1 204 No Content
```
```json
// 401 Unauthorized (token ausente o ya cerrado)
{
  "error": "No autorizado"
}
```

---

### 3.4 `GET /api/v1/profile` — Consultar perfil autenticado

- **Autenticación:** Requerida (`Authorization: Bearer <token>`).
- **Permisos / Restricciones:** Devuelve únicamente el perfil del dueño del token. El front-end usa `id` para determinar autoría de reseñas (`review.user_id === user.id`).

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Valores admitidos |
|---|---|---|---|---|
| Header | `Authorization` | `string` | Sí | `Bearer <token>` |

#### Respuesta exitosa (`200 OK`)
| Campo | Tipo | Significado |
|---|---|---|
| `id` | `integer` | ID del usuario autenticado |
| `name` | `string` | Nombre visible |
| `email` | `string` | Email registrado |

#### Respuestas de error
- `401 Unauthorized`: `{ "error": "No autorizado" }`.

#### Ejemplos reproducibles
```bash
curl -i http://localhost:3000/api/v1/profile \
  -H "Authorization: Bearer <TOKEN>"
```
```json
// 200 OK
{
  "id": 2,
  "name": "Usuario Demo",
  "email": "usuario@example.com"
}
```
```json
// 401 Unauthorized (sin token)
{
  "error": "No autorizado"
}
```

---

## 4. Restaurantes

### 4.1 `GET /api/v1/restaurants` — Listar restaurantes

- **Autenticación:** No requerida (público).
- **Permisos / Restricciones:** Acceso abierto. Devuelve todos los restaurantes ordenados alfabéticamente por `name`. No admite parámetros de consulta ni paginación en el servidor.

#### Datos de entrada
- Sin parámetros de ruta, query ni body.

#### Respuesta exitosa (`200 OK`) — Array de objetos
| Campo | Tipo | Opcional / Nullable | Significado |
|---|---|---|---|
| `id` | `integer` | No | Identificador único del restaurante |
| `name` | `string` | No | Nombre comercial del local |
| `address` | `string \| null` | Nullable en DB | Dirección del local |
| `category` | `string \| null` | String plano | Nombre de la categoría (no es objeto ni ID) |
| `photo_url` | `string \| null` | Opcional (`null`) | URL absoluta de ActiveStorage si tiene foto adjunta; `null` si no tiene |

#### Respuestas de error
- No aplica en condiciones normales (`200 []` si no hay restaurantes cargados).

#### Ejemplos reproducibles
```bash
curl -i http://localhost:3000/api/v1/restaurants
```
```json
// 200 OK
[
  {
    "id": 3,
    "name": "Café Botánico",
    "address": "Diagonal 74 nº 1482, La Plata",
    "category": "Cafetería",
    "photo_url": "http://localhost:3000/rails/active_storage/blobs/redirect/.../cafe-botanico.jpg"
  },
  {
    "id": 1,
    "name": "Don Mario",
    "address": "Calle 7 nº 123, La Plata",
    "category": "Pizzería",
    "photo_url": null
  }
]
```

---

### 4.2 `GET /api/v1/restaurants/:id` — Detalle de un restaurante

- **Autenticación:** No requerida (público).
- **Permisos / Restricciones:** Acceso abierto.

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|---|
| Ruta (Path) | `id` | `integer` | Sí | Debe corresponder a un restaurante existente |

#### Respuesta exitosa (`200 OK`)
Misma estructura de objeto que cada elemento de `GET /api/v1/restaurants` (`id`, `name`, `address`, `category`, `photo_url`).

#### Respuestas de error
- `404 Not Found`: `{ "error": "No encontrado" }`.

#### Ejemplos reproducibles
```bash
# Petición exitosa
curl -i http://localhost:3000/api/v1/restaurants/1
```
```json
// 200 OK
{
  "id": 1,
  "name": "Don Mario",
  "address": "Calle 7 nº 123, La Plata",
  "category": "Pizzería",
  "photo_url": null
}
```
```bash
# Error: restaurante inexistente
curl -i http://localhost:3000/api/v1/restaurants/9999
```
```json
// 404 Not Found
{
  "error": "No encontrado"
}
```

---

## 5. Reseñas (`reviews`)

### 5.1 `GET /api/v1/restaurants/:restaurant_id/reviews` — Listar reseñas de un restaurante

- **Autenticación:** No requerida (público).
- **Permisos / Restricciones:** Devuelve las reseñas del restaurante ordenadas de más reciente a más antigua (`created_at DESC`).

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Validaciones |
|---|---|---|---|---|
| Ruta (Path) | `restaurant_id` | `integer` | Sí | Debe existir el restaurante; si no, `404` |

#### Respuesta exitosa (`200 OK`) — Array de objetos
| Campo | Tipo | Significado |
|---|---|---|
| `id` | `integer` | ID de la reseña |
| `restaurant_id` | `integer` | ID del restaurante reseñado |
| `user_id` | `integer` | ID del usuario autor (el front lo compara con `/profile` para habilitar Editar/Eliminar) |
| `user_name` | `string` | Nombre del autor (`review.user.name`) |
| `rating` | `integer` | Puntuación entera entre `1` y `5` |
| `comment` | `string` | Texto de la reseña |
| `created_at` | `string` | Fecha y hora de creación en formato ISO 8601 UTC |

#### Respuestas de error
- `404 Not Found`: `{ "error": "No encontrado" }` si `restaurant_id` no existe.

#### Ejemplos reproducibles
```bash
curl -i http://localhost:3000/api/v1/restaurants/1/reviews
```
```json
// 200 OK
[
  {
    "id": 42,
    "restaurant_id": 1,
    "user_id": 3,
    "user_name": "Camila Crítica",
    "rating": 5,
    "comment": "La fugazzeta rellena rebalsa de queso.",
    "created_at": "2026-11-04T19:15:00.000Z"
  }
]
```
```json
// 404 Not Found (restaurante inexistente)
{
  "error": "No encontrado"
}
```

---

### 5.2 `POST /api/v1/restaurants/:restaurant_id/reviews` — Crear una reseña

- **Autenticación:** Requerida (`Authorization: Bearer <token>`).
- **Permisos / Restricciones:** Cualquier usuario autenticado puede publicar una o más reseñas en un restaurante. El cuerpo debe estar **anidado** bajo `review`.

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Valores admitidos / Validaciones |
|---|---|---|---|---|
| Ruta (Path) | `restaurant_id` | `integer` | Sí | Restaurante existente |
| Header | `Authorization` | `string` | Sí | `Bearer <token>` |
| Header | `Content-Type` | `string` | Sí | `application/json` |
| Body (anidado) | `review.rating` | `integer` | Sí | Entero entre `1` y `5` inclusive (`inclusion: { in: 1..5 }`) |
| Body (anidado) | `review.comment` | `string` | Sí | Obligatorio, no vacío (`presence: true`) |

#### Respuesta exitosa (`201 Created`)
Devuelve el objeto reseña creado (`id`, `restaurant_id`, `user_id`, `user_name`, `rating`, `comment`, `created_at`).

#### Respuestas de error
- `401 Unauthorized`: `{ "error": "No autorizado" }` (sin token o token inválido).
- `404 Not Found`: `{ "error": "No encontrado" }` (si `restaurant_id` no existe).
- `422 Unprocessable Entity`: `{ "errors": ["..."] }` (rating fuera de `1..5` o comentario vacío).

#### Ejemplos reproducibles
```bash
# Petición exitosa
curl -i -X POST http://localhost:3000/api/v1/restaurants/1/reviews \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"review":{"rating":5,"comment":"Excelente atención y comida."}}'
```
```json
// 201 Created
{
  "id": 128,
  "restaurant_id": 1,
  "user_id": 2,
  "user_name": "Usuario Demo",
  "rating": 5,
  "comment": "Excelente atención y comida.",
  "created_at": "2026-11-04T20:10:12.411Z"
}
```
```bash
# Error 422: rating fuera de rango y comentario vacío
curl -i -X POST http://localhost:3000/api/v1/restaurants/1/reviews \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"review":{"rating":9,"comment":""}}'
```
```json
// 422 Unprocessable Entity
{
  "errors": [
    "Rating is not included in the list",
    "Comment can't be blank"
  ]
}
```

---

### 5.3 `PATCH /api/v1/reviews/:id` — Editar una reseña propia

- **Autenticación:** Requerida (`Authorization: Bearer <token>`).
- **Permisos / Restricciones:** **Solo el autor** de la reseña puede editarla. El servidor busca sobre `current_user.reviews.find(params[:id])`, por lo que si pertenece a otro usuario responde `404 Not Found` (no `403`).

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Valores admitidos / Validaciones |
|---|---|---|---|---|
| Ruta (Path) | `id` | `integer` | Sí | ID de la reseña |
| Header | `Authorization` | `string` | Sí | `Bearer <token>` del autor |
| Header | `Content-Type` | `string` | Sí | `application/json` |
| Body (anidado) | `review.rating` | `integer` | Opcional en PATCH, requerido si se envía | Entero entre `1` y `5` |
| Body (anidado) | `review.comment` | `string` | Opcional en PATCH, requerido si se envía | No vacío |

#### Respuesta exitosa (`200 OK`)
Devuelve la reseña actualizada (`id`, `restaurant_id`, `user_id`, `user_name`, `rating`, `comment`, `created_at`).

#### Respuestas de error
- `401 Unauthorized`: `{ "error": "No autorizado" }`.
- `404 Not Found`: `{ "error": "No encontrado" }` (reseña inexistente o perteneciente a otro usuario).
- `422 Unprocessable Entity`: `{ "errors": ["..."] }` (validación fallida).

#### Ejemplos reproducibles
```bash
curl -i -X PATCH http://localhost:3000/api/v1/reviews/128 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"review":{"rating":4,"comment":"Muy rico, editado."}}'
```
```json
// 200 OK
{
  "id": 128,
  "restaurant_id": 1,
  "user_id": 2,
  "user_name": "Usuario Demo",
  "rating": 4,
  "comment": "Muy rico, editado.",
  "created_at": "2026-11-04T20:10:12.411Z"
}
```
```json
// 404 Not Found (reseña de otro usuario o inexistente)
{
  "error": "No encontrado"
}
```

---

### 5.4 `DELETE /api/v1/reviews/:id` — Eliminar una reseña propia

- **Autenticación:** Requerida (`Authorization: Bearer <token>`).
- **Permisos / Restricciones:** **Solo el autor** de la reseña puede eliminarla (`current_user.reviews.find`). Si pertenece a otro usuario responde `404 Not Found`.

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Valores admitidos |
|---|---|---|---|---|
| Ruta (Path) | `id` | `integer` | Sí | ID de la reseña |
| Header | `Authorization` | `string` | Sí | `Bearer <token>` del autor |

#### Respuesta exitosa
- `204 No Content` — Sin cuerpo.

#### Respuestas de error
- `401 Unauthorized`: `{ "error": "No autorizado" }`.
- `404 Not Found`: `{ "error": "No encontrado" }` (reseña ajena o inexistente).

#### Ejemplos reproducibles
```bash
curl -i -X DELETE http://localhost:3000/api/v1/reviews/128 \
  -H "Authorization: Bearer <TOKEN>"
# HTTP/1.1 204 No Content
```
```json
// 404 Not Found
{
  "error": "No encontrado"
}
```

---

## 6. Favoritos (`favorites`)

### 6.1 `GET /api/v1/favorites` — Listar favoritos del usuario

- **Autenticación:** Requerida (`Authorization: Bearer <token>`).
- **Permisos / Restricciones:** Devuelve exclusivamente los favoritos de `current_user`.

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Valores admitidos |
|---|---|---|---|---|
| Header | `Authorization` | `string` | Sí | `Bearer <token>` |

#### Respuesta exitosa (`200 OK`) — Array de objetos
| Campo | Tipo | Significado |
|---|---|---|
| `id` | `integer` | ID del registro de favorito |
| `restaurant_id` | `integer` | ID del restaurante guardado |
| `restaurant_name` | `string` | Nombre del restaurante |
| `restaurant_address` | `string \| null` | Dirección del restaurante |

> *Nota de integración:* Como este payload no incluye `category` ni `photo_url`, la pantalla `/favorites` cruza `restaurant_id` con el listado cacheado de `GET /api/v1/restaurants`.

#### Respuestas de error
- `401 Unauthorized`: `{ "error": "No autorizado" }`.

#### Ejemplos reproducibles
```bash
curl -i http://localhost:3000/api/v1/favorites \
  -H "Authorization: Bearer <TOKEN>"
```
```json
// 200 OK
[
  {
    "id": 1,
    "restaurant_id": 1,
    "restaurant_name": "Don Mario",
    "restaurant_address": "Calle 7 nº 123, La Plata"
  }
]
```
```json
// 401 Unauthorized
{
  "error": "No autorizado"
}
```

---

### 6.2 `POST /api/v1/favorites` — Agregar restaurante a favoritos

- **Autenticación:** Requerida (`Authorization: Bearer <token>`).
- **Permisos / Restricciones:** Operación **idempotente** (`find_or_initialize_by`): repetir la llamada para el mismo usuario y restaurante no duplica el favorito (respaldado además por índice único en PostgreSQL) y responde `201 Created`.

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Valores admitidos / Validaciones |
|---|---|---|---|---|
| Header | `Authorization` | `string` | Sí | `Bearer <token>` |
| Header | `Content-Type` | `string` | Sí | `application/json` |
| Body (JSON plano) | `restaurant_id` | `integer` | Sí | ID de un restaurante existente |

#### Respuesta exitosa (`201 Created`)
Devuelve el favorito (`id`, `restaurant_id`, `restaurant_name`, `restaurant_address`).

#### Respuestas de error
- `401 Unauthorized`: `{ "error": "No autorizado" }`.
- `404 Not Found`: `{ "error": "No encontrado" }` si `restaurant_id` no existe.

#### Ejemplos reproducibles
```bash
curl -i -X POST http://localhost:3000/api/v1/favorites \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"restaurant_id":3}'
```
```json
// 201 Created
{
  "id": 5,
  "restaurant_id": 3,
  "restaurant_name": "Café Botánico",
  "restaurant_address": "Diagonal 74 nº 1482, La Plata"
}
```
```json
// 404 Not Found (restaurante inexistente)
{
  "error": "No encontrado"
}
```

---

### 6.3 `DELETE /api/v1/favorites/:restaurant_id` — Quitar restaurante de favoritos

- **Autenticación:** Requerida (`Authorization: Bearer <token>`).
- **Permisos / Restricciones:** Elimina el favorito del usuario autenticado buscando por `restaurant_id` (**no** por el `id` del registro favorito).

#### Datos de entrada
| Ubicación | Campo | Tipo | Obligatorio | Valores admitidos |
|---|---|---|---|---|
| Ruta (Path) | `restaurant_id` | `integer` | Sí | ID del restaurante a quitar |
| Header | `Authorization` | `string` | Sí | `Bearer <token>` |

#### Respuesta exitosa
- `204 No Content` — Sin cuerpo.

#### Respuestas de error
- `401 Unauthorized`: `{ "error": "No autorizado" }`.
- `404 Not Found`: `{ "error": "No encontrado" }` si el restaurante no estaba guardado en los favoritos del usuario.

#### Ejemplos reproducibles
```bash
curl -i -X DELETE http://localhost:3000/api/v1/favorites/3 \
  -H "Authorization: Bearer <TOKEN>"
# HTTP/1.1 204 No Content
```
```json
// 404 Not Found (no estaba en favoritos)
{
  "error": "No encontrado"
}
```

---

## 7. Notas de integración y brechas conocidas

| Limitación en la API actual | Cómo lo resuelve el front-end hoy | Mejora futura recomendada en back-end |
|---|---|---|
| Sin `rack-cors` configurado | Proxy de Vite (`/api` → `http://localhost:3000`) usando ruta relativa `VITE_API_URL=/api/v1`. | Agregar `gem "rack-cors"` y `config/initializers/cors.rb` para habilitar deploy separado. |
| Sin `average_rating` ni `reviews_count` en `/restaurants` | Patrón N+1 en cliente con `useQueries` sobre `['reviews', id]` (paralelo y cacheado en TanStack Query). | Incluir `average_rating` y `reviews_count` en el JSON de `/restaurants` (y `?sort=rating`). |
| Sin endpoint `GET /categories` ni filtros server-side | Categorías únicas derivadas, búsqueda por nombre y ordenamiento calculados en el cliente. | Exponer `GET /api/v1/categories` y query params opcionales. |
| Favoritos sin `category` ni `photo_url` | Cruce por `restaurant_id` contra `['restaurants']` cacheado. | Incluir `category` y `photo_url` en `favorite_json`. |
| `photo_url` puede ser `null` | Fallback visual con foto representativa por restaurante/categoría e ícono temático. | Mantener fotos adjuntas en ActiveStorage (ya incluido en `db/seeds.rb`). |
| Mensajes `422` en inglés (`en.yml`) | El front-end muestra `errors[]` tal cual los devuelve la API y valida campos vacíos en español en el cliente. | Configurar `config.i18n.default_locale = :es` en Rails. |
| Gamificación *Pase Petite Critique* (50 reseñas / 3 estrellas + Ruleta) | El progreso real se calcula contando las reseñas del usuario obtenidas desde `/restaurants/:id/reviews`; los cupones ganados y el simulador de demo se guardan en el cliente (`localStorage`). | Persistir cupones/canjes en el back-end si se desea llevarlo a producción. |
