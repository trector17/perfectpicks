import { useState } from 'react'
import { useLeagueStore } from '../../stores/leagueStore.ts'
import { useUIStore } from '../../stores/uiStore.ts'
import { useDraftStore } from '../../stores/draftStore.ts'
import { usePlayerStore } from '../../stores/playerStore.ts'
import type { ScoringConfig } from '../../types/index.ts'
import scoringPresets from '../../data/scoring-presets.json'
import playersData from '../../data/players.json'
import type { Player } from '../../types/index.ts'

export function LeagueSetup() {
  const config = useLeagueStore(s => s.config)
  const updateConfig = useLeagueStore(s => s.updateConfig)
  const setView = useUIStore(s => s.setView)
  const resetDraft = useDraftStore(s => s.resetDraft)
  const loadPlayers = usePlayerStore(s => s.loadPlayers)

  const [teamCount, setTeamCount] = useState(config.teamCount)
  const [draftPosition, setDraftPosition] = useState(config.draftPosition)
  const [scoringId, setScoringId] = useState(config.scoringConfig.id)
  const [leagueName, setLeagueName] = useState(config.name)

  const handleStartDraft = () => {
    const scoring = (scoringPresets as ScoringConfig[]).find(s => s.id === scoringId)!
    updateConfig({
      name: leagueName,
      teamCount,
      draftPosition,
      scoringConfig: scoring,
    })
    loadPlayers(playersData as unknown as Player[])
    resetDraft()
    setView('draft')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h2 className="mb-6 text-xl font-semibold text-white">League Setup</h2>

      <div className="space-y-5">
        {/* League Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">League Name</label>
          <input
            type="text"
            value={leagueName}
            onChange={e => setLeagueName(e.target.value)}
            className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            placeholder="My League"
          />
        </div>

        {/* Team Count */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Number of Teams
          </label>
          <select
            value={teamCount}
            onChange={e => {
              const count = Number(e.target.value)
              setTeamCount(count)
              if (draftPosition > count) setDraftPosition(count)
            }}
            className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            {[8, 10, 12, 14].map(n => (
              <option key={n} value={n}>{n} Teams</option>
            ))}
          </select>
        </div>

        {/* Draft Position */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Your Draft Position
          </label>
          <select
            value={draftPosition}
            onChange={e => setDraftPosition(Number(e.target.value))}
            className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            {Array.from({ length: teamCount }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>Pick #{n}</option>
            ))}
          </select>
        </div>

        {/* Scoring Format */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Scoring Format</label>
          <div className="grid grid-cols-3 gap-2">
            {(scoringPresets as ScoringConfig[]).map(preset => (
              <button
                key={preset.id}
                onClick={() => setScoringId(preset.id)}
                className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                  scoringId === preset.id
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Roster Display */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Roster Slots</label>
          <div className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-400">
            {config.rosterSlots.map(slot => (
              <span key={slot.type} className="mr-3">
                {slot.count} {slot.type}
              </span>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">Default roster configuration</p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartDraft}
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Start Draft
        </button>
      </div>
    </div>
  )
}
