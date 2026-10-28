export function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="sm:w-56">
      <label htmlFor="category" className="block text-sm font-medium text-slate-800">
        Categoría
      </label>
      <select
        id="category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm"
      >
        <option value="">Todas</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  )
}

