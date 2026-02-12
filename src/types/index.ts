// ── Positions ──────────────────────────────────────────────

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DST'

export const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'K', 'DST']

export const FLEX_ELIGIBLE: Position[] = ['RB', 'WR', 'TE']

// ── Players ────────────────────────────────────────────────

export interface Player {
  id: string
  name: string
  position: Position
  team: string
  bye: number
  adp: number
  /** Projected stats keyed by stat category (e.g. passYards, receptions) */
  projections: Record<string, number>
}

// ── Scoring ────────────────────────────────────────────────

export interface ScoringConfig {
  id: string
  name: string
  /** Maps stat category → points per unit (e.g. { passYards: 0.04, receptions: 1 }) */
  rules: Record<string, number>
}

// ── Roster ─────────────────────────────────────────────────

export type SlotType = Position | 'FLEX' | 'SUPERFLEX' | 'BENCH'

export interface RosterSlot {
  type: SlotType
  count: number
}

/** Default standard roster: QB/2RB/2WR/TE/FLEX/DST/K + 6 bench */
export const DEFAULT_ROSTER_SLOTS: RosterSlot[] = [
  { type: 'QB', count: 1 },
  { type: 'RB', count: 2 },
  { type: 'WR', count: 2 },
  { type: 'TE', count: 1 },
  { type: 'FLEX', count: 1 },
  { type: 'DST', count: 1 },
  { type: 'K', count: 1 },
  { type: 'BENCH', count: 6 },
]

// ── League Config ──────────────────────────────────────────

export interface LeagueConfig {
  name: string
  teamCount: number
  rosterSlots: RosterSlot[]
  scoringConfig: ScoringConfig
  /** User's draft position, 1-indexed */
  draftPosition: number
}

/** Total roster size (starters + bench) */
export function totalRosterSize(slots: RosterSlot[]): number {
  return slots.reduce((sum, s) => sum + s.count, 0)
}

/** Number of starter slots (everything except BENCH) */
export function starterCount(slots: RosterSlot[]): number {
  return slots.filter(s => s.type !== 'BENCH').reduce((sum, s) => sum + s.count, 0)
}

/** How many starting slots require a given position (including FLEX) */
export function starterSlotsForPosition(slots: RosterSlot[], position: Position): number {
  let count = 0
  for (const slot of slots) {
    if (slot.type === position) {
      count += slot.count
    }
    if (slot.type === 'FLEX' && FLEX_ELIGIBLE.includes(position)) {
      count += slot.count
    }
    if (slot.type === 'SUPERFLEX') {
      count += slot.count
    }
  }
  return count
}

// ── Draft State ────────────────────────────────────────────

export interface DraftPick {
  /** Overall pick number (1-indexed) */
  overall: number
  round: number
  pickInRound: number
  /** 0-indexed team number */
  teamIndex: number
  playerId: string
}

// ── Recommendations ────────────────────────────────────────

export interface RecommendationBreakdown {
  vorScore: number
  scarcityScore: number
  needScore: number
  adpValueScore: number
}

export interface Recommendation {
  player: Player
  score: number
  rank: number
  reasons: string[]
  breakdown: RecommendationBreakdown
}
