import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import { getToken, setToken, setUnauthorizedHandler } from '../api/client'
import type { LoginInput, RegisterInput, User } from '../types/api'
import { useToast } from '../components/useToast'
import { AuthContext, type AuthContextValue, type AuthStatus } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => (getToken() ? 'loading' : 'anonymous'))

  // Ref para que el handler global siempre vea la ubicación actual.
  const locationRef = useRef(location)
  useEffect(() => {
    locationRef.current = location
  }, [location])

  const clearSession = useCallback(() => {
    setToken(null)
    setUser(null)
    setStatus('anonymous')
    queryClient.removeQueries({ queryKey: ['favorites'] })
  }, [queryClient])

  // 401 global: los tokens no expiran, pero pueden invalidarse. Limpiar y mandar a /login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!getToken()) return
      clearSession()
      showToast('Tu sesión terminó. Volvé a iniciar sesión.', 'error')
      const { pathname, search } = locationRef.current
      navigate('/login', { replace: true, state: { from: pathname + search } })
    })
    return () => setUnauthorizedHandler(null)
  }, [clearSession, navigate, showToast])

  // Restaurar sesión al cargar la página.
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    authApi
      .getProfile()
      .then((profile) => {
        if (cancelled) return
        setUser(profile)
        setStatus('authenticated')
      })
      .catch((error: unknown) => {
        if (cancelled) return
        // El 401 ya limpia la sesión; ante otros errores (red) dejamos la sesión anónima sin borrar el token.
        setStatus('anonymous')
        if (error instanceof Error && 'status' in error && error.status === 0) {
          showToast('No pudimos verificar tu sesión. Recargá la página.', 'error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [showToast])

  const login = useCallback(async (input: LoginInput) => {
    const { token, user: loggedUser } = await authApi.login(input)
    setToken(token)
    setUser(loggedUser)
    setStatus('authenticated')
  }, [])

  const register = useCallback(
    async (input: RegisterInput) => {
      // El registro no inicia sesión: encadenamos /login.
      await authApi.register(input)
      await login({ email: input.email, password: input.password })
    },
    [login],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Aunque falle el servidor, cerramos la sesión local.
    }
    clearSession()
    queryClient.clear()
  }, [clearSession, queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

