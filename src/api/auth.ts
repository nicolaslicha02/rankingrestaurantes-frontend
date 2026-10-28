import { apiFetch } from './client'
import type { LoginInput, LoginResponse, RegisterInput, User } from '../types/api'

export const register = (input: RegisterInput) =>
  apiFetch<User>('/users', { method: 'POST', body: input })

export const login = (input: LoginInput) =>
  apiFetch<LoginResponse>('/login', { method: 'POST', body: input, skipUnauthorizedHandler: true })

export const logout = () => apiFetch<void>('/logout', { method: 'DELETE', skipUnauthorizedHandler: true })

export const getProfile = () => apiFetch<User>('/profile')

