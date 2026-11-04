import { describe, expect, it } from 'vitest'
import {
  calcLaborCost,
  calcMaterialLineCost,
  calcSalePrice,
  calcTotalCost,
  marginToFixed,
  marginToPercent,
} from './pricing'

describe('custo de material', () => {
  it('novelo 125g por R$19,50, consumo 20g = R$3,12', () => {
    const unitCost = 19.5 / 125
    expect(unitCost).toBeCloseTo(0.156, 6)
    expect(calcMaterialLineCost(unitCost, 20)).toBe(3.12)
  })

  it('ignora NaN/undefined como zero', () => {
    expect(calcMaterialLineCost(Number.NaN, 5)).toBe(0)
  })
})

describe('mão de obra', () => {
  it('90 min a R$20/h = R$30', () => {
    expect(calcLaborCost(90, 20)).toBe(30)
  })
  it('zero minutos = 0', () => {
    expect(calcLaborCost(0, 50)).toBe(0)
  })
})

describe('custo total', () => {
  it('soma insumos + mão de obra', () => {
    expect(calcTotalCost({ materialCost: 5, laborCost: 30 })).toBe(35)
  })
})

describe('preço de venda (exemplo do README: custo 35, 30%)', () => {
  const base = { materialCost: 5, laborCost: 30 }

  it('margem sobre a venda 30% = R$50,00', () => {
    expect(
      calcSalePrice({ ...base, marginType: 'margin', marginValue: 30 })
    ).toBe(50)
  })

  it('markup 30% = R$45,50', () => {
    expect(
      calcSalePrice({ ...base, marginType: 'percent', marginValue: 30 })
    ).toBe(45.5)
  })

  it('valor fixo soma ao custo', () => {
    expect(
      calcSalePrice({ ...base, marginType: 'fixed', marginValue: 10 })
    ).toBe(45)
  })

  it('markup acima de 100% é válido', () => {
    expect(
      calcSalePrice({ ...base, marginType: 'percent', marginValue: 150 })
    ).toBe(87.5)
  })

  it('margem >= 100% é inválida (NaN)', () => {
    expect(
      calcSalePrice({ ...base, marginType: 'margin', marginValue: 100 })
    ).toBeNaN()
  })
})

describe('conversão margem', () => {
  it('percent <-> fixed', () => {
    expect(marginToFixed(35, 30)).toBe(10.5)
    expect(marginToPercent(35, 10.5)).toBe(30)
    expect(marginToPercent(0, 10)).toBe(0)
  })
})
