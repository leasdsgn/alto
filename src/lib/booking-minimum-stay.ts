export function getEffectiveMinimumNights(
  baseMinimumNights: number | undefined,
  selectedStartDate: string,
  minimumNightsByDate: ReadonlyMap<string, number>,
) {
  return Math.max(baseMinimumNights ?? 1, minimumNightsByDate.get(selectedStartDate) ?? 1)
}
