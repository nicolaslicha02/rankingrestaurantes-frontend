import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../api/client'
import { useCreateReview, useUpdateReview } from '../hooks/useReviews'
import type { Review } from '../types/api'
import { StarInput } from './StarInput'
import { useToast } from './useToast'

interface Props {
  restaurantId: number
  /** Si viene, el formulario edita esa reseña. */
  review?: Review
  onDone?: () => void
}

export function ReviewForm({ restaurantId, review, onDone }: Props) {
  const { status } = useAuth()
  const location = useLocation()
  const { showToast } = useToast()
  const create = useCreateReview(restaurantId)
  const update = useUpdateReview(restaurantId)
  const [rating, setRating] = useState(review?.rating ?? 0)
  const [comment, setComment] = useState(review?.comment ?? '')
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [serverErrors, setServerErrors] = useState<string[]>([])

  const isEdit = review !== undefined
  const pending = create.isPending || update.isPending

  if (status !== 'authenticated') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <Link
          to="/login"
          state={{ from: location.pathname }}
          className="font-medium text-amber-800 underline"
        >
          Iniciá sesión
        </Link>{' '}
        para dejar tu reseña.
      </div>
    )
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    const problems: string[] = []
    if (rating < 1 || rating > 5) problems.push('Elegí un puntaje de 1 a 5 estrellas.')
    if (comment.trim() === '') problems.push('Escribí un comentario.')
    setFieldErrors(problems)
    setServerErrors([])
    if (problems.length > 0) return

    const input = { rating, comment: comment.trim() }
    const callbacks = {
      onSuccess: () => {
        showToast(isEdit ? 'Reseña actualizada.' : '¡Gracias! Publicamos tu reseña.', 'success')
        if (!isEdit) {
          setRating(0)
          setComment('')
        }
        onDone?.()
      },
      onError: (error: Error) => {
        setServerErrors(error instanceof ApiError ? error.messages : [error.message])
      },
    }
    if (isEdit) update.mutate({ id: review.id, input }, callbacks)
    else create.mutate(input, callbacks)
  }

  const errors = [...fieldErrors, ...serverErrors]
  const idPrefix = `review-${review?.id ?? 'new'}`

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label={isEdit ? 'Editar reseña' : 'Dejar una reseña'}
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
    >
      {!isEdit && <h3 className="text-lg font-semibold text-slate-900">Dejá tu reseña</h3>}
      <StarInput
        value={rating}
        onChange={setRating}
        disabled={pending}
        describedBy={errors.length > 0 ? `${idPrefix}-errors` : undefined}
      />
      <div>
        <label htmlFor={`${idPrefix}-comment`} className="block text-sm font-medium text-slate-800">
          Comentario
        </label>
        <textarea
          id={`${idPrefix}-comment`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          disabled={pending}
          aria-invalid={errors.length > 0}
          aria-describedby={errors.length > 0 ? `${idPrefix}-errors` : undefined}
          className="mt-1 w-full rounded-lg border border-slate-400 p-2 text-sm"
        />
      </div>
      {errors.length > 0 && (
        <ul id={`${idPrefix}-errors`} role="alert" className="list-disc space-y-1 pl-5 text-sm text-red-700">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {pending ? 'Enviando…' : isEdit ? 'Guardar cambios' : 'Publicar reseña'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={onDone}
            disabled={pending}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

