import { create } from 'zustand'
import type { Player, Position } from '../types/index.ts'

interface PlayerStore {
  players: Player[]
  isLoaded: boolean

  loadPlayers: (players: Player[]) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  players: [],
  isLoaded: false,

  loadPlayers: (players) => set({ players, isLoaded: true }),
}))

// ── Derived selectors (pure functions, take store state as input) ──

/** Get available players (not yet drafted) */
export function selectAvailablePlayers(players: Player[], draftedIds: Set<string>): Player[] {
  return players.filter(p => !draftedIds.has(p.id))
}

/** Filter players by position */
export function selectPlayersByPosition(players: Player[], position: Position): Player[] {
  return players.filter(p => p.position === position)
}

/** Search players by name (case-insensitive) */
export function selectPlayersBySearch(players: Player[], query: string): Player[] {
  const lower = query.toLowerCase()
  return players.filter(p => p.name.toLowerCase().includes(lower))
}

/** Get a player by ID */
export function selectPlayerById(players: Player[], id: string): Player | undefined {
  return players.find(p => p.id === id)
}
