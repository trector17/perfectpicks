import { create } from 'zustand'
import type { Position } from '../types/index.ts'

type DraftView = 'setup' | 'draft'
type MobileTab = 'board' | 'players' | 'recommendations' | 'roster'

interface UIStore {
  view: DraftView
  mobileTab: MobileTab
  positionFilter: Position | null
  searchQuery: string
  selectedPlayerId: string | null

  setView: (view: DraftView) => void
  setMobileTab: (tab: MobileTab) => void
  setPositionFilter: (position: Position | null) => void
  setSearchQuery: (query: string) => void
  setSelectedPlayer: (id: string | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  view: 'setup',
  mobileTab: 'board',
  positionFilter: null,
  searchQuery: '',
  selectedPlayerId: null,

  setView: (view) => set({ view }),
  setMobileTab: (tab) => set({ mobileTab: tab }),
  setPositionFilter: (position) => set({ positionFilter: position }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedPlayer: (id) => set({ selectedPlayerId: id }),
}))
