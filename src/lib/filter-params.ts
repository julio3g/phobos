/**
 * Lê o valor de um filtro `multiSelect` da URL (?status=draft,paid) e
 * descarta o que não estiver na lista permitida.
 */
export function parseListFilter<T extends string>(
  value: string,
  allowed: readonly T[]
): T[] {
  return value
    .split(',')
    .filter((item): item is T => (allowed as readonly string[]).includes(item))
}
