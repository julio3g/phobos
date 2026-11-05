'use client'

import {
  endOfMonth,
  format,
  parse,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { parseAsString, useQueryStates } from 'nuqs'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const URL_FORMAT = 'yyyy-MM-dd'
const LABEL_FORMAT = 'dd/MM/yyyy'

const toDate = (value: string) => parse(value, URL_FORMAT, new Date())

function getPresets() {
  const today = startOfDay(new Date())
  const lastMonth = subMonths(today, 1)

  return [
    { label: 'Hoje', from: today, to: today },
    { label: 'Ontem', from: subDays(today, 1), to: subDays(today, 1) },
    { label: 'Últimos 7 dias', from: subDays(today, 6), to: today },
    { label: 'Últimos 30 dias', from: subDays(today, 29), to: today },
    { label: 'Últimos 90 dias', from: subDays(today, 89), to: today },
    { label: 'Este mês', from: startOfMonth(today), to: today },
    {
      label: 'Mês passado',
      from: startOfMonth(lastMonth),
      to: endOfMonth(lastMonth),
    },
    { label: 'Este ano', from: startOfYear(today), to: today },
  ]
}

interface DateRangeFilterProps {
  /** Período já resolvido no servidor (yyyy-MM-dd). */
  from: string
  to: string
}

export function DateRangeFilter({ from, to }: DateRangeFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [, setQuery] = useQueryStates(
    { from: parseAsString, to: parseAsString },
    { shallow: false, history: 'replace' }
  )

  const applied = React.useMemo<DateRange>(
    () => ({ from: toDate(from), to: toDate(to) }),
    [from, to]
  )

  // seleção em andamento: só vai para a URL quando o intervalo fecha
  const [draft, setDraft] = React.useState<DateRange | undefined>(applied)
  const [month, setMonth] = React.useState(applied.to ?? new Date())

  React.useEffect(() => {
    setDraft(applied)
    setMonth(applied.to ?? new Date())
  }, [applied])

  const presets = React.useMemo(getPresets, [])

  function apply(range: { from: Date; to: Date }) {
    void setQuery({
      from: format(range.from, URL_FORMAT),
      to: format(range.to, URL_FORMAT),
    })
    setOpen(false)
  }

  function onSelect(range: DateRange | undefined) {
    setDraft(range)
    if (range?.from && range.to) apply({ from: range.from, to: range.to })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" />}>
        <CalendarIcon />
        <span>
          {format(applied.from as Date, LABEL_FORMAT)} –{' '}
          {format(applied.to as Date, LABEL_FORMAT)}
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto max-w-[calc(100vw-1rem)] p-0">
        <div className="flex max-sm:flex-col">
          <div className="max-sm:order-1 max-sm:border-t max-sm:p-2 sm:w-40 sm:border-e sm:py-4">
            <div className="flex flex-wrap gap-1.5 sm:flex-col sm:gap-0 sm:px-2">
              {presets.map(preset => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs max-sm:h-7 max-sm:grow max-sm:justify-center max-sm:border max-sm:bg-muted/40 sm:w-full sm:text-sm"
                  onClick={() => apply(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <Calendar
            autoFocus
            mode="range"
            locale={ptBR}
            month={month}
            onMonthChange={setMonth}
            disabled={{ after: new Date() }}
            selected={draft}
            onSelect={onSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
