import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiFetch, setToken, setUnauthorizedHandler } from './client'
import { jsonResponse } from '../test/utils'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  fetchMock.mockReset()
  setUnauthorizedHandler(null)
  vi.unstubAllGlobals()
})

describe('apiFetch', () => {
  it('envía el Bearer token y el body como JSON', async () => {
    setToken('abc')
    fetchMock.mockResolvedValue(jsonResponse({ id: 1 }, 201))
    await apiFetch('/favorites', { method: 'POST', body: { restaurant_id: 1 } })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/favorites$/)
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer abc')
    expect(init.body).toBe(JSON.stringify({ restaurant_id: 1 }))
  })

  it('maneja 204 sin cuerpo', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))
    await expect(apiFetch<void>('/logout', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('convierte un 422 en ApiError con los mensajes de errors[]', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ errors: ['Comentario no puede estar en blanco'] }, 422))
    const error = await apiFetch('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(422)
    expect((error as ApiError).messages).toEqual(['Comentario no puede estar en blanco'])
  })

  it('en un 401 llama al handler global y lanza el error', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    fetchMock.mockResolvedValue(jsonResponse({ error: 'No autorizado' }, 401))
    await expect(apiFetch('/profile')).rejects.toMatchObject({ status: 401, messages: ['No autorizado'] })
    expect(handler).toHaveBeenCalledOnce()
  })

  it('con skipUnauthorizedHandler no dispara el handler (login inválido)', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    fetchMock.mockResolvedValue(jsonResponse({ error: 'Email o contraseña inválidos' }, 401))
    await expect(apiFetch('/login', { method: 'POST', skipUnauthorizedHandler: true })).rejects.toMatchObject({
      messages: ['Email o contraseña inválidos'],
    })
    expect(handler).not.toHaveBeenCalled()
  })

  it('un fallo de red produce ApiError con status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(apiFetch('/restaurants')).rejects.toMatchObject({ status: 0 })
  })
})

