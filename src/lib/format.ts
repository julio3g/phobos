export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return ''

  try {
    return new Intl.DateTimeFormat('en-US', {
      month: opts.month ?? 'long',
      day: opts.day ?? 'numeric',
      year: opts.year ?? 'numeric',
      ...opts,
    }).format(new Date(date))
  } catch {
    return ''
  }
}

/** Moeda BRL. Única fonte de formatação de dinheiro do app. */
export function formatCurrency(
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {}
) {
  if (value == null) return '—'

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    ...options,
  })
}

export function formatShortDate(
  date: Date | string | number | null | undefined
) {
  if (!date) return '—'

  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatCpf(value: string | null | undefined) {
  const digits = (value ?? '').replace(/\D/g, '')
  return digits.length === 11
    ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : (value ?? '')
}

export function formatCnpj(value: string | null | undefined) {
  const digits = (value ?? '').replace(/\D/g, '')
  return digits.length === 14
    ? digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    : (value ?? '')
}

export function formatPhone(value: string | null | undefined) {
  const digits = (value ?? '').replace(/\D/g, '')
  if (digits.length === 11)
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (digits.length === 10)
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return value ?? ''
}
