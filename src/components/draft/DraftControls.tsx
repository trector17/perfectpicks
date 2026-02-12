import { useDraftStore, selectCurrentOverall, selectIsDraftComplete, selectIsUserPick } from '../../stores/draftStore.ts'
import { useLeagueStore } from '../../stores/leagueStore.ts'
import { totalRosterSize } from '../../types/index.ts'
import { getTeamForPick } from '../../utils/draftOrder.ts'

interface DraftControlsProps {
  isBotPicking?: boolean
}

export function DraftControls({ isBotPicking = false }: DraftControlsProps) {
  const picks = useDraftStore(s => s.picks)
  const undoPick = useDraftStore(s => s.undoPick)
  const config = useLeagueStore(s => s.config)

  const rosterSize = totalRosterSize(config.rosterSlots)
  const currentOverall = selectCurrentOverall(picks, config.teamCount, rosterSize)
  const isDone = selectIsDraftComplete(picks, config.teamCount, rosterSize)
  const isUserPick = selectIsUserPick(picks, config.teamCount, config.draftPosition - 1)
  const currentRound = Math.ceil(currentOverall / config.teamCount)
  const currentTeam = isDone ? -1 : getTeamForPick(currentOverall, config.teamCount)

  const totalPicks = config.teamCount * rosterSize
  const progress = (picks.length / totalPicks) * 100

  return (
    <div className="border-b border-gray-800 bg-gray-900">
      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-2 px-2 py-2 sm:gap-4 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs text-gray-400 sm:text-sm">Rd</span>
          <span className="text-base font-bold text-white sm:text-lg">{isDone ? '-' : currentRound}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs text-gray-400 sm:text-sm">Pick</span>
          <span className="text-base font-bold text-white sm:text-lg">{isDone ? '-' : currentOverall}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {isDone ? (
            <span className="text-xs font-medium text-green-400 sm:text-sm">Draft Complete!</span>
          ) : isUserPick ? (
            <span className="animate-pulse rounded bg-green-600 px-1.5 py-0.5 text-xs font-semibold text-white shadow-lg shadow-green-600/50 sm:px-2 sm:text-sm">
              YOUR PICK
            </span>
          ) : isBotPicking ? (
            <span className="flex items-center gap-1.5 rounded bg-yellow-600/80 px-1.5 py-0.5 text-xs font-semibold text-white sm:px-2 sm:text-sm">
              <span className="inline-block h-2 w-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Team {currentTeam + 1} picking...
            </span>
          ) : (
            <span className="text-xs text-gray-300 sm:text-sm">Team {currentTeam + 1}</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-gray-500 sm:inline">
            {picks.length}/{totalPicks}
          </span>
          <button
            onClick={undoPick}
            disabled={picks.length === 0}
            className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-700 disabled:opacity-40 disabled:hover:bg-gray-800 sm:px-3 sm:py-1.5 sm:text-sm"
          >
            Undo
          </button>
        </div>
      </div>
    </div>
  )
}
