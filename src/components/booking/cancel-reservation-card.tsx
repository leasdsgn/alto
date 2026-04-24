'use client'

import { useState } from 'react'

interface CancelReservationCardProps {
  token: string
  listingTitle: string
  checkIn: string
  checkOut: string
  status: string
}

export function CancelReservationCard(props: CancelReservationCardProps) {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canCancel =
    (props.status === 'confirmed' || props.status === 'pending') && message === null

  async function handleCancel() {
    setSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/reservations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: props.token }),
      })

      const body = await response.json().catch(() => ({ error: 'cancel_failed' }))

      if (!response.ok) {
        throw new Error(typeof body.error === 'string' ? body.error : 'cancel_failed')
      }

      setMessage(
        body.refundAmountCents > 0
          ? 'Annulation confirmée. Le remboursement est en cours de traitement.'
          : 'Annulation confirmée.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'cancel_failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border-divider bg-cream rounded-2xl border p-6">
      <div className="space-y-2">
        <h2 className="text-coffee text-2xl font-semibold">Annuler votre réservation</h2>
        <p className="text-taupe text-sm leading-relaxed">
          Cette action concerne <span className="text-coffee font-medium">{props.listingTitle}</span>, du{' '}
          {props.checkIn} au {props.checkOut}.
        </p>
        <p className="text-taupe text-sm">
          Statut actuel: <span className="text-coffee font-medium">{props.status}</span>
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <p className="text-taupe text-sm leading-relaxed">
          Si vous confirmez, Alto annulera la réservation dans Guesty. Le remboursement éventuel dépend de la politique d’annulation applicable.
        </p>

        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          type="button"
          onClick={handleCancel}
          disabled={!canCancel || submitting}
          className="bg-coffee text-cream hover:bg-coffee/90 disabled:bg-taupe w-full rounded-lg px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
        >
          {submitting ? 'Annulation en cours...' : 'Confirmer l’annulation'}
        </button>
      </div>
    </div>
  )
}
