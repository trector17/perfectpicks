import type { Player, DraftPick, LeagueConfig, Position } from '../types/index.ts'

/** All data the engine needs to produce recommendations */
export interface EngineInput {
  players: Player[]
  picks: DraftPick[]
  leagueConfig: LeagueConfig
  /** Which overall pick number we're making a recommendation for */
  currentOverall: number
}

export type DraftPhase = 'early' | 'mid' | 'late' | 'final'

export interface PhaseWeights {
  vor: number
  scarcity: number
  need: number
  adpValue: number
}

/** Per-position summary of remaining talent */
export interface PositionScarcity {
  position: Position
  /** How many players are still available at this position */
  remaining: number
  /** How many startable-quality players remain (above replacement) */
  aboveReplacement: number
  /** 0-1 score where 1 = most scarce */
  scarcityScore: number
}

/** Summary of the user's roster needs */
export interface RosterNeed {
  position: Position
  /** How many starter slots still need this position */
  unfilledStarters: number
  /** How many total slots (including bench) could use this position */
  unfilledTotal: number
  /** 0-1 score where 1 = most needed */
  needScore: number
}
