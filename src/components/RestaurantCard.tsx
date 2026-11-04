import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { formatAverage } from '../lib/ratings'
import type { RatingEntry } from '../hooks/useRestaurantRatings'
import type { Restaurant } from '../types/api'
import { FavoriteButton } from './FavoriteButton'
import { RestaurantPhoto } from './RestaurantPhoto'
import { StarRating } from './StarRating'

const PODIUM_BADGE: Record<number, string> = {
  1: 'bg-amber-400 text-amber-950 border-amber-500',
  2: 'bg-slate-200 text-slate-900 border-slate-400',
  3: 'bg-orange-200 text-orange-950 border-orange-400',
}

export function RestaurantCard({
  restaurant,
  rating,
  position,
  extra,
}: {
  restaurant: Restaurant
  rating?: RatingEntry
  position?: number
  /** Acciones extra (p. ej. "Quitar" en favoritos) */
  extra?: ReactNode
}) {
  const podiumStyle = position ? PODIUM_BADGE[position] : undefined

  return (
    <li className="group relative flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-amber-300 hover:shadow-md">
      <div className="relative shrink-0">
        <RestaurantPhoto
          url={restaurant.photo_url}
          name={restaurant.name}
          category={restaurant.category}
          className="h-24 w-24 rounded-xl sm:h-28 sm:w-28"
        />
        {position !== undefined && (
          <span
            className={`absolute -left-1.5 -top-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-extrabold shadow-sm ${
              podiumStyle ?? 'border-slate-300 bg-white text-slate-800'
            }`}
          >
            {position === 1 ? '🥇 #1' : position === 2 ? '🥈 #2' : position === 3 ? '🥉 #3' : `#${position}`}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 pr-10">
            <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
              {restaurant.category}
            </span>
          </div>
          <h3 className="mt-1 truncate pr-10 text-lg font-bold text-slate-900">
            <Link to={`/restaurants/${restaurant.id}`} className="hover:text-amber-800 hover:underline">
              {restaurant.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-600 sm:text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">{restaurant.address}</span>
          </p>
        </div>

        {rating && (
          <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-slate-700">
            {rating.isLoading ? (
              <span className="h-4 w-32 animate-pulse rounded bg-slate-200" aria-label="Cargando puntaje" />
            ) : rating.isError ? (
              <span>Puntaje no disponible</span>
            ) : (
              <>
                <StarRating value={rating.average} />
                <span className="font-bold text-slate-900">{formatAverage(rating.average)}</span>
                <span className="text-xs text-slate-600">
                  ({rating.count} {rating.count === 1 ? 'reseña' : 'reseñas'})
                </span>
              </>
            )}
          </div>
        )}
        {extra}
      </div>
      <div className="absolute right-3 top-3">
        <FavoriteButton restaurant={restaurant} />
      </div>
    </li>
  )
}
