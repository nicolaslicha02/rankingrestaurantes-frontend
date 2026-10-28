import { useState } from 'react'
import { Utensils } from 'lucide-react'

export function RestaurantPhoto({
  url,
  name,
  className = '',
}: {
  url: string | null
  name: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (!url || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-200 text-slate-500 ${className}`}
        role="img"
        aria-label={`Sin foto de ${name}`}
      >
        <Utensils className="h-1/3 w-1/3" aria-hidden="true" />
      </div>
    )
  }
  return (
    <img
      src={url}
      alt={`Foto de ${name}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}

