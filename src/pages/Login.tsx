import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { useToast } from '../components/useToast'

export function Login() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [pending, setPending] = useState(false)

  // GuestRoute redirige al origen cuando el estado pasa a "authenticated".
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    const problems: string[] = []
    if (email.trim() === '') problems.push('Ingresá tu email.')
    if (password === '') problems.push('Ingresá tu contraseña.')
    setErrors(problems)
    if (problems.length > 0) return

    setPending(true)
    try {
      await login({ email: email.trim(), password })
      showToast('¡Bienvenido/a!', 'success')
    } catch (error) {
      setErrors(error instanceof ApiError ? error.messages : ['No pudimos iniciar sesión.'])
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Ingresar</h1>
      <form onSubmit={onSubmit} noValidate className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            className="mt-1 w-full rounded-lg border border-slate-400 p-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            className="mt-1 w-full rounded-lg border border-slate-400 p-2 text-sm"
          />
        </div>
        {errors.length > 0 && (
          <ul role="alert" className="list-disc space-y-1 pl-5 text-sm text-red-700">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {pending ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
      <p className="text-sm text-slate-700">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-medium text-amber-800 underline">
          Registrate
        </Link>
      </p>
    </div>
  )
}

