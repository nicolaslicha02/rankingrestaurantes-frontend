import { useState } from 'react'
import { Award, Gift, Sparkles, Star, Ticket, RotateCw } from 'lucide-react'
import { useAuth } from '../auth/useAuth'

interface Prize {
  id: string
  label: string
  shortLabel: string
  place: string
  codePrefix: string
  color: string
}

const PRIZES: Prize[] = [
  {
    id: 'cafe',
    label: '☕ Café de especialidad + croissant gratis',
    shortLabel: '☕ Café Gratis',
    place: 'Café Botánico / Moka Petite Café',
    codePrefix: 'PETITE-CAFE',
    color: '#b45309',
  },
  {
    id: 'burger',
    label: '🍔 2x1 en Smash Burgers dobles',
    shortLabel: '🍔 2x1 Burgers',
    place: 'Smash Lab Burgers / Doble Cheddar Club',
    codePrefix: 'PETITE-BURGER',
    color: '#dc2626',
  },
  {
    id: 'pizza',
    label: '🍕 35% OFF en Pizzerías seleccionadas',
    shortLabel: '🍕 35% OFF',
    place: 'Don Mario / Nápoles al Corte',
    codePrefix: 'PETITE-PIZZA',
    color: '#d97706',
  },
  {
    id: 'pancho',
    label: '🌭 Combo Pancho Gourmet + papas gratis',
    shortLabel: '🌭 Pancho Gratis',
    place: 'Pancho Villa Gourmet / El Rey del Pancho',
    codePrefix: 'PETITE-PANCHO',
    color: '#ea580c',
  },
  {
    id: 'parrilla',
    label: '🥩 Postre y bebida libre en Parrilla',
    shortLabel: '🥩 Postre Libre',
    place: 'La Estancia / Fuego & Brasas',
    codePrefix: 'PETITE-BRASA',
    color: '#991b1b',
  },
  {
    id: 'helado',
    label: '🍦 1/4 kg de Helado Artesanal gratis',
    shortLabel: '🍦 1/4 Helado',
    place: "Lucciano's Gelato",
    codePrefix: 'PETITE-GELATO',
    color: '#7c3aed',
  },
]

const GOAL = 50
const STAR_THRESHOLDS = [
  { star: 1, target: 15, prev: 0, title: '1★ Crítico Amateur' },
  { star: 2, target: 30, prev: 15, title: '2★ Crítico Gourmet' },
  { star: 3, target: 50, prev: 30, title: '3★ Gran Crítico' },
]

export interface WonCoupon {
  prize: Prize
  code: string
  wonAt: string
}

const COUPON_STORAGE_KEY = 'petite_critique.coupons'

function loadCoupons(): WonCoupon[] {
  try {
    const raw = localStorage.getItem(COUPON_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WonCoupon[]) : []
  } catch {
    return []
  }
}

