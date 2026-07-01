import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MindfulEntry } from './types'

interface GardenState {
  entries: MindfulEntry[]
  muted: boolean
  addEntry: (entry: MindfulEntry) => void
  importEntries: (entries: MindfulEntry[]) => void
  removeEntry: (id: string) => void
  clearEntries: () => void
  toggleMuted: () => void
}

export const useGardenStore = create<GardenState>()(persist(
  (set) => ({
    entries: [], muted: false,
    addEntry: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
    importEntries: (incoming) => set((s) => {
      const byId = new Map(s.entries.map((entry) => [entry.id, entry]))
      incoming.forEach((entry) => byId.set(entry.id, entry))
      return { entries: Array.from(byId.values()).sort((a,b) => +new Date(b.createdAt) - +new Date(a.createdAt)) }
    }),
    removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    clearEntries: () => set({ entries: [] }),
    toggleMuted: () => set((s) => ({ muted: !s.muted })),
  }),
  { name: 'mindful-garden-v1' },
))
