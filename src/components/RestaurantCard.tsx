import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatAverage } from '../lib/ratings'
import type { RatingEntry } from '../hooks/useRestaurantRatings'
import type { Restaurant } from '../types/api'
import { FavoriteButton } from './FavoriteButton'
import { RestaurantPhoto } from './RestaurantPhoto'
import { StarRating } from './StarRating'

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
  return (
    <li className="relative flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <RestaurantPhoto
        url={restaurant.photo_url}
        name={restaurant.name}
        className="h-24 w-24 shrink-0 rounded-lg sm:h-28 sm:w-28"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="truncate pr-12 text-lg font-semibold text-slate-900">
            {position !== undefined && <span className="mr-2 text-amber-700">#{position}</span>}
            <Link
              to={`/restaurants/${restaurant.id}`}
              className="hover:underline"
            >
              {restaurant.name}
            </Link>
          </h3>
          <p className="text-sm text-slate-700">{restaurant.category}</p>
          <p className="truncate text-sm text-slate-600">{restaurant.address}</p>
        </div>
        {rating && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-700">
            {rating.isLoading ? (
              <span className="h-4 w-32 animate-pulse rounded bg-slate-200" aria-label="Cargando puntaje" />
            ) : rating.isError ? (
              <span>Puntaje no disponible</span>
            ) : (
              <>
                <StarRating value={rating.average} />
                <span className="font-medium">{formatAverage(rating.average)}</span>
                <span>
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
