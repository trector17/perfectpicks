import { describe, it, expect } from 'vitest'
import { calculateFantasyPoints, rankPlayersByPoints } from '../../src/engine/scoring.ts'
import { testPlayers, pprScoring, standardScoring } from './fixtures.ts'

describe('calculateFantasyPoints', () => {
  const eliteRB = testPlayers.find(p => p.id === 'rb1')!
  const eliteWR = testPlayers.find(p => p.id === 'wr1')!
  const starQB = testPlayers.find(p => p.id === 'qb1')!

  it('calculates PPR points for an RB correctly', () => {
    // 1400 * 0.1 + 12 * 6 + 55 * 1 + 450 * 0.1 + 3 * 6
    // = 140 + 72 + 55 + 45 + 18 = 330
    const points = calculateFantasyPoints(eliteRB, pprScoring)
    expect(points).toBe(330)
  })

  it('calculates standard (non-PPR) points correctly', () => {
    // Same as PPR but receptions worth 0
    // 140 + 72 + 0 + 45 + 18 = 275
    const points = calculateFantasyPoints(eliteRB, standardScoring)
    expect(points).toBe(275)
  })

  it('PPR boosts high-reception players', () => {
    const wrPPR = calculateFantasyPoints(eliteWR, pprScoring)
    const wrStd = calculateFantasyPoints(eliteWR, standardScoring)
    expect(wrPPR).toBeGreaterThan(wrStd)
    expect(wrPPR - wrStd).toBe(110) // 110 receptions * 1 point each
  })

  it('calculates QB points with passing stats', () => {
    // 4800 * 0.04 + 38 * 4 + 10 * -2 + 300 * 0.1 + 3 * 6
    // = 192 + 152 + -20 + 30 + 18 = 372
    const points = calculateFantasyPoints(starQB, pprScoring)
    expect(points).toBe(372)
  })

  it('returns 0 for player with no matching projections', () => {
    const emptyPlayer = { ...eliteRB, projections: {} }
    expect(calculateFantasyPoints(emptyPlayer, pprScoring)).toBe(0)
  })
})

describe('rankPlayersByPoints', () => {
  it('returns players sorted by points descending', () => {
    const ranked = rankPlayersByPoints(testPlayers, pprScoring)
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].points).toBeGreaterThanOrEqual(ranked[i].points)
    }
  })

  it('includes all players', () => {
    const ranked = rankPlayersByPoints(testPlayers, pprScoring)
    expect(ranked).toHaveLength(testPlayers.length)
  })
})
