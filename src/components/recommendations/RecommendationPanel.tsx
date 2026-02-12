import { useMemo, useEffect } from 'react'
import { usePlayerStore } from '../../stores/playerStore.ts'
import { useDraftStore, selectIsDraftComplete } from '../../stores/draftStore.ts'
import { useLeagueStore } from '../../stores/leagueStore.ts'
import { totalRosterSize } from '../../types/index.ts'
import { getRecommendations } from '../../engine/recommend.ts'
import { useDraftWithFeedback } from '../../hooks/useDraftWithFeedback.ts'
import type { EngineInput } from '../../engine/types.ts'
import type { Recommendation } from '../../types/index.ts'

const POSITION_BADGES: Record<string, string> = {
  QB: 'bg-red-900/60 text-red-300',
  RB: 'bg-green-900/60 text-green-300',
  WR: 'bg-blue-900/60 text-blue-300',
  TE: 'bg-orange-900/60 text-orange-300',
  K: 'bg-purple-900/60 text-purple-300',
  DST: 'bg-yellow-900/60 text-yellow-300',
}

function RecommendationCard({ rec, isTop, onDraft }: { rec: Recommendation; isTop?: boolean; onDraft: () => void }) {
  return (
    <div className={`border-b border-gray-800 px-3 py-2 transition-colors hover:bg-gray-800/50 ${
      isTop ? 'bg-green-950/30' : ''
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${isTop ? 'text-green-400' : 'text-gray-500'}`}>
              #{rec.rank}
            </span>
            <span className="font-medium text-white">{rec.player.name}</span>
            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${POSITION_BADGES[rec.player.position] ?? ''}`}>
              {rec.player.position}
            </span>
            {isTop && (
              <span className="rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                TOP PICK
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            {rec.player.team} - ADP {rec.player.adp.toFixed(1)}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {rec.reasons.map((reason, i) => (
              <span key={i} className="rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-400">
                {reason}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-bold text-green-400">{rec.score.toFixed(3)}</span>
          <button
            onClick={onDraft}
            className={`rounded px-2 py-1 text-xs font-medium text-white transition-colors ${
              isTop
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {isTop ? 'Draft (Enter)' : 'Draft'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function RecommendationPanel() {
  const players = usePlayerStore(s => s.players)
  const picks = useDraftStore(s => s.picks)
  const config = useLeagueStore(s => s.config)
  const { draftPlayer, isUserPick } = useDraftWithFeedback()

  const rosterSize = totalRosterSize(config.rosterSlots)
  const isDone = selectIsDraftComplete(picks, config.teamCount, rosterSize)
  const currentOverall = picks.length + 1

  const recommendations = useMemo(() => {
    if (isDone || players.length === 0) return []

    const input: EngineInput = {
      players,
      picks,
      leagueConfig: config,
      currentOverall,
    }

    return getRecommendations(input, 8)
  }, [players, picks, config, currentOverall, isDone])

  // Keyboard shortcut: Enter to draft top recommendation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.repeat && recommendations.length > 0 && isUserPick) {
        e.preventDefault()
        draftPlayer(recommendations[0].player.id)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [recommendations, isUserPick, draftPlayer])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-800 px-3 py-2">
        <h3 className="text-sm font-semibold text-green-400">Recommendations</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isDone ? (
          <div className="p-4 text-center text-sm text-gray-500">Draft complete!</div>
        ) : recommendations.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
        ) : (
          recommendations.map((rec, index) => (
            <RecommendationCard
              key={rec.player.id}
              rec={rec}
              isTop={index === 0}
              onDraft={() => draftPlayer(rec.player.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
