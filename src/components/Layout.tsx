import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Heart, LogOut, Star } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { useState } from 'react'
import { useToast } from './useToast'

export function Layout() {
  const { status, user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)

  const onLogout = async () => {
    setLeaving(true)
    await logout()
    setLeaving(false)
    showToast('Cerraste sesión.', 'success')
    navigate('/')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100'}`

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-amber-800">
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" aria-hidden="true" />
            Ranking de Restaurantes
          </Link>
          <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Ranking
            </NavLink>
            {status === 'authenticated' ? (
              <>
                <NavLink to="/favorites" className={linkClass}>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-4 w-4" aria-hidden="true" /> Favoritos
                  </span>
                </NavLink>
                <span className="px-2 text-sm text-slate-700">Hola, {user?.name}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  disabled={leaving}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {leaving ? 'Saliendo…' : 'Salir'}
                </button>
              </>
            ) : (
              status === 'anonymous' && (
                <>
                  <NavLink to="/login" className={linkClass}>
                    Ingresar
                  </NavLink>
                  <NavLink to="/register" className={linkClass}>
                    Registrarme
                  </NavLink>
                </>
              )
            )}
          </nav>
        </div>
      </header>
      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-600">
        TP2 Programación IV · UTN FRLP
      </footer>
    </div>
  )
}

