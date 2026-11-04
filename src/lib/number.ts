/**
 * Arredonda um número para 2 casas decimais (half-up, tolerante a erro de
 * ponto flutuante: 1.005 -> 1.01).
 * Útil para exibição de moeda, percentuais e resultados de cálculo.
 */
const round2 = (n: number) =>
  Math.sign(n) * (Math.round((Math.abs(n) + Number.EPSILON) * 100) / 100) || 0

export { round2 }
