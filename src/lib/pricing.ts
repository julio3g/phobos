import { round2 } from '@/lib/number'

export type MarginType = 'percent' | 'margin' | 'fixed'

export function calcTotalCost(p: { materialCost: number; laborCost: number }) {
  return round2((p.materialCost || 0) + (p.laborCost || 0))
}

/** custo do insumo consumido: custo unitário × quantidade */
export function calcMaterialLineCost(unitCost: number, quantity: number) {
  return round2((unitCost || 0) * (quantity || 0))
}

/** (minutos / 60) × valor/hora */
export function calcLaborCost(minutes: number, hourlyRate: number) {
  return round2(((minutes || 0) / 60) * (hourlyRate || 0))
}

/** percent (ex: 25) -> valor em R$ sobre o custo */
export function marginToFixed(totalCost: number, percent: number) {
  return round2(totalCost * ((percent || 0) / 100))
}

/** valor em R$ -> percent sobre o custo (0 se custo zerado) */
export function marginToPercent(totalCost: number, amount: number) {
  return totalCost > 0 ? round2(((amount || 0) / totalCost) * 100) : 0
}

/**
 * - percent: markup sobre o custo   -> custo × (1 + p/100)
 * - margin:  margem sobre a venda   -> custo / (1 - p/100), p < 100
 * - fixed:   valor em R$ sobre o custo
 */
export function calcSalePrice(p: {
  materialCost: number
  laborCost: number
  marginType: MarginType
  marginValue: number
}) {
  const totalCost = calcTotalCost(p)
  const value = p.marginValue || 0

  if (p.marginType === 'margin') {
    if (value >= 100) return Number.NaN
    return round2(totalCost / (1 - value / 100))
  }
  if (p.marginType === 'fixed') return round2(totalCost + value)
  return round2(totalCost * (1 + value / 100))
}
