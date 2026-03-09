/**
 * Porcentaje de cashback por categoría de gasto (0-100).
 * Solo aplica a movimientos tipo "out" con categoryId.
 */
export const CASHBACK_RATES: Record<string, number> = {
  streaming: 5,
  food: 2,
  transport: 1,
  shopping: 3,
  services: 1,
  health: 2,
  entertainment: 4,
  "transfer-out": 0,
  "out-other": 0,
};

export function getCashbackRateForCategory(categoryId: string | undefined): number {
  if (!categoryId) return 0;
  return CASHBACK_RATES[categoryId] ?? 0;
}
