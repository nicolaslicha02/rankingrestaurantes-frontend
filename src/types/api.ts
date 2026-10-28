export interface User {
  id: number
  name: string
  email: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface Restaurant {
  id: number
  name: string
  address: string
  /** Nombre de la categoría (string, no objeto). */
  category: string
  /** URL absoluta o null: siempre prever placeholder. */
  photo_url: string | null
}

export interface Review {
  id: number
  restaurant_id: number
  user_id: number
  user_name: string
  /** Entero 1–5 */
  rating: number
  comment: string
  created_at: string
}

export interface ReviewInput {
  rating: number
  comment: string
}

export interface Favorite {
  id: number
  restaurant_id: number
  restaurant_name: string
  restaurant_address: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface ApiErrorBody {
  error?: string
  errors?: string[]
}

