import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewForm } from './ReviewForm'
import { jsonResponse, renderApp } from '../test/utils'

const fetchMock = vi.fn()
const profile = { id: 7, name: 'Ana', email: 'ana@example.com' }

beforeEach(() => {
  localStorage.setItem('ranking.token', 'tok')
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

/** Responde /profile siempre y delega el resto en `onReview`. */
function mockApi(onReview: () => Promise<Response>) {
  fetchMock.mockImplementation((url: string) =>
    url.endsWith('/profile') ? Promise.resolve(jsonResponse(profile)) : onReview(),
  )
}

async function fillAndSubmit(comment: string, stars = 4) {
  const user = userEvent.setup()
  await user.click(await screen.findByRole('radio', { name: `${stars} estrellas` }))
  if (comment) await user.type(screen.getByLabelText('Comentario'), comment)
  await user.click(screen.getByRole('button', { name: 'Publicar reseña' }))
  return user
}

describe('ReviewForm', () => {
  it('envía la reseña anidada en { review } y confirma con un toast', async () => {
    mockApi(() =>
      Promise.resolve(
        jsonResponse(
          { id: 1, restaurant_id: 3, user_id: 7, user_name: 'Ana', rating: 4, comment: 'Muy rico', created_at: '2026-10-01T10:00:00Z' },
          201,
        ),
      ),
    )
    renderApp(<ReviewForm restaurantId={3} />)
    await fillAndSubmit('Muy rico')

    expect(await screen.findByText('¡Gracias! Publicamos tu reseña.')).toBeInTheDocument()
    const post = fetchMock.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'POST')
    expect(post?.[0]).toMatch(/\/restaurants\/3\/reviews$/)
    expect(JSON.parse((post?.[1] as RequestInit).body as string)).toEqual({
      review: { rating: 4, comment: 'Muy rico' },
    })
    expect(screen.getByLabelText('Comentario')).toHaveValue('')
  })

  it('deshabilita el botón mientras se envía', async () => {
    let release: (r: Response) => void = () => {}
    mockApi(() => new Promise<Response>((resolve) => (release = resolve)))
    renderApp(<ReviewForm restaurantId={3} />)
    await fillAndSubmit('Bien')

    const button = await screen.findByRole('button', { name: 'Enviando…' })
    expect(button).toBeDisabled()
    release(jsonResponse({ id: 2 }, 201))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Publicar reseña' })).toBeEnabled())
  })

  it('muestra los errores 422 de la API junto al formulario', async () => {
    mockApi(() => Promise.resolve(jsonResponse({ errors: ['Comentario no puede estar en blanco'] }, 422)))
    renderApp(<ReviewForm restaurantId={3} />)
    await fillAndSubmit('   ')
    // La validación local frena el envío vacío…
    expect(await screen.findByText('Escribí un comentario.')).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => (init as RequestInit | undefined)?.method === 'POST')).toBe(false)
  })

  it('muestra los mensajes que devuelve el servidor ante un 422', async () => {
    mockApi(() => Promise.resolve(jsonResponse({ errors: ['Rating debe estar entre 1 y 5'] }, 422)))
    renderApp(<ReviewForm restaurantId={3} />)
    await fillAndSubmit('Algo')
    expect(await screen.findByRole('alert')).toHaveTextContent('Rating debe estar entre 1 y 5')
  })

  it('invita a iniciar sesión si no hay sesión', () => {
    localStorage.clear()
    renderApp(<ReviewForm restaurantId={3} />)
    expect(screen.getByRole('link', { name: 'Iniciá sesión' })).toBeInTheDocument()
  })
})

