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

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0)
    return current > 0 ? <Badge variant="secondary">Novo</Badge> : null

  const change = ((current - previous) / previous) * 100
  const Icon = change >= 0 ? TrendingUp : TrendingDown

  return (
    <Badge variant={change >= 0 ? 'secondary' : 'destructive'}>
      <Icon />
      {change >= 0 ? '+' : ''}
      {change.toFixed(1).replace('.', ',')}%
    </Badge>
  )
}

interface KpiCardProps {
  label: string
  value: string
  previousLabel: string
  current: number
  previous: number
}

function KpiCard({
  label,
  value,
  previousLabel,
  current,
  previous,
}: KpiCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-semibold text-2xl tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Delta current={current} previous={previous} />
        </CardAction>
      </CardHeader>
      <CardFooter className="text-muted-foreground text-sm">
        Período anterior: {previousLabel}
      </CardFooter>
    </Card>
  )
}

export function KpiCards({
  current,
  previous,
}: Pick<Dashboard, 'current' | 'previous'>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Faturamento"
        value={formatCurrency(current.revenue)}
        previousLabel={formatCurrency(previous.revenue)}
        current={current.revenue}
        previous={previous.revenue}
      />
      <KpiCard
        label="Lucro"
        value={formatCurrency(current.profit)}
        previousLabel={formatCurrency(previous.profit)}
        current={current.profit}
        previous={previous.profit}
      />
      <KpiCard
        label="Ordens"
        value={current.orders.toLocaleString('pt-BR')}
        previousLabel={previous.orders.toLocaleString('pt-BR')}
        current={current.orders}
        previous={previous.orders}
      />
      <KpiCard
        label="Ticket médio"
        value={formatCurrency(current.avgTicket)}
        previousLabel={formatCurrency(previous.avgTicket)}
        current={current.avgTicket}
        previous={previous.avgTicket}
      />
    </div>
  )
}
