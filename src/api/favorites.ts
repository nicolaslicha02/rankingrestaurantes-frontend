import { apiFetch } from './client'
import type { Favorite } from '../types/api'

// TODO(backend): incluir category y photo_url en el payload de favoritos para no cruzar con /restaurants.
export const getFavorites = () => apiFetch<Favorite[]>('/favorites')

export const addFavorite = (restaurantId: number) =>
  apiFetch<Favorite>('/favorites', { method: 'POST', body: { restaurant_id: restaurantId } })

/** Ojo: el parámetro es el id del RESTAURANTE, no del favorito. */
export const removeFavorite = (restaurantId: number) =>
  apiFetch<void>(`/favorites/${restaurantId}`, { method: 'DELETE' })

