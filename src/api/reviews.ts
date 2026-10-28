import { apiFetch } from './client'
import type { Review, ReviewInput } from '../types/api'

export const getReviews = (restaurantId: number) =>
  apiFetch<Review[]>(`/restaurants/${restaurantId}/reviews`)

export const createReview = (restaurantId: number, input: ReviewInput) =>
  apiFetch<Review>(`/restaurants/${restaurantId}/reviews`, {
    method: 'POST',
    body: { review: input },
  })

export const updateReview = (id: number, input: ReviewInput) =>
  apiFetch<Review>(`/reviews/${id}`, { method: 'PATCH', body: { review: input } })

export const deleteReview = (id: number) => apiFetch<void>(`/reviews/${id}`, { method: 'DELETE' })

