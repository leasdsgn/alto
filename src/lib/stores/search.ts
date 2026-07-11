import { create } from 'zustand'
import { today, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

function getDefaultDates() {
  const start = today(getLocalTimeZone())
  return { start, end: start.add({ days: 1 }) }
}

interface DateRange {
  start: DateValue
  end: DateValue
}

interface SearchState {
  city: string
  dates: DateRange
  guests: number
  setCity: (city: string) => void
  setDates: (dates: DateRange) => void
  setGuests: (guests: number) => void
  reset: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  city: 'Paris',
  dates: getDefaultDates(),
  guests: 1,
  setCity: (city) => set({ city }),
  setDates: (dates) => set({ dates }),
  setGuests: (guests) => set({ guests }),
  reset: () => set({ city: 'Paris', dates: getDefaultDates(), guests: 1 }),
}))

export function clampGuestsToCapacity(guests: number, capacity?: number): number {
  if (!capacity || capacity < 1) return Math.max(1, guests)
  return Math.min(Math.max(1, guests), capacity)
}
