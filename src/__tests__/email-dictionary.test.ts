import { describe, expect, it } from 'vitest'
import { translate } from '@/lib/i18n/email-dictionary'

describe('translate', () => {
  it('retourne la clé brute quand pas de variables', () => {
    expect(translate('fr', 'confirmation.subject')).toBe('Votre réservation est confirmée')
    expect(translate('en', 'confirmation.subject')).toBe('Your booking is confirmed')
  })

  it('interpole les variables {{var}}', () => {
    const result = translate('fr', 'confirmation.greeting', { firstName: 'Camille' })
    expect(result).toBe('Bonjour Camille,')
  })

  it('supporte plusieurs variables', () => {
    const result = translate('fr', 'confirmation.body', {
      nights: 4,
      nightsPlural: 's',
      listingTitle: 'Le Marais Terrasse',
    })
    expect(result).toContain('4 nuits')
    expect(result).toContain('Le Marais Terrasse')
  })

  it('remplace par chaîne vide quand variable manquante', () => {
    const result = translate('fr', 'confirmation.greeting', {})
    expect(result).toBe('Bonjour ,')
  })

  it('EN utilise les mêmes clés', () => {
    expect(translate('en', 'inquiryReceived.subject')).toBe(
      'Your booking request has been received',
    )
  })
})
