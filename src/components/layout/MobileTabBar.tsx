import { useUIStore } from '../../stores/uiStore.ts'

const tabs = [
  { id: 'board', label: 'Board', icon: '▦' },
  { id: 'players', label: 'Players', icon: '👤' },
  { id: 'recommendations', label: 'Recs', icon: '★' },
  { id: 'roster', label: 'Roster', icon: '📋' },
] as const

export function MobileTabBar() {
  const mobileTab = useUIStore(s => s.mobileTab)
  const setMobileTab = useUIStore(s => s.setMobileTab)

  return (
    <nav className="flex border-t border-gray-800 bg-gray-900">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setMobileTab(tab.id)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
            mobileTab === tab.id
              ? 'bg-gray-800 text-blue-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
