import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Dashboard } from '@/db/queries/dashboard'
import { type OrderStatus, orderStatusLabels } from '@/lib/orders'

export function OrdersByStatus({
  statusCounts,
}: Pick<Dashboard, 'statusCounts'>) {
  const counts = new Map<string, number>(
    statusCounts.map(row => [row.status, row.orders])
  )
  const total = statusCounts.reduce((sum, row) => sum + row.orders, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordens por status</CardTitle>
        <CardDescription>
          {total.toLocaleString('pt-BR')} no período
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(Object.keys(orderStatusLabels) as OrderStatus[]).map(status => {
          const count = counts.get(status) ?? 0
          const percent = total > 0 ? (count / total) * 100 : 0

          return (
            <div key={status} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>{orderStatusLabels[status]}</span>
                <span className="text-muted-foreground tabular-nums">
                  {count}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
