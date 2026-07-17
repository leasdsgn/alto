import { describe, expect, it } from 'vitest'
import { getSurfaceInSquareMeters } from '@/lib/guesty-area'

describe('guesty-area', () => {
  it('convertit les pieds carrés Guesty en mètres carrés arrondis', () => {
    expect(getSurfaceInSquareMeters(538)).toBe(50)
  })

  it('ignore les surfaces absentes ou invalides', () => {
    expect(getSurfaceInSquareMeters(undefined)).toBe(0)
    expect(getSurfaceInSquareMeters(0)).toBe(0)
    expect(getSurfaceInSquareMeters(-10)).toBe(0)
  })
})
