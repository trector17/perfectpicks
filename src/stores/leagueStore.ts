import { create } from 'zustand'
import type { LeagueConfig, ScoringConfig, RosterSlot } from '../types/index.ts'
import { DEFAULT_ROSTER_SLOTS } from '../types/index.ts'
import { saveToStorage, loadFromStorage } from '../utils/persistence.ts'
import scoringPresets from '../data/scoring-presets.json'

const STORAGE_KEY = 'league-config'

const defaultScoring = scoringPresets[0] as ScoringConfig // PPR

function createDefaultConfig(): LeagueConfig {
  return {
    name: 'My League',
    teamCount: 10,
    rosterSlots: [...DEFAULT_ROSTER_SLOTS],
    scoringConfig: defaultScoring,
    draftPosition: 1,
  }
}

interface LeagueStore {
  config: LeagueConfig
  isConfigured: boolean

  setConfig: (config: LeagueConfig) => void
  updateConfig: (partial: Partial<LeagueConfig>) => void
  setScoring: (scoring: ScoringConfig) => void
  setRosterSlots: (slots: RosterSlot[]) => void
  reset: () => void
}

export const useLeagueStore = create<LeagueStore>((set) => ({
  config: loadFromStorage<LeagueConfig>(STORAGE_KEY) ?? createDefaultConfig(),
  isConfigured: loadFromStorage<LeagueConfig>(STORAGE_KEY) !== null,

  setConfig: (config) => {
    saveToStorage(STORAGE_KEY, config)
    set({ config, isConfigured: true })
  },

  updateConfig: (partial) =>
    set((state) => {
      const config = { ...state.config, ...partial }
      saveToStorage(STORAGE_KEY, config)
      return { config, isConfigured: true }
    }),

  setScoring: (scoring) =>
    set((state) => {
      const config = { ...state.config, scoringConfig: scoring }
      saveToStorage(STORAGE_KEY, config)
      return { config }
    }),

  setRosterSlots: (slots) =>
    set((state) => {
      const config = { ...state.config, rosterSlots: slots }
      saveToStorage(STORAGE_KEY, config)
      return { config }
    }),

  reset: () => {
    const config = createDefaultConfig()
    saveToStorage(STORAGE_KEY, config)
    set({ config, isConfigured: false })
  },
}))
