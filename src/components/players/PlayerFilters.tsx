import { useUIStore } from '../../stores/uiStore.ts'
import { POSITIONS } from '../../types/index.ts'
import type { Position } from '../../types/index.ts'

export function PlayerFilters() {
  const positionFilter = useUIStore(s => s.positionFilter)
  const setPositionFilter = useUIStore(s => s.setPositionFilter)
  const searchQuery = useUIStore(s => s.searchQuery)
  const setSearchQuery = useUIStore(s => s.setSearchQuery)

  return (
    <div className="border-b border-gray-800 px-3 py-2 space-y-2">
      <input
        type="text"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search players..."
        className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
      />
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setPositionFilter(null)}
          className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
            positionFilter === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {POSITIONS.map(pos => (
          <button
            key={pos}
            onClick={() => setPositionFilter(positionFilter === pos ? null : pos as Position)}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              positionFilter === pos
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>
    </div>
  )
}
