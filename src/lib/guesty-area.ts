const SQUARE_FEET_TO_SQUARE_METERS = 0.09290304

export function getSurfaceInSquareMeters(areaSquareFeet: number | null | undefined) {
  if (!Number.isFinite(areaSquareFeet) || !areaSquareFeet || areaSquareFeet <= 0) return 0
  return Math.round(areaSquareFeet * SQUARE_FEET_TO_SQUARE_METERS)
}
