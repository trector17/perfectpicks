import type { Player, Position, ScoringConfig, RosterSlot } from '../types/index.ts'
import { POSITIONS } from '../types/index.ts'
import { getReplacementLevels } from './vor.ts'
import { calculateFantasyPoints } from './scoring.ts'
import type { PositionScarcity } from './types.ts'

/**
 * Analyze positional scarcity for all positions based on remaining available players.
 * Scarcity increases as the pool of above-replacement players shrinks.
 */
export function analyzeScarcity(
  availablePlayers: Player[],
  allPlayers: Player[],
  scoring: ScoringConfig,
  teamCount: number,
  rosterSlots: RosterSlot[],
): PositionScarcity[] {
  const replacementLevels = getReplacementLevels(allPlayers, scoring, teamCount, rosterSlots)

  const scarcities: PositionScarcity[] = []

  for (const pos of POSITIONS) {
    const available = availablePlayers.filter(p => p.position === pos)
    const aboveReplacement = available.filter(
      p => calculateFantasyPoints(p, scoring) > replacementLevels[pos],
    )

    // Original count of above-replacement players at this position
    const originalAbove = allPlayers
      .filter(p => p.position === pos)
      .filter(p => calculateFantasyPoints(p, scoring) > replacementLevels[pos]).length

    // Scarcity score: 1 - (remaining above replacement / original above replacement)
    // Higher = more scarce
    const scarcityScore =
      originalAbove > 0 ? 1 - aboveReplacement.length / originalAbove : 1

    scarcities.push({
      position: pos,
      remaining: available.length,
      aboveReplacement: aboveReplacement.length,
      scarcityScore: Math.round(scarcityScore * 1000) / 1000,
    })
  }

  return scarcities
}

/**
 * Get the scarcity score for a specific position (0-1, higher = more scarce).
 */
export function getScarcityForPosition(
  scarcities: PositionScarcity[],
  position: Position,
): number {
  return scarcities.find(s => s.position === position)?.scarcityScore ?? 0
}
