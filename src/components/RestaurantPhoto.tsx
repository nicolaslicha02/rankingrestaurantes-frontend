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

const CATEGORY_PHOTOS: Record<string, string> = {
  Cafetería: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
  Hamburguesería: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  Panchería: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80',
  'Tenedor Libre': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  Parrilla: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  Pizzería: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  Bodegón: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=600&q=80',
  Heladería: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
  'Sushi & Nikkei': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
  'Cervecería Artesanal': 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=600&q=80',
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
  // TODO(backend): los seeds no adjuntan fotos en ActiveStorage; si photo_url viene null,
  // mostramos una foto representativa de la categoría o un placeholder temático.
  const effectiveUrl = url ?? (category ? CATEGORY_PHOTOS[category] : undefined) ?? null

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
