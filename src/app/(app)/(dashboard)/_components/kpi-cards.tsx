import {
  HandCoins,
  type LucideIcon,
  Percent,
  Receipt,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Dashboard } from '@/db/queries/dashboard'
import { formatCurrency } from '@/lib/format'

const pt = (value: number, digits = 1) =>
  value.toFixed(digits).replace('.', ',')

function DeltaBadge({
  change,
  suffix,
  invert = false,
}: {
  change: number
  suffix: string
  /** true quando subir é ruim (ex.: valor a receber) */
  invert?: boolean
}) {
  const up = change >= 0
  const good = invert ? !up : up
  const Icon = up ? TrendingUp : TrendingDown

  return (
    <Badge
      variant="outline"
      className={
        good
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
      }
    >
      <Icon />
      {up ? '+' : ''}
      {pt(change)}
      {suffix}
    </Badge>
  )
}

function Delta({
  current,
  previous,
  invert,
}: {
  current: number
  previous: number
  invert?: boolean
}) {
  if (!previous)
    return current > 0 ? <Badge variant="secondary">Novo</Badge> : null

  return (
    <DeltaBadge
      change={((current - previous) / previous) * 100}
      suffix="%"
      invert={invert}
    />
  )
}

const tones = {
  indigo: {
    chip: 'bg-primary/15 text-primary',
    card: 'border-t-primary',
  },
  emerald: {
    chip: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    card: 'border-t-emerald-500',
  },
  violet: {
    chip: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    card: 'border-t-violet-500',
  },
  sky: {
    chip: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    card: 'border-t-sky-500',
  },
  amber: {
    chip: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    card: 'border-t-amber-500',
  },
  rose: {
    chip: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    card: 'border-t-rose-500',
  },
} as const

interface KpiCardProps {
  label: string
  value: string
  previousLabel: string
  delta: React.ReactNode
  icon: LucideIcon
  tone: keyof typeof tones
}

function KpiCard({
  label,
  value,
  previousLabel,
  delta,
  icon: Icon,
  tone,
}: KpiCardProps) {
  return (
    <Card className={`@container/card border-t-2 ${tones[tone].card}`}>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <span
            className={`flex size-7 items-center justify-center rounded-lg ${tones[tone].chip}`}
          >
            <Icon className="size-4" aria-hidden />
          </span>
          {label}
        </CardDescription>
        <CardTitle className="font-semibold text-2xl tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>{delta}</CardAction>
      </CardHeader>
      <CardFooter className="text-muted-foreground text-sm">
        Período anterior: {previousLabel}
      </CardFooter>
    </Card>
  )
}

const margin = (t: { revenue: number; profit: number }) =>
  t.revenue > 0 ? (t.profit / t.revenue) * 100 : 0

export function KpiCards({
  current,
  previous,
}: Pick<Dashboard, 'current' | 'previous'>) {
  const currentMargin = margin(current)
  const previousMargin = margin(previous)
  const hasPreviousMargin = previous.revenue > 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <KpiCard
        label="Faturamento"
        icon={Wallet}
        tone="indigo"
        value={formatCurrency(current.revenue)}
        previousLabel={formatCurrency(previous.revenue)}
        delta={<Delta current={current.revenue} previous={previous.revenue} />}
      />
      <KpiCard
        label="Lucro"
        icon={TrendingUp}
        tone="emerald"
        value={formatCurrency(current.profit)}
        previousLabel={formatCurrency(previous.profit)}
        delta={<Delta current={current.profit} previous={previous.profit} />}
      />
      <KpiCard
        label="Margem de lucro"
        icon={Percent}
        tone="violet"
        value={`${pt(currentMargin)}%`}
        previousLabel={`${pt(previousMargin)}%`}
        delta={
          hasPreviousMargin && current.revenue > 0 ? (
            <DeltaBadge change={currentMargin - previousMargin} suffix=" p.p." />
          ) : null
        }
      />
      <KpiCard
        label="Ordens"
        icon={ShoppingBag}
        tone="sky"
        value={current.orders.toLocaleString('pt-BR')}
        previousLabel={previous.orders.toLocaleString('pt-BR')}
        delta={<Delta current={current.orders} previous={previous.orders} />}
      />
      <KpiCard
        label="Ticket médio"
        icon={Receipt}
        tone="amber"
        value={formatCurrency(current.avgTicket)}
        previousLabel={formatCurrency(previous.avgTicket)}
        delta={
          <Delta current={current.avgTicket} previous={previous.avgTicket} />
        }
      />
      <KpiCard
        label="A receber"
        icon={HandCoins}
        tone="rose"
        value={formatCurrency(current.receivable)}
        previousLabel={formatCurrency(previous.receivable)}
        delta={
          <Delta
            current={current.receivable}
            previous={previous.receivable}
            invert
          />
        }
      />
    </div>
  )
}
