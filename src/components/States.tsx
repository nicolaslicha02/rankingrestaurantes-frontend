import type { ReactNode } from 'react'
import { AlertTriangle, RefreshCw, SearchX } from 'lucide-react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
      <SearchX className="h-10 w-10 text-slate-400" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {description && <p className="max-w-md text-sm text-slate-600">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
  retrying = false,
}: {
  message: string
  onRetry?: () => void
  retrying?: boolean
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-10 text-center"
    >
      <AlertTriangle className="h-10 w-10 text-red-600" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-red-900">No pudimos cargar la información</h2>
      <p className="max-w-md text-sm text-red-800">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} aria-hidden="true" />
          {retrying ? 'Reintentando…' : 'Reintentar'}
        </button>
      )}
    </div>
  )
}

