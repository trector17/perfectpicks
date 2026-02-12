import { describe, it, expect } from 'vitest'
import { analyzeNeeds, getNeedForPosition } from '../../src/engine/needs.ts'
import type { DraftPick } from '../../src/types/index.ts'
import { testPlayers, testRosterSlots } from './fixtures.ts'

describe('analyzeNeeds', () => {
  it('returns needs for all positions', () => {
    const needs = analyzeNeeds([], testPlayers, testRosterSlots, 15, 1)
    expect(needs).toHaveLength(6)
  })

  it('all positions have some need at start of draft', () => {
    const needs = analyzeNeeds([], testPlayers, testRosterSlots, 15, 1)
    for (const need of needs) {
      // QB, RB, WR, TE all have starter slots
      if (['QB', 'RB', 'WR', 'TE'].includes(need.position)) {
        expect(need.unfilledStarters).toBeGreaterThan(0)
      }
    }
  })

  it('need decreases after drafting a player at that position', () => {
    const earlyNeeds = analyzeNeeds([], testPlayers, testRosterSlots, 15, 5)
    const rbNeedBefore = getNeedForPosition(earlyNeeds, 'RB')

    // Draft an RB
    const picks: DraftPick[] = [
      { overall: 1, round: 1, pickInRound: 1, teamIndex: 0, playerId: 'rb1' },
    ]
    const afterNeeds = analyzeNeeds(picks, testPlayers, testRosterSlots, 15, 5)
    const rbNeedAfter = getNeedForPosition(afterNeeds, 'RB')

    expect(rbNeedAfter).toBeLessThanOrEqual(rbNeedBefore)
  })

  it('need scores are between 0 and 1', () => {
    const needs = analyzeNeeds([], testPlayers, testRosterSlots, 15, 10)
    for (const need of needs) {
      expect(need.needScore).toBeGreaterThanOrEqual(0)
      expect(need.needScore).toBeLessThanOrEqual(1)
    }
  })

  it('need increases in later rounds when position is unfilled', () => {
    const earlyNeeds = analyzeNeeds([], testPlayers, testRosterSlots, 15, 1)
    const lateNeeds = analyzeNeeds([], testPlayers, testRosterSlots, 15, 13)

    const qbEarly = getNeedForPosition(earlyNeeds, 'QB')
    const qbLate = getNeedForPosition(lateNeeds, 'QB')

    expect(qbLate).toBeGreaterThanOrEqual(qbEarly)
  })
})
