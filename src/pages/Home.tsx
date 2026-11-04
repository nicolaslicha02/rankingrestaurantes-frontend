import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dices, Flame, MessageSquareText, Store } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { CardListSkeleton } from '../components/Skeletons'
import { CategoryFilter } from '../components/CategoryFilter'
import { CriticPassWheel } from '../components/CriticPassWheel'
import { EmptyState, ErrorState } from '../components/States'
import { RestaurantCard } from '../components/RestaurantCard'
import { SearchBar } from '../components/SearchBar'
import { useRestaurantRatings } from '../hooks/useRestaurantRatings'
import { useRestaurants } from '../hooks/useRestaurants'
import { errorMessage } from '../lib/ratings'
import type { Restaurant } from '../types/api'

const NO_RESTAURANTS: Restaurant[] = []

type SortBy = 'rating' | 'reviews' | 'name'

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const query = useRestaurants()
  const restaurants = query.data ?? NO_RESTAURANTS
  const ratings = useRestaurantRatings(restaurants)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('rating')

  // TODO(backend): GET /categories. Mientras tanto se derivan de los valores únicos de category.
  const categories = useMemo(
    () => [...new Set(restaurants.map((r) => r.category))].sort((a, b) => a.localeCompare(b, 'es')),
    [restaurants],
  )

  const { communityReviewsCount, userReviewsCount } = useMemo(() => {
    let total = 0
    let mine = 0
    ratings.forEach((entry) => {
      total += entry.count
      if (user) {
        mine += entry.reviews.filter((rev) => rev.user_id === user.id).length
      }
    })
    return { communityReviewsCount: total, userReviewsCount: mine }
  }, [ratings, user])

  // TODO(backend): búsqueda/orden server-side (?sort=rating). Hoy se filtra y ordena en el cliente.
  const visible = useMemo(() => {
    const term = normalize(search.trim())
    return restaurants
      .filter((r) => (category === '' || r.category === category) && normalize(r.name).includes(term))
      .sort((a, b) => {
        const ra = ratings.get(a.id)
        const rb = ratings.get(b.id)
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'es')
        if (sortBy === 'reviews') {
          const countDiff = (rb?.count ?? 0) - (ra?.count ?? 0)
          if (countDiff !== 0) return countDiff
        }
        const avgA = ra?.average ?? -1
        const avgB = rb?.average ?? -1
        if (avgA !== avgB) return avgB - avgA
        if ((rb?.count ?? 0) !== (ra?.count ?? 0)) return (rb?.count ?? 0) - (ra?.count ?? 0)
        return a.name.localeCompare(b.name, 'es')
      })
  }, [restaurants, ratings, search, category, sortBy])

  const pickRandomRestaurant = () => {
    const pool = visible.length > 0 ? visible : restaurants
    if (pool.length === 0) return
    const random = pool[Math.floor(Math.random() * pool.length)]
    navigate(`/restaurants/${random.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Encabezado Petite Critique con métricas y botón de recomendación al azar */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-5 text-white shadow-md sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-semibold text-amber-300">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" /> Ranking en vivo
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Petite Critique: Los mejores lugares para comer
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Descubrí cafeterías, hamburgueserías, pancherías, tenedores libres, parrillas y pizzerías puntuadas por la comunidad.
            </p>
          </div>
          {restaurants.length > 0 && (
            <button
              type="button"
              onClick={pickRandomRestaurant}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow hover:bg-amber-400 sm:self-center"
            >
              <Dices className="h-4 w-4" aria-hidden="true" />
              ¿Dónde comemos hoy?
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 border-t border-white/10 pt-3 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <Store className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <strong>{restaurants.length}</strong> locales gastronómicos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquareText className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <strong>{communityReviewsCount}</strong> reseñas verificadas
          </span>
        </div>
      </section>

      {/* Pasito de reseñas (1★, 2★, 3★ hasta 50 reseñas) + Ruleta de descuentos y café gratis */}
      <CriticPassWheel
        userReviewsCount={userReviewsCount}
        communityReviewsCount={communityReviewsCount}
      />

      {/* Buscador, selector de categoría y criterio de ordenamiento */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryFilter categories={categories} value={category} onChange={setCategory} />
          <div className="sm:w-48">
            <label htmlFor="sort-by" className="block text-sm font-medium text-slate-800">
              Ordenar por
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm"
            >
              <option value="rating">Mejor promedio</option>
              <option value="reviews">Más reseñados</option>
              <option value="name">Nombre (A–Z)</option>
            </select>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1" role="group" aria-label="Filtros rápidos de categoría">
            <button
              type="button"
              onClick={() => setCategory('')}
              aria-pressed={category === ''}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                category === ''
                  ? 'bg-amber-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas ({restaurants.length})
            </button>
            {categories.map((cat) => {
              const active = category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(active ? '' : cat)}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? 'bg-amber-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        )}
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
        <ul className="grid gap-3.5 lg:grid-cols-2" aria-label="Ranking">
          {visible.map((r, i) => (
            <RestaurantCard key={r.id} restaurant={r} rating={ratings.get(r.id)} position={i + 1} />
          ))}
        </ul>
      )}
    </div>
  )
}
