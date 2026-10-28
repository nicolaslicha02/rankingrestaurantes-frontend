import type { ApiErrorBody } from '../types/api'

/** Error tipado de la API: status HTTP (0 = sin conexión) y mensajes en español. */
export class ApiError extends Error {
  readonly status: number
  readonly messages: string[]

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? 'Error desconocido')
    this.name = 'ApiError'
    this.status = status
    this.messages = messages
  }
}

export const TOKEN_KEY = 'ranking.token'

export const API_URL: string = import.meta.env.VITE_API_URL ?? '/api/v1'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

type UnauthorizedHandler = () => void
let unauthorizedHandler: UnauthorizedHandler | null = null

/** Registra qué hacer ante cualquier 401 (limpiar sesión y redirigir a /login). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Para /login: un 401 acá significa credenciales inválidas, no sesión vencida. */
  skipUnauthorizedHandler?: boolean
}

const FALLBACK_MESSAGES: Record<number, string> = {
  401: 'No autorizado',
  404: 'No encontrado',
}

function extractMessages(status: number, data: unknown): string[] {
  if (data && typeof data === 'object') {
    const body = data as ApiErrorBody
    if (Array.isArray(body.errors) && body.errors.length > 0) return body.errors.map(String)
    if (typeof body.error === 'string' && body.error) return [body.error]
  }
  return [FALLBACK_MESSAGES[status] ?? 'Ocurrió un error inesperado. Probá de nuevo.']
}

/**
 * Único punto de acceso HTTP: base URL, Bearer, JSON, 204 sin cuerpo,
 * errores tipados y 401 global.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, skipUnauthorizedHandler = false } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, ['No pudimos conectarnos con el servidor. Revisá tu conexión y reintentá.'])
  }

  if (response.status === 204) return undefined as T

  let data: unknown = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !skipUnauthorizedHandler) unauthorizedHandler?.()
    throw new ApiError(response.status, extractMessages(response.status, data))
  }

  return data as T
}

