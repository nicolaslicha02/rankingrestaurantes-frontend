import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { useToast } from '../components/useToast'

export function Register() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    const problems: string[] = []
    if (name.trim() === '') problems.push('Ingresá tu nombre.')
    if (email.trim() === '') problems.push('Ingresá tu email.')
    if (password === '') problems.push('Elegí una contraseña.')
    setErrors(problems)
    if (problems.length > 0) return

    setPending(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password })
      showToast('¡Cuenta creada! Ya iniciaste sesión.', 'success')
    } catch (error) {
      setErrors(error instanceof ApiError ? error.messages : ['No pudimos crear la cuenta.'])
      setPending(false)
    }
  }

  const field = (id: string, label: string, type: string, value: string, set: (v: string) => void, auto: string) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={auto}
        value={value}
        onChange={(e) => set(e.target.value)}
        disabled={pending}
        className="mt-1 w-full rounded-lg border border-slate-400 p-2 text-sm"
      />
    </div>
  )

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <form onSubmit={onSubmit} noValidate className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        {field('name', 'Nombre', 'text', name, setName, 'name')}
        {field('email', 'Email', 'email', email, setEmail, 'email')}
        {field('password', 'Contraseña', 'password', password, setPassword, 'new-password')}
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
          {pending ? 'Creando cuenta…' : 'Registrarme'}
        </button>
      </form>
      <p className="text-sm text-slate-700">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium text-amber-800 underline">
          Ingresá
        </Link>
      </p>
    </div>
  )
}

