import type { Player, ScoringConfig, RosterSlot } from '../../src/types/index.ts'
import { DEFAULT_ROSTER_SLOTS } from '../../src/types/index.ts'

export const pprScoring: ScoringConfig = {
  id: 'ppr',
  name: 'PPR',
  rules: {
    passYards: 0.04,
    passTDs: 4,
    interceptions: -2,
    rushYards: 0.1,
    rushTDs: 6,
    receptions: 1,
    receivingYards: 0.1,
    receivingTDs: 6,
    fumblesLost: -2,
  },
}

export const standardScoring: ScoringConfig = {
  id: 'standard',
  name: 'Standard',
  rules: {
    ...pprScoring.rules,
    receptions: 0,
  },
}

export const testRosterSlots: RosterSlot[] = DEFAULT_ROSTER_SLOTS

/** A small set of test players with realistic-ish projections */
export const testPlayers: Player[] = [
  // QBs
  {
    id: 'qb1', name: 'Star QB', position: 'QB', team: 'KC', bye: 6, adp: 25,
    projections: { passYards: 4800, passTDs: 38, interceptions: 10, rushYards: 300, rushTDs: 3 },
  },
  {
    id: 'qb2', name: 'Good QB', position: 'QB', team: 'BUF', bye: 12, adp: 50,
    projections: { passYards: 4200, passTDs: 30, interceptions: 12, rushYards: 500, rushTDs: 5 },
  },
  {
    id: 'qb3', name: 'Average QB', position: 'QB', team: 'DAL', bye: 7, adp: 90,
    projections: { passYards: 3800, passTDs: 24, interceptions: 14, rushYards: 100, rushTDs: 1 },
  },
  // RBs
  {
    id: 'rb1', name: 'Elite RB', position: 'RB', team: 'ATL', bye: 11, adp: 1.5,
    projections: { rushYards: 1400, rushTDs: 12, receptions: 55, receivingYards: 450, receivingTDs: 3 },
  },
  {
    id: 'rb2', name: 'Great RB', position: 'RB', team: 'NYJ', bye: 7, adp: 4,
    projections: { rushYards: 1200, rushTDs: 10, receptions: 60, receivingYards: 500, receivingTDs: 2 },
  },
  {
    id: 'rb3', name: 'Good RB', position: 'RB', team: 'DET', bye: 13, adp: 15,
    projections: { rushYards: 1000, rushTDs: 8, receptions: 45, receivingYards: 350, receivingTDs: 2 },
  },
  {
    id: 'rb4', name: 'Decent RB', position: 'RB', team: 'SF', bye: 9, adp: 35,
    projections: { rushYards: 800, rushTDs: 6, receptions: 35, receivingYards: 280, receivingTDs: 1 },
  },
  {
    id: 'rb5', name: 'Bench RB', position: 'RB', team: 'CLE', bye: 10, adp: 80,
    projections: { rushYards: 600, rushTDs: 4, receptions: 20, receivingYards: 150, receivingTDs: 0 },
  },
  // WRs
  {
    id: 'wr1', name: 'Elite WR', position: 'WR', team: 'MIA', bye: 10, adp: 2,
    projections: { receptions: 110, receivingYards: 1600, receivingTDs: 12, rushYards: 40, rushTDs: 0 },
  },
  {
    id: 'wr2', name: 'Great WR', position: 'WR', team: 'MIN', bye: 9, adp: 5,
    projections: { receptions: 100, receivingYards: 1450, receivingTDs: 10, rushYards: 30, rushTDs: 0 },
  },
  {
    id: 'wr3', name: 'Good WR', position: 'WR', team: 'CIN', bye: 8, adp: 12,
    projections: { receptions: 90, receivingYards: 1200, receivingTDs: 9, rushYards: 50, rushTDs: 1 },
  },
  {
    id: 'wr4', name: 'Solid WR', position: 'WR', team: 'PHI', bye: 5, adp: 30,
    projections: { receptions: 75, receivingYards: 1000, receivingTDs: 7, rushYards: 20, rushTDs: 0 },
  },
  {
    id: 'wr5', name: 'Bench WR', position: 'WR', team: 'SEA', bye: 12, adp: 70,
    projections: { receptions: 60, receivingYards: 800, receivingTDs: 5, rushYards: 10, rushTDs: 0 },
  },
  // TEs
  {
    id: 'te1', name: 'Elite TE', position: 'TE', team: 'KC', bye: 6, adp: 10,
    projections: { receptions: 85, receivingYards: 900, receivingTDs: 8 },
  },
  {
    id: 'te2', name: 'Good TE', position: 'TE', team: 'DET', bye: 13, adp: 45,
    projections: { receptions: 65, receivingYards: 700, receivingTDs: 5 },
  },
  {
    id: 'te3', name: 'Average TE', position: 'TE', team: 'BAL', bye: 14, adp: 100,
    projections: { receptions: 45, receivingYards: 500, receivingTDs: 3 },
  },
  // K
  {
    id: 'k1', name: 'Top Kicker', position: 'K', team: 'BAL', bye: 14, adp: 130,
    projections: { fgMade0_39: 20, fgMade40_49: 8, fgMade50Plus: 4, extraPoints: 40, fgMissed: 3 },
  },
  // DST
  {
    id: 'dst1', name: 'Top DST', position: 'DST', team: 'SF', bye: 9, adp: 120,
    projections: { sacks: 45, defInterceptions: 15, fumbleRecoveries: 8, defTDs: 3, safeties: 1, pointsAllowed7_13: 8 },
  },
]
