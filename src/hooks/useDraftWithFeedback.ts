import { useDraftStore, selectIsUserPick } from '../stores/draftStore.ts'
import { usePlayerStore, selectPlayerById } from '../stores/playerStore.ts'
import { useLeagueStore } from '../stores/leagueStore.ts'
import { useToast } from '../components/ui/Toast.tsx'

export function useDraftWithFeedback() {
  const makePick = useDraftStore(s => s.makePick)
  const picks = useDraftStore(s => s.picks)
  const players = usePlayerStore(s => s.players)
  const config = useLeagueStore(s => s.config)
  const showToast = useToast(s => s.show)

  const userTeamIndex = config.draftPosition - 1
  const isUserPick = selectIsUserPick(picks, config.teamCount, userTeamIndex)

  const draftPlayer = (playerId: string) => {
    const player = selectPlayerById(players, playerId)
    if (!player) return

    makePick(playerId)

    if (isUserPick) {
      showToast(`Drafted ${player.name}!`, 'success')
    } else {
      showToast(`${player.name} drafted by Team ${((picks.length) % config.teamCount) + 1}`, 'info')
    }
  }

  return { draftPlayer, isUserPick }
}
