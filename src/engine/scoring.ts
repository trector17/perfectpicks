import type { Player, ScoringConfig } from '../types/index.ts'

/**
 * Calculate projected fantasy points for a player given a scoring config.
 * Multiplies each projected stat by the corresponding scoring rule.
 */
export function calculateFantasyPoints(player: Player, scoring: ScoringConfig): number {
  let points = 0
  for (const [stat, projected] of Object.entries(player.projections)) {
    const pointsPer = scoring.rules[stat]
    if (pointsPer !== undefined) {
      points += projected * pointsPer
    }
  }
  return Math.round(points * 100) / 100
}

/**
 * Calculate fantasy points for all players and return sorted descending.
 */
export function rankPlayersByPoints(
  players: Player[],
  scoring: ScoringConfig,
): Array<{ player: Player; points: number }> {
  return players
    .map(player => ({ player, points: calculateFantasyPoints(player, scoring) }))
    .sort((a, b) => b.points - a.points)
}
