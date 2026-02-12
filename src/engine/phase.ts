import type { DraftPhase, PhaseWeights } from './types.ts'

/** Default phase weight configurations */
const PHASE_WEIGHTS: Record<DraftPhase, PhaseWeights> = {
  early: { vor: 0.50, scarcity: 0.20, need: 0.10, adpValue: 0.20 },
  mid:   { vor: 0.30, scarcity: 0.25, need: 0.25, adpValue: 0.20 },
  late:  { vor: 0.15, scarcity: 0.20, need: 0.45, adpValue: 0.20 },
  final: { vor: 0.10, scarcity: 0.10, need: 0.60, adpValue: 0.20 },
}

/**
 * Determine the draft phase based on current round and total rounds.
 */
export function getDraftPhase(currentRound: number, totalRounds: number): DraftPhase {
  const progress = currentRound / totalRounds

  if (progress <= 0.2) return 'early'   // ~rounds 1-3 in 15-round draft
  if (progress <= 0.55) return 'mid'    // ~rounds 4-8
  if (progress <= 0.8) return 'late'    // ~rounds 9-12
  return 'final'                        // ~rounds 13+
}

/**
 * Get the signal weights for the current draft phase.
 */
export function getPhaseWeights(phase: DraftPhase): PhaseWeights {
  return PHASE_WEIGHTS[phase]
}
