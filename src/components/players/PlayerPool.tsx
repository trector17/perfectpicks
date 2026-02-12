import { useMemo } from 'react'
import { usePlayerStore, selectAvailablePlayers, selectPlayersByPosition, selectPlayersBySearch } from '../../stores/playerStore.ts'
import { useDraftStore, selectDraftedPlayerIds, selectIsDraftComplete } from '../../stores/draftStore.ts'
import { useLeagueStore } from '../../stores/leagueStore.ts'
import { useUIStore } from '../../stores/uiStore.ts'
import { totalRosterSize } from '../../types/index.ts'
import { calculateFantasyPoints } from '../../engine/scoring.ts'
import { PlayerFilters } from './PlayerFilters.tsx'
import { useDraftWithFeedback } from '../../hooks/useDraftWithFeedback.ts'

const POSITION_BADGES: Record<string, string> = {
  QB: 'bg-red-900/60 text-red-300',
  RB: 'bg-green-900/60 text-green-300',
  WR: 'bg-blue-900/60 text-blue-300',
  TE: 'bg-orange-900/60 text-orange-300',
  K: 'bg-purple-900/60 text-purple-300',
  DST: 'bg-yellow-900/60 text-yellow-300',
}

export function PlayerPool() {
  const allPlayers = usePlayerStore(s => s.players)
  const picks = useDraftStore(s => s.picks)
  const config = useLeagueStore(s => s.config)
  const positionFilter = useUIStore(s => s.positionFilter)
  const searchQuery = useUIStore(s => s.searchQuery)
  const { draftPlayer } = useDraftWithFeedback()

  const rosterSize = totalRosterSize(config.rosterSlots)
  const isDone = selectIsDraftComplete(picks, config.teamCount, rosterSize)

  const filteredPlayers = useMemo(() => {
    const draftedIds = selectDraftedPlayerIds(picks)
    let players = selectAvailablePlayers(allPlayers, draftedIds)
    if (positionFilter) {
      players = selectPlayersByPosition(players, positionFilter)
    }
    if (searchQuery.trim()) {
      players = selectPlayersBySearch(players, searchQuery)
    }
    return players
  }, [allPlayers, picks, positionFilter, searchQuery])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-800 px-3 py-2">
        <h3 className="text-sm font-semibold text-gray-300">Available Players</h3>
      </div>
      <PlayerFilters />
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-900">
            <tr className="text-left text-xs text-gray-500">
              <th className="px-3 py-1">Player</th>
              <th className="px-2 py-1">Pos</th>
              <th className="px-2 py-1 text-right">ADP</th>
              <th className="px-2 py-1 text-right">Pts</th>
              <th className="px-2 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map(player => (
              <tr
                key={player.id}
                className="border-t border-gray-800/50 hover:bg-gray-800/50"
              >
                <td className="px-3 py-1.5">
                  <div className="font-medium text-white">{player.name}</div>
                  <div className="text-xs text-gray-500">{player.team} - Bye {player.bye}</div>
                </td>
                <td className="px-2 py-1.5">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${POSITION_BADGES[player.position] ?? ''}`}>
                    {player.position}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right text-gray-400">
                  {player.adp.toFixed(1)}
                </td>
                <td className="px-2 py-1.5 text-right text-gray-400">
                  {calculateFantasyPoints(player, config.scoringConfig).toFixed(0)}
                </td>
                <td className="px-2 py-1.5 text-right">
                  <button
                    onClick={() => draftPlayer(player.id)}
                    disabled={isDone}
                    className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-600 disabled:opacity-40"
                  >
                    Draft
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPlayers.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            No players match your filters.
          </div>
        )}
      </div>
    </div>
  )
}
