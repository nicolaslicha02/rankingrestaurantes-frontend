import type { Review } from '../types/api'

export interface RatingSummary {
  average: number | null
  count: number
}

export function summarizeReviews(reviews: Review[]): RatingSummary {
  if (reviews.length === 0) return { average: null, count: 0 }
  const total = reviews.reduce((sum, r) => sum + r.rating, 0)
  return { average: total / reviews.length, count: reviews.length }
}

export function formatAverage(average: number | null): string {
  if (average === null) return 'Sin puntaje'
  return average.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}

