import { describe, it, expect } from 'vitest'
import {
  generateDraftOrder,
  getTeamForPick,
  getPicksForTeam,
  getNextPickForTeam,
} from '../../src/utils/draftOrder.ts'

describe('generateDraftOrder', () => {
  it('generates correct picks for 4 teams, 3 rounds', () => {
    const order = generateDraftOrder(4, 3)
    expect(order).toHaveLength(12)

    // Round 1: teams 0,1,2,3
    expect(order[0]).toEqual({ overall: 1, round: 1, pickInRound: 1, teamIndex: 0 })
    expect(order[1]).toEqual({ overall: 2, round: 1, pickInRound: 2, teamIndex: 1 })
    expect(order[2]).toEqual({ overall: 3, round: 1, pickInRound: 3, teamIndex: 2 })
    expect(order[3]).toEqual({ overall: 4, round: 1, pickInRound: 4, teamIndex: 3 })

    // Round 2 (snake): teams 3,2,1,0
    expect(order[4]).toEqual({ overall: 5, round: 2, pickInRound: 1, teamIndex: 3 })
    expect(order[5]).toEqual({ overall: 6, round: 2, pickInRound: 2, teamIndex: 2 })
    expect(order[6]).toEqual({ overall: 7, round: 2, pickInRound: 3, teamIndex: 1 })
    expect(order[7]).toEqual({ overall: 8, round: 2, pickInRound: 4, teamIndex: 0 })

    // Round 3: teams 0,1,2,3 again
    expect(order[8]).toEqual({ overall: 9, round: 3, pickInRound: 1, teamIndex: 0 })
    expect(order[11]).toEqual({ overall: 12, round: 3, pickInRound: 4, teamIndex: 3 })
  })

  it('generates correct total picks for 10 teams, 15 rounds', () => {
    const order = generateDraftOrder(10, 15)
    expect(order).toHaveLength(150)
    expect(order[0].overall).toBe(1)
    expect(order[149].overall).toBe(150)
  })

  it('handles single team', () => {
    const order = generateDraftOrder(1, 3)
    expect(order).toHaveLength(3)
    expect(order.every(p => p.teamIndex === 0)).toBe(true)
  })
})

describe('getTeamForPick', () => {
  it('returns correct team for round 1 picks', () => {
    expect(getTeamForPick(1, 10)).toBe(0)
    expect(getTeamForPick(5, 10)).toBe(4)
    expect(getTeamForPick(10, 10)).toBe(9)
  })

  it('returns correct team for round 2 (snake) picks', () => {
    expect(getTeamForPick(11, 10)).toBe(9) // first pick of round 2 = last team
    expect(getTeamForPick(20, 10)).toBe(0) // last pick of round 2 = first team
  })

  it('is consistent with generateDraftOrder', () => {
    const order = generateDraftOrder(10, 15)
    for (const pick of order) {
      expect(getTeamForPick(pick.overall, 10)).toBe(pick.teamIndex)
    }
  })
})

describe('getPicksForTeam', () => {
  it('returns all picks for team 0 in 10-team, 15-round draft', () => {
    const picks = getPicksForTeam(0, 10, 15)
    expect(picks).toHaveLength(15)
    // First pick in round 1 = overall 1
    expect(picks[0]).toBe(1)
    // Last pick in round 2 (snake) = overall 20
    expect(picks[1]).toBe(20)
    // First pick in round 3 = overall 21
    expect(picks[2]).toBe(21)
  })

  it('returns all picks for last team in 10-team draft', () => {
    const picks = getPicksForTeam(9, 10, 15)
    expect(picks).toHaveLength(15)
    // Last pick in round 1 = overall 10
    expect(picks[0]).toBe(10)
    // First pick in round 2 (snake) = overall 11
    expect(picks[1]).toBe(11)
  })

  it('all team picks match generateDraftOrder', () => {
    const order = generateDraftOrder(10, 15)
    for (let team = 0; team < 10; team++) {
      const teamPicks = getPicksForTeam(team, 10, 15)
      const fromOrder = order.filter(p => p.teamIndex === team).map(p => p.overall)
      expect(teamPicks).toEqual(fromOrder)
    }
  })
})

describe('getNextPickForTeam', () => {
  it('returns next pick for team 0 after pick 1', () => {
    // Team 0 picks at 1, 20, 21, ...
    expect(getNextPickForTeam(0, 1, 10, 15)).toBe(20)
  })

  it('returns next pick for team 9 after pick 10', () => {
    // Team 9 picks at 10, 11, 30, 31 ...
    expect(getNextPickForTeam(9, 10, 10, 15)).toBe(11)
  })

  it('returns null when no more picks', () => {
    expect(getNextPickForTeam(0, 150, 10, 15)).toBeNull()
  })

  it('returns null when team has drafted all rounds', () => {
    const lastPick = getPicksForTeam(0, 10, 15).at(-1)!
    expect(getNextPickForTeam(0, lastPick, 10, 15)).toBeNull()
  })
})
