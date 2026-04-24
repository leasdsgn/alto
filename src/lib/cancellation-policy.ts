const FULL_REFUND_THRESHOLD_DAYS = 30
const PARTIAL_REFUND_THRESHOLD_DAYS = 7
const PARTIAL_REFUND_RATIO = 0.5

export function calculateRefundAmountCents(
  amountCents: number,
  checkInDate: string,
  referenceDate = new Date(),
): number {
  const daysBeforeArrival = daysUntilCheckIn(checkInDate, referenceDate)

  if (daysBeforeArrival > FULL_REFUND_THRESHOLD_DAYS) {
    return amountCents
  }

  if (daysBeforeArrival >= PARTIAL_REFUND_THRESHOLD_DAYS) {
    return Math.round(amountCents * PARTIAL_REFUND_RATIO)
  }

  return 0
}

function daysUntilCheckIn(checkInDate: string, referenceDate: Date): number {
  const startOfReference = new Date(referenceDate)
  startOfReference.setUTCHours(0, 0, 0, 0)

  const checkIn = new Date(checkInDate)
  checkIn.setUTCHours(0, 0, 0, 0)

  return Math.floor((checkIn.getTime() - startOfReference.getTime()) / 86400000)
}
