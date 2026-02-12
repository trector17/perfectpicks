import type { Player, Position, DraftPick, RosterSlot } from '../types/index.ts'
import { POSITIONS, FLEX_ELIGIBLE } from '../types/index.ts'
import type { RosterNeed } from './types.ts'

/**
 * Count how many players of a given position a team has drafted.
 */
function countDraftedAtPosition(
  teamPicks: DraftPick[],
  players: Player[],
  position: Position,
): number {
  const playerMap = new Map(players.map(p => [p.id, p]))
  return teamPicks.filter(pick => playerMap.get(pick.playerId)?.position === position).length
}

/**
 * Calculate how many starter slots are still unfilled for a position.
 * Accounts for FLEX eligibility.
 */
function unfilledStarterSlots(
  position: Position,
  rosterSlots: RosterSlot[],
  teamPicks: DraftPick[],
  players: Player[],
): number {
  const drafted = countDraftedAtPosition(teamPicks, players, position)

  // Direct starter slots for this position
  const directSlots = rosterSlots
    .filter(s => s.type === position)
    .reduce((sum, s) => sum + s.count, 0)

  // If we haven't filled direct slots, need is high
  const directUnfilled = Math.max(0, directSlots - drafted)

  // Also consider FLEX slots (shared among RB/WR/TE)
  if (FLEX_ELIGIBLE.includes(position)) {
    const flexSlots = rosterSlots
      .filter(s => s.type === 'FLEX')
      .reduce((sum, s) => sum + s.count, 0)

    // Count total FLEX-eligible players drafted
    const totalFlexEligibleDrafted = FLEX_ELIGIBLE.reduce(
      (sum, pos) => sum + countDraftedAtPosition(teamPicks, players, pos),
      0,
    )
    const totalFlexDirectSlots = FLEX_ELIGIBLE.reduce(
      (sum, pos) =>
        sum +
        rosterSlots
          .filter(s => s.type === pos)
          .reduce((slotSum, s) => slotSum + s.count, 0),
      0,
    )

    // If total flex-eligible drafted exceeds direct slots, they fill FLEX
    const flexFilledByOthers = Math.max(0, totalFlexEligibleDrafted - totalFlexDirectSlots)
    const flexUnfilled = Math.max(0, flexSlots - flexFilledByOthers)

    // If direct slots are filled, remaining can still fill flex
    if (directUnfilled === 0 && flexUnfilled > 0) {
      return 0 // Direct need is met, FLEX is a bonus
    }

    return directUnfilled
  }

  return directUnfilled
}

/**
 * Analyze roster needs for the user's team.
 * Returns a need assessment for each position.
 */
export function analyzeNeeds(
  userTeamPicks: DraftPick[],
  players: Player[],
  rosterSlots: RosterSlot[],
  totalRounds: number,
  currentRound: number,
): RosterNeed[] {
  const remainingRounds = totalRounds - currentRound + 1
  const needs: RosterNeed[] = []

  for (const pos of POSITIONS) {
    const drafted = countDraftedAtPosition(userTeamPicks, players, pos)
    const unfilled = unfilledStarterSlots(pos, rosterSlots, userTeamPicks, players)

    // Total slots that could use this position (direct + bench)
    const totalSlots = rosterSlots
      .filter(s => s.type === pos || s.type === 'BENCH' || s.type === 'FLEX' || s.type === 'SUPERFLEX')
      .reduce((sum, s) => sum + s.count, 0)
    const unfilledTotal = Math.max(0, totalSlots - drafted)

    // Need score calculation:
    // - High if starter slots unfilled and few rounds remain
    // - Lower if there are many rounds left to fill the position
    let needScore = 0
    if (unfilled > 0) {
      // Urgency increases as remaining rounds decrease relative to unfilled slots
      const urgency = Math.min(1, unfilled / Math.max(1, remainingRounds))
      needScore = 0.5 + urgency * 0.5
    } else if (drafted === 0 && remainingRounds <= 4) {
      // Haven't drafted any yet and running low on rounds
      needScore = 0.3
    }

    needs.push({
      position: pos,
      unfilledStarters: unfilled,
      unfilledTotal,
      needScore: Math.round(needScore * 1000) / 1000,
    })
  }

  return needs
}

/**
 * Get the need score for a specific position (0-1, higher = more needed).
 */
export function getNeedForPosition(needs: RosterNeed[], position: Position): number {
  return needs.find(n => n.position === position)?.needScore ?? 0
}
