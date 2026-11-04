export const APP_TIMEZONE = 'America/Sao_Paulo'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MAX_RANGE_DAYS = 366
const DAY_MS = 24 * 60 * 60 * 1000

export interface DateRangeStrings {
  from: string // yyyy-MM-dd
  to: string // yyyy-MM-dd
}

export interface ResolvedRange extends DateRangeStrings {
  days: number
  /** Período imediatamente anterior, com o mesmo tamanho (para comparação). */
  previous: DateRangeStrings
}

// yyyy-MM-dd <-> ms (UTC): só aritmética de calendário, sem influência de fuso
const toUtcMs = (value: string) => Date.parse(`${value}T00:00:00Z`)
const fromUtcMs = (ms: number) => new Date(ms).toISOString().slice(0, 10)

/** Hoje (yyyy-MM-dd) no fuso do app, independente do fuso do servidor. */
export function todayInAppTimezone(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(
    now
  )
}

export function addDays(value: string, amount: number) {
  return fromUtcMs(toUtcMs(value) + amount * DAY_MS)
}

/** Lista todos os dias de `from` até `to` (inclusive). */
export function eachDay({ from, to }: DateRangeStrings) {
  const days: string[] = []
  for (let day = from; day <= to; day = addDays(day, 1)) days.push(day)
  return days
}

/** Valida ?from=&to= e cai em "últimos 30 dias" quando ausente ou inválido. */
export function resolveRange(input: {
  from?: string | null
  to?: string | null
}): ResolvedRange {
  const today = todayInAppTimezone()
  const isValid = (v?: string | null): v is string =>
    !!v && DATE_PATTERN.test(v) && !Number.isNaN(toUtcMs(v))

  let to = isValid(input.to) ? input.to : today
  let from = isValid(input.from) ? input.from : addDays(to, -29)

  if (from > to) [from, to] = [to, from]
  if ((toUtcMs(to) - toUtcMs(from)) / DAY_MS + 1 > MAX_RANGE_DAYS)
    from = addDays(to, -(MAX_RANGE_DAYS - 1))

  const days = (toUtcMs(to) - toUtcMs(from)) / DAY_MS + 1

  return {
    from,
    to,
    days,
    previous: { from: addDays(from, -days), to: addDays(from, -1) },
  }
}
