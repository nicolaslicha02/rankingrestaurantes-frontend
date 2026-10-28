import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createReview, deleteReview, getReviews, updateReview } from '../api/reviews'
import type { ReviewInput } from '../types/api'

export function useReviews(restaurantId: number) {
  return useQuery({
    queryKey: ['reviews', restaurantId],
    queryFn: () => getReviews(restaurantId),
  })
}

export function useCreateReview(restaurantId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ReviewInput) => createReview(restaurantId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', restaurantId] }),
  })
}

export function useUpdateReview(restaurantId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ReviewInput }) => updateReview(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', restaurantId] }),
  })
}

export function useDeleteReview(restaurantId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews', restaurantId] }),
  })
}

