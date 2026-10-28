import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { Login } from './Login'
import { jsonResponse, renderApp } from '../test/utils'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

function renderLogin() {
  renderApp(
    <Routes>
      <Route path="/login" element={<Login />} />
    </Routes>,
    '/login',
  )
}

describe('Login', () => {
  it('muestra el error de la API ante credenciales inválidas y permite reintentar', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'Email o contraseña inválidos' }, 401))
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Contraseña'), 'mala')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email o contraseña inválidos')
    // El botón vuelve a estar habilitado para reintentar.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled())
    expect(localStorage.getItem('ranking.token')).toBeNull()
  })

  it('valida campos vacíos sin llamar a la API', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('Ingresá tu email.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('guarda el token al iniciar sesión correctamente', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ token: 't0k3n', user: { id: 1, name: 'Ana', email: 'a@b.com' } }, 201))
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'a@b.com')
    await user.type(screen.getByLabelText('Contraseña'), 'clave1234')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => expect(localStorage.getItem('ranking.token')).toBe('t0k3n'))
  })
})

