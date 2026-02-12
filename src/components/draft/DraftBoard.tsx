import { useDraftStore } from '../../stores/draftStore.ts'
import { useLeagueStore } from '../../stores/leagueStore.ts'
import { usePlayerStore } from '../../stores/playerStore.ts'
import { totalRosterSize } from '../../types/index.ts'
import { selectPlayerById } from '../../stores/playerStore.ts'
import { getTeamForPick } from '../../utils/draftOrder.ts'

const POSITION_COLORS: Record<string, string> = {
  QB: 'bg-red-900/60 text-red-300',
  RB: 'bg-green-900/60 text-green-300',
  WR: 'bg-blue-900/60 text-blue-300',
  TE: 'bg-orange-900/60 text-orange-300',
  K: 'bg-purple-900/60 text-purple-300',
  DST: 'bg-yellow-900/60 text-yellow-300',
}

export function DraftBoard() {
  const picks = useDraftStore(s => s.picks)
  const { teamCount, draftPosition } = useLeagueStore(s => s.config)
  const players = usePlayerStore(s => s.players)

  const rounds = totalRosterSize(useLeagueStore(s => s.config).rosterSlots)
  const currentOverall = picks.length + 1
  const userTeamIndex = draftPosition - 1

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-gray-900 px-2 py-1 text-left text-gray-500">Rd</th>
            {Array.from({ length: teamCount }, (_, i) => (
              <th
                key={i}
                className={`px-1 py-1 text-center ${
                  i === userTeamIndex ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                {i === userTeamIndex ? 'You' : `T${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rounds }, (_, round) => (
            <tr key={round} className="border-t border-gray-800">
              <td className="sticky left-0 z-10 bg-gray-900 px-2 py-1 text-gray-500">
                {round + 1}
              </td>
              {Array.from({ length: teamCount }, (_, pick) => {
                const overall = round * teamCount + pick + 1
                const teamIndex = getTeamForPick(overall, teamCount)
                const draftPick = picks.find(p => p.overall === overall)
                const player = draftPick
                  ? selectPlayerById(players, draftPick.playerId)
                  : undefined
                const isCurrentPick = overall === currentOverall
                const isUserColumn = teamIndex === userTeamIndex

                return (
                  <td
                    key={pick}
                    className={`px-1 py-0.5 text-center ${
                      isCurrentPick
                        ? 'ring-2 ring-inset ring-yellow-500'
                        : isUserColumn
                          ? 'bg-blue-950/30'
                          : ''
                    }`}
                  >
                    {player ? (
                      <div
                        className={`rounded px-1 py-0.5 ${POSITION_COLORS[player.position] ?? ''}`}
                      >
                        <div className="truncate font-medium">{player.name.split(' ').pop()}</div>
                        <div className="text-[10px] opacity-70">{player.position}</div>
                      </div>
                    ) : (
                      <div className="py-1 text-gray-700">{overall}</div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
