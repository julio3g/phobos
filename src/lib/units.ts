export const baseUnits = ['un', 'm', 'g', 'ml', 'pair'] as const
export type BaseUnit = (typeof baseUnits)[number]

export const inputUnits = {
  g: { base: 'g', factor: 1 },
  kg: { base: 'g', factor: 1000 },
  ml: { base: 'ml', factor: 1 },
  l: { base: 'ml', factor: 1000 },
  m: { base: 'm', factor: 1 },
  cm: { base: 'm', factor: 0.01 },
  un: { base: 'un', factor: 1 },
  dz: { base: 'un', factor: 12 },
  ten: { base: 'un', factor: 10 },
  pair: { base: 'pair', factor: 1 },
} as const satisfies Record<string, { base: BaseUnit; factor: number }>

export type InputUnit = keyof typeof inputUnits

export const toBase = (value: number, from: InputUnit) => ({
  unit: inputUnits[from].base,
  value: Math.round(value * inputUnits[from].factor * 1000) / 1000,
})

// dozen => duzia
// ten = dezeno
//
