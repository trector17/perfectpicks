import { Header } from './components/layout/Header.tsx'
import { MobileTabBar } from './components/layout/MobileTabBar.tsx'
import { LeagueSetup } from './components/setup/LeagueSetup.tsx'
import { DraftBoard } from './components/draft/DraftBoard.tsx'
import { DraftControls } from './components/draft/DraftControls.tsx'
import { PlayerPool } from './components/players/PlayerPool.tsx'
import { RecommendationPanel } from './components/recommendations/RecommendationPanel.tsx'
import { MyRoster } from './components/roster/MyRoster.tsx'
import { Toast } from './components/ui/Toast.tsx'
import { useUIStore } from './stores/uiStore.ts'

function MobileContent() {
  const mobileTab = useUIStore(s => s.mobileTab)

  return (
    <div className="flex-1 overflow-auto">
      {mobileTab === 'board' && (
        <div className="p-2">
          <DraftBoard />
        </div>
      )}
      {mobileTab === 'players' && <PlayerPool />}
      {mobileTab === 'recommendations' && <RecommendationPanel />}
      {mobileTab === 'roster' && <MyRoster />}
    </div>
  )
}

function DesktopContent() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left: Draft Board */}
      <div className="flex-1 overflow-auto border-r border-gray-800 p-2">
        <DraftBoard />
      </div>
      {/* Center: Player Pool */}
      <div className="w-96 border-r border-gray-800">
        <PlayerPool />
      </div>
      {/* Right: Recs + Roster */}
      <div className="flex w-72 flex-col">
        <div className="flex-1 overflow-hidden border-b border-gray-800">
          <RecommendationPanel />
        </div>
        <div className="h-64 overflow-hidden">
          <MyRoster />
        </div>
      </div>
    </div>
  )
}

function DraftView() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <DraftControls />
      {/* Desktop: 3-column layout */}
      <div className="hidden flex-1 overflow-hidden lg:flex">
        <DesktopContent />
      </div>
      {/* Mobile: Single panel + tab bar */}
      <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
        <MobileContent />
        <MobileTabBar />
      </div>
    </div>
  )
}

function App() {
  const view = useUIStore(s => s.view)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header />
      {view === 'setup' ? <LeagueSetup /> : <DraftView />}
      <Toast />
    </div>
  )
}

export default App
