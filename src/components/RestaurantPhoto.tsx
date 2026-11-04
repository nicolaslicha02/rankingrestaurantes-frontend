import { useState } from 'react'
import {
  Beer,
  Coffee,
  Flame,
  IceCreamCone,
  Pizza,
  Sandwich,
  Soup,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react'

/** Fotos únicas por restaurante para que cada local tenga su propia imagen distintiva. */
const RESTAURANT_PHOTOS: Record<string, string> = {
  'Don Mario': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  'Nápoles al Corte': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
  'La Estancia': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  'Fuego & Brasas': 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
  'Café Botánico': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  'Tostado & Co. Roasters': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
  'Moka Petite Café': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
  'Smash Lab Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'Doble Cheddar Club': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
  'Bronx Burger Joint': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  'El Rey del Pancho': 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80',
  'Pancho Villa Gourmet': 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&w=800&q=80',
  'Super Pancho 74': 'https://images.unsplash.com/photo-1627054234097-0b15d1f3006d?auto=format&fit=crop&w=800&q=80',
  'Gran Palacio Libre': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'El Banquete Sin Fin': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'Lo de Nono Bodegón': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=800&q=80',
  "Lucciano's Gelato": 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
  'Osaka Nikkei Bar': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  'Lúpulo Platense': 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80',
}

const CATEGORY_PHOTOS: Record<string, string> = {
  Cafetería: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  Hamburguesería: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  Panchería: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80',
  'Tenedor Libre': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  Parrilla: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  Pizzería: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  Bodegón: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=800&q=80',
  Heladería: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
  'Sushi & Nikkei': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  'Cervecería Artesanal': 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80',
}

function renderCategoryIcon(category?: string) {
  const cls = 'h-1/3 w-1/3'
  switch (category) {
    case 'Cafetería':
      return <Coffee className={cls} aria-hidden="true" />
    case 'Hamburguesería':
    case 'Panchería':
      return <Sandwich className={cls} aria-hidden="true" />
    case 'Parrilla':
      return <Flame className={cls} aria-hidden="true" />
    case 'Pizzería':
      return <Pizza className={cls} aria-hidden="true" />
    case 'Heladería':
      return <IceCreamCone className={cls} aria-hidden="true" />
    case 'Cervecería Artesanal':
      return <Beer className={cls} aria-hidden="true" />
    case 'Tenedor Libre':
      return <UtensilsCrossed className={cls} aria-hidden="true" />
    case 'Bodegón':
      return <Soup className={cls} aria-hidden="true" />
    default:
      return <Utensils className={cls} aria-hidden="true" />
  }
}

export function RestaurantPhoto({
  url,
  name,
  category,
  className = '',
}: {
  url: string | null
  name: string
  category?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  // Prioridad: 1) photo_url de la API (/admin), 2) foto específica del restaurante, 3) foto de su categoría.
  const effectiveUrl =
    url ?? RESTAURANT_PHOTOS[name] ?? (category ? CATEGORY_PHOTOS[category] : undefined) ?? null

  if (!effectiveUrl || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-amber-100 to-orange-200 text-amber-900 ${className}`}
        role="img"
        aria-label={`Ilustración de ${name}`}
      >
        {renderCategoryIcon(category)}
      </div>
    )
  }
  return (
    <img
      src={effectiveUrl}
      alt={`Foto de ${name}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}
