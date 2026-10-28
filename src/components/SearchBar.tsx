import { Search } from 'lucide-react'

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex-1">
      <label htmlFor="search" className="block text-sm font-medium text-slate-800">
        Buscar por nombre
      </label>
      <div className="relative mt-1">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" aria-hidden="true" />
        <input
          id="search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej.: Don Mario"
          className="w-full rounded-lg border border-slate-400 bg-white py-2 pl-9 pr-3 text-sm"
        />
      </div>
    </div>
  )
}

