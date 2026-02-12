import type { Player, Recommendation } from '../types/index.ts'
import { totalRosterSize } from '../types/index.ts'
import { getReplacementLevels, calculateVOR } from './vor.ts'
import { analyzeScarcity, getScarcityForPosition } from './scarcity.ts'
import { analyzeNeeds, getNeedForPosition } from './needs.ts'
import { getDraftPhase, getPhaseWeights } from './phase.ts'
import { selectTeamPicks } from '../stores/draftStore.ts'
import type { EngineInput } from './types.ts'

/**
 * Calculate ADP value score: how much value this player represents
 * relative to their ADP vs current pick.
 * Positive = player falling past their ADP (good value).
 */
function calculateADPValue(player: Player, currentOverall: number, teamCount: number): number {
  const adpDiff = player.adp - currentOverall
  // Normalize: if ADP is well below current pick, high value
  // If ADP is above current pick, might be available later (lower urgency)
  // Scale by ~1 round (teamCount picks)
  const normalized = -adpDiff / teamCount
  // Clamp to 0-1 range
  return Math.max(0, Math.min(1, 0.5 + normalized * 0.5))
}

/**
 * Normalize an array of scores to 0-1 range.
 */
function normalizeScores(scores: number[]): number[] {
  const max = Math.max(...scores)
  if (max === 0) return scores.map(() => 0)
  return scores.map(s => s / max)
}

/**
 * Generate a human-readable reason for why a player is recommended.
 */
function generateReasons(
  player: Player,
  vorScore: number,
  scarcityScore: number,
  needScore: number,
  adpValueScore: number,
): string[] {
  const reasons: string[] = []

  if (vorScore > 0.7) reasons.push(`Elite value over replacement at ${player.position}`)
  else if (vorScore > 0.4) reasons.push(`Strong value over replacement`)

  if (scarcityScore > 0.6) reasons.push(`${player.position} pool thinning quickly`)
  if (needScore > 0.7) reasons.push(`Fills critical roster need at ${player.position}`)
  else if (needScore > 0.4) reasons.push(`Addresses roster need at ${player.position}`)

  if (adpValueScore > 0.7) reasons.push(`Falling past ADP — great value pick`)
  else if (adpValueScore > 0.5) reasons.push(`Good value relative to ADP`)

  if (reasons.length === 0) reasons.push(`Best available option`)

  return reasons
}

/**
 * Core recommendation engine.
 * Takes the full draft context and returns ranked recommendations.
 * @param forTeamIndex - Optional team index to get recommendations for (defaults to user's team)
 */
export function getRecommendations(input: EngineInput, count: number = 10, forTeamIndex?: number): Recommendation[] {
  const { players, picks, leagueConfig, currentOverall } = input
  const { teamCount, rosterSlots, scoringConfig, draftPosition } = leagueConfig
  const rosterSize = totalRosterSize(rosterSlots)
  const totalRounds = rosterSize
  const currentRound = Math.ceil(currentOverall / teamCount)

  // Use provided team index or default to user's team
  const teamIndex = forTeamIndex ?? (draftPosition - 1)

  // Get team's existing picks
  const teamPicks = selectTeamPicks(picks, teamIndex)

  // Available players (not yet drafted)
  const draftedIds = new Set(picks.map(p => p.playerId))
  const available = players.filter(p => !draftedIds.has(p.id))

  if (available.length === 0) return []

  // Phase and weights
  const phase = getDraftPhase(currentRound, totalRounds)
  const weights = getPhaseWeights(phase)

  // Signal 1: VOR
  const replacementLevels = getReplacementLevels(players, scoringConfig, teamCount, rosterSlots)
  const vorScoresRaw = available.map(p => calculateVOR(p, scoringConfig, replacementLevels))

  // Signal 2: Scarcity
  const scarcities = analyzeScarcity(available, players, scoringConfig, teamCount, rosterSlots)
  const scarcityScoresRaw = available.map(p => getScarcityForPosition(scarcities, p.position))

  // Signal 3: Roster need
  const needs = analyzeNeeds(teamPicks, players, rosterSlots, totalRounds, currentRound)
  const needScoresRaw = available.map(p => getNeedForPosition(needs, p.position))

  // Signal 4: ADP value
  const adpScoresRaw = available.map(p => calculateADPValue(p, currentOverall, teamCount))

  // Normalize VOR scores (scarcity, need, adp are already 0-1)
  const vorNorm = normalizeScores(vorScoresRaw)

  // Compute composite scores
  const scored = available.map((player, i) => {
    const vorScore = vorNorm[i]
    const scarcityScore = scarcityScoresRaw[i]
    const needScore = needScoresRaw[i]
    const adpValueScore = adpScoresRaw[i]

    const composite =
      vorScore * weights.vor +
      scarcityScore * weights.scarcity +
      needScore * weights.need +
      adpValueScore * weights.adpValue

    return {
      player,
      score: Math.round(composite * 1000) / 1000,
      rank: 0,
      reasons: generateReasons(player, vorScore, scarcityScore, needScore, adpValueScore),
      breakdown: {
        vorScore: Math.round(vorScore * 1000) / 1000,
        scarcityScore: Math.round(scarcityScore * 1000) / 1000,
        needScore: Math.round(needScore * 1000) / 1000,
        adpValueScore: Math.round(adpValueScore * 1000) / 1000,
      },
    }
  })

  // Sort by composite score descending
  scored.sort((a, b) => b.score - a.score)

  // Assign ranks and take top N
  return scored.slice(0, count).map((rec, i) => ({
    ...rec,
    rank: i + 1,
  }))
}
