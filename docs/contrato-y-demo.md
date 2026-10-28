# Verificación del contrato y guion de demo

## 1. Verificación del contrato contra el back real

El contrato fue verificado contra el backend real corriendo en `http://localhost:3000/api/v1` con PostgreSQL 18 y los seeds cargados (`Don Mario` y `La Estancia`).

Con el back corriendo en `localhost:3000`:

```bash
B=http://localhost:3000/api/v1
curl -s $B/restaurants
curl -s -i $B/restaurants/999                         # esperado 404 {"error":"No encontrado"}
curl -s -X POST $B/login -H 'Content-Type: application/json' \
  -d '{"email":"usuario@example.com","password":"usuario1234"}'   # 201 {token,user}
curl -s -i -X POST $B/login -H 'Content-Type: application/json' \
  -d '{"email":"x@x.com","password":"mal"}'            # 401 {"error":"Email o contraseña inválidos"}
TOKEN=<token>
curl -s $B/profile -H "Authorization: Bearer $TOKEN"
curl -s -X POST $B/restaurants/1/reviews -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"review":{"rating":5,"comment":"Excelente"}}'
curl -s -i -X POST $B/restaurants/1/reviews -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"review":{"rating":9,"comment":""}}'   # 422 {errors:[...]}
curl -s -X POST $B/favorites -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"restaurant_id":1}'
curl -s $B/favorites -H "Authorization: Bearer $TOKEN"
curl -s -i -X DELETE $B/favorites/1 -H "Authorization: Bearer $TOKEN"             # 204
curl -s -i -X DELETE $B/logout -H "Authorization: Bearer $TOKEN"                  # 204
```

| Verificar | Supuesto del front | ¿OK? |
|---|---|---|
| `/restaurants` devuelve `{id,name,address,category,photo_url}` con `category` string | sí | ☐ |
| `rating` llega como entero y `created_at` como ISO 8601 | sí | ☐ |
| `POST /favorites` con restaurante inexistente (404 o 422) | se muestra el mensaje tal cual | ☐ |
| 422 de `POST /users` (email duplicado, password corta) usa `errors: []` | sí | ☐ |
| Editar/borrar reseña ajena responde 404 | se muestra el mensaje en un toast | ☐ |
| CORS (si se prueba sin proxy) | falla hasta que exista `rack-cors` | ☐ |

## 2. Guion de demo (API real)

Preparación: back con seeds, front con `npm run dev`. Para ver ranking con datos, crear 2–3 reseñas antes.

1. **Registro + login automático:** `/register` → crear cuenta → queda logueado/a (encadena `POST /users` + `POST /login`).
2. **Ranking:** `/` muestra tarjetas ordenadas por promedio; buscar "mario" y filtrar por categoría.
3. **Flujo que persiste:** entrar a un restaurante → reseñar con 5 estrellas y comentario → toast de éxito → **recargar (F5)** y verificar que la reseña sigue ahí. Marcar favorito (corazón) → ir a `/favorites` → **recargar** y verificar.
4. **Escenario de error:**
   - Cerrar sesión e intentar ingresar con contraseña incorrecta → "Email o contraseña inválidos".
   - Reseña con comentario vacío → validación local; si se fuerza un rating inválido desde el back, se muestra el `errors[]` del 422.
5. **Extras:** editar y eliminar la reseña propia (con confirmación); entrar a `/favorites` sin sesión → redirige a `/login` y vuelve tras autenticarse; URL inexistente → 404 amigable; navegar solo con teclado.
6. **Logout:** botón "Salir" → `DELETE /logout`, vuelve el estado anónimo.

