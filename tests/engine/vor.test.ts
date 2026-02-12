import { describe, it, expect } from 'vitest'
import { getReplacementLevels, calculateVOR, rankPlayersByVOR } from '../../src/engine/vor.ts'
import { testPlayers, pprScoring, testRosterSlots } from './fixtures.ts'

describe('getReplacementLevels', () => {
  it('returns a value for every position', () => {
    const levels = getReplacementLevels(testPlayers, pprScoring, 10, testRosterSlots)
    expect(levels).toHaveProperty('QB')
    expect(levels).toHaveProperty('RB')
    expect(levels).toHaveProperty('WR')
    expect(levels).toHaveProperty('TE')
    expect(levels).toHaveProperty('K')
    expect(levels).toHaveProperty('DST')
  })

  it('replacement level is lower than the best player at each position', () => {
    const levels = getReplacementLevels(testPlayers, pprScoring, 10, testRosterSlots)
    // The best QB should have more points than the replacement level
    expect(levels.QB).toBeLessThan(372) // Star QB's points
    expect(levels.RB).toBeLessThan(330) // Elite RB's points
  })
})

describe('calculateVOR', () => {
  it('elite players have high VOR', () => {
    const levels = getReplacementLevels(testPlayers, pprScoring, 10, testRosterSlots)
    const eliteRB = testPlayers.find(p => p.id === 'rb1')!
    const vor = calculateVOR(eliteRB, pprScoring, levels)
    expect(vor).toBeGreaterThan(0)
  })

  it('VOR is non-negative', () => {
    const levels = getReplacementLevels(testPlayers, pprScoring, 10, testRosterSlots)
    for (const player of testPlayers) {
      const vor = calculateVOR(player, pprScoring, levels)
      expect(vor).toBeGreaterThanOrEqual(0)
    }
  })

  it('better players at same position have higher VOR', () => {
    const levels = getReplacementLevels(testPlayers, pprScoring, 10, testRosterSlots)
    const rb1 = testPlayers.find(p => p.id === 'rb1')!
    const rb5 = testPlayers.find(p => p.id === 'rb5')!
    expect(calculateVOR(rb1, pprScoring, levels)).toBeGreaterThan(
      calculateVOR(rb5, pprScoring, levels),
    )
  })
})

describe('rankPlayersByVOR', () => {
  it('returns players sorted by VOR descending', () => {
    const ranked = rankPlayersByVOR(testPlayers, pprScoring, 10, testRosterSlots)
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].vor).toBeGreaterThanOrEqual(ranked[i].vor)
    }
  })
})
