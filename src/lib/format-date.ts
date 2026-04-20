import type { DateValue } from '@internationalized/date'

const MONTHS = [
  'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
]

export function formatDate(date: DateValue): string {
  return `${date.day} ${MONTHS[date.month - 1]} ${date.year}`
}

export function formatDateShort(date: DateValue): string {
  return `${date.day} ${MONTHS[date.month - 1]} ${date.year}`
}
