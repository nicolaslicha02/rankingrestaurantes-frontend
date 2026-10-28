import { Heart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useFavorites, useToggleFavorite } from '../hooks/useFavorites'
import type { Restaurant } from '../types/api'
import { useToast } from './useToast'

export function FavoriteButton({
  restaurant,
  withLabel = false,
}: {
  restaurant: Pick<Restaurant, 'id' | 'name' | 'address'>
  withLabel?: boolean
}) {
  const { status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const favorites = useFavorites()
  const toggle = useToggleFavorite()

  if (status === 'loading') return null

  const isFavorite = favorites.data?.some((f) => f.restaurant_id === restaurant.id) ?? false

  const onClick = () => {
    if (status !== 'authenticated') {
      showToast('Iniciá sesión para guardar tus favoritos.', 'info')
      navigate('/login', { state: { from: location.pathname + location.search } })
      return
    }
    const add = !isFavorite
    toggle.mutate(
      { restaurant, add },
      {
        onSuccess: () =>
          showToast(add ? `Guardaste ${restaurant.name} en favoritos.` : `Quitaste ${restaurant.name} de favoritos.`, 'success'),
        onError: (error) => showToast(error.message, 'error'),
      },
    )
  }

  const label = isFavorite
    ? `Quitar ${restaurant.name} de favoritos`
    : `Guardar ${restaurant.name} en favoritos`

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white p-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
    >
      <Heart
        aria-hidden="true"
        className={`h-5 w-5 ${isFavorite ? 'fill-red-600 text-red-600' : 'text-slate-600'}`}
      />
      {withLabel && <span className="pr-1">{isFavorite ? 'En favoritos' : 'Guardar favorito'}</span>}
    </button>
  )
}

