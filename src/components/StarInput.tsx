import { useId, useRef, type KeyboardEvent } from 'react'
import { Star } from 'lucide-react'

interface Props {
  value: number
  onChange: (value: number) => void
  label?: string
  disabled?: boolean
  describedBy?: string
}

/** Selector de 1–5 estrellas accesible: radiogroup con flechas, Home/End y foco visible. */
export function StarInput({ value, onChange, label = 'Puntaje', disabled, describedBy }: Props) {
  const labelId = useId()
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const move = (next: number) => {
    const clamped = Math.min(5, Math.max(1, next))
    onChange(clamped)
    refs.current[clamped - 1]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault()
        move((value || 0) + 1)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault()
        move((value || 2) - 1)
        break
      case 'Home':
        event.preventDefault()
        move(1)
        break
      case 'End':
        event.preventDefault()
        move(5)
        break
    }
  }

  return (
    <div>
      <span id={labelId} className="block text-sm font-medium text-slate-800">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        onKeyDown={onKeyDown}
        className="mt-1 flex gap-1"
      >
        {[1, 2, 3, 4, 5].map((n) => {
          // Roving tabindex: solo una estrella entra en el orden de tabulación.
          const tabbable = value === n || (value === 0 && n === 1)
          return (
            <button
              key={n}
              ref={(el) => {
                refs.current[n - 1] = el
              }}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
              tabIndex={tabbable ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(n)}
              className="rounded p-1 disabled:opacity-50"
            >
              <Star
                aria-hidden="true"
                className={`h-8 w-8 ${n <= value ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

