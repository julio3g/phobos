import { TrendingDown, TrendingUp } from 'lucide-react'
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

interface KpiCardProps {
  label: string
  value: string
  previousLabel: string
  delta: React.ReactNode
}

function KpiCard({ label, value, previousLabel, delta }: KpiCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
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
        value={formatCurrency(current.revenue)}
        previousLabel={formatCurrency(previous.revenue)}
        delta={<Delta current={current.revenue} previous={previous.revenue} />}
      />
      <KpiCard
        label="Lucro"
        value={formatCurrency(current.profit)}
        previousLabel={formatCurrency(previous.profit)}
        delta={<Delta current={current.profit} previous={previous.profit} />}
      />
      <KpiCard
        label="Margem de lucro"
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
        value={current.orders.toLocaleString('pt-BR')}
        previousLabel={previous.orders.toLocaleString('pt-BR')}
        delta={<Delta current={current.orders} previous={previous.orders} />}
      />
      <KpiCard
        label="Ticket médio"
        value={formatCurrency(current.avgTicket)}
        previousLabel={formatCurrency(previous.avgTicket)}
        delta={
          <Delta current={current.avgTicket} previous={previous.avgTicket} />
        }
      />
      <KpiCard
        label="A receber"
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
