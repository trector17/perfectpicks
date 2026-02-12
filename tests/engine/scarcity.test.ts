import { describe, it, expect } from 'vitest'
import { analyzeScarcity, getScarcityForPosition } from '../../src/engine/scarcity.ts'
import { testPlayers, pprScoring, testRosterSlots } from './fixtures.ts'

describe('analyzeScarcity', () => {
  it('returns scarcity for all positions', () => {
    const scarcity = analyzeScarcity(testPlayers, testPlayers, pprScoring, 10, testRosterSlots)
    expect(scarcity).toHaveLength(6) // QB, RB, WR, TE, K, DST
  })

  it('scarcity scores are between 0 and 1', () => {
    const scarcity = analyzeScarcity(testPlayers, testPlayers, pprScoring, 10, testRosterSlots)
    for (const s of scarcity) {
      expect(s.scarcityScore).toBeGreaterThanOrEqual(0)
      expect(s.scarcityScore).toBeLessThanOrEqual(1)
    }
  })

  it('scarcity increases when players are removed', () => {
    const fullScarcity = analyzeScarcity(testPlayers, testPlayers, pprScoring, 10, testRosterSlots)
    const rbScarcityFull = getScarcityForPosition(fullScarcity, 'RB')

    // Remove 2 best RBs
    const reducedPool = testPlayers.filter(p => p.id !== 'rb1' && p.id !== 'rb2')
    const reducedScarcity = analyzeScarcity(reducedPool, testPlayers, pprScoring, 10, testRosterSlots)
    const rbScarcityReduced = getScarcityForPosition(reducedScarcity, 'RB')

    expect(rbScarcityReduced).toBeGreaterThan(rbScarcityFull)
  })

  it('remaining count decreases as players are drafted', () => {
    const full = analyzeScarcity(testPlayers, testPlayers, pprScoring, 10, testRosterSlots)
    const rbFull = full.find(s => s.position === 'RB')!

    const reduced = testPlayers.filter(p => p.id !== 'rb1')
    const partial = analyzeScarcity(reduced, testPlayers, pprScoring, 10, testRosterSlots)
    const rbPartial = partial.find(s => s.position === 'RB')!

    expect(rbPartial.remaining).toBe(rbFull.remaining - 1)
  })
})
