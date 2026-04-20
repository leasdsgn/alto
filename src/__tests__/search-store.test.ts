import { describe, it, expect, beforeEach } from 'vitest'
import { useSearchStore } from '@/lib/stores/search'

describe('useSearchStore', () => {
  beforeEach(() => {
    useSearchStore.getState().reset()
  })

  it('a des valeurs par défaut cohérentes', () => {
    const state = useSearchStore.getState()
    expect(state.city).toBe('Paris')
    expect(state.guests).toBe(1)
    expect(state.dates.start).toBeDefined()
    expect(state.dates.end).toBeDefined()
  })

  it('change la ville', () => {
    useSearchStore.getState().setCity('Lyon')
    expect(useSearchStore.getState().city).toBe('Lyon')
  })

  it('change le nombre de voyageurs', () => {
    useSearchStore.getState().setGuests(4)
    expect(useSearchStore.getState().guests).toBe(4)
  })

  it('reset remet les valeurs par défaut', () => {
    useSearchStore.getState().setCity('Lyon')
    useSearchStore.getState().setGuests(5)
    useSearchStore.getState().reset()

    const state = useSearchStore.getState()
    expect(state.city).toBe('Paris')
    expect(state.guests).toBe(1)
  })

  it('les dates par défaut sont dans le futur', () => {
    const { dates } = useSearchStore.getState()
    const startDay = dates.start.day
    const endDay = dates.end.day
    expect(endDay).not.toBe(startDay)
  })
})
