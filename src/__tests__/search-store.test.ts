import { describe, it, expect, beforeEach } from 'vitest'
import { CalendarDate } from '@internationalized/date'
import { clampGuestsToCapacity, useSearchStore } from '@/lib/stores/search'

describe('useSearchStore', () => {
  beforeEach(() => {
    useSearchStore.getState().reset()
  })

  it('a des valeurs par défaut cohérentes', () => {
    const state = useSearchStore.getState()
    expect(state.city).toBe('Paris')
    expect(state.guests).toBe(1)
    expect(state.hasSelectedDates).toBe(false)
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

  it('marque les dates comme sélectionnées après une saisie', () => {
    useSearchStore.getState().setDates({
      start: new CalendarDate(2026, 8, 12),
      end: new CalendarDate(2026, 8, 15),
    })

    expect(useSearchStore.getState().hasSelectedDates).toBe(true)
  })

  it('efface la sélection de dates sans invalider la plage interne', () => {
    useSearchStore.getState().setDates({
      start: new CalendarDate(2026, 8, 12),
      end: new CalendarDate(2026, 8, 15),
    })
    useSearchStore.getState().clearDates()

    const state = useSearchStore.getState()
    expect(state.hasSelectedDates).toBe(false)
    expect(state.dates.start.toString()).toBe('2026-08-12')
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

describe('clampGuestsToCapacity', () => {
  it('réduit le nombre de voyageurs à la capacité du logement', () => {
    expect(clampGuestsToCapacity(3, 2)).toBe(2)
  })

  it('conserve un nombre de voyageurs déjà valide', () => {
    expect(clampGuestsToCapacity(2, 4)).toBe(2)
  })

  it('conserve au minimum un voyageur', () => {
    expect(clampGuestsToCapacity(0, 4)).toBe(1)
  })
})
