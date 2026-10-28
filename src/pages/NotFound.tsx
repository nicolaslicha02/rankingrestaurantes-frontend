import { Link } from 'react-router-dom'

export function NotFound({ message = 'La página que buscás no existe.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-5xl font-bold text-amber-700">404</p>
      <h1 className="text-xl font-semibold">¡Ups! No encontramos eso</h1>
      <p className="text-sm text-slate-700">{message}</p>
      <Link to="/" className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
        Volver al ranking
      </Link>
    </div>
  )
}

