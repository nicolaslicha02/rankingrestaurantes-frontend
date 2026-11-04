import { ArrowLeft, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { FavoriteButton } from '../components/FavoriteButton'
import { RestaurantPhoto } from '../components/RestaurantPhoto'
import { ReviewForm } from '../components/ReviewForm'
import { ReviewList } from '../components/ReviewList'
import { DetailSkeleton, ReviewListSkeleton } from '../components/Skeletons'
import { StarRating } from '../components/StarRating'
import { EmptyState, ErrorState } from '../components/States'
import { useRestaurant } from '../hooks/useRestaurants'
import { useReviews } from '../hooks/useReviews'
import { errorMessage, formatAverage, summarizeReviews } from '../lib/ratings'
import { NotFound } from './NotFound'

export function RestaurantDetail() {
  const params = useParams()
  const id = Number(params.id)
  const restaurant = useRestaurant(id)
  const reviews = useReviews(id)

  if (!Number.isInteger(id) || id <= 0) return <NotFound />
  if (restaurant.error instanceof ApiError && restaurant.error.status === 404) {
    return <NotFound message="No encontramos ese restaurante." />
  }

  const summary = summarizeReviews(reviews.data ?? [])

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Volver al ranking
      </Link>

      {restaurant.isPending ? (
        <DetailSkeleton />
      ) : restaurant.isError ? (
        <ErrorState
          message={errorMessage(restaurant.error)}
          onRetry={() => restaurant.refetch()}
          retrying={restaurant.isFetching}
        />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <RestaurantPhoto
            url={restaurant.data.photo_url}
            name={restaurant.data.name}
            category={restaurant.data.category}
            className="h-48 w-full sm:h-64"
          />
          <div className="flex flex-wrap items-start justify-between gap-3 p-5">
            <div className="space-y-1.5">
              <span className="inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-900">
                {restaurant.data.category}
              </span>
              <h1 className="text-2xl font-bold">{restaurant.data.name}</h1>
              <p className="flex items-center gap-1 text-sm text-slate-700">
                <MapPin className="h-4 w-4 text-amber-700" aria-hidden="true" /> {restaurant.data.address}
              </p>
              {reviews.isSuccess && (
                <p className="flex flex-wrap items-center gap-2 pt-1 text-sm">
                  <StarRating value={summary.average} size="h-5 w-5" />
                  <span className="font-semibold">{formatAverage(summary.average)}</span>
                  <span className="text-slate-700">
                    · {summary.count} {summary.count === 1 ? 'reseña' : 'reseñas'}
                  </span>
                </p>
              )}
            </div>
            <FavoriteButton restaurant={restaurant.data} withLabel />
          </div>
        </section>
      )}

      <ReviewForm restaurantId={id} />

      <section aria-labelledby="reviews-title" className="space-y-3">
        <h2 id="reviews-title" className="text-xl font-semibold">
          Reseñas ({reviews.data?.length ?? 0})
        </h2>
        {reviews.isPending ? (
          <ReviewListSkeleton />
        ) : reviews.isError ? (
          <ErrorState message={errorMessage(reviews.error)} onRetry={() => reviews.refetch()} retrying={reviews.isFetching} />
        ) : reviews.data.length === 0 ? (
          <EmptyState title="Todavía no hay reseñas" description="Sé la primera persona en opinar." />
        ) : (
          <ReviewList reviews={reviews.data} restaurantId={id} />
        )}
      </section>
    </div>
  )
}
