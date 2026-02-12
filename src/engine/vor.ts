import type { Player, Position, ScoringConfig, RosterSlot } from '../types/index.ts'
import { POSITIONS, starterSlotsForPosition } from '../types/index.ts'
import { calculateFantasyPoints } from './scoring.ts'

/**
 * Determine the replacement level index for a position.
 * This is the number of starters needed across all teams.
 * e.g., in a 10-team league with 2 RB slots + 1 FLEX, replacement RB = ~RB25.
 */
export function getReplacementIndex(
  position: Position,
  teamCount: number,
  rosterSlots: RosterSlot[],
): number {
  const starterSlots = starterSlotsForPosition(rosterSlots, position)
  // Multiply by team count to get total starters at this position across the league.
  // For FLEX-eligible positions, reduce the multiplier slightly since not all FLEX
  // slots will be the same position.
  return starterSlots * teamCount
}

/**
 * Get the replacement-level fantasy points for each position.
 * Returns a map of position → points of the replacement-level player.
 */
export function getReplacementLevels(
  players: Player[],
  scoring: ScoringConfig,
  teamCount: number,
  rosterSlots: RosterSlot[],
): Record<Position, number> {
  const result = {} as Record<Position, number>

  for (const pos of POSITIONS) {
    const posPlayers = players
      .filter(p => p.position === pos)
      .map(p => ({ player: p, points: calculateFantasyPoints(p, scoring) }))
      .sort((a, b) => b.points - a.points)

    const replacementIdx = getReplacementIndex(pos, teamCount, rosterSlots)
    // Use the player at the replacement index, or the last player if fewer exist
    const idx = Math.min(replacementIdx, posPlayers.length - 1)
    result[pos] = idx >= 0 ? posPlayers[idx].points : 0
  }

  return result
}

/**
 * Calculate Value Over Replacement for a single player.
 */
export function calculateVOR(
  player: Player,
  scoring: ScoringConfig,
  replacementLevels: Record<Position, number>,
): number {
  const points = calculateFantasyPoints(player, scoring)
  const replacement = replacementLevels[player.position]
  return Math.max(0, points - replacement)
}

/**
 * Calculate VOR for all available players and return sorted descending.
 */
export function rankPlayersByVOR(
  players: Player[],
  scoring: ScoringConfig,
  teamCount: number,
  rosterSlots: RosterSlot[],
): Array<{ player: Player; vor: number; points: number }> {
  const replacementLevels = getReplacementLevels(players, scoring, teamCount, rosterSlots)

  return players
    .map(player => ({
      player,
      vor: calculateVOR(player, scoring, replacementLevels),
      points: calculateFantasyPoints(player, scoring),
    }))
    .sort((a, b) => b.vor - a.vor)
}