export function CriticPassWheel({
  userReviewsCount,
  communityReviewsCount,
}: {
  userReviewsCount: number
  communityReviewsCount: number
}) {
  const { status, user } = useAuth()
  const [bonusDemoReviews, setBonusDemoReviews] = useState(0)
  const [wheelOpen, setWheelOpen] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [wonCoupon, setWonCoupon] = useState<WonCoupon | null>(null)
  const [savedCoupons, setSavedCoupons] = useState<WonCoupon[]>(() => loadCoupons())

  // Si hay sesión, usamos las reseñas del usuario (+ bonus demo si quiere probar en vivo).
  // Si no hay sesión, mostramos el progreso comunitario o el demo interactivo.
  const baseCount = status === 'authenticated' ? userReviewsCount : communityReviewsCount
  const effectiveCount = Math.min(GOAL, baseCount + bonusDemoReviews)
  const overallPercent = Math.min(100, Math.round((effectiveCount / GOAL) * 100))
  const unlockedAllThree = effectiveCount >= GOAL

  const spinWheel = () => {
    if (spinning || !unlockedAllThree) return
    setSpinning(true)
    setWonCoupon(null)

    const winnerIndex = Math.floor(Math.random() * PRIZES.length)
    const sliceAngle = 360 / PRIZES.length
    // Apuntamos el centro del segmento ganador hacia el puntero superior (0 grados)
    const targetSliceCenter = 360 - (winnerIndex * sliceAngle + sliceAngle / 2)
    const nextRotation = rotation + 360 * 5 + ((targetSliceCenter - (rotation % 360) + 360) % 360)
    setRotation(nextRotation)

    window.setTimeout(() => {
      const prize = PRIZES[winnerIndex]
      const randomDigits = Math.floor(1000 + Math.random() * 9000)
      const coupon: WonCoupon = {
        prize,
        code: `${prize.codePrefix}-${randomDigits}`,
        wonAt: new Date().toLocaleDateString('es-AR'),
      }
      setWonCoupon(coupon)
      setSpinning(false)
      setSavedCoupons((prev) => {
        const updated = [coupon, ...prev].slice(0, 5)
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    }, 3600)
  }

  return (
    <section
      aria-label="Pase de Reseñas Petite Critique"
      className="overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-800 px-3 py-0.5 text-xs font-semibold text-amber-50">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            PASE PETITE CRITIQUE · CAMINO A LAS 50 RESEÑAS
          </div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            {unlockedAllThree
              ? '¡Completaste las 3 Estrellas! Tenés un giro en la Ruleta Gourmet'
              : 'Sumá reseñas, cargá tus 3 estrellas progresivas y girá la ruleta de premios'}
          </h2>
          <p className="text-xs text-slate-700 sm:text-sm">
            {status === 'authenticated' ? (
              <>
                Hola <strong>{user?.name}</strong>: llevás <strong>{effectiveCount}</strong> de{' '}
                <strong>{GOAL}</strong> reseñas para completar las 3 estrellas (1★ a las 15, 2★ a las 30, 3★ a las 50).
              </>
            ) : (
              <>
                Progreso activo: <strong>{effectiveCount} / {GOAL} reseñas</strong>. Iniciá sesión con{' '}
                <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-xs">critico@example.com</code>{' '}
                (49 reseñas) o usá los botones de prueba para ver cómo se cargan 1★, 2★ y 3★.
              </>
            )}
          </p>
        </div>

        {/* Las 3 Estrellas Progresivas (1e, 2e, 3e) */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {STAR_THRESHOLDS.map(({ star, target, prev, title }) => {
            const starFill = Math.max(0, Math.min(100, Math.round(((effectiveCount - prev) / (target - prev)) * 100)))
            const done = starFill >= 100
            return (
              <div
                key={star}
                className={`flex flex-col items-center rounded-xl border px-3 py-2 text-center transition ${
                  done
                    ? 'border-amber-500 bg-amber-500/15 shadow-sm'
                    : 'border-amber-200 bg-white/80'
                }`}
              >
                <div className="relative h-9 w-9" aria-label={`${title}: ${starFill}% completado`}>
                  <Star className="h-9 w-9 text-slate-300" aria-hidden="true" />
                  <div
                    className="absolute inset-0 overflow-hidden transition-all duration-500"
                    style={{ width: `${starFill}%` }}
                  >
                    <Star className="h-9 w-9 fill-amber-500 text-amber-600" aria-hidden="true" />
                  </div>
                </div>
                <span className="mt-1 text-xs font-bold text-slate-900">{title}</span>
                <span className="text-[11px] font-medium text-slate-600">
                  {done ? `¡Lista! (${target}/${target})` : `${starFill}% · meta ${target}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Barra progresiva general 0 -> 50 */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-800">
          <span>Progreso general: {effectiveCount} / {GOAL} reseñas ({overallPercent}%)</span>
          <span> Hitos: 15 (1★) · 30 (2★) · 50 (3★ + Ruleta)</span>
        </div>
        <div
          className="relative h-3.5 w-full overflow-hidden rounded-full bg-white shadow-inner"
          role="progressbar"
          aria-valuenow={effectiveCount}
          aria-valuemin={0}
          aria-valuemax={GOAL}
          aria-label="Progreso hacia las 50 reseñas"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Controles de acción y simulador de etapas para la demo */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-medium text-slate-700">Probar carga de estrellas:</span>
          <button
            type="button"
            onClick={() => setBonusDemoReviews(Math.max(0, 15 - baseCount))}
            className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-medium text-slate-800 hover:bg-amber-50"
          >
            1★ (15)
          </button>
          <button
            type="button"
            onClick={() => setBonusDemoReviews(Math.max(0, 30 - baseCount))}
            className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-medium text-slate-800 hover:bg-amber-50"
          >
            2★ (30)
          </button>
          <button
            type="button"
            onClick={() => setBonusDemoReviews(Math.max(0, 50 - baseCount))}
            className="rounded-lg border border-amber-400 bg-amber-100 px-2.5 py-1 font-semibold text-amber-950 hover:bg-amber-200"
          >
            3★ (50 ¡Ruleta!)
          </button>
          {bonusDemoReviews > 0 && (
            <button
              type="button"
              onClick={() => setBonusDemoReviews(0)}
              className="rounded-lg px-2 py-1 text-slate-600 underline hover:text-slate-900"
            >
              Ver conteo real
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setWheelOpen(true)}
          disabled={!unlockedAllThree}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <Gift className="h-4 w-4" aria-hidden="true" />
          {unlockedAllThree
            ? '🎡 Girar Ruleta Petite Critique'
            : `Faltan ${GOAL - effectiveCount} reseñas para la Ruleta`}
        </button>
      </div>

      {/* Cupones ganados recientemente */}
      {savedCoupons.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-amber-200/80 pt-3 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-950">
            <Ticket className="h-4 w-4 text-amber-700" aria-hidden="true" /> Tus beneficios desbloqueados:
          </span>
          {savedCoupons.map((c) => (
            <span
              key={c.code}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 py-1 font-medium text-slate-800"
            >
              {c.prize.shortLabel} · <strong className="font-mono text-amber-900">{c.code}</strong>
            </span>
          ))}
        </div>
      )}

      {/* Modal de la Ruleta de Premios */}
      {wheelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wheel-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-700">
                  <Award className="h-4 w-4" aria-hidden="true" /> Recompensa 3 Estrellas (50 reseñas)
                </span>
                <h3 id="wheel-title" className="text-xl font-bold text-slate-900">
                  Ruleta Gourmet de Petite Critique
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWheelOpen(false)}
                disabled={spinning}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            <div className="relative my-6 flex flex-col items-center">
              {/* Puntero superior */}
              <div
                aria-hidden="true"
                className="z-10 -mb-3 h-0 w-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-slate-900 drop-shadow"
              />

              {/* Disco de la ruleta */}
              <div
                className="relative h-64 w-64 overflow-hidden rounded-full border-8 border-amber-900 shadow-xl transition-transform duration-[3500ms] ease-out sm:h-72 sm:w-72"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(
                    ${PRIZES[0].color} 0deg 60deg,
                    ${PRIZES[1].color} 60deg 120deg,
                    ${PRIZES[2].color} 120deg 180deg,
                    ${PRIZES[3].color} 180deg 240deg,
                    ${PRIZES[4].color} 240deg 300deg,
                    ${PRIZES[5].color} 300deg 360deg
                  )`,
                }}
              >
                {PRIZES.map((prize, idx) => {
                  const angle = idx * 60 + 30
                  return (
                    <div
                      key={prize.id}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-bold text-white drop-shadow"
                      style={{
                        transform: `rotate(${angle}deg) translateY(-88px)`,
                      }}
                    >
                      {prize.shortLabel}
                    </div>
                  )
                })}
                <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-amber-200 bg-white font-bold text-amber-900 shadow">
                  ★★★
                </div>
              </div>
            </div>

            {wonCoupon && (
              <div
                role="status"
                className="mb-4 rounded-xl border-2 border-green-600 bg-green-50 p-4 text-center"
              >
                <p className="text-xs font-bold uppercase text-green-800">¡Felicitaciones, ganaste!</p>
                <p className="mt-1 text-base font-bold text-slate-900">{wonCoupon.prize.label}</p>
                <p className="text-xs text-slate-700">Válido en: {wonCoupon.prize.place}</p>
                <p className="mt-2 inline-block rounded-lg bg-white px-3 py-1 font-mono text-sm font-bold text-amber-900 shadow-sm">
                  Cupón: {wonCoupon.code}
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={spinWheel}
                disabled={spinning}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-amber-800 disabled:opacity-60"
              >
                <RotateCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} aria-hidden="true" />
                {spinning ? 'Girando la ruleta…' : wonCoupon ? 'Volver a girar' : '¡Girar Ruleta Ahora!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

