import { Star } from 'lucide-react'

/** Estrellas de solo lectura (acepta decimales: redondea al entero más cercano). */
export function StarRating({ value, size = 'h-4 w-4' }: { value: number | null; size?: string }) {
  const filled = value === null ? 0 : Math.round(value)
  return (
    <span
      className="inline-flex items-center"
      role="img"
      aria-label={value === null ? 'Sin puntaje' : `${filled} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={`${size} ${n <= filled ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`}
        />
      ))}
    </span>
  )
}

