import { describe, it, expect } from 'vitest'
import { getRecommendations } from '../../src/engine/recommend.ts'
import type { EngineInput } from '../../src/engine/types.ts'
import type { LeagueConfig } from '../../src/types/index.ts'
import { DEFAULT_ROSTER_SLOTS } from '../../src/types/index.ts'
import { testPlayers, pprScoring } from './fixtures.ts'

const testLeagueConfig: LeagueConfig = {
  name: 'Test League',
  teamCount: 10,
  rosterSlots: DEFAULT_ROSTER_SLOTS,
  scoringConfig: pprScoring,
  draftPosition: 1,
}

describe('getRecommendations', () => {
  it('returns recommendations when draft is empty', () => {
    const input: EngineInput = {
      players: testPlayers,
      picks: [],
      leagueConfig: testLeagueConfig,
      currentOverall: 1,
    }

    const recs = getRecommendations(input, 5)
    expect(recs).toHaveLength(5)
    expect(recs[0].rank).toBe(1)
    expect(recs[4].rank).toBe(5)
  })

  it('recommendations are sorted by score descending', () => {
    const input: EngineInput = {
      players: testPlayers,
      picks: [],
      leagueConfig: testLeagueConfig,
      currentOverall: 1,
    }

    const recs = getRecommendations(input, 10)
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i - 1].score).toBeGreaterThanOrEqual(recs[i].score)
    }
  })

  it('does not recommend already-drafted players', () => {
    const input: EngineInput = {
      players: testPlayers,
      picks: [
        { overall: 1, round: 1, pickInRound: 1, teamIndex: 0, playerId: 'rb1' },
      ],
      leagueConfig: testLeagueConfig,
      currentOverall: 2,
    }

    const recs = getRecommendations(input, 10)
    const recIds = recs.map(r => r.player.id)
    expect(recIds).not.toContain('rb1')
  })

  it('each recommendation has reasons', () => {
    const input: EngineInput = {
      players: testPlayers,
      picks: [],
      leagueConfig: testLeagueConfig,
      currentOverall: 1,
    }

    const recs = getRecommendations(input)
    for (const rec of recs) {
      expect(rec.reasons.length).toBeGreaterThan(0)
    }
  })

  it('each recommendation has a breakdown', () => {
    const input: EngineInput = {
      players: testPlayers,
      picks: [],
      leagueConfig: testLeagueConfig,
      currentOverall: 1,
    }

    const recs = getRecommendations(input)
    for (const rec of recs) {
      expect(rec.breakdown).toHaveProperty('vorScore')
      expect(rec.breakdown).toHaveProperty('scarcityScore')
      expect(rec.breakdown).toHaveProperty('needScore')
      expect(rec.breakdown).toHaveProperty('adpValueScore')
    }
  })

  it('returns empty array when no players available', () => {
    const input: EngineInput = {
      players: [],
      picks: [],
      leagueConfig: testLeagueConfig,
      currentOverall: 1,
    }

    const recs = getRecommendations(input)
    expect(recs).toHaveLength(0)
  })

  it('returns at most the requested count', () => {
    const input: EngineInput = {
      players: testPlayers,
      picks: [],
      leagueConfig: testLeagueConfig,
      currentOverall: 1,
    }

    const recs = getRecommendations(input, 3)
    expect(recs).toHaveLength(3)
  })

  it('early round recommendations favor high-VOR players', () => {
    const input: EngineInput = {
      players: testPlayers,
      picks: [],
      leagueConfig: testLeagueConfig,
      currentOverall: 1,
    }

    const recs = getRecommendations(input, 3)
    // Top recommendations should be elite players (RB1, WR1, etc.)
    const topPositions = recs.map(r => r.player.position)
    // At minimum, the top rec should be an RB or WR (high-value positions in PPR)
    expect(['RB', 'WR']).toContain(topPositions[0])
  })
})
