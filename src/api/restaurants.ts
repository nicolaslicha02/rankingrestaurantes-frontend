import { apiFetch } from './client'
import type { Restaurant } from '../types/api'

// TODO(backend): agregar average_rating y reviews_count al JSON (y opcionalmente ?sort=rating)
// para evitar el patrón N+1 de reseñas que hace el front.
export const getRestaurants = () => apiFetch<Restaurant[]>('/restaurants')

export const getRestaurant = (id: number) => apiFetch<Restaurant>(`/restaurants/${id}`)

