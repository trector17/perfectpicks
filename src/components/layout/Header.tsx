import { useUIStore } from '../../stores/uiStore.ts'

export function Header() {
  const view = useUIStore(s => s.view)
  const setView = useUIStore(s => s.setView)

  return (
    <header className="border-b border-gray-800 bg-gray-900 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            PerfectPicks
          </h1>
          <p className="text-xs text-gray-400 sm:text-sm">Fantasy Football Draft Assistant</p>
        </div>
        {view === 'draft' && (
          <button
            onClick={() => setView('setup')}
            className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-700"
          >
            Settings
          </button>
        )}
      </div>
    </header>
  )
}
