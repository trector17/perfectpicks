import { useEffect, useRef } from 'react'
import { useDraftStore, selectIsUserPick, selectIsDraftComplete } from '../stores/draftStore.ts'
import { usePlayerStore } from '../stores/playerStore.ts'
import { useLeagueStore } from '../stores/leagueStore.ts'
import { useToast } from '../components/ui/Toast.tsx'
import { totalRosterSize } from '../types/index.ts'
import { getRecommendations } from '../engine/recommend.ts'
import { getTeamForPick } from '../utils/draftOrder.ts'
import type { EngineInput } from '../engine/types.ts'

const BOT_PICK_DELAY = 800 // ms delay before bot picks

export function useBotPicks() {
  const picks = useDraftStore(s => s.picks)
  const makePick = useDraftStore(s => s.makePick)
  const players = usePlayerStore(s => s.players)
  const config = useLeagueStore(s => s.config)
  const showToast = useToast(s => s.show)
  const timeoutRef = useRef<number | null>(null)

  const userTeamIndex = config.draftPosition - 1
  const rosterSize = totalRosterSize(config.rosterSlots)
  const isUserPick = selectIsUserPick(picks, config.teamCount, userTeamIndex)
  const isDone = selectIsDraftComplete(picks, config.teamCount, rosterSize)
  const currentOverall = picks.length + 1
  const currentTeamIndex = getTeamForPick(currentOverall, config.teamCount)

  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Don't auto-pick if draft is done, it's user's turn, or no players loaded
    if (isDone || isUserPick || players.length === 0) {
      return
    }

    // Schedule bot pick
    timeoutRef.current = window.setTimeout(() => {
      const input: EngineInput = {
        players,
        picks,
        leagueConfig: config,
        currentOverall,
      }

      // Get recommendations for the current team (bot)
      const recommendations = getRecommendations(input, 1, currentTeamIndex)

      if (recommendations.length > 0) {
        const pick = recommendations[0]
        makePick(pick.player.id)
        showToast(`Team ${currentTeamIndex + 1} drafted ${pick.player.name}`, 'info')
      }
    }, BOT_PICK_DELAY)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [picks, players, config, isUserPick, isDone, currentOverall, currentTeamIndex, makePick, showToast])

  return { isUserPick, isBotPicking: !isUserPick && !isDone && players.length > 0 }
}
