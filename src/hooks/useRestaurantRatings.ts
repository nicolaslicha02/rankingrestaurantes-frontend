import { useQueries } from '@tanstack/react-query'
import { getReviews } from '../api/reviews'
import { summarizeReviews, type RatingSummary } from '../lib/ratings'
import type { Restaurant, Review } from '../types/api'

export interface RatingEntry extends RatingSummary {
  isLoading: boolean
  isError: boolean
  reviews: Review[]
}

/**
 * Promedio y cantidad por restaurante calculados en el cliente.
 * TODO(backend): patrón N+1 (un GET /reviews por restaurante). Reemplazar por
 * average_rating y reviews_count en GET /restaurants cuando el back los exponga.
 * Comparte la clave ['reviews', id] con el detalle, así que la caché se reutiliza.
 */
export function useRestaurantRatings(restaurants: Restaurant[]): Map<number, RatingEntry> {
  const results = useQueries({
    queries: restaurants.map((r) => ({
      queryKey: ['reviews', r.id],
      queryFn: () => getReviews(r.id),
      staleTime: 30_000,
    })),
  })

  const map = new Map<number, RatingEntry>()
  restaurants.forEach((r, i) => {
    const result = results[i]
    const reviews = result?.data ?? []
    const summary = summarizeReviews(reviews)
    map.set(r.id, {
      ...summary,
      reviews,
      isLoading: result?.isPending ?? true,
      isError: result?.isError ?? false,
    })
  })
  return map
}
