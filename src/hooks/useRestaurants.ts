import { useQuery } from '@tanstack/react-query'
import { getRestaurant, getRestaurants } from '../api/restaurants'

export function useRestaurants() {
  return useQuery({ queryKey: ['restaurants'], queryFn: getRestaurants })
}

export function useRestaurant(id: number) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurant(id),
    enabled: Number.isInteger(id) && id > 0,
    retry: (count, error) => !(error instanceof Error && 'status' in error && error.status === 404) && count < 2,
  })
}

