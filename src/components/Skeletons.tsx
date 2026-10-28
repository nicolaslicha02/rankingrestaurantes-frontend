export function PageSpinner() {
  return (
    <div className="flex justify-center py-20" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-amber-600" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <li className="flex animate-pulse gap-4 rounded-xl border border-slate-200 bg-white p-3" aria-hidden="true">
      <div className="h-24 w-24 shrink-0 rounded-lg bg-slate-200 sm:h-28 sm:w-28" />
      <div className="flex-1 space-y-3 py-2">
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
      </div>
    </li>
  )
}

export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="grid gap-3 lg:grid-cols-2" role="status" aria-label="Cargando restaurantes">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
      <li className="sr-only">Cargando…</li>
    </ul>
  )
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="Cargando restaurante">
      <div className="h-56 rounded-xl bg-slate-200" />
      <div className="h-7 w-1/2 rounded bg-slate-200" />
      <div className="h-4 w-1/3 rounded bg-slate-200" />
    </div>
  )
}

export function ReviewListSkeleton() {
  return (
    <ul className="space-y-3" role="status" aria-label="Cargando reseñas">
      {[0, 1, 2].map((i) => (
        <li key={i} className="animate-pulse space-y-2 rounded-lg border border-slate-200 bg-white p-4">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-3/4 rounded bg-slate-200" />
        </li>
      ))}
    </ul>
  )
}

