/**
 * Snake draft order utilities.
 *
 * In a snake draft, odd rounds go 1→N and even rounds go N→1.
 * Example for 4 teams, 3 rounds:
 *   Round 1: Team 1, Team 2, Team 3, Team 4
 *   Round 2: Team 4, Team 3, Team 2, Team 1
 *   Round 3: Team 1, Team 2, Team 3, Team 4
 */

export interface PickInfo {
  /** Overall pick number (1-indexed) */
  overall: number
  round: number
  /** Pick within the round (1-indexed) */
  pickInRound: number
  /** Team index (0-indexed) */
  teamIndex: number
}

/**
 * Generate the full snake draft order for a given number of teams and rounds.
 */
export function generateDraftOrder(teamCount: number, rounds: number): PickInfo[] {
  const picks: PickInfo[] = []
  let overall = 1

  for (let round = 1; round <= rounds; round++) {
    const isEvenRound = round % 2 === 0
    for (let pick = 1; pick <= teamCount; pick++) {
      const teamIndex = isEvenRound ? teamCount - pick : pick - 1
      picks.push({
        overall,
        round,
        pickInRound: pick,
        teamIndex,
      })
      overall++
    }
  }

  return picks
}

/**
 * Get the team index for a given overall pick number.
 */
export function getTeamForPick(overall: number, teamCount: number): number {
  const round = Math.ceil(overall / teamCount)
  const pickInRound = overall - (round - 1) * teamCount
  const isEvenRound = round % 2 === 0
  return isEvenRound ? teamCount - pickInRound : pickInRound - 1
}

/**
 * Get all overall pick numbers for a specific team (0-indexed).
 */
export function getPicksForTeam(teamIndex: number, teamCount: number, rounds: number): number[] {
  const picks: number[] = []
  for (let round = 1; round <= rounds; round++) {
    const isEvenRound = round % 2 === 0
    const pickInRound = isEvenRound ? teamCount - teamIndex : teamIndex + 1
    const overall = (round - 1) * teamCount + pickInRound
    picks.push(overall)
  }
  return picks
}

/**
 * Get the next overall pick number for a specific team after a given overall pick.
 * Returns null if the team has no more picks.
 */
export function getNextPickForTeam(
  teamIndex: number,
  afterOverall: number,
  teamCount: number,
  rounds: number,
): number | null {
  const totalPicks = teamCount * rounds
  for (let overall = afterOverall + 1; overall <= totalPicks; overall++) {
    if (getTeamForPick(overall, teamCount) === teamIndex) {
      return overall
    }
  }
  return null
}
