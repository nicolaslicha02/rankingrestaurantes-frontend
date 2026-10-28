import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { useDeleteReview } from '../hooks/useReviews'
import { formatDate } from '../lib/ratings'
import type { Review } from '../types/api'
import { ConfirmDialog } from './ConfirmDialog'
import { ReviewForm } from './ReviewForm'
import { StarRating } from './StarRating'
import { useToast } from './useToast'

export function ReviewList({ reviews, restaurantId }: { reviews: Review[]; restaurantId: number }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const del = useDeleteReview(restaurantId)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<Review | null>(null)

  const confirmDelete = () => {
    if (!deleting) return
    del.mutate(deleting.id, {
      onSuccess: () => {
        showToast('Eliminaste tu reseña.', 'success')
        setDeleting(null)
      },
      onError: (error) => {
        showToast(error.message, 'error')
        setDeleting(null)
      },
    })
  }

  return (
    <>
      <ul className="space-y-3">
        {reviews.map((review) => {
          // Solo el autor puede editar/borrar (el back responde 404 si no es suyo).
          const own = user !== null && review.user_id === user.id
          return (
            <li key={review.id} className="rounded-lg border border-slate-200 bg-white p-4">
              {editingId === review.id ? (
                <ReviewForm restaurantId={restaurantId} review={review} onDone={() => setEditingId(null)} />
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium text-slate-900">{review.user_name}</span>
                    <StarRating value={review.rating} />
                    <time dateTime={review.created_at} className="text-xs text-slate-600">
                      {formatDate(review.created_at)}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-line break-words text-sm text-slate-800">{review.comment}</p>
                  {own && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(review.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
                        <span className="sr-only"> tu reseña</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(review)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1 text-sm text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar
                        <span className="sr-only"> tu reseña</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ul>
      {deleting && (
        <ConfirmDialog
          title="¿Eliminar tu reseña?"
          confirmLabel="Eliminar"
          busy={del.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        >
          Esta acción no se puede deshacer.
        </ConfirmDialog>
      )}
    </>
  )
}

