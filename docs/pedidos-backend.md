# Pedidos al back-end (para el front del TP2)

Prioridad: 🔴 bloqueante · 🟠 alta · 🟡 opcional

## 🔴 1. CORS (`rack-cors`)
Sin esto el front desplegado (y en dev sin proxy) falla en el navegador.

```ruby
# Gemfile
gem "rack-cors"

# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
    resource "/api/*",
      headers: %w[Authorization Content-Type],
      methods: %i[get post patch delete options],
      expose: %w[Authorization]
  end
end
```
`FRONTEND_ORIGINS` = origen local + URL del deploy del front (sin barra final).

## 🟠 2. `average_rating` y `reviews_count` en restaurantes
Hoy el front hace N+1 (un `GET /reviews` por restaurante). Pedido para `GET /restaurants` y `GET /restaurants/:id`:

```json
{ "id": 1, "name": "Don Mario", "address": "Calle 1", "category": "Pizzería",
  "photo_url": null, "average_rating": 4.5, "reviews_count": 12 }
```
- Sin reseñas: `"average_rating": null, "reviews_count": 0`.
- Opcional: `GET /restaurants?sort=rating` (promedio desc).

## 🟡 3. Opcionales
- `GET /categories` → `200 [{ "id": 1, "name": "Pizzería" }]`.
- Favoritos con más datos:
```json
{ "id": 5, "restaurant_id": 1, "restaurant_name": "Don Mario",
  "restaurant_address": "Calle 1", "category": "Pizzería", "photo_url": null }
```

## 🟠 4. Documentación del contrato
README/Markdown u OpenAPI que cubra **todos** los endpoints, por cada uno: método, ruta, auth, params/headers/body (tipo y obligatoriedad), respuesta OK (código + estructura), errores (401/404/422 con ejemplo), y un `curl` reproducible. Incluir los nuevos campos de arriba.

Puntos a confirmar: formato de `created_at`; `POST /favorites` con restaurante inexistente; 422 de `POST /users` (email duplicado, password corta); si `/restaurants/:id` devuelve los mismos campos que el listado.

## 🟡 5. Seeds para la demo
Más restaurantes (≥6, varias categorías), usuarios de prueba, 2–3 reseñas por restaurante con ratings variados, y algunas fotos (`photo_url` no nulo).

