import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addFavorite, getFavorites, removeFavorite } from '../api/favorites'
import { useAuth } from '../auth/useAuth'
import type { Favorite, Restaurant } from '../types/api'

export function useFavorites() {
  const { status } = useAuth()
  return useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: status === 'authenticated',
  })
}

interface ToggleVars {
  restaurant: Pick<Restaurant, 'id' | 'name' | 'address'>
  /** true = agregar, false = quitar */
  add: boolean
}

/** Agregar/quitar favorito con actualización optimista y rollback si falla. */
export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ restaurant, add }: ToggleVars): Promise<void> => {
      if (add) await addFavorite(restaurant.id)
      else await removeFavorite(restaurant.id)
    },
    onMutate: async ({ restaurant, add }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const previous = queryClient.getQueryData<Favorite[]>(['favorites'])
      queryClient.setQueryData<Favorite[]>(['favorites'], (current = []) => {
        if (!add) return current.filter((f) => f.restaurant_id !== restaurant.id)
        if (current.some((f) => f.restaurant_id === restaurant.id)) return current
        // id provisorio negativo hasta que el servidor confirme.
        return [
          ...current,
          {
            id: -restaurant.id,
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.name,
            restaurant_address: restaurant.address,
          },
        ]
      })
      return { previous }
    },
    onError: (_error, _vars, context) => {
      queryClient.setQueryData(['favorites'], context?.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })
}
