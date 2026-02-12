import { useMemo } from 'react'
import { useDraftStore, selectTeamPicks } from '../../stores/draftStore.ts'
import { useLeagueStore } from '../../stores/leagueStore.ts'
import { usePlayerStore, selectPlayerById } from '../../stores/playerStore.ts'
import { calculateFantasyPoints } from '../../engine/scoring.ts'
import { POSITION_COLORS } from '../../constants/positions.ts'
import type { RosterSlot } from '../../types/index.ts'

export function MyRoster() {
  const picks = useDraftStore(s => s.picks)
  const config = useLeagueStore(s => s.config)
  const allPlayers = usePlayerStore(s => s.players)

  const userTeamIndex = config.draftPosition - 1

  const { slots, totalPoints } = useMemo(() => {
    const userPicks = selectTeamPicks(picks, userTeamIndex)
    const draftedPlayers = userPicks
      .map(p => selectPlayerById(allPlayers, p.playerId))
      .filter(Boolean)

    // Assign drafted players to roster slots
    const remaining = [...draftedPlayers]
    const slotEntries: Array<{ slot: RosterSlot; slotIndex: number; player: typeof draftedPlayers[0] }> = []

    // Fill direct position slots first
    for (const slot of config.rosterSlots) {
      for (let i = 0; i < slot.count; i++) {
        if (slot.type === 'FLEX' || slot.type === 'SUPERFLEX' || slot.type === 'BENCH') continue
        const idx = remaining.findIndex(p => p!.position === slot.type)
        const player = idx >= 0 ? remaining.splice(idx, 1)[0] : undefined
        slotEntries.push({ slot, slotIndex: i, player })
      }
    }

    // Fill FLEX slots
    const flexSlots = config.rosterSlots.filter(s => s.type === 'FLEX')
    for (const slot of flexSlots) {
      for (let i = 0; i < slot.count; i++) {
        const idx = remaining.findIndex(p => ['RB', 'WR', 'TE'].includes(p!.position))
        const player = idx >= 0 ? remaining.splice(idx, 1)[0] : undefined
        slotEntries.push({ slot, slotIndex: i, player })
      }
    }

    // Fill bench with whatever's left
    const benchSlots = config.rosterSlots.filter(s => s.type === 'BENCH')
    for (const slot of benchSlots) {
      for (let i = 0; i < slot.count; i++) {
        const player = remaining.shift()
        slotEntries.push({ slot, slotIndex: i, player })
      }
    }

    const total = draftedPlayers.reduce(
      (sum, p) => sum + (p ? calculateFantasyPoints(p, config.scoringConfig) : 0),
      0,
    )

    return { slots: slotEntries, totalPoints: total }
  }, [picks, allPlayers, config, userTeamIndex])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
        <h3 className="text-sm font-semibold text-gray-300">My Roster</h3>
        <span className="text-xs text-gray-500">{totalPoints.toFixed(0)} pts</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {slots.map(({ slot, slotIndex, player }, i) => (
          <div
            key={`${slot.type}-${slotIndex}-${i}`}
            className="flex items-center gap-2 border-b border-gray-800/50 px-3 py-1.5"
          >
            <span className={`w-10 text-xs font-medium ${POSITION_COLORS[slot.type] ?? 'text-gray-500'}`}>
              {slot.type}
            </span>
            {player ? (
              <div className="flex-1">
                <span className="text-sm text-white">{player.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  {calculateFantasyPoints(player, config.scoringConfig).toFixed(0)} pts
                </span>
              </div>
            ) : (
              <span className="flex-1 text-xs text-gray-600">Empty</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
