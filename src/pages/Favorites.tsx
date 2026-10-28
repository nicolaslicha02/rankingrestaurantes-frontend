import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { RestaurantCard } from '../components/RestaurantCard'
import { CardListSkeleton } from '../components/Skeletons'
import { EmptyState, ErrorState } from '../components/States'
import { useToast } from '../components/useToast'
import { useFavorites, useToggleFavorite } from '../hooks/useFavorites'
import { useRestaurantRatings } from '../hooks/useRestaurantRatings'
import { useRestaurants } from '../hooks/useRestaurants'
import { errorMessage } from '../lib/ratings'
import type { Restaurant } from '../types/api'

const NO_RESTAURANTS: Restaurant[] = []

export function Favorites() {
  const favorites = useFavorites()
  const restaurantsQuery = useRestaurants()
  const toggle = useToggleFavorite()
  const { showToast } = useToast()
  const [removing, setRemoving] = useState<Restaurant | null>(null)

  // El payload de favoritos no trae foto ni categoría: se cruza con /restaurants (cacheado).
  // TODO(backend): incluir category y photo_url en /favorites.
  const restaurants = restaurantsQuery.data ?? NO_RESTAURANTS
  const favoriteRestaurants = (favorites.data ?? [])
    .map((f) => restaurants.find((r) => r.id === f.restaurant_id))
    .filter((r): r is Restaurant => r !== undefined)
  const ratings = useRestaurantRatings(favoriteRestaurants)

  const loading = favorites.isPending || restaurantsQuery.isPending
  const error = favorites.error ?? restaurantsQuery.error

  const confirmRemove = () => {
    if (!removing) return
    const target = removing
    setRemoving(null)
    toggle.mutate(
      { restaurant: target, add: false },
      {
        onSuccess: () => showToast(`Quitaste ${target.name} de favoritos.`, 'success'),
        onError: (e) => showToast(e.message, 'error'),
      },
    )
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Mis favoritos</h1>
      {loading ? (
        <CardListSkeleton count={2} />
      ) : error ? (
        <ErrorState
          message={errorMessage(error)}
          onRetry={() => {
            void favorites.refetch()
            void restaurantsQuery.refetch()
          }}
          retrying={favorites.isFetching || restaurantsQuery.isFetching}
        />
      ) : favoriteRestaurants.length === 0 ? (
        <EmptyState
          title="Todavía no guardaste favoritos"
          description="Tocá el corazón de un restaurante para verlo acá."
          action={
            <Link to="/" className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
              Ver el ranking
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2" aria-label="Favoritos">
          {favoriteRestaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              rating={ratings.get(r.id)}
              extra={
                <button
                  type="button"
                  onClick={() => setRemoving(r)}
                  className="mt-2 inline-flex w-fit items-center gap-1 rounded-lg border border-red-300 px-3 py-1 text-sm text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Quitar
                  <span className="sr-only"> {r.name} de favoritos</span>
                </button>
              }
            />
          ))}
        </ul>
      )}
      {removing && (
        <ConfirmDialog
          title="¿Quitar de favoritos?"
          confirmLabel="Quitar"
          onConfirm={confirmRemove}
          onCancel={() => setRemoving(null)}
        >
          Vas a quitar <strong>{removing.name}</strong> de tus favoritos.
        </ConfirmDialog>
      )}
    </div>
  )
}

