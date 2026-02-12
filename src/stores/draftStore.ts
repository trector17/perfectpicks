import { create } from 'zustand'
import type { DraftPick } from '../types/index.ts'
import { totalRosterSize } from '../types/index.ts'
import { getTeamForPick } from '../utils/draftOrder.ts'
import { saveToStorage, loadFromStorage } from '../utils/persistence.ts'
import { useLeagueStore } from './leagueStore.ts'

const STORAGE_KEY = 'draft-state'

interface SavedDraftState {
  picks: DraftPick[]
}

interface DraftStore {
  picks: DraftPick[]

  /** Make a pick: assign a player to the current overall pick position */
  makePick: (playerId: string) => void

  /** Undo the last pick */
  undoPick: () => void

  /** Reset the entire draft */
  resetDraft: () => void

  /** Load saved draft state from storage */
  loadSaved: () => void
}

export const useDraftStore = create<DraftStore>((set, get) => ({
  picks: loadFromStorage<SavedDraftState>(STORAGE_KEY)?.picks ?? [],

  makePick: (playerId) => {
    const { config } = useLeagueStore.getState()
    const { picks } = get()
    const totalPicks = config.teamCount * totalRosterSize(config.rosterSlots)

    const nextOverall = picks.length + 1
    if (nextOverall > totalPicks) return // draft complete

    const round = Math.ceil(nextOverall / config.teamCount)
    const pickInRound = nextOverall - (round - 1) * config.teamCount
    const teamIndex = getTeamForPick(nextOverall, config.teamCount)

    const newPick: DraftPick = {
      overall: nextOverall,
      round,
      pickInRound,
      teamIndex,
      playerId,
    }

    const newPicks = [...picks, newPick]
    saveToStorage(STORAGE_KEY, { picks: newPicks })
    set({ picks: newPicks })
  },

  undoPick: () => {
    const { picks } = get()
    if (picks.length === 0) return

    const newPicks = picks.slice(0, -1)
    saveToStorage(STORAGE_KEY, { picks: newPicks })
    set({ picks: newPicks })
  },

  resetDraft: () => {
    saveToStorage(STORAGE_KEY, { picks: [] })
    set({ picks: [] })
  },

  loadSaved: () => {
    const saved = loadFromStorage<SavedDraftState>(STORAGE_KEY)
    if (saved) {
      set({ picks: saved.picks })
    }
  },
}))

// ── Derived selectors ──────────────────────────────────────

/** Get the current overall pick number (1-indexed). Returns totalPicks+1 if draft is complete. */
export function selectCurrentOverall(picks: DraftPick[], teamCount: number, rosterSize: number): number {
  return Math.min(picks.length + 1, teamCount * rosterSize + 1)
}

/** Check if the draft is complete */
export function selectIsDraftComplete(picks: DraftPick[], teamCount: number, rosterSize: number): boolean {
  return picks.length >= teamCount * rosterSize
}

/** Get the current round */
export function selectCurrentRound(picks: DraftPick[], teamCount: number): number {
  return Math.ceil((picks.length + 1) / teamCount)
}

/** Check if it's the user's pick */
export function selectIsUserPick(picks: DraftPick[], teamCount: number, userTeamIndex: number): boolean {
  const nextOverall = picks.length + 1
  return getTeamForPick(nextOverall, teamCount) === userTeamIndex
}

/** Get all picks for a specific team */
export function selectTeamPicks(picks: DraftPick[], teamIndex: number): DraftPick[] {
  return picks.filter(p => p.teamIndex === teamIndex)
}

/** Get the set of drafted player IDs */
export function selectDraftedPlayerIds(picks: DraftPick[]): Set<string> {
  return new Set(picks.map(p => p.playerId))
}
