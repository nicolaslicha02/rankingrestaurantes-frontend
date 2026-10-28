import { useMemo, useState } from 'react'
import { CardListSkeleton } from '../components/Skeletons'
import { CategoryFilter } from '../components/CategoryFilter'
import { EmptyState, ErrorState } from '../components/States'
import { RestaurantCard } from '../components/RestaurantCard'
import { SearchBar } from '../components/SearchBar'
import { useRestaurantRatings } from '../hooks/useRestaurantRatings'
import { useRestaurants } from '../hooks/useRestaurants'
import { errorMessage } from '../lib/ratings'
import type { Restaurant } from '../types/api'

const NO_RESTAURANTS: Restaurant[] = []

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function Home() {
  const query = useRestaurants()
  const restaurants = query.data ?? NO_RESTAURANTS
  const ratings = useRestaurantRatings(restaurants)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  // TODO(backend): GET /categories. Mientras tanto se derivan de los valores únicos de category.
  const categories = useMemo(
    () => [...new Set(restaurants.map((r) => r.category))].sort((a, b) => a.localeCompare(b, 'es')),
    [restaurants],
  )

  // TODO(backend): búsqueda/orden server-side (?sort=rating). Hoy se filtra y ordena en el cliente.
  const visible = useMemo(() => {
    const term = normalize(search.trim())
    return restaurants
      .filter((r) => (category === '' || r.category === category) && normalize(r.name).includes(term))
      .sort((a, b) => {
        const ra = ratings.get(a.id)
        const rb = ratings.get(b.id)
        const avgA = ra?.average ?? -1
        const avgB = rb?.average ?? -1
        if (avgA !== avgB) return avgB - avgA
        if ((rb?.count ?? 0) !== (ra?.count ?? 0)) return (rb?.count ?? 0) - (ra?.count ?? 0)
        return a.name.localeCompare(b.name, 'es')
      })
  }, [restaurants, ratings, search, category])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Ranking de restaurantes</h1>
        <p className="text-sm text-slate-700">Ordenados por puntaje promedio de las reseñas.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter categories={categories} value={category} onChange={setCategory} />
      </div>

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} retrying={query.isFetching} />
      ) : restaurants.length === 0 ? (
        <EmptyState title="Todavía no hay restaurantes" description="Cuando se carguen, van a aparecer acá." />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No encontramos resultados"
          description="Probá con otro nombre o cambiá la categoría."
          action={
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setCategory('')
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2" aria-label="Ranking">
          {visible.map((r, i) => (
            <RestaurantCard key={r.id} restaurant={r} rating={ratings.get(r.id)} position={i + 1} />
          ))}
        </ul>
      )}
    </div>
  )
}

